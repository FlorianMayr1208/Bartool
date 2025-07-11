import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient
import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.db import models, session as db_session


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

models.Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[db_session.get_db] = override_get_db


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    transport = httpx.ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_healthz(async_client):
    resp = await async_client.get("/healthz")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_create_and_list_ingredient(async_client):
    data = {"name": "Rum"}
    resp = await async_client.post("/ingredients/", json=data)
    assert resp.status_code == 201
    created = resp.json()
    assert created["name"] == "Rum"

    resp = await async_client.get("/ingredients/")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


@pytest.mark.asyncio
async def test_create_recipe(monkeypatch, async_client):
    async def fake_fetch(name: str):
        return {
            "name": "Mojito",
            "alcoholic": "Alcoholic",
            "instructions": "Mix it",
            "thumb": "http://example.com/mojito.jpg",
            "tags": ["Classic"],
            "categories": ["Cocktail"],
            "ibas": ["New Era"],
            "ingredients": [{"name": "Rum", "measure": "2 oz"}],
        }

    monkeypatch.setattr("backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch)
    resp = await async_client.post("/recipes/", json={"name": "mojito"})
    assert resp.status_code == 201
    assert resp.json()["name"] == "Mojito"


@pytest.mark.asyncio
async def test_get_recipe(monkeypatch, async_client):
    async def fake_fetch(name: str):
        return {
            "name": "Mojito",
            "alcoholic": "Alcoholic",
            "instructions": "Mix it",
            "thumb": "http://example.com/mojito.jpg",
            "tags": ["Classic"],
            "categories": ["Cocktail"],
            "ibas": ["New Era"],
            "ingredients": [{"name": "Rum", "measure": "2 oz"}],
        }

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    resp = await async_client.post("/recipes/", json={"name": "mojito"})
    recipe_id = resp.json()["id"]

    resp = await async_client.get(f"/recipes/{recipe_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Mojito"


@pytest.mark.asyncio
async def test_recipe_search(monkeypatch, async_client):
    async def fake_search(name: str):
        return [
            {
                "name": "Margarita",
                "alcoholic": "Alcoholic",
                "instructions": "Mix",
                "thumb": "http://example.com/margarita.jpg",
            },
            {
                "name": "Blue Margarita",
                "alcoholic": "Alcoholic",
                "instructions": "Mix blue",
                "thumb": "http://example.com/blue.jpg",
            },
        ]

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.search_recipes_details", fake_search
    )
    monkeypatch.setattr(
        "backend.app.api.recipes.search_recipes_details", fake_search
    )
    resp = await async_client.get("/recipes/search", params={"q": "margarita"})
    assert resp.status_code == 200
    assert resp.json() == await fake_search("")


@pytest.mark.asyncio
async def test_inventory_patch(async_client):
    # seed ingredient and item
    resp = await async_client.post("/ingredients/", json={"name": "Vodka"})
    ing_id = resp.json()["id"]
    resp = await async_client.post("/ingredients/", json={"name": "Gin"})
    # create inventory
    from backend.app.db import crud, schemas
    db = next(override_get_db())
    item = crud.create_inventory_item(db, schemas.InventoryItemCreate(ingredient_id=ing_id, quantity=1))
    db.close()
    resp = await async_client.get(f"/inventory/{item.id}")
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 1

    resp = await async_client.patch(f"/inventory/{item.id}", json={"quantity": 5})
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 5


@pytest.mark.asyncio
async def test_barcode_lookup(monkeypatch, async_client):
    async def fake_lookup(ean: str):
        return {"name": "Test"}

    monkeypatch.setattr("backend.app.services.barcode.fetch_barcode", fake_lookup)
    resp = await async_client.get("/barcode/123456")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test"


@pytest.mark.asyncio
async def test_inventory_create_delete(async_client):
    resp = await async_client.post("/ingredients/", json={"name": "Tequila"})
    ing_id = resp.json()["id"]
    resp = await async_client.post("/inventory/", json={"ingredient_id": ing_id, "quantity": 2})
    assert resp.status_code == 201
    item_id = resp.json()["id"]
    resp = await async_client.delete(f"/inventory/{item_id}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_recipe_import_adds_inventory(monkeypatch, async_client):
    async def fake_fetch(name: str):
        return {
            "name": "Mule",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": "http://example.com/mule.jpg",
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [{"name": "Vodka", "measure": "2 oz"}],
        }

    monkeypatch.setattr("backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch)
    resp = await async_client.post("/recipes/", json={"name": "mule"})
    assert resp.status_code == 201
    resp = await async_client.get("/inventory/")
    items = resp.json()
    vodka_items = [i for i in items if i["ingredient"]["name"] == "Vodka"]
    assert vodka_items


@pytest.mark.asyncio
async def test_ingredient_deduplication(monkeypatch, async_client):
    resp = await async_client.post("/ingredients/", json={"name": "Rum"})
    assert resp.status_code == 201

    async def fake_fetch(name: str):
        return {
            "name": "Dark Drink",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": "http://example.com/dark.jpg",
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [{"name": "Dark Rum", "measure": "1 oz"}],
        }

    monkeypatch.setattr("backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch)
    resp = await async_client.post("/recipes/", json={"name": "dark drink"})
    assert resp.status_code == 201
    resp = await async_client.get("/ingredients/")
    ingredients = resp.json()
    names = [i["name"] for i in ingredients]
    assert "Dark Rum" not in names
    assert "Rum" in names

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
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
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
        return {"name": "Test", "brand": "Foo", "image_url": "http://img"}

    monkeypatch.setattr("backend.app.services.barcode.fetch_barcode", fake_lookup)
    resp = await async_client.get("/barcode/123456")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Test"
    assert data["brand"] == "Foo"
    assert data["image_url"] == "http://img"


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
    db = next(override_get_db())
    units = db.query(models.Unit).all()
    db.close()
    names = [u.name for u in units]
    assert "oz" in names


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


@pytest.mark.asyncio
async def test_synonym_crud(async_client):
    resp = await async_client.get("/synonyms/")
    assert resp.status_code == 200
    initial = len(resp.json())

    resp = await async_client.post(
        "/synonyms/",
        json={"alias": "whisky", "canonical": "Whiskey"},
    )
    assert resp.status_code == 201
    assert resp.json()["canonical"] == "Whiskey"

    resp = await async_client.get("/synonyms/")
    assert len(resp.json()) == initial + 1

    resp = await async_client.delete("/synonyms/whisky")
    assert resp.status_code == 204

    resp = await async_client.get("/synonyms/")
    assert len(resp.json()) == initial


@pytest.mark.asyncio
async def test_unit_synonym_handled(monkeypatch, async_client):
    async def fake_fetch(name: str):
        return {
            "name": "Test Drink",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": "http://example.com/test.jpg",
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [{"name": "Vodka", "measure": "2 ounces"}],
        }

    monkeypatch.setattr("backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch)
    await async_client.post("/recipes/", json={"name": "test drink"})
    db = next(override_get_db())
    units = [u.name for u in db.query(models.Unit).all()]
    db.close()
    assert "oz" in units


@pytest.mark.asyncio
async def test_recipe_find_inventory(monkeypatch, async_client):
    from backend.app.db import crud, schemas
    async def fake_fetch(name: str):
        if name == "vodka only":
            return {
                "name": "Vodka Only",
                "alcoholic": "Alcoholic",
                "instructions": "Mix",
                "thumb": "http://example.com/vodka.jpg",
                "tags": [],
                "categories": [],
                "ibas": [],
                "ingredients": [{"name": "Vodka", "measure": "2 oz"}],
            }
        return {
            "name": "Vodka Gin",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": "http://example.com/vg.jpg",
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [
                {"name": "Vodka", "measure": "2 oz"},
                {"name": "Gin", "measure": "1 oz"},
            ],
        }

    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    monkeypatch.setattr("backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch)

    # ensure vodka inventory with quantity > 0
    db = next(override_get_db())
    ing = crud.get_or_create_ingredient(db, schemas.IngredientCreate(name="Vodka"))
    if not crud.get_inventory_by_ingredient(db, ing.id):
        crud.create_inventory_item(db, schemas.InventoryItemCreate(ingredient_id=ing.id, quantity=1))
    else:
        crud.update_inventory_item(db, crud.get_inventory_by_ingredient(db, ing.id).id, schemas.InventoryItemUpdate(quantity=1))
    db.close()

    await async_client.post("/recipes/", json={"name": "vodka only"})
    await async_client.post("/recipes/", json={"name": "vodka gin"})

    resp = await async_client.get("/recipes/find", params={"available_only": True, "q": "vodka"})
    assert resp.status_code == 200
    data = resp.json()
    names = [r["name"] for r in data]
    assert "Vodka Only" in names
    assert "Vodka Gin" not in names
    vo = next(r for r in data if r["name"] == "Vodka Only")
    assert vo["available_count"] == 1
    assert vo["missing_count"] == 0

    resp = await async_client.get("/recipes/find", params={"order_missing": True, "q": "vodka"})
    assert resp.status_code == 200
    data = resp.json()
    names = [r["name"] for r in data]
    assert names[0] == "Vodka Only"
    vg = next(r for r in data if r["name"] == "Vodka Gin")
    assert vg["available_count"] == 1
    assert vg["missing_count"] == 1

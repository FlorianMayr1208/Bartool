from typing import AsyncGenerator

import pytest
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


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    transport = httpx.ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.anyio
async def test_create_and_list_ingredient(async_client):
    data = {"name": "Rum"}
    resp = await async_client.post("/ingredients/", json=data)
    assert resp.status_code == 201
    created = resp.json()
    assert created["name"] == "Rum"

    resp = await async_client.get("/ingredients/")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


@pytest.mark.anyio
async def test_recipe_crud(async_client):
    payload = {
        "name": "Mojito",
        "alcoholic": "Alcoholic",
        "instructions": "Mix it",
        "thumb": "http://example.com/mojito.jpg",
        "tags": ["Classic"],
        "categories": ["Cocktail"],
        "ibas": ["New Era"],
        "ingredients": [{"name": "Rum", "measure": "2 oz"}],
    }

    resp = await async_client.post("/recipes/", json=payload)
    assert resp.status_code == 201
    created = resp.json()
    assert created["name"] == "Mojito"
    assert created["ingredients"][0]["name"] == "Rum"

    recipe_id = created["id"]

    resp = await async_client.get(f"/recipes/{recipe_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Mojito"

    resp = await async_client.patch(
        f"/recipes/{recipe_id}",
        json={
            "name": "Updated Mojito",
            "ingredients": [{"name": "Mint", "measure": "8 leaves"}],
        },
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["name"] == "Updated Mojito"
    assert updated["ingredients"][0]["name"] == "Mint"

    resp = await async_client.delete(f"/recipes/{recipe_id}")
    assert resp.status_code == 204

    resp = await async_client.get(f"/recipes/{recipe_id}")
    assert resp.status_code == 404


@pytest.mark.anyio
async def test_inventory_patch(async_client):
    resp = await async_client.post("/ingredients/", json={"name": "Vodka"})
    ing_id = resp.json()["id"]
    await async_client.post("/ingredients/", json={"name": "Gin"})

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


@pytest.mark.anyio
async def test_inventory_create_delete(async_client):
    resp = await async_client.post("/ingredients/", json={"name": "Tequila"})
    ing_id = resp.json()["id"]
    resp = await async_client.post("/inventory/", json={"ingredient_id": ing_id, "quantity": 2})
    assert resp.status_code == 201
    item_id = resp.json()["id"]
    resp = await async_client.delete(f"/inventory/{item_id}")
    assert resp.status_code == 204


@pytest.mark.anyio
async def test_recipe_create_adds_inventory(async_client):
    resp = await async_client.post(
        "/recipes/",
        json={
            "name": "Mule",
            "ingredients": [{"name": "Vodka", "measure": "2 oz"}],
        },
    )
    assert resp.status_code == 201
    resp = await async_client.get("/inventory/")
    items = resp.json()
    vodka_items = [i for i in items if i["ingredient"]["name"] == "Vodka"]
    assert vodka_items


@pytest.mark.anyio
async def test_ingredient_deduplication(async_client):
    resp = await async_client.post("/ingredients/", json={"name": "Rum"})
    assert resp.status_code == 201

    resp = await async_client.post(
        "/recipes/",
        json={
            "name": "Dark Drink",
            "ingredients": [{"name": "Dark Rum", "measure": "1 oz"}],
        },
    )
    assert resp.status_code == 201
    resp = await async_client.get("/ingredients/")
    ingredients = resp.json()
    names = [i["name"] for i in ingredients]
    assert "Dark Rum" not in names
    assert "Rum" in names


@pytest.mark.anyio
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

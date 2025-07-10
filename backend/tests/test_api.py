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
        return "Mojito"

    monkeypatch.setattr("backend.app.services.cocktaildb.fetch_recipe_name", fake_fetch)
    resp = await async_client.post("/recipes/", json={"name": "mojito"})
    assert resp.status_code == 201
    assert resp.json()["name"] == "Mojito"


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

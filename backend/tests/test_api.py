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
            "glass": "Highball glass",
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
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    resp = await async_client.post("/recipes/", json={"name": "mojito"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["name"] == "Mojito"
    assert body["glass"]["name"] == "Highball glass"
    assert body["alcoholic"]["name"] == "Alcoholic"

    db = next(override_get_db())
    recipe = db.query(models.Recipe).filter_by(id=body["id"]).first()
    assert recipe.glass.name == "Highball glass"
    assert recipe.alcoholic.name == "Alcoholic"
    db.close()


@pytest.mark.asyncio
async def test_get_recipe(monkeypatch, async_client):
    async def fake_fetch(name: str):
        return {
            "name": "Mojito",
            "alcoholic": "Alcoholic",
            "glass": "Highball glass",
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
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)
    resp = await async_client.post("/recipes/", json={"name": "mojito"})
    recipe_id = resp.json()["id"]

    resp = await async_client.get(f"/recipes/{recipe_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Mojito"
    assert data["glass"]["name"] == "Highball glass"
    assert data["alcoholic"]["name"] == "Alcoholic"
    ing = next(i for i in data["ingredients"] if i["name"] == "Rum")
    assert ing["measure"] == "2 oz (60 ml)"
    assert ing["inventory_quantity"] == 0
    assert ing["inventory_item_id"] is not None


@pytest.mark.asyncio
async def test_recipe_search(monkeypatch, async_client):
    async def fake_search(name: str):
        return [
            {
                "name": "Margarita",
                "alcoholic": "Alcoholic",
                "glass": None,
                "instructions": "Mix",
                "thumb": "http://example.com/margarita.jpg",
                "tags": [],
                "categories": [],
                "ibas": [],
            },
            {
                "name": "Blue Margarita",
                "alcoholic": "Alcoholic",
                "glass": None,
                "instructions": "Mix blue",
                "thumb": "http://example.com/blue.jpg",
                "tags": [],
                "categories": [],
                "ibas": [],
            },
        ]

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.search_recipes_details", fake_search
    )
    monkeypatch.setattr("backend.app.api.recipes.search_recipes_details", fake_search)
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
    item = crud.create_inventory_item(
        db, schemas.InventoryItemCreate(ingredient_id=ing_id, quantity=1)
    )
    db.close()
    resp = await async_client.get(f"/inventory/{item.id}")
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 1

    resp = await async_client.patch(f"/inventory/{item.id}", json={"quantity": 5})
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 5


@pytest.mark.asyncio
async def test_barcode_lookup(monkeypatch, async_client):
    async def fake_lookup(ean: str, db):
        return (
            {
                "name": "Test",
                "brand": "Foo",
                "image_url": "http://img",
                "keywords": ["gin", "liquor"],
            },
            False,
        )

    monkeypatch.setattr("backend.app.services.barcode.fetch_barcode", fake_lookup)
    resp = await async_client.get("/barcode/123456")
    assert resp.status_code == 200
    body = resp.json()
    data = body["data"]
    assert body["from_cache"] is False
    assert data["name"] == "Test"
    assert data["brand"] == "Foo"
    assert data["image_url"] == "http://img"
    assert data["keywords"] == ["gin", "liquor"]


@pytest.mark.asyncio
async def test_barcode_lookup_cache(monkeypatch, async_client):
    """Fetching the same barcode twice should use the cache."""

    class MockResp:
        def __init__(self, data):
            self.status_code = 200
            self._data = data

        def json(self):
            return self._data

    class FakeClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            pass

        async def get(self, url, timeout=10):
            return MockResp(
                {
                    "status": 1,
                    "product": {
                        "product_name": "Gin",
                        "brands": "Bar",
                        "image_front_url": "http://img",
                        "_keywords": ["gin"],
                    },
                }
            )

    monkeypatch.setattr("backend.app.services.barcode.httpx.AsyncClient", FakeClient)

    resp = await async_client.get("/barcode/111111")
    assert resp.status_code == 200
    assert resp.json()["from_cache"] is False

    class FailClient(FakeClient):
        async def get(self, url, timeout=10):
            raise RuntimeError("network call")

    monkeypatch.setattr("backend.app.services.barcode.httpx.AsyncClient", FailClient)

    resp = await async_client.get("/barcode/111111")
    assert resp.status_code == 200
    body = resp.json()
    assert body["from_cache"] is True
    assert body["data"]["name"] == "Gin"


@pytest.mark.asyncio
async def test_inventory_create_delete(async_client):
    resp = await async_client.post("/ingredients/", json={"name": "Tequila"})
    ing_id = resp.json()["id"]
    resp = await async_client.post(
        "/inventory/", json={"ingredient_id": ing_id, "quantity": 2}
    )
    assert resp.status_code == 201
    item_id = resp.json()["id"]
    resp = await async_client.delete(f"/inventory/{item_id}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_inventory_create_increment(async_client):
    resp = await async_client.post("/ingredients/", json={"name": "Rum"})
    ing_id = resp.json()["id"]
    resp = await async_client.post(
        "/inventory/", json={"ingredient_id": ing_id, "quantity": 1}
    )
    assert resp.status_code == 201
    resp = await async_client.post(
        "/inventory/", json={"ingredient_id": ing_id, "quantity": 1}
    )
    assert resp.status_code == 201
    assert resp.json()["quantity"] == 2
    resp = await async_client.get("/inventory/")
    items = [i for i in resp.json() if i["ingredient"]["id"] == ing_id]
    assert len(items) == 1
    assert items[0]["quantity"] == 2


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

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
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

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
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
async def test_synonym_import(async_client):
    data = {"tester": "Test"}
    resp = await async_client.post("/synonyms/import", json=data)
    assert resp.status_code == 201
    resp = await async_client.get("/synonyms/")
    aliases = [s["alias"] for s in resp.json()]
    assert "tester" in aliases
    await async_client.delete("/synonyms/tester")


@pytest.mark.asyncio
async def test_unit_synonym_crud(async_client):
    resp = await async_client.get("/unit-synonyms/")
    assert resp.status_code == 200
    aliases = [s["alias"] for s in resp.json()]
    assert "testunit" not in aliases

    resp = await async_client.post(
        "/unit-synonyms/",
        json={"alias": "testunit", "canonical": "tu"},
    )
    assert resp.status_code == 201
    assert resp.json()["canonical"] == "tu"

    resp = await async_client.get("/unit-synonyms/")
    aliases = [s["alias"] for s in resp.json()]
    assert "testunit" in aliases

    resp = await async_client.delete("/unit-synonyms/testunit")
    assert resp.status_code == 204

    resp = await async_client.get("/unit-synonyms/")
    aliases = [s["alias"] for s in resp.json()]
    assert "testunit" not in aliases


@pytest.mark.asyncio
async def test_unit_synonym_import(async_client):
    data = {"unittest": "ut"}
    resp = await async_client.post("/unit-synonyms/import", json=data)
    assert resp.status_code == 201
    resp = await async_client.get("/unit-synonyms/")
    aliases = [s["alias"] for s in resp.json()]
    assert "unittest" in aliases
    await async_client.delete("/unit-synonyms/unittest")


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

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    await async_client.post("/recipes/", json={"name": "test drink"})
    db = next(override_get_db())
    units = [u.name for u in db.query(models.Unit).all()]
    db.close()
    assert "oz" in units


@pytest.mark.asyncio
async def test_inventory_aggregate_synonyms(async_client):
    r1 = await async_client.post("/ingredients/", json={"name": "Rum"})
    r1_id = r1.json()["id"]
    r2 = await async_client.post("/ingredients/", json={"name": "151 Proof Rum"})
    r2_id = r2.json()["id"]

    await async_client.post("/inventory/", json={"ingredient_id": r1_id, "quantity": 1})
    await async_client.post("/inventory/", json={"ingredient_id": r2_id, "quantity": 2})

    await async_client.post(
        "/synonyms/", json={"alias": "151 proof rum", "canonical": "Rum"}
    )

    resp = await async_client.post("/inventory/aggregate-synonyms")
    assert resp.status_code == 200

    resp = await async_client.get("/inventory/")
    items = resp.json()
    rum_items = [i for i in items if i["ingredient"]["name"] == "Rum"]
    assert rum_items
    assert rum_items[0]["quantity"] >= 3


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
    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )

    # ensure vodka inventory with quantity > 0
    db = next(override_get_db())
    ing = crud.get_or_create_ingredient(db, schemas.IngredientCreate(name="Vodka"))
    if not crud.get_inventory_by_ingredient(db, ing.id):
        crud.create_inventory_item(
            db, schemas.InventoryItemCreate(ingredient_id=ing.id, quantity=1)
        )
    else:
        crud.update_inventory_item(
            db,
            crud.get_inventory_by_ingredient(db, ing.id).id,
            schemas.InventoryItemUpdate(quantity=1),
        )
    db.close()

    await async_client.post("/recipes/", json={"name": "vodka only"})
    await async_client.post("/recipes/", json={"name": "vodka gin"})

    resp = await async_client.get(
        "/search", params={"available_only": True, "q": "vodka"}
    )
    assert resp.status_code == 200
    data = resp.json()
    names = [r["name"] for r in data]
    assert "Vodka Only" in names
    assert "Vodka Gin" not in names
    vo = next(r for r in data if r["name"] == "Vodka Only")
    assert vo["available_count"] == 1
    assert vo["missing_count"] == 0

    resp = await async_client.get(
        "/search", params={"order_missing": True, "q": "vodka"}
    )
    assert resp.status_code == 200
    data = resp.json()
    names = [r["name"] for r in data]
    assert names[0] == "Vodka Only"
    vg = next(r for r in data if r["name"] == "Vodka Gin")
    assert vg["available_count"] == 1
    assert vg["missing_count"] == 1


@pytest.mark.asyncio
async def test_search_by_tag_category(monkeypatch, async_client):
    async def fake_fetch(name: str):
        if name == "tagged":
            return {
                "name": "Tagged",
                "alcoholic": "Alcoholic",
                "instructions": "Mix",
                "thumb": None,
                "tags": ["Summer"],
                "categories": ["Seasonal"],
                "ibas": [],
                "ingredients": [{"name": "Rum", "measure": "1 oz"}],
            }
        return {
            "name": "Other",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": None,
            "tags": [],
            "categories": ["Seasonal"],
            "ibas": [],
            "ingredients": [{"name": "Rum", "measure": "1 oz"}],
        }

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)

    await async_client.post("/recipes/", json={"name": "tagged"})
    await async_client.post("/recipes/", json={"name": "other"})

    resp = await async_client.get("/search", params={"tag": "Summer"})
    assert resp.status_code == 200
    data = resp.json()
    names = [r["name"] for r in data]
    assert names == ["Tagged"]

    resp = await async_client.get("/search", params={"category": "Seasonal"})
    assert resp.status_code == 200
    data = resp.json()
    names = {r["name"] for r in data}
    assert {"Tagged", "Other"} == names


@pytest.mark.asyncio
async def test_list_tags_categories(monkeypatch, async_client):
    async def fake_fetch(name: str):
        return {
            "name": "Cooler",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": None,
            "tags": ["Refreshing"],
            "categories": ["Longdrink"],
            "ibas": [],
            "ingredients": [{"name": "Rum", "measure": "1 oz"}],
        }

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)

    await async_client.post("/recipes/", json={"name": "cooler"})

    resp = await async_client.get("/tags/")
    assert resp.status_code == 200
    tags = [t["name"] for t in resp.json()]
    assert "Refreshing" in tags

    resp = await async_client.get("/categories/")
    assert resp.status_code == 200
    cats = [c["name"] for c in resp.json()]
    assert "Longdrink" in cats


@pytest.mark.asyncio
async def test_search_by_alcoholic(monkeypatch, async_client):
    async def fake_fetch(name: str):
        if name == "virgin":
            return {
                "name": "Virgin Drink",
                "alcoholic": "Non alcoholic",
                "instructions": "Mix",
                "thumb": None,
                "tags": [],
                "categories": [],
                "ibas": [],
                "ingredients": [{"name": "Lime", "measure": "1 oz"}],
            }
        return {
            "name": "Boozy",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": None,
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [{"name": "Rum", "measure": "1 oz"}],
        }

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)

    await async_client.post("/recipes/", json={"name": "virgin"})
    await async_client.post("/recipes/", json={"name": "boozy"})

    resp = await async_client.get("/search", params={"alcoholic": "Non alcoholic"})
    assert resp.status_code == 200
    data = resp.json()
    names = [r["name"] for r in data]
    assert names == ["Virgin Drink"]


@pytest.mark.asyncio
async def test_shopping_list_from_recipe(monkeypatch, async_client):
    async def fake_fetch(name: str):
        return {
            "name": "Gin Drink",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": None,
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [
                {"name": "Vodka", "measure": "2 oz"},
                {"name": "Gin", "measure": "1 oz"},
            ],
        }

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)

    resp = await async_client.post("/recipes/", json={"name": "gin drink"})
    assert resp.status_code == 201
    recipe_id = resp.json()["id"]

    # add vodka to inventory so only gin is missing
    vodka = resp.json()["ingredients"][0]["name"]
    resp2 = await async_client.post("/ingredients/", json={"name": vodka})
    vodka_id = resp2.json()["id"]
    await async_client.post(
        "/inventory/", json={"ingredient_id": vodka_id, "quantity": 1}
    )

    resp = await async_client.post(f"/shopping-list/from-recipe/{recipe_id}")
    assert resp.status_code == 201

    resp = await async_client.get("/shopping-list/")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) == 1
    assert items[0]["ingredient"]["name"] == "Gin"
    assert items[0]["recipe"]["id"] == recipe_id
    assert items[0]["unit"] == "oz"


@pytest.mark.asyncio
async def test_clear_shopping_list(monkeypatch, async_client):
    async def fake_fetch(name: str):
        return {
            "name": "Gin Drink",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": None,
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [
                {"name": "Gin", "measure": "1 oz"},
            ],
        }

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)

    resp = await async_client.post("/recipes/", json={"name": "gin drink"})
    recipe_id = resp.json()["id"]

    await async_client.post(f"/shopping-list/from-recipe/{recipe_id}")

    resp = await async_client.delete("/shopping-list/")
    assert resp.status_code == 204

    resp = await async_client.get("/shopping-list/")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_db_export_import(monkeypatch, async_client, tmp_path):
    tmp_db = tmp_path / "db.sqlite"
    tmp_db.write_text("old")
    from backend.app.api import db_admin
    monkeypatch.setattr(db_admin, "_DB_PATH", tmp_db)

    resp = await async_client.get("/db/export")
    assert resp.status_code == 200
    assert resp.content == b"old"

    new_file = tmp_path / "new.sqlite"
    new_file.write_text("new")
    with new_file.open("rb") as f:
        resp = await async_client.post(
            "/db/import",
            files={"file": ("new.sqlite", f, "application/octet-stream")},
        )
    assert resp.status_code == 201
    assert tmp_db.read_text() == "new"


@pytest.mark.asyncio
async def test_suggestions(monkeypatch, async_client):
    async def fake_fetch(name: str):
        if name == "vodka only":
            return {
                "name": "Vodka Only",
                "alcoholic": "Alcoholic",
                "instructions": "Mix",
                "thumb": None,
                "tags": [],
                "categories": [],
                "ibas": [],
                "ingredients": [{"name": "Vodka", "measure": "1 oz"}],
            }
        if name == "vodka gin":
            return {
                "name": "Vodka Gin",
                "alcoholic": "Alcoholic",
                "instructions": "Mix",
                "thumb": None,
                "tags": [],
                "categories": [],
                "ibas": [],
                "ingredients": [
                    {"name": "Vodka", "measure": "1 oz"},
                    {"name": "Gin", "measure": "1 oz"},
                ],
            }
        return {
            "name": "Rum Drink",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": None,
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [{"name": "Rum", "measure": "1 oz"}],
        }

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)

    await async_client.post("/recipes/", json={"name": "vodka only"})
    await async_client.post("/recipes/", json={"name": "vodka gin"})
    await async_client.post("/recipes/", json={"name": "rum drink"})

    resp = await async_client.post("/ingredients/", json={"name": "Vodka"})
    vodka_id = resp.json()["id"]
    await async_client.post(
        "/inventory/", json={"ingredient_id": vodka_id, "quantity": 1}
    )

    resp = await async_client.get("/suggestions", params={"limit": 1, "max_missing": 0})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["missing_count"] == 0


@pytest.mark.asyncio
async def test_suggestions_by_ingredients(monkeypatch, async_client):
    async def fake_fetch(name: str):
        if name == "vodka only":
            return {
                "name": "Vodka Only",
                "alcoholic": "Alcoholic",
                "instructions": "Mix",
                "thumb": None,
                "tags": [],
                "categories": [],
                "ibas": [],
                "ingredients": [{"name": "Vodka", "measure": "1 oz"}],
            }
        if name == "vodka gin":
            return {
                "name": "Vodka Gin",
                "alcoholic": "Alcoholic",
                "instructions": "Mix",
                "thumb": None,
                "tags": [],
                "categories": [],
                "ibas": [],
                "ingredients": [
                    {"name": "Vodka", "measure": "1 oz"},
                    {"name": "Gin", "measure": "1 oz"},
                ],
            }
        return {
            "name": "Rum Drink",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": None,
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [{"name": "Rum", "measure": "1 oz"}],
        }

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)

    await async_client.post("/recipes/", json={"name": "vodka only"})
    await async_client.post("/recipes/", json={"name": "vodka gin"})
    await async_client.post("/recipes/", json={"name": "rum drink"})

    resp = await async_client.post("/ingredients/", json={"name": "Vodka"})
    vodka_id = resp.json()["id"]
    resp = await async_client.post("/ingredients/", json={"name": "Gin"})
    gin_id = resp.json()["id"]

    await async_client.post(
        "/inventory/", json={"ingredient_id": vodka_id, "quantity": 1}
    )

    resp = await async_client.get(
        "/suggestions/by-ingredients",
        params=[("ingredients", vodka_id), ("ingredients", gin_id), ("mode", "or")],
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data[0]["name"] == "Vodka Gin"


@pytest.mark.asyncio
async def test_suggestions_macro_filter(monkeypatch, async_client):
    async def fake_fetch(name: str):
        if name == "sweet":
            return {
                "name": "Sweet",
                "alcoholic": "Alcoholic",
                "instructions": "Mix",
                "thumb": None,
                "tags": [],
                "categories": [],
                "ibas": [],
                "ingredients": [{"name": "Simple Syrup", "measure": "1 oz"}],
            }
        if name == "bitter":
            return {
                "name": "Bitter",
                "alcoholic": "Alcoholic",
                "instructions": "Mix",
                "thumb": None,
                "tags": [],
                "categories": [],
                "ibas": [],
                "ingredients": [{"name": "Campari", "measure": "1 oz"}],
            }
        return {
            "name": "Neutral",
            "alcoholic": "Alcoholic",
            "instructions": "Mix",
            "thumb": None,
            "tags": [],
            "categories": [],
            "ibas": [],
            "ingredients": [{"name": "Vodka", "measure": "1 oz"}],
        }

    monkeypatch.setattr(
        "backend.app.services.cocktaildb.fetch_recipe_details", fake_fetch
    )
    monkeypatch.setattr("backend.app.api.recipes.fetch_recipe_details", fake_fetch)

    await async_client.post("/recipes/", json={"name": "sweet"})
    await async_client.post("/recipes/", json={"name": "bitter"})
    await async_client.post("/recipes/", json={"name": "neutral"})

    resp = await async_client.get(
        "/suggestions/by-ingredients",
        params=[("macros", "sweet"), ("macro_mode", "and")],
    )
    assert resp.status_code == 200
    names = [r["name"] for r in resp.json()]
    assert names == ["Sweet"]

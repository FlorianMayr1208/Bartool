from sqlalchemy import func
from sqlalchemy.orm import Session

from ..services import synonyms
from . import models, schemas


# Ingredient CRUD

def get_ingredient(db: Session, ingredient_id: int):
    return db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()


def create_ingredient(db: Session, ingredient: schemas.IngredientCreate):
    canonical = synonyms.canonical_name(ingredient.name)
    existing = (
        db.query(models.Ingredient)
        .filter(func.lower(models.Ingredient.name) == canonical.lower())
        .first()
    )
    if existing:
        return existing

    data = ingredient.model_dump()
    data["name"] = canonical
    db_obj = models.Ingredient(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def list_ingredients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Ingredient).offset(skip).limit(limit).all()


def get_ingredient_by_name(db: Session, name: str):
    canonical = synonyms.canonical_name(name)
    return (
        db.query(models.Ingredient)
        .filter(func.lower(models.Ingredient.name) == canonical.lower())
        .first()
    )


def get_or_create_ingredient(db: Session, ingredient: schemas.IngredientCreate):
    existing = get_ingredient_by_name(db, ingredient.name)
    if existing:
        return existing
    return create_ingredient(db, ingredient)


# Recipe CRUD

def get_recipe(db: Session, recipe_id: int):
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()


def get_recipe_with_inventory(db: Session, recipe_id: int):
    recipe = get_recipe(db, recipe_id)
    if not recipe:
        return None

    ingredients: list[schemas.RecipeIngredientWithInventory] = []
    for r_ing in recipe.ingredients:
        canonical = synonyms.canonical_name(r_ing.name)
        ing = get_or_create_ingredient(db, schemas.IngredientCreate(name=canonical))
        item = get_inventory_by_ingredient(db, ing.id)
        ingredients.append(
            schemas.RecipeIngredientWithInventory(
                id=r_ing.id,
                name=r_ing.name,
                measure=r_ing.measure,
                inventory_item_id=item.id if item else None,
                inventory_quantity=item.quantity if item else 0,
            )
        )

    base = schemas.Recipe.model_validate(recipe, from_attributes=True).model_dump(
        exclude={"ingredients"}
    )
    return schemas.RecipeDetail(**base, ingredients=ingredients)


def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    data = recipe.model_dump(exclude={"ingredients"})
    db_obj = models.Recipe(**data)
    db_obj.ingredients = [
        models.RecipeIngredient(name=i.name, measure=i.measure) for i in recipe.ingredients
    ]
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def list_recipes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Recipe).offset(skip).limit(limit).all()


def delete_recipe(db: Session, recipe_id: int) -> bool:
    recipe = get_recipe(db, recipe_id)
    if not recipe:
        return False
    db.delete(recipe)
    db.commit()
    return True


# InventoryItem CRUD

def get_inventory_item(db: Session, item_id: int):
    return db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()


def get_inventory_by_ingredient(db: Session, ingredient_id: int):
    return (
        db.query(models.InventoryItem)
        .filter(models.InventoryItem.ingredient_id == ingredient_id)
        .first()
    )


def create_inventory_item(db: Session, item: schemas.InventoryItemCreate):
    existing = get_inventory_by_ingredient(db, item.ingredient_id)
    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        return existing
    db_obj = models.InventoryItem(**item.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def ensure_inventory_for_ingredients(
    db: Session, ingredients: list[schemas.RecipeIngredientCreate]
) -> None:
    for ing in ingredients:
        db_ing = get_or_create_ingredient(db, schemas.IngredientCreate(name=ing.name))
        if not get_inventory_by_ingredient(db, db_ing.id):
            db.add(
                models.InventoryItem(
                    ingredient_id=db_ing.id,
                    quantity=0,
                    status="available",
                )
            )
    db.commit()


def update_inventory_item(db: Session, item_id: int, item_update: schemas.InventoryItemUpdate):
    db_obj = get_inventory_item(db, item_id)
    if not db_obj:
        return None
    for field, value in item_update.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def list_inventory_items(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    sort: str = "name",
    order: str = "asc",
):
    from sqlalchemy import asc, desc
    from sqlalchemy.orm import selectinload

    q = db.query(models.InventoryItem).options(selectinload(models.InventoryItem.ingredient))

    if search or sort == "name":
        q = q.join(models.Ingredient)
    if search:
        q = q.filter(models.Ingredient.name.ilike(f"%{search}%"))

    if sort == "quantity":
        q = q.order_by(
            asc(models.InventoryItem.quantity)
            if order == "asc"
            else desc(models.InventoryItem.quantity)
        )
    else:
        q = q.order_by(
            asc(models.Ingredient.name) if order == "asc" else desc(models.Ingredient.name)
        )

    return q.offset(skip).limit(limit).all()


def aggregate_inventory_by_synonyms(db: Session) -> None:
    from sqlalchemy.orm import selectinload

    items = (
        db.query(models.InventoryItem)
        .options(selectinload(models.InventoryItem.ingredient))
        .all()
    )
    for item in list(items):
        canonical = synonyms.canonical_name(item.ingredient.name)
        if canonical == item.ingredient.name:
            continue
        canon_ing = get_or_create_ingredient(db, schemas.IngredientCreate(name=canonical))
        if item.ingredient_id == canon_ing.id:
            continue
        existing = get_inventory_by_ingredient(db, canon_ing.id)
        if existing:
            existing.quantity += item.quantity
            db.delete(item)
        else:
            item.ingredient_id = canon_ing.id
    db.commit()

    for ing in db.query(models.Ingredient).all():
        used = (
            db.query(models.InventoryItem)
            .filter(models.InventoryItem.ingredient_id == ing.id)
            .first()
        )
        if not used:
            db.delete(ing)
    db.commit()


def delete_inventory_item(db: Session, item_id: int) -> bool:
    item = get_inventory_item(db, item_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def get_suggestions(
    db: Session,
    limit: int = 20,
    max_missing: int | None = None,
) -> list[dict]:
    from sqlalchemy.orm import selectinload

    inventory = (
        db.query(models.InventoryItem)
        .options(selectinload(models.InventoryItem.ingredient))
        .filter(models.InventoryItem.quantity > 0)
        .all()
    )
    available = {synonyms.canonical_name(item.ingredient.name).lower() for item in inventory}

    all_recipes = (
        db.query(models.Recipe)
        .options(selectinload(models.Recipe.ingredients))
        .all()
    )

    results = []
    for recipe in all_recipes:
        if not recipe.ingredients:
            continue
        total = len(recipe.ingredients)
        avail_count = sum(
            1 for ing in recipe.ingredients
            if synonyms.canonical_name(ing.name).lower() in available
        )
        missing = total - avail_count
        if max_missing is not None and missing > max_missing:
            continue
        results.append({
            "id": recipe.id,
            "name": recipe.name,
            "thumb": recipe.thumb,
            "missing_count": missing,
            "available_count": avail_count,
        })

    results.sort(key=lambda r: (r["missing_count"], r["name"]))
    return results[:limit]


def get_suggestions_by_ingredients(
    db: Session,
    ingredient_ids: list[int],
    mode: str = "and",
    max_missing: int = 3,
    limit: int = 50,
) -> list[dict]:
    from sqlalchemy.orm import selectinload

    selected_ings = (
        db.query(models.Ingredient)
        .filter(models.Ingredient.id.in_(ingredient_ids))
        .all()
    )
    selected_names = {synonyms.canonical_name(ing.name).lower() for ing in selected_ings}

    inventory = (
        db.query(models.InventoryItem)
        .options(selectinload(models.InventoryItem.ingredient))
        .filter(models.InventoryItem.quantity > 0)
        .all()
    )
    available = {synonyms.canonical_name(item.ingredient.name).lower() for item in inventory}

    all_recipes = (
        db.query(models.Recipe)
        .options(selectinload(models.Recipe.ingredients))
        .all()
    )

    results = []
    for recipe in all_recipes:
        if not recipe.ingredients:
            continue
        recipe_names = {synonyms.canonical_name(i.name).lower() for i in recipe.ingredients}

        if selected_names:
            if mode == "and" and not selected_names.issubset(recipe_names):
                continue
            elif mode == "or" and not (selected_names & recipe_names):
                continue
            elif mode == "not" and (selected_names & recipe_names):
                continue

        total = len(recipe.ingredients)
        avail_count = sum(1 for name in recipe_names if name in available)
        missing = total - avail_count

        if missing > max_missing:
            continue

        results.append({
            "id": recipe.id,
            "name": recipe.name,
            "thumb": recipe.thumb,
            "missing_count": missing,
            "available_count": avail_count,
        })

    results.sort(key=lambda r: (r["missing_count"], r["name"]))
    return results[:limit]

from sqlalchemy.orm import Session
from sqlalchemy import func

from ..services import synonyms

from . import models, schemas

# Ingredient CRUD

def get_ingredient(db: Session, ingredient_id: int):
    return db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()


def create_ingredient(db: Session, ingredient: schemas.IngredientCreate):
    canonical = synonyms.canonical_name(ingredient.name)
    existing = db.query(models.Ingredient).filter(
        func.lower(models.Ingredient.name) == canonical.lower()
    ).first()
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
    return db.query(models.Ingredient).filter(
        func.lower(models.Ingredient.name) == canonical.lower()
    ).first()


def get_or_create_ingredient(db: Session, ingredient: schemas.IngredientCreate):
    existing = get_ingredient_by_name(db, ingredient.name)
    if existing:
        return existing
    return create_ingredient(db, ingredient)


# Recipe CRUD

def get_recipe(db: Session, recipe_id: int):
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()


def _get_or_create_by_name(db: Session, model, name: str):
    obj = db.query(model).filter(func.lower(model.name) == name.lower()).first()
    if obj:
        return obj
    obj = model(name=name)
    db.add(obj)
    db.flush()
    return obj


def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    data = recipe.model_dump(exclude={"tags", "categories", "ibas", "ingredients"})
    db_obj = models.Recipe(**data)

    db_obj.tags = [_get_or_create_by_name(db, models.Tag, t) for t in recipe.tags]
    db_obj.categories = [_get_or_create_by_name(db, models.Category, c) for c in recipe.categories]
    db_obj.ibas = [_get_or_create_by_name(db, models.Iba, i) for i in recipe.ibas]
    db_obj.ingredients = [models.RecipeIngredient(name=i.name, measure=i.measure) for i in recipe.ingredients]

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def list_recipes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Recipe).offset(skip).limit(limit).all()


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
    db_obj = models.InventoryItem(**item.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def ensure_inventory_for_ingredients(
    db: Session, ingredients: list[schemas.RecipeIngredientCreate]
) -> None:
    """Add missing ingredients to inventory with quantity 0."""
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


def list_inventory_items(db: Session, skip: int = 0, limit: int = 100):
    from sqlalchemy.orm import selectinload
    return (
        db.query(models.InventoryItem)
        .options(selectinload(models.InventoryItem.ingredient))
        .offset(skip)
        .limit(limit)
        .all()
    )


def delete_inventory_item(db: Session, item_id: int) -> bool:
    item = get_inventory_item(db, item_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True

from sqlalchemy.orm import Session

from . import models, schemas

# Ingredient CRUD

def get_ingredient(db: Session, ingredient_id: int):
    return db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()


def create_ingredient(db: Session, ingredient: schemas.IngredientCreate):
    db_obj = models.Ingredient(**ingredient.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def list_ingredients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Ingredient).offset(skip).limit(limit).all()


# Recipe CRUD

def get_recipe(db: Session, recipe_id: int):
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()


def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    data = recipe.model_dump(exclude={"tags", "categories", "ibas", "ingredients"})
    db_obj = models.Recipe(**data)
    db_obj.tags = [models.Tag(name=t) for t in recipe.tags]
    db_obj.categories = [models.Category(name=c) for c in recipe.categories]
    db_obj.ibas = [models.Iba(name=i) for i in recipe.ibas]
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


def create_inventory_item(db: Session, item: schemas.InventoryItemCreate):
    db_obj = models.InventoryItem(**item.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


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

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


# Recipe CRUD

def get_recipe(db: Session, recipe_id: int):
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()


def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    db_obj = models.Recipe(**recipe.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


# InventoryItem CRUD

def get_inventory_item(db: Session, item_id: int):
    return db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()


def create_inventory_item(db: Session, item: schemas.InventoryItemCreate):
    db_obj = models.InventoryItem(**item.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

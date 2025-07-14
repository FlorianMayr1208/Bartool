from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import crud, schemas, session

router = APIRouter()


@router.get("/", response_model=list[schemas.ShoppingListItemWithIngredient])
def list_items(skip: int = 0, limit: int = 100, db: Session = Depends(session.get_db)):
    return crud.list_shopping_list_items(db, skip=skip, limit=limit)


@router.post("/from-recipe/{recipe_id}", response_model=list[schemas.ShoppingListItemWithIngredient], status_code=201)
def add_from_recipe(recipe_id: int, db: Session = Depends(session.get_db)):
    items = crud.add_missing_ingredients_to_shopping_list(db, recipe_id)
    if items is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return items


@router.delete("/", status_code=204)
def clear_list(db: Session = Depends(session.get_db)):
    crud.clear_shopping_list(db)
    return None

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import crud, schemas, session
from ..services.cocktaildb import (
    fetch_recipe_details,
    search_recipes_details,
)

router = APIRouter()


@router.get("/search", response_model=list[schemas.RecipePreview])
async def search_recipes_endpoint(q: str):
    return await search_recipes_details(q)



@router.get("/", response_model=list[schemas.Recipe])
def list_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(session.get_db)):
    return crud.list_recipes(db, skip=skip, limit=limit)


@router.get("/{recipe_id}", response_model=schemas.RecipeDetail)
def get_recipe(recipe_id: int, db: Session = Depends(session.get_db)):
    recipe = crud.get_recipe_with_inventory(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.post("/", response_model=schemas.Recipe, status_code=201)
async def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(session.get_db)):
    details = await fetch_recipe_details(recipe.name)
    if details:
        recipe = schemas.RecipeCreate(**details)
    db_recipe = crud.create_recipe(db, recipe)
    crud.ensure_inventory_for_ingredients(db, recipe.ingredients)
    return db_recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, db: Session = Depends(session.get_db)):
    success = crud.delete_recipe(db, recipe_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return None

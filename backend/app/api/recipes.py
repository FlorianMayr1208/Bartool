from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import crud, schemas, session
from ..services.cocktaildb import fetch_recipe_name, search_recipes

router = APIRouter()


@router.get("/search", response_model=list[schemas.RecipeBase])
async def search_recipes_endpoint(q: str):
    names = await search_recipes(q)
    return [{"name": n} for n in names]

@router.get("/", response_model=list[schemas.Recipe])
def list_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(session.get_db)):
    return crud.list_recipes(db, skip=skip, limit=limit)


@router.post("/", response_model=schemas.Recipe, status_code=201)
async def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(session.get_db)):
    fetched = await fetch_recipe_name(recipe.name)
    if fetched:
        recipe.name = fetched
    return crud.create_recipe(db, recipe)

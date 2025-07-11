from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import crud, schemas, session
from ..services.cocktaildb import (
    fetch_recipe_details,
    search_recipes,
    search_recipes_details,
)

router = APIRouter()


@router.get("/search", response_model=list[schemas.RecipeBase])
async def search_recipes_endpoint(q: str):
    return await search_recipes_details(q)


@router.get("/find", response_model=list[schemas.Recipe])
def find_recipes(
    q: str | None = None,
    available_only: bool = False,
    order_missing: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(session.get_db),
):
    """Search recipes stored locally with optional inventory filters."""
    return crud.search_local_recipes(
        db,
        query=q,
        available_only=available_only,
        order_missing=order_missing,
        skip=skip,
        limit=limit,
    )

@router.get("/", response_model=list[schemas.Recipe])
def list_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(session.get_db)):
    return crud.list_recipes(db, skip=skip, limit=limit)


@router.get("/{recipe_id}", response_model=schemas.Recipe)
def get_recipe(recipe_id: int, db: Session = Depends(session.get_db)):
    recipe = crud.get_recipe(db, recipe_id)
    if not recipe:
        from fastapi import HTTPException

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

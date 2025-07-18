from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import crud, schemas, session

router = APIRouter()

@router.get("", response_model=list[schemas.RecipeWithInventory])
def get_suggestions(
    limit: int = 4,
    max_missing: int | None = None,
    db: Session = Depends(session.get_db),
):
    """Return random recipe suggestions with few missing ingredients."""
    return crud.suggest_recipes(db, limit=limit, max_missing=max_missing)


@router.get("/by-ingredients", response_model=list[schemas.RecipeWithInventory])
def suggest_by_ingredients(
    ingredients: list[int] = Query(None),
    mode: str = "and",
    max_missing: int | None = None,
    limit: int = 100,
    db: Session = Depends(session.get_db),
):
    """Filter recipe suggestions by inventory ingredients."""
    return crud.suggest_recipes_by_ingredients(
        db,
        ingredient_ids=ingredients or [],
        mode=mode,
        max_missing=max_missing,
        limit=limit,
    )


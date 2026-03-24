from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import crud, schemas, session

router = APIRouter()


@router.get("/", response_model=list[schemas.RecipeSuggestion])
def get_suggestions(
    limit: int = 20,
    max_missing: Optional[int] = None,
    db: Session = Depends(session.get_db),
):
    return crud.get_suggestions(db, limit=limit, max_missing=max_missing)


@router.get("/by-ingredients", response_model=list[schemas.RecipeSuggestion])
def get_suggestions_by_ingredients(
    ingredients: list[int] = Query(default=[]),
    mode: str = "and",
    max_missing: int = 3,
    limit: int = 50,
    db: Session = Depends(session.get_db),
):
    return crud.get_suggestions_by_ingredients(
        db,
        ingredient_ids=ingredients,
        mode=mode,
        max_missing=max_missing,
        limit=limit,
    )

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import crud, schemas, session

router = APIRouter()

@router.get("", response_model=list[schemas.RecipeWithInventory])
def get_suggestions(
    limit: int = 3,
    max_missing: int | None = None,
    db: Session = Depends(session.get_db),
):
    """Return random recipe suggestions with few missing ingredients."""
    return crud.suggest_recipes(db, limit=limit, max_missing=max_missing)


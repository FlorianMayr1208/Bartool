from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import crud, schemas, session

router = APIRouter()


@router.get("", response_model=list[schemas.RecipeWithInventory])
def find_recipes(
    q: str | None = None,
    tag: str | None = None,
    category: str | None = None,
    alcoholic: str | None = None,
    iba: str | None = None,
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
        tag=tag,
        category=category,
        alcoholic=alcoholic,
        iba=iba,
        available_only=available_only,
        order_missing=order_missing,
        skip=skip,
        limit=limit,
    )

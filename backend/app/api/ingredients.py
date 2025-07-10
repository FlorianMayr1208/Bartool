from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import crud, schemas, session

router = APIRouter()

@router.get("/", response_model=list[schemas.Ingredient])
def list_ingredients(skip: int = 0, limit: int = 100, db: Session = Depends(session.get_db)):
    return crud.list_ingredients(db, skip=skip, limit=limit)


@router.post("/", response_model=schemas.Ingredient, status_code=201)
def create_ingredient(ingredient: schemas.IngredientCreate, db: Session = Depends(session.get_db)):
    return crud.create_ingredient(db, ingredient)

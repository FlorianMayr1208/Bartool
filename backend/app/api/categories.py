from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import crud, schemas, session

router = APIRouter()

@router.get('/', response_model=list[schemas.Category])
def list_categories(skip: int = 0, limit: int = 100, db: Session = Depends(session.get_db)):
    return crud.list_categories(db, skip=skip, limit=limit)

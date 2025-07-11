from fastapi import APIRouter, HTTPException

from ..services import synonyms
from ..db import schemas

router = APIRouter()


@router.get("/", response_model=list[schemas.Synonym])
def list_synonyms():
    return synonyms.list_synonyms()


@router.post("/", response_model=schemas.Synonym, status_code=201)
def create_synonym(s: schemas.Synonym):
    if not s.alias or not s.canonical:
        raise HTTPException(status_code=400, detail="Invalid data")
    return synonyms.add_synonym(s.alias, s.canonical)


@router.delete("/{alias}", status_code=204)
def delete_synonym(alias: str):
    synonyms.delete_synonym(alias)
    return None

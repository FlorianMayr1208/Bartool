from fastapi import APIRouter, HTTPException
from fastapi import Body

from ..services import unit_synonyms
from ..db import schemas

router = APIRouter()

@router.get('/', response_model=list[schemas.Synonym])
def list_synonyms():
    return unit_synonyms.list_synonyms()

@router.post('/', response_model=schemas.Synonym, status_code=201)
def create_synonym(s: schemas.Synonym):
    if not s.alias or not s.canonical:
        raise HTTPException(status_code=400, detail='Invalid data')
    return unit_synonyms.add_synonym(s.alias, s.canonical)

@router.delete('/{alias}', status_code=204)
def delete_synonym(alias: str):
    unit_synonyms.delete_synonym(alias)
    return None


@router.post('/import', status_code=201)
def import_unit_synonym_data(data: dict[str, str] = Body(...)):
    if not data:
        raise HTTPException(status_code=400, detail='No data provided')
    unit_synonyms.import_synonyms(data)
    return {"imported": len(data)}

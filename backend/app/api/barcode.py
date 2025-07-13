from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..services import barcode as barcode_service
from ..db import session as db_session

router = APIRouter()

@router.get("/{ean}")
async def lookup_barcode(ean: str, db: Session = Depends(db_session.get_db)):
    data = await barcode_service.fetch_barcode(ean, db)
    if not data:
        raise HTTPException(status_code=404, detail="Barcode not found")
    return data

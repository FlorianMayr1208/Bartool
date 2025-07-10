from fastapi import APIRouter, HTTPException
from ..services import barcode as barcode_service

router = APIRouter()

@router.get("/{ean}")
async def lookup_barcode(ean: str):
    data = await barcode_service.fetch_barcode(ean)
    if not data:
        raise HTTPException(status_code=404, detail="Barcode not found")
    return data

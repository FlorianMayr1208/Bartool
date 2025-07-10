from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import crud, schemas, session

router = APIRouter()

@router.get("/{item_id}", response_model=schemas.InventoryItem)
def get_item(item_id: int, db: Session = Depends(session.get_db)):
    item = crud.get_inventory_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.patch("/{item_id}", response_model=schemas.InventoryItem)
def update_item(item_id: int, item_update: schemas.InventoryItemUpdate, db: Session = Depends(session.get_db)):
    item = crud.update_inventory_item(db, item_id, item_update)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

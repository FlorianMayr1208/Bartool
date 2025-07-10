from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import crud, schemas, session

router = APIRouter()


@router.get("/", response_model=list[schemas.InventoryItemWithIngredient])
def list_items(skip: int = 0, limit: int = 100, db: Session = Depends(session.get_db)):
    return crud.list_inventory_items(db, skip=skip, limit=limit)


@router.post("/", response_model=schemas.InventoryItem, status_code=201)
def create_item(item: schemas.InventoryItemCreate, db: Session = Depends(session.get_db)):
    return crud.create_inventory_item(db, item)

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


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(session.get_db)):
    success = crud.delete_inventory_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return None

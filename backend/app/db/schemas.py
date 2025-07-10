from pydantic import BaseModel
from typing import Optional

class IngredientBase(BaseModel):
    name: str
    type: Optional[str] = None
    barcode: Optional[str] = None
    notes: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int

    class Config:
        orm_mode = True

class RecipeBase(BaseModel):
    name: str

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int

    class Config:
        orm_mode = True

class InventoryItemBase(BaseModel):
    ingredient_id: int
    quantity: int
    status: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    quantity: Optional[int] = None
    status: Optional[str] = None

class InventoryItem(InventoryItemBase):
    id: int

    class Config:
        orm_mode = True


class InventoryItemWithIngredient(InventoryItem):
    ingredient: Ingredient

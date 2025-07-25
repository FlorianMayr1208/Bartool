from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

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
    alcoholic: Optional[str] = None
    instructions: Optional[str] = None
    thumb: Optional[str] = None

class RecipeIngredientBase(BaseModel):
    name: str
    measure: Optional[str] = None

class RecipeIngredientCreate(RecipeIngredientBase):
    pass

class RecipeIngredient(RecipeIngredientBase):
    id: int

    class Config:
        orm_mode = True

class Tag(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class Category(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class Iba(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class RecipeCreate(RecipeBase):
    tags: List[str] = []
    categories: List[str] = []
    ibas: List[str] = []
    ingredients: List[RecipeIngredientCreate] = []

class Recipe(RecipeBase):
    id: int
    tags: List[Tag] = []
    categories: List[Category] = []
    ibas: List[Iba] = []
    ingredients: List[RecipeIngredient] = []

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


class Synonym(BaseModel):
    alias: str
    canonical: str


class BarcodeCache(BaseModel):
    ean: str
    data: str
    fetched_at: datetime

    class Config:
        orm_mode = True

from typing import List, Optional

from pydantic import BaseModel


class IngredientBase(BaseModel):
    name: str
    type: Optional[str] = None
    notes: Optional[str] = None


class IngredientCreate(IngredientBase):
    pass


class Ingredient(IngredientBase):
    id: int

    class Config:
        orm_mode = True


class RecipeBase(BaseModel):
    name: str
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


class RecipeCreate(RecipeBase):
    ingredients: List[RecipeIngredientCreate] = []


class Recipe(RecipeBase):
    id: int
    ingredients: List[RecipeIngredient] = []

    class Config:
        orm_mode = True


class RecipeIngredientWithInventory(RecipeIngredient):
    inventory_item_id: int | None = None
    inventory_quantity: int = 0


class RecipeDetail(Recipe):
    ingredients: List[RecipeIngredientWithInventory] = []


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

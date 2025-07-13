from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)
    barcode = Column(String, nullable=True)
    notes = Column(String, nullable=True)


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    alcoholic = Column(String, nullable=True)
    instructions = Column(String, nullable=True)
    thumb = Column(String, nullable=True)

    tags = relationship("Tag", back_populates="recipe", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="recipe", cascade="all, delete-orphan")
    ibas = relationship("Iba", back_populates="recipe", cascade="all, delete-orphan")
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)

    recipe = relationship("Recipe", back_populates="tags")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)

    recipe = relationship("Recipe", back_populates="categories")


class Iba(Base):
    __tablename__ = "ibas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)

    recipe = relationship("Recipe", back_populates="ibas")


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    name = Column(String, nullable=False)
    measure = Column(String, nullable=True)

    recipe = relationship("Recipe", back_populates="ingredients")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity = Column(Integer, default=0)
    status = Column(String, default="available")

    ingredient = relationship("Ingredient")


class BarcodeCache(Base):
    __tablename__ = "barcode_cache"

    ean = Column(String, primary_key=True, index=True)
    data = Column(Text, nullable=False)
    fetched_at = Column(DateTime, default=datetime.utcnow, nullable=False)

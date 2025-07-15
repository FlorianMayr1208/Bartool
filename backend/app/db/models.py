from __future__ import annotations

from sqlalchemy import Column, Integer, String, ForeignKey, Float, Table, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# Association tables for many-to-many relations
recipe_tag = Table(
    "recipe_tag",
    Base.metadata,
    Column("recipe_id", ForeignKey("recipes.id"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id"), primary_key=True),
)

recipe_category = Table(
    "recipe_category",
    Base.metadata,
    Column("recipe_id", ForeignKey("recipes.id"), primary_key=True),
    Column("category_id", ForeignKey("categories.id"), primary_key=True),
)

recipe_iba = Table(
    "recipe_iba",
    Base.metadata,
    Column("recipe_id", ForeignKey("recipes.id"), primary_key=True),
    Column("iba_id", ForeignKey("ibas.id"), primary_key=True),
)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    recipes = relationship(
        "Recipe",
        secondary=recipe_category,
        back_populates="categories",
    )


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    symbol = Column(String, unique=True, nullable=False)

    synonyms = relationship(
        "UnitSynonym",
        back_populates="unit",
        cascade="all, delete-orphan",
    )


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    type = Column(String, nullable=True)
    barcode = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    default_unit_id = Column(Integer, ForeignKey("units.id"), nullable=True)

    category = relationship("Category")
    unit = relationship("Unit")
    synonyms = relationship(
        "IngredientSynonym",
        back_populates="ingredient",
        cascade="all, delete-orphan",
    )


class IngredientSynonym(Base):
    __tablename__ = "ingredient_synonyms"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    name = Column(String, unique=True, nullable=False)

    ingredient = relationship("Ingredient", back_populates="synonyms")


class UnitSynonym(Base):
    __tablename__ = "unit_synonyms"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    name = Column(String, unique=True, nullable=False)

    unit = relationship("Unit", back_populates="synonyms")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    recipes = relationship(
        "Recipe",
        secondary=recipe_tag,
        back_populates="tags",
    )


class Glass(Base):
    __tablename__ = "glasses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    recipes = relationship("Recipe", back_populates="glass")


class Alcoholic(Base):
    __tablename__ = "alcoholics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    recipes = relationship("Recipe", back_populates="alcoholic")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    alcoholic = Column(String, nullable=True)
    glass_id = Column(Integer, ForeignKey("glasses.id"), nullable=True)
    alcoholic_id = Column(Integer, ForeignKey("alcoholics.id"), nullable=True)
    instructions = Column(String, nullable=True)
    thumb = Column(String, nullable=True)

    glass = relationship("Glass", back_populates="recipes")
    alcoholic = relationship("Alcoholic", back_populates="recipes")

    tags = relationship(
        "Tag",
        secondary=recipe_tag,
        back_populates="recipes",
    )
    categories = relationship(
        "Category",
        secondary=recipe_category,
        back_populates="recipes",
    )
    ibas = relationship(
        "Iba",
        secondary=recipe_iba,
        back_populates="recipes",
    )
    ingredients = relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan",
    )


class Iba(Base):
    __tablename__ = "ibas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    recipes = relationship(
        "Recipe",
        secondary=recipe_iba,
        back_populates="ibas",
    )


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
    timestamp = Column(Integer, nullable=False)
    json = Column(Text, nullable=False)


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity = Column(Integer, default=1)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    unit = Column(String, nullable=True)

    ingredient = relationship("Ingredient")
    recipe = relationship("Recipe")

from sqlalchemy.orm import Session

# Import all models so ``Base.metadata`` contains every table
from models import (
    Base,
    Category,
    Unit,
    Ingredient,
    IngredientSynonym,
    UnitSynonym,
    Tag,
    Recipe,
    Iba,
    RecipeIngredient,
    InventoryItem,
)
from session import engine


def run():
    Base.metadata.create_all(bind=engine)
    db = Session(bind=engine)

    if db.query(Ingredient).first():
        db.close()
        return

    # basic measurement units
    oz = Unit(name="oz", symbol="oz")
    ml = Unit(name="ml", symbol="ml")
    tsp = Unit(name="tsp", symbol="tsp")
    db.add_all([oz, ml, tsp])
    db.commit()

    # recipe categories and tags
    cat_cocktail = Category(name="Cocktail")
    cat_classic = Category(name="Classic")
    db.add_all([cat_cocktail, cat_classic])
    db.commit()

    tag_classic = Tag(name="Classic")
    tag_summer = Tag(name="Summer")
    db.add_all([tag_classic, tag_summer])
    db.commit()

    iba_unforget = Iba(name="Unforgettables")
    iba_new = Iba(name="New Era")
    db.add_all([iba_unforget, iba_new])
    db.commit()

    # ingredients
    vodka = Ingredient(name="Vodka", type="spirit")
    rum = Ingredient(name="Rum", type="spirit")
    tequila = Ingredient(name="Tequila", type="spirit")
    cachaca = Ingredient(name="Cachaça", type="spirit")
    lime = Ingredient(name="Lime Juice", type="juice")
    sugar = Ingredient(name="Sugar Syrup", type="syrup")
    triple_sec = Ingredient(name="Triple Sec", type="liqueur")
    mint = Ingredient(name="Mint", type="herb")
    db.add_all([vodka, rum, tequila, cachaca, lime, sugar, triple_sec, mint])
    db.commit()

    # recipes
    mojito = Recipe(
        name="Mojito",
        alcoholic="Alcoholic",
        instructions="Muddle mint with sugar syrup, add lime and rum, top with soda.",
    )
    mojito.tags.append(tag_classic)
    mojito.categories.append(cat_cocktail)
    mojito.ibas.append(iba_unforget)
    mojito.ingredients = [
        RecipeIngredient(name="Rum", measure="2 oz"),
        RecipeIngredient(name="Lime Juice", measure="1 oz"),
        RecipeIngredient(name="Sugar Syrup", measure="1 tsp"),
        RecipeIngredient(name="Mint", measure="5 leaves"),
    ]

    margarita = Recipe(
        name="Margarita",
        alcoholic="Alcoholic",
        instructions="Shake tequila, triple sec and lime juice with ice.",
    )
    margarita.tags.append(tag_classic)
    margarita.categories.append(cat_cocktail)
    margarita.ibas.append(iba_new)
    margarita.ingredients = [
        RecipeIngredient(name="Tequila", measure="2 oz"),
        RecipeIngredient(name="Triple Sec", measure="1 oz"),
        RecipeIngredient(name="Lime Juice", measure="1 oz"),
    ]

    caipirinha = Recipe(
        name="Caipirinha",
        alcoholic="Alcoholic",
        instructions="Muddle lime with sugar syrup, add cachaça and ice.",
    )
    caipirinha.tags.append(tag_summer)
    caipirinha.categories.append(cat_cocktail)
    caipirinha.ibas.append(iba_new)
    caipirinha.ingredients = [
        RecipeIngredient(name="Cachaça", measure="2 oz"),
        RecipeIngredient(name="Lime Juice", measure="1 oz"),
        RecipeIngredient(name="Sugar Syrup", measure="1 tsp"),
    ]

    db.add_all([mojito, margarita, caipirinha])
    db.commit()

    # inventory items
    inv_vodka = InventoryItem(ingredient_id=vodka.id, quantity=1)
    inv_rum = InventoryItem(ingredient_id=rum.id, quantity=1)
    inv_lime = InventoryItem(ingredient_id=lime.id, quantity=2)
    db.add_all([inv_vodka, inv_rum, inv_lime])
    db.commit()

    db.close()


if __name__ == "__main__":
    run()

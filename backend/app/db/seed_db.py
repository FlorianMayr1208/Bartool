from sqlalchemy.orm import Session

from .models import Base, Ingredient, InventoryItem, Recipe, RecipeIngredient
from .session import engine


def run():
    Base.metadata.create_all(bind=engine)
    db = Session(bind=engine)

    if db.query(Ingredient).first():
        db.close()
        return

    rum = Ingredient(name="Rum", type="spirit")
    lime = Ingredient(name="Lime Juice", type="juice")
    sugar = Ingredient(name="Sugar Syrup", type="syrup")
    mint = Ingredient(name="Mint", type="herb")
    db.add_all([rum, lime, sugar, mint])
    db.commit()

    mojito = Recipe(
        name="Mojito",
        instructions="Muddle mint with sugar syrup, add lime and rum, top with soda.",
        ingredients=[
            RecipeIngredient(name="Rum", measure="2 oz"),
            RecipeIngredient(name="Lime Juice", measure="1 oz"),
            RecipeIngredient(name="Sugar Syrup", measure="1 tsp"),
            RecipeIngredient(name="Mint", measure="5 leaves"),
        ],
    )
    db.add(mojito)
    db.commit()

    db.add_all(
        [
            InventoryItem(ingredient_id=rum.id, quantity=1),
            InventoryItem(ingredient_id=lime.id, quantity=2),
        ]
    )
    db.commit()
    db.close()


if __name__ == "__main__":
    run()

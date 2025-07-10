from sqlalchemy.orm import Session

from .models import Base, Ingredient, Recipe, InventoryItem
from .session import engine


def run():
    Base.metadata.create_all(bind=engine)
    db = Session(bind=engine)

    if db.query(Ingredient).first():
        db.close()
        return

    vodka = Ingredient(name="Vodka", type="spirit")
    lime = Ingredient(name="Lime Juice", type="juice")
    db.add_all([vodka, lime])
    db.commit()

    caipirinha = Recipe(name="Caipirinha")
    db.add(caipirinha)
    db.commit()

    inv = InventoryItem(ingredient_id=vodka.id, quantity=1)
    db.add(inv)
    db.commit()
    db.close()


if __name__ == "__main__":
    run()

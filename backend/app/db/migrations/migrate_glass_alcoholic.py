from sqlalchemy.orm import Session
from ..session import engine
from .. import models


def run() -> None:
    """Populate Glass and Alcoholic tables based on existing recipe data."""
    models.Base.metadata.create_all(bind=engine)
    db = Session(bind=engine)
    for recipe in db.query(models.Recipe).all():
        if recipe.alcoholic:
            alc = (
                db.query(models.Alcoholic)
                .filter(models.Alcoholic.name == recipe.alcoholic)
                .first()
            )
            if not alc:
                alc = models.Alcoholic(name=recipe.alcoholic)
                db.add(alc)
                db.flush()
            recipe.alcoholic_id = alc.id
        # existing DB does not store glass information
    db.commit()
    db.close()


if __name__ == "__main__":
    run()

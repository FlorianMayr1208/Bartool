from backend.app.services import macros


def test_macros_for_ingredient():
    assert "sour" in macros.macros_for_ingredient("fresh lime juice")
    assert "sweet" in macros.macros_for_ingredient("simple syrup")
    assert "smoky" in macros.macros_for_ingredient("peated whisky")


class DummyRecipe:
    def __init__(self, ingredients):
        self.ingredients = [{"name": n} for n in ingredients]


def test_classify_recipe():
    r = DummyRecipe(["Lime", "Simple Syrup", "Gin"])
    scores = macros.classify_recipe(r)
    assert scores["sour"] == 1
    assert scores["sweet"] == 1

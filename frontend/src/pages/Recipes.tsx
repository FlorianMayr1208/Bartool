import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createRecipe, deleteRecipe, listRecipes } from '../api';

interface RecipeSummary {
  id: number;
  name: string;
  alcoholic?: string | null;
  instructions?: string | null;
  thumb?: string | null;
}

interface IngredientField {
  name: string;
  measure: string;
}

interface RecipeForm {
  name: string;
  alcoholic: string;
  instructions: string;
  thumb: string;
  tagsText: string;
  categoriesText: string;
  ibasText: string;
  ingredients: IngredientField[];
}

const emptyRecipe = (): RecipeForm => ({
  name: '',
  alcoholic: '',
  instructions: '',
  thumb: '',
  tagsText: '',
  categoriesText: '',
  ibasText: '',
  ingredients: [{ name: '', measure: '' }],
});

const splitCsv = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export default function Recipes() {
  const [saved, setSaved] = useState<RecipeSummary[]>([]);
  const [form, setForm] = useState(emptyRecipe());

  const refresh = () => {
    listRecipes().then(setSaved);
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateIngredient = (index: number, field: keyof IngredientField, value: string) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, ingredientIndex) =>
        ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    }));
  };

  const addIngredient = () => {
    setForm((current) => ({
      ...current,
      ingredients: [...current.ingredients, { name: '', measure: '' }],
    }));
  };

  const removeIngredient = (index: number) => {
    setForm((current) => ({
      ...current,
      ingredients:
        current.ingredients.length === 1
          ? [{ name: '', measure: '' }]
          : current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index),
    }));
  };

  const submit = async () => {
    if (!form.name.trim()) {
      return;
    }

    await createRecipe({
      name: form.name.trim(),
      alcoholic: form.alcoholic?.trim() || null,
      instructions: form.instructions?.trim() || null,
      thumb: form.thumb?.trim() || null,
      tags: splitCsv(form.tagsText),
      categories: splitCsv(form.categoriesText),
      ibas: splitCsv(form.ibasText),
      ingredients: form.ingredients
        .map((ingredient) => ({
          name: ingredient.name.trim(),
          measure: ingredient.measure.trim() || null,
        }))
        .filter((ingredient) => ingredient.name),
    });

    setForm(emptyRecipe());
    refresh();
  };

  const remove = async (id: number) => {
    await deleteRecipe(id);
    setSaved((current) => current.filter((recipe) => recipe.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <p className="text-sm text-gray-600">Create and manage recipes stored entirely in this app.</p>
      </div>

      <section className="space-y-3 rounded border p-4">
        <h2 className="text-lg font-semibold">New Recipe</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
            placeholder="Recipe name"
            className="border p-2"
          />
          <input
            value={form.alcoholic ?? ''}
            onChange={(e) => setForm((current) => ({ ...current, alcoholic: e.target.value }))}
            placeholder="Alcoholic / Non alcoholic"
            className="border p-2"
          />
          <input
            value={form.thumb ?? ''}
            onChange={(e) => setForm((current) => ({ ...current, thumb: e.target.value }))}
            placeholder="Image URL"
            className="border p-2"
          />
          <input
            value={form.tagsText}
            onChange={(e) => setForm((current) => ({ ...current, tagsText: e.target.value }))}
            placeholder="Tags (comma separated)"
            className="border p-2"
          />
          <input
            value={form.categoriesText}
            onChange={(e) => setForm((current) => ({ ...current, categoriesText: e.target.value }))}
            placeholder="Categories (comma separated)"
            className="border p-2"
          />
          <input
            value={form.ibasText}
            onChange={(e) => setForm((current) => ({ ...current, ibasText: e.target.value }))}
            placeholder="IBA labels (comma separated)"
            className="border p-2"
          />
        </div>
        <textarea
          value={form.instructions ?? ''}
          onChange={(e) => setForm((current) => ({ ...current, instructions: e.target.value }))}
          placeholder="Instructions"
          className="min-h-28 w-full border p-2"
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Ingredients</h3>
            <button type="button" onClick={addIngredient} className="rounded bg-gray-200 px-2 py-1">
              Add Ingredient
            </button>
          </div>
          {form.ingredients.map((ingredient, index) => (
            <div key={`${index}-${ingredient.name}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="border p-2"
              />
              <input
                value={ingredient.measure}
                onChange={(e) => updateIngredient(index, 'measure', e.target.value)}
                placeholder="Measure"
                className="border p-2"
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="rounded bg-red-100 px-2 py-1 text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button onClick={submit} className="rounded bg-blue-500 px-3 py-2 text-white">
          Save Recipe
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Saved Recipes</h2>
        {saved.length === 0 ? (
          <p className="text-sm text-gray-600">No recipes saved yet.</p>
        ) : (
          <ul className="space-y-2">
            {saved.map((recipe) => (
              <li key={recipe.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <Link to={`/recipes/${recipe.id}`} className="font-semibold text-blue-600 underline">
                    {recipe.name}
                  </Link>
                  {recipe.alcoholic && <p className="text-sm text-gray-600">{recipe.alcoholic}</p>}
                </div>
                <button onClick={() => remove(recipe.id)} className="text-red-600">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

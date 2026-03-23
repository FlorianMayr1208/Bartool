import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteRecipe, getRecipe, updateRecipe } from '../api';

interface RecipeIngredient {
  id?: number;
  name: string;
  measure?: string | null;
}

interface NamedValue {
  id: number;
  name: string;
}

interface Recipe {
  id: number;
  name: string;
  alcoholic?: string | null;
  instructions?: string | null;
  thumb?: string | null;
  tags: NamedValue[];
  categories: NamedValue[];
  ibas: NamedValue[];
  ingredients: RecipeIngredient[];
}

interface FormState {
  name: string;
  alcoholic: string;
  instructions: string;
  thumb: string;
  tagsText: string;
  categoriesText: string;
  ibasText: string;
  ingredients: RecipeIngredient[];
}

const splitCsv = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const toFormState = (recipe: Recipe): FormState => ({
  name: recipe.name,
  alcoholic: recipe.alcoholic ?? '',
  instructions: recipe.instructions ?? '',
  thumb: recipe.thumb ?? '',
  tagsText: recipe.tags.map((tag) => tag.name).join(', '),
  categoriesText: recipe.categories.map((category) => category.name).join(', '),
  ibasText: recipe.ibas.map((iba) => iba.name).join(', '),
  ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', measure: '' }],
});

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (!id) return;
    getRecipe(parseInt(id))
      .then((result) => {
        setRecipe(result);
        setForm(toFormState(result));
      })
      .catch(() => {
        setRecipe(null);
        setForm(null);
      });
  }, [id]);

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string) => {
    setForm((current) =>
      current
        ? {
            ...current,
            ingredients: current.ingredients.map((ingredient, ingredientIndex) =>
              ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient,
            ),
          }
        : current,
    );
  };

  const addIngredient = () => {
    setForm((current) =>
      current
        ? { ...current, ingredients: [...current.ingredients, { name: '', measure: '' }] }
        : current,
    );
  };

  const removeIngredient = (index: number) => {
    setForm((current) =>
      current
        ? {
            ...current,
            ingredients:
              current.ingredients.length === 1
                ? [{ name: '', measure: '' }]
                : current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index),
          }
        : current,
    );
  };

  const save = async () => {
    if (!id || !form || !form.name.trim()) {
      return;
    }

    const updated = await updateRecipe(parseInt(id), {
      name: form.name.trim(),
      alcoholic: form.alcoholic.trim() || null,
      instructions: form.instructions.trim() || null,
      thumb: form.thumb.trim() || null,
      tags: splitCsv(form.tagsText),
      categories: splitCsv(form.categoriesText),
      ibas: splitCsv(form.ibasText),
      ingredients: form.ingredients
        .map((ingredient) => ({
          name: ingredient.name.trim(),
          measure: ingredient.measure?.trim() || null,
        }))
        .filter((ingredient) => ingredient.name),
    });

    setRecipe(updated);
    setForm(toFormState(updated));
  };

  const remove = async () => {
    if (!id) {
      return;
    }
    await deleteRecipe(parseInt(id));
    navigate('/recipes');
  };

  if (!recipe || !form) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Recipe</h1>
        <button onClick={remove} className="rounded bg-red-600 px-3 py-2 text-white">
          Delete Recipe
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={form.name}
          onChange={(e) => setForm((current) => (current ? { ...current, name: e.target.value } : current))}
          className="border p-2"
        />
        <input
          value={form.alcoholic}
          onChange={(e) =>
            setForm((current) => (current ? { ...current, alcoholic: e.target.value } : current))
          }
          placeholder="Alcoholic / Non alcoholic"
          className="border p-2"
        />
        <input
          value={form.thumb}
          onChange={(e) => setForm((current) => (current ? { ...current, thumb: e.target.value } : current))}
          placeholder="Image URL"
          className="border p-2"
        />
        <input
          value={form.tagsText}
          onChange={(e) => setForm((current) => (current ? { ...current, tagsText: e.target.value } : current))}
          placeholder="Tags (comma separated)"
          className="border p-2"
        />
        <input
          value={form.categoriesText}
          onChange={(e) =>
            setForm((current) => (current ? { ...current, categoriesText: e.target.value } : current))
          }
          placeholder="Categories (comma separated)"
          className="border p-2"
        />
        <input
          value={form.ibasText}
          onChange={(e) => setForm((current) => (current ? { ...current, ibasText: e.target.value } : current))}
          placeholder="IBA labels (comma separated)"
          className="border p-2"
        />
      </div>
      <textarea
        value={form.instructions}
        onChange={(e) =>
          setForm((current) => (current ? { ...current, instructions: e.target.value } : current))
        }
        className="min-h-28 w-full border p-2"
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Ingredients</h2>
          <button type="button" onClick={addIngredient} className="rounded bg-gray-200 px-2 py-1">
            Add Ingredient
          </button>
        </div>
        {form.ingredients.map((ingredient, index) => (
          <div key={`${ingredient.id ?? 'new'}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              placeholder="Ingredient name"
              className="border p-2"
            />
            <input
              value={ingredient.measure ?? ''}
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
      {recipe.thumb && <img src={recipe.thumb} alt={recipe.name} className="w-48" />}
      <button onClick={save} className="rounded bg-blue-500 px-3 py-2 text-white">
        Save Changes
      </button>
    </div>
  );
}

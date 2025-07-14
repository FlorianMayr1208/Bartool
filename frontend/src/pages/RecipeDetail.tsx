import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getRecipe,
  addMissingFromRecipe,
  type RecipeDetail,
} from '../api';


export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRecipe(parseInt(id))
      .then(setRecipe)
      .catch(() => setRecipe(null));
  }, [id]);

  if (!recipe) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {recipe.thumb && (
          <img
            src={recipe.thumb}
            alt={recipe.name}
            className="w-24 h-24 aspect-square rounded-md object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold mb-2">{recipe.name}</h1>
          {recipe.instructions && <p className="mb-4">{recipe.instructions}</p>}
          <button
            onClick={async () => {
              if (recipe) {
                await addMissingFromRecipe(recipe.id);
                setAdded(true);
              }
            }}
            className="button-search"
          >
            Add missing to shopping list
          </button>
          {added && <p className="text-sm text-green-700">Added!</p>}
        </div>
      </div>
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <section className="mt-6 p-4 bg-[var(--bg-elevated)] rounded-lg shadow border border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id}>
                <div className="flex justify-between">
                  <span className="font-medium">{ing.name}</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {`${ing.inventory_quantity} in stock`}
                  </span>
                </div>
                {ing.measure && (
                  <div className="text-sm text-[var(--text-muted)]">{ing.measure}</div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}


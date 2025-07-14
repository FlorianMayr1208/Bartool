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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{recipe.name}</h1>
      {recipe.thumb && (
        <img src={recipe.thumb} alt={recipe.name} className="w-48" />
      )}
      {recipe.instructions && <p>{recipe.instructions}</p>}
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
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div>
          <h2 className="font-semibold">Ingredients</h2>
          <ul className="list-disc pl-5">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id}>
                {ing.measure ? `${ing.measure} ` : ''}
                {ing.name}
                <span className="text-sm text-[var(--text-secondary)]">
                  {` – ${ing.inventory_quantity} in stock`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


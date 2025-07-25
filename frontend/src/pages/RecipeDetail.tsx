import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipe } from '../api';

interface Ingredient {
  id: number;
  name: string;
  measure?: string | null;
}

interface Recipe {
  id: number;
  name: string;
  instructions?: string | null;
  thumb?: string | null;
  ingredients?: Ingredient[];
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

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
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div>
          <h2 className="font-semibold">Ingredients</h2>
          <ul className="list-disc pl-5">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id}>
                {ing.measure ? `${ing.measure} ` : ''}
                {ing.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


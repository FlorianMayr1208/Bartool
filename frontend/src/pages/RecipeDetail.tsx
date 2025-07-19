import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getRecipe,
  addMissingFromRecipe,
  updateInventory,
  deleteRecipe,
  listSynonyms,
  type RecipeDetail,
  type RecipeIngredient,
  type Synonym,
} from '../api';


export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [added, setAdded] = useState<number | null>(null);
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);

  const synonymsMap = Object.fromEntries(
    synonyms.map((s) => [s.alias.toLowerCase(), s.canonical]),
  );

  const canonical = (n: string): string | null => {
    const key = n.trim().toLowerCase();
    const cand = synonymsMap[key];
    if (!cand || cand.toLowerCase() === key) return null;
    return cand.charAt(0).toUpperCase() + cand.slice(1);
  };

  const updateQty = async (ing: RecipeIngredient, qty: number) => {
    if (!recipe || !ing.inventory_item_id) return;
    const { data } = await updateInventory(ing.inventory_item_id, { quantity: qty });
    if (data) {
      setRecipe({
        ...recipe,
        ingredients: recipe.ingredients.map((i) =>
          i.id === ing.id ? { ...i, inventory_quantity: data.quantity } : i,
        ),
      });
    }
  };

  useEffect(() => {
    if (!id) return;
    getRecipe(parseInt(id))
      .then(setRecipe)
      .catch(() => setRecipe(null));
    listSynonyms().then(({ data }) => {
      if (data) setSynonyms(data);
    });
  }, [id]);

  if (!recipe) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 text-white max-w-4xl mx-auto">
      <h1 className="page-title">{recipe.name}</h1>
      {recipe.thumb && (
        <div className="flex justify-center mb-6">
          <img
            src={recipe.thumb}
            alt={recipe.name}
            className="w-full max-w-md h-80 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}
      {(recipe.categories?.length || recipe.tags?.length || recipe.ibas?.length) && (
        <div className="space-y-1 mb-2 text-sm text-[var(--text-secondary)] text-center">
          {recipe.categories && recipe.categories.length > 0 && (
            <p>
              Category:{" "}
              {recipe.categories.map((c, idx) => (
                <span key={c.id}>
                  <Link
                    to={`/search?category=${encodeURIComponent(c.name)}`}
                    className="text-[var(--highlight)] hover:underline"
                  >
                    {c.name}
                  </Link>
                  {idx < recipe.categories!.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}
          {recipe.tags && recipe.tags.length > 0 && (
            <p>
              Tags:{" "}
              {recipe.tags.map((t, idx) => (
                <span key={t.id}>
                  <Link
                    to={`/search?tag=${encodeURIComponent(t.name)}`}
                    className="text-[var(--highlight)] hover:underline"
                  >
                    {t.name}
                  </Link>
                  {idx < recipe.tags!.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}
          {recipe.ibas && recipe.ibas.length > 0 && (
            <p>
              IBA:{" "}
              {recipe.ibas.map((i, idx) => (
                <span key={i.id}>
                  <Link
                    to={`/search?iba=${encodeURIComponent(i.name)}`}
                    className="text-[var(--highlight)] hover:underline"
                  >
                    {i.name}
                  </Link>
                  {idx < recipe.ibas!.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-8">
        <div>
          {recipe.instructions && (
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Instructions</h2>
              <p className="text-[var(--text-muted)]">{recipe.instructions}</p>
            </div>
          )}
          <button
            onClick={async () => {
              if (recipe) {
                const { data } = await addMissingFromRecipe(recipe.id);
                if (data) {
                  setAdded(data.length);
                }
              }
            }}
            className="button-search mr-4"
          >
            Add missing to shopping list
          </button>
          {added !== null && (
            <p className="text-sm text-green-700">
              {added > 0
                ? `Added ${added} item${added === 1 ? "" : "s"}!`
                : "All ingredients already in inventory"}
            </p>
          )}
          <button
            onClick={async () => {
              if (recipe) {
                await deleteRecipe(recipe.id);
                navigate('/search');
              }
            }}
            className="button-search mt-4"
          >
            Delete recipe
          </button>
        </div>
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <section className="card p-4 max-w-md">
            <h2 className="text-xl font-semibold mb-2 ">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id}>
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-medium">
                      {ing.name}
                      {canonical(ing.name) && (
                        <span className="ml-1 text-sm text-[var(--text-secondary)]">
                          ({canonical(ing.name)})
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={ing.inventory_quantity}
                        onChange={(e) => updateQty(ing, parseInt(e.target.value))}
                        className="w-16 border border-[var(--border)]"
                      />
                      <span className="text-sm text-[var(--text-secondary)]">in stock</span>
                    </div>
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
    </div>
  );
}


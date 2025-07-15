import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getRecipe,
  addMissingFromRecipe,
  updateInventory,
  listSynonyms,
  type RecipeDetail,
  type RecipeIngredient,
  type Synonym,
} from '../api';


export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
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
    <div className="space-y-4 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {recipe.thumb && (
          <img
            src={recipe.thumb}
            alt={recipe.name}
            className="w-48 rounded-md object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold mb-2 font-display">{recipe.name}</h1>
          {(recipe.categories?.length || recipe.tags?.length || recipe.ibas?.length) && (
            <div className="space-y-1 mb-2 text-sm text-[var(--text-secondary)]">
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
          {recipe.instructions && <p className="mb-4">{recipe.instructions}</p>}
          <button
            onClick={async () => {
              if (recipe) {
                const { data } = await addMissingFromRecipe(recipe.id);
                if (data) {
                  setAdded(data.length);
                }
              }
            }}
            className="button-search"
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
        </div>
      </div>
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <section className="mt-6 p-4 bg-[var(--bg-elevated)] rounded-lg shadow border border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
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
  );
}


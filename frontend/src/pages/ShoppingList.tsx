import { useEffect, useState } from 'react';
import {
  listShoppingList,
  clearShoppingList,
  listSynonyms,
  type ShoppingListItem,
  type Synonym,
} from '../api';

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [synonyms, setSynonyms] = useState<Synonym[]>([]);

  const synonymsMap = Object.fromEntries(
    synonyms.map((s) => [s.alias.toLowerCase(), s.canonical]),
  );

  const canonical = (n: string | undefined) => {
    if (!n) return null;
    const key = n.trim().toLowerCase();
    const cand = synonymsMap[key];
    if (!cand || cand.toLowerCase() === key) return null;
    return cand.charAt(0).toUpperCase() + cand.slice(1);
  };

  useEffect(() => {
    listShoppingList().then(({ data }) => {
      if (data) setItems(data);
    });
    listSynonyms().then(({ data }) => {
      if (data) setSynonyms(data);
    });
  }, []);

  const reset = async () => {
    const { debug } = await clearShoppingList();
    if (debug) console.debug(debug);
    setItems([]);
  };

  const download = () => {
    const lines = items.map(
      (it) => `${it.quantity} x ${it.ingredient?.name || it.ingredient_id}`,
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping_list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const itemsByRecipe = items.reduce<Record<number | string, ShoppingListItem[]>>(
    (acc, it) => {
      const key = it.recipe ? it.recipe.id : "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(it);
      return acc;
    },
    {},
  );

  const aggregated = items.reduce<Record<string, number>>((acc, it) => {
    const name = it.ingredient?.name || String(it.ingredient_id);
    const key = (synonymsMap[name.toLowerCase()] || name).toLowerCase();
    acc[key] = (acc[key] || 0) + it.quantity;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Shopping List</h1>
      <div className="flex gap-4">
        <button onClick={download} className="button-search">
          Download
        </button>
        <button onClick={reset} className="button-send">
          Reset
        </button>
      </div>
      <div className="space-y-4">
        {Object.entries(itemsByRecipe).map(([key, list]) => (
          <div key={key} className="card p-0">
            <h2 className="px-4 py-2 font-semibold">
              {list[0].recipe ? list[0].recipe.name : "Other"}
            </h2>
            <ul className="divide-y divide-[var(--border)]">
              {list.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between p-4"
                >
                  <span>
                    {it.quantity} x {it.ingredient?.name || it.ingredient_id}
                    {canonical(it.ingredient?.name) && (
                      <span className="text-sm text-[var(--text-secondary)] ml-1">
                        ({canonical(it.ingredient?.name)})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {Object.keys(aggregated).length > 0 && (
        <div className="card p-0">
          <h2 className="px-4 py-2 font-semibold">All Ingredients</h2>
          <ul className="divide-y divide-[var(--border)]">
            {Object.entries(aggregated).map(([name, qty]) => (
              <li key={name} className="flex items-center justify-between p-4">
                <span>
                  {qty} x {name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
  const [recipeCounts, setRecipeCounts] = useState<Record<string, number>>({});

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
      if (data) {
        setItems(data);
        const counts: Record<string, number> = {};
        data.forEach((it) => {
          if (it.recipe) {
            const key = String(it.recipe.id);
            if (!counts[key]) counts[key] = 1;
          }
        });
        setRecipeCounts(counts);
      }
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
    const lines = Object.entries(aggregated).map(([name, info]) =>
      `${info.qty} x ${name.charAt(0).toUpperCase() + name.slice(1)}${
        info.units.size > 0 ? ` (${Array.from(info.units).join(', ')})` : ''
      }`,
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

  const aggregated = items.reduce<Record<string, { qty: number; units: Set<string> }>>(
    (acc, it) => {
      const name = it.ingredient?.name || String(it.ingredient_id);
      const key = (synonymsMap[name.toLowerCase()] || name).toLowerCase();
      const count = recipeCounts[it.recipe ? String(it.recipe.id) : 'other'] ?? 1;
      if (!acc[key]) acc[key] = { qty: 0, units: new Set() };
      acc[key].qty += it.quantity * count;
      if (it.unit) acc[key].units.add(it.unit);
      return acc;
    },
    {},
  );

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
            <div className="flex items-center justify-between px-4 py-2">
              <h2 className="font-semibold">
                {list[0].recipe ? list[0].recipe.name : "Other"}
              </h2>
              {list[0].recipe && (
                <input
                  type="number"
                  min={1}
                  className="w-16 border border-[var(--border)]"
                  value={recipeCounts[String(list[0].recipe.id)] ?? 1}
                  onChange={(e) =>
                    setRecipeCounts({
                      ...recipeCounts,
                      [list[0].recipe!.id]: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                />
              )}
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {list.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between p-4"
                >
                  <span>
                    {(it.quantity * (recipeCounts[it.recipe ? String(it.recipe.id) : 'other'] ?? 1))}
                    {it.unit ? ` ${it.unit}` : ""} x {it.ingredient?.name || it.ingredient_id}
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
            {Object.entries(aggregated).map(([name, info]) => (
              <li key={name} className="flex items-center justify-between p-4">
                <span>
                  {info.qty} x {name.charAt(0).toUpperCase() + name.slice(1)}
                  {info.units.size > 0 && (
                    <> ({Array.from(info.units).join(', ')})</>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import {
  listShoppingList,
  clearShoppingList,
  type ShoppingListItem,
} from '../api';

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    listShoppingList().then(({ data }) => {
      if (data) setItems(data);
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
      <div className="card p-0">
        <ul className="divide-y divide-[var(--border)]">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between p-4">
              <span>
                {it.quantity} x {it.ingredient?.name || it.ingredient_id}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

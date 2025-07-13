import { useEffect, useState } from 'react';
import { listShoppingList, type ShoppingListItem } from '../api';

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    listShoppingList().then(({ data }) => {
      if (data) setItems(data);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shopping List</h1>
      <ul className="list-disc pl-5">
        {items.map((it) => (
          <li key={it.id}>
            {it.quantity} x {it.ingredient?.name || it.ingredient_id}
          </li>
        ))}
      </ul>
    </div>
  );
}

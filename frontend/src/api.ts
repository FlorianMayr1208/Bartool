const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/healthz`);
  if (!res.ok) {
    throw new Error('Network error');
  }
  return res.json();
}

export async function listInventory() {
  const res = await fetch(`${API_BASE}/inventory/`);
  return res.json();
}

export async function createIngredient(data: { name: string }) {
  const res = await fetch(`${API_BASE}/ingredients/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createInventory(data: { ingredient_id: number; quantity: number }) {
  const res = await fetch(`${API_BASE}/inventory/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateInventory(id: number, data: { quantity?: number; status?: string }) {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteInventory(id: number) {
  await fetch(`${API_BASE}/inventory/${id}`, { method: 'DELETE' });
}

export async function lookupBarcode(ean: string) {
  const res = await fetch(`${API_BASE}/barcode/${ean}`);
  if (!res.ok) return null;
  return res.json();
}

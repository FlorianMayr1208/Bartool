const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface RecipeIngredientPayload {
  name: string;
  measure?: string | null;
}

export interface RecipePayload {
  name: string;
  alcoholic?: string | null;
  instructions?: string | null;
  thumb?: string | null;
  tags?: string[];
  categories?: string[];
  ibas?: string[];
  ingredients?: RecipeIngredientPayload[];
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

export async function listRecipes() {
  const res = await fetch(`${API_BASE}/recipes/`);
  return res.json();
}

export async function getRecipe(id: number) {
  const res = await fetch(`${API_BASE}/recipes/${id}`);
  if (!res.ok) {
    throw new Error('Recipe not found');
  }
  return res.json();
}

export async function createRecipe(data: RecipePayload) {
  const res = await fetch(`${API_BASE}/recipes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateRecipe(id: number, data: Partial<RecipePayload>) {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to update recipe');
  }
  return res.json();
}

export async function deleteRecipe(id: number) {
  const res = await fetch(`${API_BASE}/recipes/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Failed to delete recipe');
  }
}

export async function listSynonyms() {
  const res = await fetch(`${API_BASE}/synonyms/`);
  return res.json();
}

export async function addSynonym(alias: string, canonical: string) {
  const res = await fetch(`${API_BASE}/synonyms/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alias, canonical }),
  });
  return res.json();
}

export async function deleteSynonym(alias: string) {
  await fetch(`${API_BASE}/synonyms/${encodeURIComponent(alias)}`, {
    method: 'DELETE',
  });
}

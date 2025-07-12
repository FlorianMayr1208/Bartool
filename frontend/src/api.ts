const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/healthz`);
  if (!res.ok) {
    throw new Error("Network error");
  }
  return res.json();
}

export async function listInventory() {
  const res = await fetch(`${API_BASE}/inventory/`);
  return res.json();
}

export async function createIngredient(data: { name: string }) {
  const res = await fetch(`${API_BASE}/ingredients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createInventory(data: {
  ingredient_id: number;
  quantity: number;
}) {
  const res = await fetch(`${API_BASE}/inventory/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateInventory(
  id: number,
  data: { quantity?: number; status?: string },
) {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteInventory(id: number) {
  await fetch(`${API_BASE}/inventory/${id}`, { method: "DELETE" });
}

export interface BarcodeResult {
  name: string | null
  brand?: string | null
  image_url?: string | null
}

export async function lookupBarcode(ean: string): Promise<BarcodeResult | null> {
  const res = await fetch(`${API_BASE}/barcode/${ean}`);
  if (!res.ok) return null;
  return res.json();
}

export async function listRecipes() {
  const res = await fetch(`${API_BASE}/recipes/`);
  return res.json();
}

export async function searchRecipes(q: string) {
  const res = await fetch(
    `${API_BASE}/recipes/search?q=${encodeURIComponent(q)}`,
  );
  return res.json();
}

export interface FindRecipesOptions {
  q?: string;
  available_only?: boolean;
  order_missing?: boolean;
  skip?: number;
  limit?: number;
}

export async function findRecipes(options: FindRecipesOptions = {}) {
  const params = new URLSearchParams();
  if (options.q) params.append("q", options.q);
  if (options.available_only) params.append("available_only", "true");
  if (options.order_missing) params.append("order_missing", "true");
  if (options.skip !== undefined) params.append("skip", String(options.skip));
  if (options.limit !== undefined)
    params.append("limit", String(options.limit));
  const query = params.toString();
  const res = await fetch(
    `${API_BASE}/recipes/find${query ? `?${query}` : ""}`,
  );
  return res.json();
}

export async function getRecipe(id: number) {
  const res = await fetch(`${API_BASE}/recipes/${id}`);
  if (!res.ok) {
    throw new Error("Recipe not found");
  }
  return res.json();
}

export async function createRecipe(data: { name: string }) {
  const res = await fetch(`${API_BASE}/recipes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function listSynonyms() {
  const res = await fetch(`${API_BASE}/synonyms/`);
  return res.json();
}

export async function addSynonym(alias: string, canonical: string) {
  const res = await fetch(`${API_BASE}/synonyms/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alias, canonical }),
  });
  return res.json();
}

export async function deleteSynonym(alias: string) {
  await fetch(`${API_BASE}/synonyms/${encodeURIComponent(alias)}`, {
    method: "DELETE",
  });
}

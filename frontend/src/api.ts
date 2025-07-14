const API_BASE = import.meta.env.VITE_API_BASE || "";

export interface FetchDebug {
  url: string;
  status: number;
  body: unknown;
}

async function fetchJson<T>(
  url: string,
  options?: RequestInit,
): Promise<{ data: T | null; debug: FetchDebug }> {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => null);
  return {
    data: res.ok ? (body as T) : null,
    debug: { url, status: res.status, body },
  };
}

export interface Ingredient {
  id: number;
  name: string;
}

export interface Synonym {
  alias: string;
  canonical: string;
}

export interface InventoryItem {
  id: number;
  ingredient_id: number;
  quantity: number;
  status?: string;
  ingredient?: Ingredient;
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/healthz`);
  if (!res.ok) {
    throw new Error("Network error");
  }
  return res.json();
}

export async function listInventory() {
  return fetchJson<InventoryItem[]>(`${API_BASE}/inventory/`);
}

export async function createIngredient(data: { name: string }) {
  return fetchJson<Ingredient>(`${API_BASE}/ingredients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function listIngredients() {
  return fetchJson<Ingredient[]>(`${API_BASE}/ingredients/`);
}

export async function createInventory(data: {
  ingredient_id: number;
  quantity: number;
}) {
  return fetchJson<InventoryItem>(`${API_BASE}/inventory/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateInventory(
  id: number,
  data: { quantity?: number; status?: string },
) {
  return fetchJson<InventoryItem>(`${API_BASE}/inventory/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteInventory(id: number) {
  return fetchJson<void>(`${API_BASE}/inventory/${id}`, { method: "DELETE" });
}

export interface BarcodeResult {
  name: string | null
  brand?: string | null
  image_url?: string | null
  keywords?: string[]
}

export interface BarcodeDebug {
  url: string
  status: number
  body: unknown
}

export interface BarcodeLookup {
  data: BarcodeResult | null
  from_cache: boolean
  debug: BarcodeDebug
}

export async function lookupBarcode(ean: string): Promise<BarcodeLookup> {
  const url = `${API_BASE}/barcode/${ean}`
  const res = await fetch(url)
  const body = await res.json().catch(() => null)
  return {
    data: res.ok ? (body?.data as BarcodeResult) : null,
    from_cache: Boolean(body?.from_cache),
    debug: {
      url,
      status: res.status,
      body,
    },
  }
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
  return fetchJson<Synonym[]>(`${API_BASE}/synonyms/`);
}

export async function addSynonym(alias: string, canonical: string) {
  return fetchJson<Synonym>(`${API_BASE}/synonyms/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alias, canonical }),
  });
}

export async function deleteSynonym(alias: string) {
  return fetchJson<void>(`${API_BASE}/synonyms/${encodeURIComponent(alias)}`, {
    method: "DELETE",
  });
}

export interface ShoppingListItem {
  id: number;
  ingredient_id: number;
  quantity: number;
  ingredient?: Ingredient;
}

export async function listShoppingList() {
  return fetchJson<ShoppingListItem[]>(`${API_BASE}/shopping-list/`);
}

export async function clearShoppingList() {
  return fetchJson<void>(`${API_BASE}/shopping-list/`, { method: "DELETE" });
}

export async function addMissingFromRecipe(recipe_id: number) {
  return fetchJson<ShoppingListItem[]>(
    `${API_BASE}/shopping-list/from-recipe/${recipe_id}`,
    { method: "POST" },
  );
}

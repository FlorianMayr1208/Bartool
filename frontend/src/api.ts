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

export interface RecipeIngredient {
  id: number;
  name: string;
  measure?: string | null;
  inventory_item_id?: number | null;
  inventory_quantity: number;
}

export interface Recipe {
  id: number;
  name: string;
}

export interface RecipeSearchResult {
  name: string;
  alcoholic?: string | null;
  instructions?: string | null;
  thumb?: string | null;
  tags?: string[];
  categories?: string[];
  ibas?: string[];
}

export interface NamedItem {
  id: number;
  name: string;
}

export interface RecipeDetail {
  id: number;
  name: string;
  instructions?: string | null;
  thumb?: string | null;
  tags?: NamedItem[];
  categories?: NamedItem[];
  ibas?: NamedItem[];
  ingredients: RecipeIngredient[];
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

export async function listTags() {
  const res = await fetch(`${API_BASE}/tags`);
  return res.json();
}

export async function listCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  return res.json();
}

export async function searchRecipes(q: string): Promise<RecipeSearchResult[]> {
  const res = await fetch(
    `${API_BASE}/recipes/search?q=${encodeURIComponent(q)}`,
  );
  return res.json();
}

export interface FindRecipesOptions {
  q?: string;
  tag?: string;
  category?: string;
  alcoholic?: string;
  iba?: string;
  available_only?: boolean;
  order_missing?: boolean;
  skip?: number;
  limit?: number;
}

export async function findRecipes(options: FindRecipesOptions = {}) {
  const params = new URLSearchParams();
  if (options.q) params.append("q", options.q);
  if (options.tag) params.append("tag", options.tag);
  if (options.category) params.append("category", options.category);
  if (options.alcoholic) params.append("alcoholic", options.alcoholic);
  if (options.iba) params.append("iba", options.iba);
  if (options.available_only) params.append("available_only", "true");
  if (options.order_missing) params.append("order_missing", "true");
  if (options.skip !== undefined) params.append("skip", String(options.skip));
  if (options.limit !== undefined)
    params.append("limit", String(options.limit));
  const query = params.toString();
  const res = await fetch(
    `${API_BASE}/search${query ? `?${query}` : ""}`,
  );
  return res.json();
}

export async function listMacros() {
  const res = await fetch(`${API_BASE}/macros`);
  return res.json();
}

export async function getSuggestions(options: {
  limit?: number;
  max_missing?: number;
  macros?: string[];
  macro_mode?: 'and' | 'or';
} = {}) {
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.append('limit', String(options.limit));
  if (options.max_missing !== undefined)
    params.append('max_missing', String(options.max_missing));
  if (options.macros)
    for (const m of options.macros) params.append('macros', m);
  if (options.macro_mode)
    params.append('macro_mode', options.macro_mode);
  const query = params.toString();
  const res = await fetch(`${API_BASE}/suggestions${query ? `?${query}` : ''}`);
  return res.json();
}

export async function getSuggestionsByIngredients(options: {
  ingredients: number[];
  mode?: 'and' | 'or';
  macros?: string[];
  macro_mode?: 'and' | 'or';
  max_missing?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  for (const id of options.ingredients) {
    params.append('ingredients', String(id));
  }
  if (options.mode) params.append('mode', options.mode);
  if (options.macros)
    for (const m of options.macros) params.append('macros', m);
  if (options.macro_mode)
    params.append('macro_mode', options.macro_mode);
  if (options.max_missing !== undefined)
    params.append('max_missing', String(options.max_missing));
  if (options.limit !== undefined) params.append('limit', String(options.limit));
  const query = params.toString();
  const res = await fetch(
    `${API_BASE}/suggestions/by-ingredients${query ? `?${query}` : ''}`,
  );
  return res.json();
}

export async function getRecipe(id: number): Promise<RecipeDetail> {
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

export async function importSynonyms(data: Record<string, string>) {
  return fetchJson<void>(`${API_BASE}/synonyms/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function listUnitSynonyms() {
  return fetchJson<Synonym[]>(`${API_BASE}/unit-synonyms/`);
}

export async function addUnitSynonym(alias: string, canonical: string) {
  return fetchJson<Synonym>(`${API_BASE}/unit-synonyms/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alias, canonical }),
  });
}

export async function deleteUnitSynonym(alias: string) {
  return fetchJson<void>(
    `${API_BASE}/unit-synonyms/${encodeURIComponent(alias)}`,
    { method: "DELETE" },
  );
}

export async function importUnitSynonyms(data: Record<string, string>) {
  return fetchJson<void>(`${API_BASE}/unit-synonyms/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function aggregateInventorySynonyms() {
  return fetchJson<void>(`${API_BASE}/inventory/aggregate-synonyms`, {
    method: "POST",
  });
}

export interface ShoppingListItem {
  id: number;
  ingredient_id: number;
  quantity: number;
  unit?: string | null;
  ingredient?: Ingredient;
  recipe_id?: number | null;
  recipe?: Recipe | null;
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

export async function exportDatabase(): Promise<Blob> {
  const res = await fetch(`${API_BASE}/db/export`);
  if (!res.ok) throw new Error("Export failed");
  return res.blob();
}

export async function importDatabase(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/db/import`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Import failed");
}

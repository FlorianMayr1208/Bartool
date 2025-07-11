// Recipes.tsx - Page for searching, saving, and viewing cocktail recipes
import { useEffect, useState } from 'react';
import { listRecipes, searchRecipes, createRecipe } from '../api';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

// Recipe interface for type safety
interface Recipe {
  id?: number;
  name: string;
  alcoholic?: string | null;
  instructions?: string | null;
  thumb?: string | null;
}

export default function Recipes() {
  // State for search query, search results, saved recipes, and expanded recipe details
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [saved, setSaved] = useState<Recipe[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Fetch saved recipes from backend
  const refresh = () => {
    listRecipes().then(setSaved);
  };

  // Initial load: fetch saved recipes
  useEffect(() => {
    refresh();
  }, []);

  // Search for recipes by query, filter out already saved ones
  const runSearch = async () => {
    if (!query) return;
    const res = await searchRecipes(query);
    // Filter out recipes that are already saved
    setResults(res.filter((r: Recipe) => !saved.some((s) => s.name === r.name)));
  };

  // Save a recipe by name, refresh saved list, remove from search results
  const save = async (name: string) => {
    await createRecipe({ name });
    refresh();
    // Remove the recipe from search results after adding
    setResults((prev) => prev.filter((r) => r.name !== name));
  };

  return (
    <div className="space-y-4">
      {/* Page title */}
      <h1 className="text-2xl font-bold">Recipes</h1>
      {/* Search bar */}
      <div className="flex max-w-md items-center overflow-hidden rounded border">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cocktails"
          className="w-full bg-transparent p-2 focus:outline-none text-[var(--text-primary)]"
        />
        <button
          onClick={runSearch}
          className="px-3 py-2 hover:bg-[var(--bg-elevated)]"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      </div>
      {/* Search results section */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">
            Results ({results.length})
          </h2>
          <div className="card p-0">
            <ul className="divide-y divide-[var(--border)]">
              {results.map((r) => {
                const key = `search-${r.name}`;
                const expandedKey = expanded === key;
                return (
                  <li key={key}>
                    <div
                      className="flex items-center gap-2 p-2 cursor-pointer"
                      onClick={() =>
                        setExpanded(expandedKey ? null : key)
                      }
                    >
                      {/* Recipe name */}
                      <span className="flex-1 truncate font-semibold">
                        {r.name}
                      </span>
                      {/* Add button for unsaved recipes */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          save(r.name);
                        }}
                        className="button-search"
                      >
                        Add
                      </button>
                    </div>
                    {/* Expanded recipe details */}
                    {expandedKey && (
                      <div className="space-y-1 p-2 text-sm text-[var(--text-muted)]">
                        {/* Recipe thumbnail */}
                        {r.thumb && (
                        <img
                          src={r.thumb}
                          alt={r.name}
                          className="h-2 w-2 rounded object-cover"
                        />
                      )}
                        {/* Alcoholic info */}
                        {r.alcoholic && <p>{r.alcoholic}</p>}
                        {/* Instructions */}
                        {r.instructions && <p>{r.instructions}</p>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      {/* Saved recipes section */}
      {saved.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Saved Recipes</h2>
          <div className="card p-0">
            <ul className="divide-y divide-[var(--border)]">
              {saved.map((s) => {
                const key = `saved-${s.id || s.name}`;
                const expandedKey = expanded === key;
                return (
                  <li key={key}>
                    <div
                      className="flex items-center gap-2 p-2 cursor-pointer"
                      onClick={() =>
                        setExpanded(expandedKey ? null : key)
                      }
                    >
                      {/* Recipe name */}
                      <span className="flex-1 truncate font-semibold">
                        {s.name}
                      </span>
                      {/* Link to recipe detail page if id exists */}
                      {s.id && (
                        <Link
                          to={`/recipes/${s.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm underline text-[var(--highlight)]"
                        >
                          Open
                        </Link>
                      )}
                    </div>
                    {/* Expanded saved recipe details */}
                    {expandedKey && (
                      <div className="space-y-1 p-2 text-sm text-[var(--text-muted)]">
                        {/* Recipe thumbnail */}
                        {s.thumb && (
                        <img
                          src={s.thumb}
                          alt={s.name}
                          className="h-2 w-2 rounded object-cover"
                        />
                      )}
                        {/* Alcoholic info */}
                        {s.alcoholic && <p>{s.alcoholic}</p>}
                        {/* Instructions */}
                        {s.instructions && <p>{s.instructions}</p>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

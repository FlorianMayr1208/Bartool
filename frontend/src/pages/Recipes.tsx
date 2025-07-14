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
      <h1 className="text-3xl font-bold font-display">Recipes</h1>
      {/* Search bar */}
      <div className="flex max-w-md items-center overflow-hidden rounded border border-[var(--border)]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cocktails"
          className="w-full bg-transparent p-2 focus:outline-none text-[var(--text-primary)] border-none"
        />
        <button
          onClick={runSearch}
          className="button-send"
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
                      className="flex items-center gap-2 p-4 cursor-pointer mb-[5px] mt-[5px]"
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
                          className="h-24 w-24 rounded object-cover"
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
                      className="flex items-center gap-2 p-4 cursor-pointer mb-[5px] mt-[5px]"
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
                          className="button-search"
                        >
                          Open
                        </Link>
                      )}
                    </div>
                    {/* Expanded saved recipe details */}
                    {expandedKey && (
                      <div className="flex h-52 w-96 space-x-4 p-2 text-sm text-[var(--text-muted)] mb-4">
                        {/* Recipe thumbnail */}
                        {s.thumb && (
                          <img
                            src={s.thumb}
                            alt={s.name}
                            className="h-48 w-48 rounded object-cover"
                          />
                        )}
                        <div className="flex flex-row items-start space-x-16 w-full">
                          {/* Alcoholic info with promille icon if alcoholic */}
                          {s.alcoholic && (
                            <div className="ml-16 flex items-center space-x-2">
                              <p>{s.alcoholic}</p>
                              {s.alcoholic === "Alcoholic" && (
                                <span title="Alcoholic">
                                  {/* Promille SVG icon */}
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <text x="10" y="14" textAnchor="middle" fontSize="10" fill="currentColor">%</text>
                                  </svg>
                                </span>
                              )}
                            </div>
                          )}
                          {/* Instructions section */}
                          {s.instructions && (
                            <div className="ml-2 flex-1 min-w-[300px] max-w-[500px]">
                              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Instructions</h3>
                              <p>{s.instructions}</p>
                            </div>
                          )}
                        </div>
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

// Recipes.tsx - Page for searching, saving, and viewing cocktail recipes
import { useEffect, useState, useRef } from 'react';
import { listRecipes, searchRecipes, createRecipe } from '../api';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import RecipeList, { type RecipeItem } from '../components/RecipeList';

// Reuse RecipeItem type from RecipeList component
type Recipe = RecipeItem;

export default function Recipes() {
  // State for search query, search results and saved recipes
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [saved, setSaved] = useState<Recipe[]>([]);
  // Ref for search input
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="space-y-6 flex flex-col items-center w-full">
      {/* Page title */}
      <h1 className="page-title">New Recipes</h1>
      {/* Search bar */}
      <div className="flex items-center justify-center w-full">
        <div className="flex w-full max-w-2xl items-center overflow-hidden rounded border border-[var(--border)] bg-white/5 shadow-lg">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cocktails"
            className="w-full bg-transparent p-4 text-lg focus:outline-none text-[var(--text-primary)] border-none"
            onClick={() => inputRef.current && inputRef.current.focus()}
            onTouchStart={() => inputRef.current && inputRef.current.focus()}
          />
          <button
            onClick={runSearch}
            className="button-send px-6 py-3 text-lg mr-4"
            aria-label="Search"
          >
            <Search size={28} />
          </button>
        </div>
      </div>
      {/* Search results section */}
      {results.length > 0 && (
        <div className="space-y-2 w-full max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 mt-8">Results ({results.length})</h2>
          <RecipeList
            recipes={results}
            renderAction={(r) => (
              <button onClick={() => save(r.name)} className="button-search">
                Add
              </button>
            )}
          />
        </div>
      )}
    </div>
  );
}

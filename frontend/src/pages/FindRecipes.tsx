import { useState } from "react";
import { findRecipes } from "../api";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import RecipeList, { type RecipeItem } from "../components/RecipeList";

type Recipe = RecipeItem;

export default function FindRecipes() {
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [orderMissing, setOrderMissing] = useState(false);
  const [results, setResults] = useState<Recipe[]>([]);

  const runSearch = async () => {
    const data = await findRecipes({
      q: query || undefined,
      available_only: availableOnly,
      order_missing: orderMissing,
    });
    setResults(data);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold font-display">Recipe Finder</h1>
      <div className="flex max-w-md items-center overflow-hidden rounded border border-[var(--border)]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved recipes"
          className="w-full bg-transparent p-2 focus:outline-none text-[var(--text-primary)] border-none"
        />
        <button onClick={runSearch} className="button-send" aria-label="Search">
          <Search size={20} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Available only
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={orderMissing}
            onChange={(e) => setOrderMissing(e.target.checked)}
          />
          Order by missing
        </label>
      </div>
      {results.length > 0 && (
        <RecipeList
          recipes={results}
          showCounts
          renderAction={(r) => (
            <Link to={`/recipes/${r.id}`} className="button-search">
              Open
            </Link>
          )}
        />
      )}
    </div>
  );
}

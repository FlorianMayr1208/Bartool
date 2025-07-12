import { useState } from "react";
import { findRecipes } from "../api";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

interface Recipe {
  id: number;
  name: string;
  alcoholic?: string | null;
  instructions?: string | null;
  thumb?: string | null;
}

export default function FindRecipes() {
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [orderMissing, setOrderMissing] = useState(false);
  const [results, setResults] = useState<Recipe[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

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
      <h1 className="text-2xl font-bold">Recipe Finder</h1>
      <div className="flex max-w-md items-center overflow-hidden rounded border border-[var(--highlight)]">
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
        <div className="card p-0">
          <ul className="divide-y divide-[var(--border)]">
            {results.map((r) => {
              const expandedKey = expanded === r.id;
              return (
                <li key={r.id}>
                  <div
                    className="flex items-center gap-2 p-4 cursor-pointer mb-[5px] mt-[5px]"
                    onClick={() => setExpanded(expandedKey ? null : r.id)}
                  >
                    <span className="flex-1 truncate font-semibold">
                      {r.name}
                    </span>
                    <Link
                      to={`/recipes/${r.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="button-search"
                    >
                      Open
                    </Link>
                  </div>
                  {expandedKey && (
                    <div className="space-y-1 p-2 text-sm text-[var(--text-muted)]">
                      {r.thumb && (
                        <img
                          src={r.thumb}
                          alt={r.name}
                          className="h-2 w-2 rounded object-cover"
                        />
                      )}
                      {r.alcoholic && <p>{r.alcoholic}</p>}
                      {r.instructions && <p>{r.instructions}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

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
  available_count?: number;
  missing_count?: number;
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
                    {typeof r.available_count === "number" && typeof r.missing_count === "number" && (
                      <span className="text-sm text-[var(--text-secondary)]">
                        {r.available_count} available / {r.missing_count} missing
                      </span>
                    )}
                    <Link
                      to={`/recipes/${r.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="button-search"
                    >
                      Open
                    </Link>
                  </div>
                  {expandedKey && (
                    <div className="flex h-52 w-96 space-x-4 p-2 text-sm text-[var(--text-muted)] mb-4">
                      {/* Recipe thumbnail */}
                      {r.thumb && (
                        <img
                          src={r.thumb}
                          alt={r.name}
                          className="h-48 w-48 rounded object-cover"
                        />
                      )}
                      <div className="flex flex-row items-start space-x-16 w-full">
                        {/* Alcoholic info with promille icon if alcoholic */}
                        {r.alcoholic && (
                          <div className="ml-16 flex items-center space-x-2">
                            <p>{r.alcoholic}</p>
                            {r.alcoholic === "Alcoholic" && (
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
                        {r.instructions && (
                          <div className="ml-2 flex-1 min-w-[300px] max-w-[500px]">
                            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Instructions</h3>
                            <p>{r.instructions}</p>
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
      )}
    </div>
  );
}

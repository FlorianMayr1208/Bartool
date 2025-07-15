import { useState, useEffect } from "react";
import { findRecipes, listTags, listCategories } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import RecipeList, { type RecipeItem } from "../components/RecipeList";

type Recipe = RecipeItem;

export default function FindRecipes() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [orderMissing, setOrderMissing] = useState(false);
  const [results, setResults] = useState<Recipe[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    undefined,
  );
  const [alcoholicFilter, setAlcoholicFilter] = useState<string | undefined>(
    undefined,
  );

  const runSearch = async () => {
    const data = await findRecipes({
      q: query || undefined,
      tag: tagFilter || undefined,
      category: categoryFilter || undefined,
      alcoholic: alcoholicFilter || undefined,
      iba: searchParams.get("iba") || undefined,
      available_only: availableOnly,
      order_missing: orderMissing,
    });
    setResults(data);
  };

  useEffect(() => {
    listTags().then((t) => setTags(t.map((x) => (typeof x === "string" ? x : x.name))));
    listCategories().then((c) =>
      setCategories(c.map((x) => (typeof x === "string" ? x : x.name)))
    );
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const tag = searchParams.get("tag") || undefined;
    const category = searchParams.get("category") || undefined;
    const alc = searchParams.get("alcoholic") || undefined;
    const iba = searchParams.get("iba") || undefined;
    if (q || tag || category || alc || iba) {
      setQuery(q);
      setTagFilter(tag);
      setCategoryFilter(category);
      setAlcoholicFilter(alc);
      findRecipes({ q: q || undefined, tag, category, alcoholic: alc, iba }).then(
        setResults,
      );
    }
  }, [searchParams]);

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
        <select
          value={tagFilter || ""}
          onChange={(e) => setTagFilter(e.target.value || undefined)}
          className="bg-transparent border border-[var(--border)] p-1 rounded"
        >
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter || ""}
          onChange={(e) => setCategoryFilter(e.target.value || undefined)}
          className="bg-transparent border border-[var(--border)] p-1 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={alcoholicFilter || ""}
          onChange={(e) => setAlcoholicFilter(e.target.value || undefined)}
          className="bg-transparent border border-[var(--border)] p-1 rounded"
        >
          <option value="">All</option>
          <option value="Alcoholic">Alcoholic</option>
          <option value="Non alcoholic">Non alcoholic</option>
        </select>
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

import { useState, useEffect } from "react";
import { findRecipes, listTags, listCategories } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import RecipeList, { type RecipeItem } from "../components/RecipeList";

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

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
        {/* Tag Filter Dropdown */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/10">
              {tagFilter ? tags.find((t) => t === tagFilter) : "All Tags"}
              <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-[var(--border)]" />
            </MenuButton>
          </div>
          <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--background)] border border-[var(--border)] shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--border)]/20" : ""}`}
                    onClick={() => setTagFilter(undefined)}
                  >
                    All Tags
                  </button>
                )}
              </MenuItem>
              {tags.map((t) => (
                <MenuItem key={t}>
                  {({ active }) => (
                    <button
                      className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--border)]/20" : ""}`}
                      onClick={() => setTagFilter(t)}
                    >
                      {t}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
        {/* Category Filter Dropdown */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/10">
              {categoryFilter ? categories.find((c) => c === categoryFilter) : "All Categories"}
              <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-[var(--border)]" />
            </MenuButton>
          </div>
          <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--background)] border border-[var(--border)] shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--border)]/20" : ""}`}
                    onClick={() => setCategoryFilter(undefined)}
                  >
                    All Categories
                  </button>
                )}
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c}>
                  {({ active }) => (
                    <button
                      className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--border)]/20" : ""}`}
                      onClick={() => setCategoryFilter(c)}
                    >
                      {c}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
        {/* Alcoholic Filter Dropdown */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--border)]/10">
              {alcoholicFilter ? alcoholicFilter : "All"}
              <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-[var(--border)]" />
            </MenuButton>
          </div>
          <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--background)] border border-[var(--border)] shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--border)]/20" : ""}`}
                    onClick={() => setAlcoholicFilter(undefined)}
                  >
                    All
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--border)]/20" : ""}`}
                    onClick={() => setAlcoholicFilter("Alcoholic")}
                  >
                    Alcoholic
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--border)]/20" : ""}`}
                    onClick={() => setAlcoholicFilter("Non alcoholic")}
                  >
                    Non alcoholic
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
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

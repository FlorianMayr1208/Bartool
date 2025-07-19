import { useState, useEffect } from "react";
import { findRecipes, listTags, listCategories, deleteRecipe } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import RecipeList, { type RecipeItem } from "../components/RecipeList";
import Suggestions from "../components/Suggestions";

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

  const remove = async (id: number) => {
    await deleteRecipe(id);
    runSearch();
  };

  useEffect(() => {
    listTags().then((t: Array<string | { name: string }>) =>
      setTags(t.map((x) => (typeof x === "string" ? x : x.name)))
    );
    listCategories().then((c: Array<string | { name: string }>) =>
      setCategories(c.map((x) => (typeof x === "string" ? x : x.name)))
    );
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const tag = searchParams.get("tag") || undefined;
    const category = searchParams.get("category") || undefined;
    const alc = searchParams.get("alcoholic") || undefined;
    const iba = searchParams.get("iba") || undefined;
    setQuery(q);
    setTagFilter(tag);
    setCategoryFilter(category);
    setAlcoholicFilter(alc);
    // Always fetch results on mount, with or without filters
    findRecipes({ q: q || undefined, tag, category, alcoholic: alc, iba }).then(
      setResults,
    );
  }, [searchParams]);

  return (
    <div className="space-y-6 flex flex-col items-center w-full">
      <h1 className="page-title">Recipe Library</h1>
      <Suggestions limit={4} />
      <div className="flex items-center justify-center w-full mt-8">
        <div className="flex w-full max-w-2xl items-center overflow-hidden rounded border border-[var(--border)] bg-white/5 shadow-lg">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved recipes"
            className="w-full bg-transparent p-4 text-lg focus:outline-none text-[var(--text-primary)] border-none"
          />
          <button onClick={runSearch} className="button-send px-6 py-3 text-lg mr-4" aria-label="Search">
            <Search size={28} />
          </button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 w-full items-stretch sm:items-center justify-center mt-2">
        <label className="flex items-center gap-2 px-2 py-1 rounded bg-white/10 border border-[var(--border)] text-sm w-full sm:w-auto">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="w-5 h-5 accent-[var(--accent)]"
          />
          Available only
        </label>
        <label className="flex items-center gap-2 px-2 py-1 rounded bg-white/10 border border-[var(--border)] text-sm w-full sm:w-auto">
          <input
            type="checkbox"
            checked={orderMissing}
            onChange={(e) => setOrderMissing(e.target.checked)}
            className="w-5 h-5 accent-[var(--accent)]"
          />
          Order by missing
        </label>
        {/* Tag Filter Dropdown */}
        <Menu as="div" className="relative inline-block text-left w-full sm:w-auto">
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--accent)]/10">
              {tagFilter ? tags.find((t) => t === tagFilter) : "All Tags"}
              <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-[var(--accent)]" />
            </MenuButton>
          </div>
          <MenuItems className="absolute left-0 sm:left-auto right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--background)] border border-[var(--border)] shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--accent)]/20" : ""}`}
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
                      className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--accent)]/20" : ""}`}
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
        <Menu as="div" className="relative inline-block text-left w-full sm:w-auto">
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--accent)]/10">
              {categoryFilter ? categories.find((c) => c === categoryFilter) : "All Categories"}
              <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-[var(--accent)]" />
            </MenuButton>
          </div>
          <MenuItems className="absolute left-0 sm:left-auto right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--background)] border border-[var(--border)] shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--accent)]/20" : ""}`}
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
                      className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--accent)]/20" : ""}`}
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
        <Menu as="div" className="relative inline-block text-left w-full sm:w-auto">
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--accent)]/10">
              {alcoholicFilter ? alcoholicFilter : "All"}
              <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-[var(--accent)]" />
            </MenuButton>
          </div>
          <MenuItems className="absolute left-0 sm:left-auto right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-[var(--background)] border border-[var(--border)] shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--accent)]/20" : ""}`}
                    onClick={() => setAlcoholicFilter(undefined)}
                  >
                    All
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--accent)]/20" : ""}`}
                    onClick={() => setAlcoholicFilter("Alcoholic")}
                  >
                    Alcoholic
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <button
                    className={`block w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] ${active ? "bg-[var(--accent)]/20" : ""}`}
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
        <div className="w-full max-w-2xl mx-auto">
          <RecipeList
            recipes={results}
            showCounts
            renderAction={(r) =>
              r.id ? (
                <span className="flex gap-2">
                  <Link to={`/recipes/${r.id}`} className="button-search">
                    Open
                  </Link>
                    <button onClick={() => remove(r.id!)} className="button-search">
                    Delete
                    </button>
                </span>
              ) : null
            }
          />
        </div>
      )}
    </div>
  );
}

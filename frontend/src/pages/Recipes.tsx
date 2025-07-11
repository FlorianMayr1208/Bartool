import { useEffect, useState } from 'react';
import { listRecipes, searchRecipes, createRecipe } from '../api';
import { Link } from 'react-router-dom';

interface Recipe {
  id?: number;
  name: string;
  alcoholic?: string | null;
  instructions?: string | null;
  thumb?: string | null;
}

export default function Recipes() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [saved, setSaved] = useState<Recipe[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = () => {
    listRecipes().then(setSaved);
  };

  useEffect(() => {
    refresh();
  }, []);

  const runSearch = async () => {
    if (!query) return;
    const res = await searchRecipes(query);
    // Filter out recipes that are already saved
    setResults(res.filter((r: Recipe) => !saved.some((s) => s.name === r.name)));
  };

  const save = async (name: string) => {
    await createRecipe({ name });
    refresh();
    // Remove the recipe from search results after adding
    setResults((prev) => prev.filter((r) => r.name !== name));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Recipes</h1>
      <div className="space-x-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cocktails"
          className="border p-1"
        />
        <button onClick={runSearch} className="rounded bg-blue-500 px-2 py-1 text-white">
          Search
        </button>
      </div>
      {results.length > 0 && (
        <div>
          <h2 className="font-semibold">Results</h2>
          <ul className="list-disc pl-5">
            {results.map((r) => (
              <li key={r.name} className="my-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(expanded === r.name ? null : r.name)
                    }
                    className="font-semibold underline"
                  >
                    {r.name}
                  </button>
                  <button
                    onClick={() => save(r.name)}
                    className="rounded bg-green-500 px-1 text-white"
                  >
                    Add
                  </button>
                </div>
                {expanded === r.name && (
                  <div className="space-y-1">
                    {r.thumb && (
                      <img src={r.thumb} alt={r.name} className="w-32" />
                    )}
                    {r.instructions && (
                      <p className="text-sm text-gray-700">{r.instructions}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {saved.length > 0 && (
        <div>
          <h2 className="font-semibold">Saved Recipes</h2>
          <ul className="list-disc pl-5">
            {saved.map((s) => (
              <li key={s.id || s.name}>
                {s.id ? (
                  <Link to={`/recipes/${s.id}`} className="text-blue-600 underline">
                    {s.name}
                  </Link>
                ) : (
                  s.name
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

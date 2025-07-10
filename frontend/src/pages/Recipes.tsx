import { useEffect, useState } from 'react';
import { listRecipes, searchRecipes, createRecipe } from '../api';

interface Recipe {
  name: string;
  id?: number;
}

export default function Recipes() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [saved, setSaved] = useState<Recipe[]>([]);

  const refresh = () => {
    listRecipes().then(setSaved);
  };

  useEffect(() => {
    refresh();
  }, []);

  const runSearch = async () => {
    if (!query) return;
    const res = await searchRecipes(query);
    setResults(res);
  };

  const save = async (name: string) => {
    await createRecipe({ name });
    refresh();
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
              <li key={r.name} className="my-1 flex items-center space-x-2">
                <span>{r.name}</span>
                <button
                  onClick={() => save(r.name)}
                  className="rounded bg-green-500 px-1 text-white"
                >
                  Add
                </button>
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
              <li key={s.id || s.name}>{s.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSuggestions } from '../api';
import type { RecipeItem } from './RecipeList';

interface SuggestionsProps {
  limit?: number;
}

export default function Suggestions({ limit = 4 }: SuggestionsProps) {
  const [suggestions, setSuggestions] = useState<RecipeItem[]>([]);

  useEffect(() => {
    getSuggestions(limit)
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [limit]);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">Suggestions</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {suggestions.map((s, idx) => (
          <Link
            key={s.id ?? idx}
            to={s.id ? `/recipes/${s.id}` : '#'}
            className="card flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            {s.thumb && (
              <img
                src={s.thumb}
                alt={s.name}
                className="h-64 w-full object-cover rounded"
              />
            )}
            <div className="font-semibold mt-3">{s.name}</div>
            {typeof s.missing_count === 'number' && (
              <div className="text-sm text-[var(--text-muted)] mt-1">
                Missing {s.missing_count}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

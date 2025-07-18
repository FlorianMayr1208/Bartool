import { useEffect, useState } from 'react';
import {
  listInventory,
  type InventoryItem,
  getSuggestionsByIngredients,
  listMacros,
} from '../api';
import RecipeList, { type RecipeItem } from '../components/RecipeList';

export default function SuggestionsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [mode, setMode] = useState<'and' | 'or'>('and');
  const [macroMode, setMacroMode] = useState<'and' | 'or'>('or');
  const [maxMissing, setMaxMissing] = useState(0);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [drag, setDrag] = useState<number | null>(null);
  const [macros, setMacros] = useState<string[]>([]);
  const [selectedMacros, setSelectedMacros] = useState<string[]>([]);

  useEffect(() => {
    listInventory().then(({ data }) => {
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    });
    listMacros().then(setMacros).catch(() => setMacros([]));
  }, []);

  useEffect(() => {
    getSuggestionsByIngredients({
      ingredients: selected,
      mode,
      macros: selectedMacros,
      macro_mode: macroMode,
      max_missing: maxMissing === 3 ? undefined : maxMissing,
    })
      .then(setRecipes)
      .catch(() => setRecipes([]));
  }, [selected, mode, maxMissing, selectedMacros, macroMode]);

  const toggle = (id: number) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  };

  const toggleMacro = (name: string) => {
    setSelectedMacros((s) =>
      s.includes(name) ? s.filter((x) => x !== name) : [...s, name],
    );
  };

  const handleDrop = (target: number) => {
    if (drag === null || drag === target) return;
    const from = selected.indexOf(drag);
    const to = selected.indexOf(target);
    if (from === -1 || to === -1) return;
    const arr = [...selected];
    arr.splice(from, 1);
    arr.splice(to, 0, drag);
    setSelected(arr);
    setDrag(null);
  };

  const chipClass = (active: boolean) =>
    `px-3 py-2 rounded-full border text-sm cursor-pointer select-none transition ${
      active
        ? 'bg-[var(--accent)] text-black'
        : 'border-[var(--border)] text-[var(--text-primary)]'
    }`;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold font-display">Suggestions</h1>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <div
            key={it.id}
            draggable={selected.includes(it.ingredient_id)}
            onDragStart={() => setDrag(it.ingredient_id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(it.ingredient_id)}
            onClick={() => toggle(it.ingredient_id)}
            className={chipClass(selected.includes(it.ingredient_id))}
          >
            {it.ingredient?.name}
          </div>
        ))}
      </div>
      {macros.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {macros.map((m) => (
            <div
              key={m}
              onClick={() => toggleMacro(m)}
              className={chipClass(selectedMacros.includes(m))}
            >
              {m}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('and')}
            className={`px-2 py-1 border rounded ${
              mode === 'and'
                ? 'bg-[var(--accent)] text-black'
                : 'border-[var(--border)]'
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setMode('or')}
            className={`px-2 py-1 border rounded ${
              mode === 'or'
                ? 'bg-[var(--accent)] text-black'
                : 'border-[var(--border)]'
            }`}
          >
            Beliebige
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMacroMode('and')}
            className={`px-2 py-1 border rounded ${
              macroMode === 'and'
                ? 'bg-[var(--accent)] text-black'
                : 'border-[var(--border)]'
            }`}
          >
            Macro AND
          </button>
          <button
            onClick={() => setMacroMode('or')}
            className={`px-2 py-1 border rounded ${
              macroMode === 'or'
                ? 'bg-[var(--accent)] text-black'
                : 'border-[var(--border)]'
            }`}
          >
            Macro OR
          </button>
        </div>
        <label className="flex items-center gap-2">
          <span className="text-sm">Max. fehlende Zutaten:</span>
          <input
            type="range"
            min={0}
            max={3}
            value={maxMissing}
            onChange={(e) => setMaxMissing(parseInt(e.target.value))}
          />
          <span className="text-sm">
            {maxMissing === 3 ? 'egal' : maxMissing}
          </span>
        </label>
      </div>
      {recipes.length > 0 && (
        <RecipeList
          recipes={recipes}
          showCounts
          renderAction={(r) =>
            r.id ? (
              <a href={`/recipes/${r.id}`} className="button-search">
                Open
              </a>
            ) : null
          }
        />
      )}
    </div>
  );
}

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
  const [maxMissing, setMaxMissing] = useState(3); // Default to 'egal'
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [drag, setDrag] = useState<number | null>(null);
  const [macros, setMacros] = useState<string[]>([]);
  const [selectedMacros, setSelectedMacros] = useState<string[]>([]);
  const [showIngredients, setShowIngredients] = useState<boolean>(false);

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
      .then((results: RecipeItem[]) => {
        // Remove duplicates by id (or by name if id is missing)
        const seen = new Set();
        const unique = results.filter((r) => {
          const key = r.id ?? r.name;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setRecipes(unique);
      })
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
    } chip-hover`;

  // Unified button style
  const buttonClass = (active: boolean) =>
    `px-2 py-1 border rounded text-xs font-medium transition ${
      active
        ? 'bg-[var(--highlight)] text-black border-[var(--highlight)]'
        : 'border-[var(--border)] text-[var(--text-primary)] bg-transparent hover:bg-[var(--border)]/30'
    }`;

  return (
    <div className="space-y-6">
      <h1 className="page-title mb-8">Suggestions</h1>

      {/* Ingredients Section (Hideable) */}
      <section className="card p-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg mb-2">Ingredients</h2>
          <button
            onClick={() => setShowIngredients((v) => !v)}
            className={buttonClass(showIngredients) + ' ml-2'}
            title={showIngredients ? 'Hide ingredients' : 'Show ingredients'}
          >
            {showIngredients ? 'Hide' : 'Show'}
          </button>
        </div>
        {showIngredients && (
          <>
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
                  title="Select ingredient (drag to reorder)"
                >
                  {it.ingredient?.name}
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-6">
              <button
                onClick={() => setMode('and')}
                className={buttonClass(mode === 'and')}
                title="All selected ingredients must be present"
              >
                AND
              </button>
              <button
                onClick={() => setMode('or')}
                className={buttonClass(mode === 'or')}
                title="Any selected ingredient may be present"
              >
                OR
              </button>
            </div>
          </>
        )}
      </section>


      {/* Macros and Filter Options Side by Side */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Macros Section */}
        {macros.length > 0 && (
          <section className="card p-0 flex-1 min-w-[250px]">
            <h2 className="font-semibold text-lg mb-2">Taste</h2>
            <div className="flex flex-wrap gap-2">
              {macros.map((m) => (
                <div
                  key={m}
                  onClick={() => toggleMacro(m)}
                  className={chipClass(selectedMacros.includes(m))}
                  title="Select taste filter"
                >
                  {m}
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-6">
              <button
                onClick={() => setMacroMode('and')}
                className={buttonClass(macroMode === 'and')}
                title="All selected macros must be present"
              >
                AND
              </button>
              <button
                onClick={() => setMacroMode('or')}
                className={buttonClass(macroMode === 'or')}
                title="Any selected macro may be present"
              >
                OR
              </button>
            </div>
          </section>
        )}

        {/* Filter Options Section */}
        <section className="card p-0 flex-1 min-w-[250px] flex flex-col gap-4">
          <h2 className="font-semibold text-lg mb-1">Missing Ingredients</h2>
          <span className="text-xs font-medium text-gray-500">Maximum number of missing ingredients</span>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col items-start gap-1">

              <div className="flex flex-col items-center w-full mt-2">
                <input
                  type="range"
                  min={0}
                  max={3}
                  value={maxMissing}
                  onChange={(e) => setMaxMissing(parseInt(e.target.value))}
                  className="accent-[var(--accent)] w-128 h-5"
                  title="Maximum number of missing ingredients allowed"
                  style={{ maxWidth: '100%' }}
                />
                <span className="text-sm mt-1">
                  {maxMissing === 3 ? 'max' : maxMissing}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recipe Results */}
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

import { useEffect, useState } from 'react';
import {
  listInventory,
  type InventoryItem,
  getSuggestionsByIngredients,
  listMacros,
} from '../api';
import { type RecipeItem } from '../components/RecipeList';
import EnhancedSuggestions from '../components/EnhancedSuggestions';
import { useDebounce } from '../hooks/useDebounce';
import { useFilter, useFilterActions } from '../contexts/FilterContext';

export default function SuggestionsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [drag, setDrag] = useState<number | null>(null);
  const [macros, setMacros] = useState<string[]>([]);

  // Use FilterContext for all filter state
  const { state } = useFilter();
  const filterActions = useFilterActions();

  // Debounce values to reduce API calls
  const debouncedSelected = useDebounce(state.selectedIngredients, 300);
  const debouncedMaxMissing = useDebounce(state.maxMissing, 300);
  const debouncedSelectedMacros = useDebounce(state.selectedMacros, 300);

  useEffect(() => {
    listInventory().then(({ data }) => {
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    });
    listMacros().then((data: unknown) => setMacros(data as string[])).catch(() => setMacros([]));
  }, []);

  useEffect(() => {
    getSuggestionsByIngredients({
      ingredients: debouncedSelected,
      mode: state.mode,
      macros: debouncedSelectedMacros,
      macro_mode: state.macroMode,
      max_missing: debouncedMaxMissing === 3 ? undefined : debouncedMaxMissing,
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
  }, [debouncedSelected, state.mode, debouncedMaxMissing, debouncedSelectedMacros, state.macroMode]);

  const handleDrop = (target: number) => {
    if (drag === null || drag === target) return;
    const from = state.selectedIngredients.indexOf(drag);
    const to = state.selectedIngredients.indexOf(target);
    if (from === -1 || to === -1) return;
    const arr = [...state.selectedIngredients];
    arr.splice(from, 1);
    arr.splice(to, 0, drag);
    filterActions.reorderIngredients(arr);
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
            onClick={filterActions.toggleIngredientsVisibility}
            className={buttonClass(state.showIngredients) + ' ml-2'}
            title={state.showIngredients ? 'Hide ingredients' : 'Show ingredients'}
          >
            {state.showIngredients ? 'Hide' : 'Show'}
          </button>
        </div>
        {state.showIngredients && (
          <>
            <div className="flex flex-wrap gap-2">
              {items.map((it) => (
                <div
                  key={it.id}
                  draggable={state.selectedIngredients.includes(it.ingredient_id)}
                  onDragStart={() => setDrag(it.ingredient_id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(it.ingredient_id)}
                  onClick={() => filterActions.toggleIngredient(it.ingredient_id)}
                  className={chipClass(state.selectedIngredients.includes(it.ingredient_id))}
                  title="Select ingredient (drag to reorder)"
                >
                  {it.ingredient?.name}
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-6">
              <button
                onClick={() => filterActions.setMode('and')}
                className={buttonClass(state.mode === 'and')}
                title="All selected ingredients must be present"
              >
                AND
              </button>
              <button
                onClick={() => filterActions.setMode('or')}
                className={buttonClass(state.mode === 'or')}
                title="Any selected ingredient may be present"
              >
                OR
              </button>
              <button
                onClick={() => filterActions.setMode('not')}
                className={buttonClass(state.mode === 'not')}
                title="None of the selected ingredients may be present"
              >
                NOT
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
                  onClick={() => filterActions.toggleMacro(m)}
                  className={chipClass(state.selectedMacros.includes(m))}
                  title="Select taste filter"
                >
                  {m}
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-6">
              <button
                onClick={() => filterActions.setMacroMode('and')}
                className={buttonClass(state.macroMode === 'and')}
                title="All selected macros must be present"
              >
                AND
              </button>
              <button
                onClick={() => filterActions.setMacroMode('or')}
                className={buttonClass(state.macroMode === 'or')}
                title="Any selected macro may be present"
              >
                OR
              </button>
              <button
                onClick={() => filterActions.setMacroMode('not')}
                className={buttonClass(state.macroMode === 'not')}
                title="Selected macros must not be present"
              >
                NOT
              </button>
            </div>
          </section>
        )}

        {/* Missing Ingredients Section */}
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
                  value={state.maxMissing}
                  onChange={(e) => filterActions.setMaxMissing(parseInt(e.target.value))}
                  className="accent-[var(--accent)] h-8 w-full max-w-xs sm:max-w-md md:max-w-lg touch-manipulation"
                  title="Maximum number of missing ingredients allowed"
                  style={{ maxWidth: '100%' }}
                />
                <span className="text-base mt-2 font-semibold">
                  {state.maxMissing === 3 ? 'max' : state.maxMissing}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recipe Results */}
      {recipes.length > 0 && (
          <EnhancedSuggestions
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

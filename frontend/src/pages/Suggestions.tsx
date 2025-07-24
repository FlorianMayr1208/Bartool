import { useEffect, useState } from 'react';
import {
  listInventory,
  type InventoryItem,
  getSuggestionsByIngredients,
  listMacros,
} from '../api';
import { type RecipeItem } from '../components/RecipeList';
import EnhancedSuggestions from '../components/EnhancedSuggestions';
import TouchSlider from '../components/TouchSlider';
import TouchChip from '../components/TouchChip';
import { useDebounce } from '../hooks/useDebounce';
import { useFilter, useFilterActions } from '../contexts/FilterContext';
import { useMobileDragDrop } from '../hooks/useMobileDragDrop';

export default function SuggestionsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [macros, setMacros] = useState<string[]>([]);

  // Use FilterContext for all filter state
  const { state } = useFilter();
  const filterActions = useFilterActions();

  // Enhanced mobile drag and drop
  const mobileDragDrop = useMobileDragDrop({
    items: state.selectedIngredients,
    onReorder: filterActions.reorderIngredients,
  });

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

  // Old drag handler removed - now using enhanced mobile drag and drop

  // Remove old chipClass as we're using TouchChip component now

  // Unified button style
  const buttonClass = (active: boolean) =>
    `px-2 py-1 border rounded text-xs font-medium transition ${
      active
        ? 'bg-[var(--highlight)] text-black border-[var(--highlight)]'
        : 'border-[var(--border)] text-[var(--text-primary)] bg-transparent hover:bg-[var(--border)]/30'
    }`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="page-title text-2xl sm:text-3xl">Suggestions</h1>
        
        {/* Mobile-friendly filter summary */}
        <div className="flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
          {state.selectedIngredients.length > 0 && (
            <span className="bg-[var(--bg-elevated)] px-2 py-1 rounded">
              {state.selectedIngredients.length} ingredients
            </span>
          )}
          {state.selectedMacros.length > 0 && (
            <span className="bg-[var(--bg-elevated)] px-2 py-1 rounded">
              {state.selectedMacros.length} tastes
            </span>
          )}
          <span className="bg-[var(--bg-elevated)] px-2 py-1 rounded">
            ≤{state.maxMissing === 3 ? '∞' : state.maxMissing} missing
          </span>
        </div>
      </div>

      {/* Ingredients Section (Hideable) */}
      <section className="card p-0">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold text-lg">Ingredients</h2>
          <button
            onClick={filterActions.toggleIngredientsVisibility}
            className={buttonClass(state.showIngredients)}
            title={state.showIngredients ? 'Hide ingredients' : 'Show ingredients'}
          >
            {state.showIngredients ? 'Hide' : 'Show'}
          </button>
        </div>
        {state.showIngredients && (
          <>
            <div className="flex flex-wrap gap-2 p-4">
              {items.map((it) => {
                const isSelected = state.selectedIngredients.includes(it.ingredient_id);
                const itemState = mobileDragDrop.getItemState(it.ingredient_id);
                const dragProps = mobileDragDrop.getDragProps(it.ingredient_id);
                
                return (
                  <TouchChip
                    key={it.id}
                    active={isSelected}
                    onClick={() => filterActions.toggleIngredient(it.ingredient_id)}
                    draggable={isSelected}
                    isDragging={itemState.isDragging}
                    isDraggedOver={itemState.isDraggedOver}
                    dragProps={isSelected ? dragProps : {}}
                    title={`${it.ingredient?.name} - Tap to ${isSelected ? 'remove' : 'select'}${isSelected ? ' (drag to reorder)' : ''}`}
                  >
                    {it.ingredient?.name}
                  </TouchChip>
                );
              })}
            </div>
            <div className="border-t border-[var(--border)] p-4">
              <p className="text-sm text-[var(--text-muted)] mb-3">Filter Logic:</p>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-1">
                <button
                  onClick={() => filterActions.setMode('and')}
                  className={`${buttonClass(state.mode === 'and')} min-h-[44px] flex-1`}
                  title="All selected ingredients must be present"
                >
                  ALL
                </button>
                <button
                  onClick={() => filterActions.setMode('or')}
                  className={`${buttonClass(state.mode === 'or')} min-h-[44px] flex-1`}
                  title="Any selected ingredient may be present"
                >
                  ANY
                </button>
                <button
                  onClick={() => filterActions.setMode('not')}
                  className={`${buttonClass(state.mode === 'not')} min-h-[44px] flex-1`}
                  title="None of the selected ingredients may be present"
                >
                  NONE
                </button>
              </div>
            </div>
          </>
        )}
      </section>


      {/* Macros and Filter Options Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Macros Section */}
        {macros.length > 0 && (
          <section className="card p-0">
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-2">Taste Filters</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {macros.map((m) => (
                  <TouchChip
                    key={m}
                    active={state.selectedMacros.includes(m)}
                    onClick={() => filterActions.toggleMacro(m)}
                    title={`${m} - Tap to ${state.selectedMacros.includes(m) ? 'remove' : 'select'} taste filter`}
                  >
                    {m}
                  </TouchChip>
                ))}
              </div>
              
              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-sm text-[var(--text-muted)] mb-3">Taste Logic:</p>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-1">
                  <button
                    onClick={() => filterActions.setMacroMode('and')}
                    className={`${buttonClass(state.macroMode === 'and')} min-h-[44px] flex-1`}
                    title="All selected tastes must be present"
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => filterActions.setMacroMode('or')}
                    className={`${buttonClass(state.macroMode === 'or')} min-h-[44px] flex-1`}
                    title="Any selected taste may be present"
                  >
                    ANY
                  </button>
                  <button
                    onClick={() => filterActions.setMacroMode('not')}
                    className={`${buttonClass(state.macroMode === 'not')} min-h-[44px] flex-1`}
                    title="Selected tastes must not be present"
                  >
                    NONE
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Missing Ingredients Section */}
        <section className="card p-0">
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-2">Missing Ingredients</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Maximum number of missing ingredients allowed
            </p>
            <TouchSlider
              min={0}
              max={3}
              value={state.maxMissing}
              onChange={filterActions.setMaxMissing}
              formatValue={(v) => v === 3 ? 'unlimited' : String(v)}
              className="w-full"
            />
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

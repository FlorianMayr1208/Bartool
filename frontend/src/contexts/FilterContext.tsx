import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePersistentStateWithValidation } from '../hooks/usePersistentState';

interface FilterState {
  selectedIngredients: number[];
  mode: 'and' | 'or' | 'not';
  macroMode: 'and' | 'or' | 'not';
  maxMissing: number;
  selectedMacros: string[];
  showIngredients: boolean;
}

type FilterAction = 
  | { type: 'TOGGLE_INGREDIENT'; id: number }
  | { type: 'SET_MODE'; mode: 'and' | 'or' | 'not' }
  | { type: 'SET_MACRO_MODE'; mode: 'and' | 'or' | 'not' }
  | { type: 'SET_MAX_MISSING'; value: number }
  | { type: 'TOGGLE_MACRO'; name: string }
  | { type: 'TOGGLE_INGREDIENTS_VISIBILITY' }
  | { type: 'REORDER_INGREDIENTS'; ingredients: number[] }
  | { type: 'RESET_FILTERS' }
  | { type: 'LOAD_STATE'; state: Partial<FilterState> };

const initialState: FilterState = {
  selectedIngredients: [],
  mode: 'and',
  macroMode: 'or',
  maxMissing: 3,
  selectedMacros: [],
  showIngredients: false,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'TOGGLE_INGREDIENT':
      return {
        ...state,
        selectedIngredients: state.selectedIngredients.includes(action.id)
          ? state.selectedIngredients.filter(id => id !== action.id)
          : [...state.selectedIngredients, action.id]
      };
    
    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode
      };
    
    case 'SET_MACRO_MODE':
      return {
        ...state,
        macroMode: action.mode
      };
    
    case 'SET_MAX_MISSING':
      return {
        ...state,
        maxMissing: action.value
      };
    
    case 'TOGGLE_MACRO':
      return {
        ...state,
        selectedMacros: state.selectedMacros.includes(action.name)
          ? state.selectedMacros.filter(name => name !== action.name)
          : [...state.selectedMacros, action.name]
      };
    
    case 'TOGGLE_INGREDIENTS_VISIBILITY':
      return {
        ...state,
        showIngredients: !state.showIngredients
      };
    
    case 'REORDER_INGREDIENTS':
      return {
        ...state,
        selectedIngredients: action.ingredients
      };
    
    case 'RESET_FILTERS':
      return initialState;
    
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.state
      };
    
    default:
      return state;
  }
}

const FilterContext = createContext<{
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
} | null>(null);

interface FilterProviderProps {
  children: ReactNode;
  initialFilters?: Partial<FilterState>;
}

// Validator function for FilterState
const isValidFilterState = (value: unknown): value is Partial<FilterState> => {
  if (!value || typeof value !== 'object') return false;
  
  const state = value as Record<string, unknown>;
  
  // Validate selectedIngredients
  if (state.selectedIngredients && (!Array.isArray(state.selectedIngredients) || 
      !state.selectedIngredients.every(id => typeof id === 'number'))) {
    return false;
  }
  
  // Validate mode
  if (state.mode && !['and', 'or', 'not'].includes(state.mode as string)) {
    return false;
  }
  
  // Validate macroMode
  if (state.macroMode && !['and', 'or', 'not'].includes(state.macroMode as string)) {
    return false;
  }
  
  // Validate maxMissing
  if (state.maxMissing && (typeof state.maxMissing !== 'number' || 
      state.maxMissing < 0 || state.maxMissing > 10)) {
    return false;
  }
  
  // Validate selectedMacros
  if (state.selectedMacros && (!Array.isArray(state.selectedMacros) || 
      !state.selectedMacros.every(macro => typeof macro === 'string'))) {
    return false;
  }
  
  // Validate showIngredients
  if (state.showIngredients && typeof state.showIngredients !== 'boolean') {
    return false;
  }
  
  return true;
};

// Migration function for old filter states
const migrateFilterState = (oldValue: unknown): Partial<FilterState> => {
  console.log('🔄 Migrating old filter state:', oldValue);
  
  // Try to preserve what we can from old state
  if (oldValue && typeof oldValue === 'object') {
    const old = oldValue as Record<string, unknown>;
    const migrated: Partial<FilterState> = {};
    
    // Safely migrate each field
    if (Array.isArray(old.selectedIngredients)) {
      migrated.selectedIngredients = old.selectedIngredients.filter(id => typeof id === 'number');
    }
    
    if (['and', 'or', 'not'].includes(old.mode as string)) {
      migrated.mode = old.mode as 'and' | 'or' | 'not';
    }
    
    if (['and', 'or', 'not'].includes(old.macroMode as string)) {
      migrated.macroMode = old.macroMode as 'and' | 'or' | 'not';
    }
    
    if (typeof old.maxMissing === 'number' && old.maxMissing >= 0 && old.maxMissing <= 10) {
      migrated.maxMissing = old.maxMissing;
    }
    
    if (Array.isArray(old.selectedMacros)) {
      migrated.selectedMacros = old.selectedMacros.filter(macro => typeof macro === 'string');
    }
    
    if (typeof old.showIngredients === 'boolean') {
      migrated.showIngredients = old.showIngredients;
    }
    
    return migrated;
  }
  
  return {};
};

export function FilterProvider({ children, initialFilters }: FilterProviderProps) {
  // Use persistent state with validation and migration
  const [persistentState, setPersistentState] = usePersistentStateWithValidation(
    'bartool-filter-state',
    {} as Partial<FilterState>,
    isValidFilterState,
    migrateFilterState
  );

  const [state, dispatch] = useReducer(filterReducer, {
    ...initialState,
    ...initialFilters,
    ...persistentState
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    setPersistentState(state);
  }, [state, setPersistentState]);

  return (
    <FilterContext.Provider value={{ state, dispatch }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider');
  }
  return context;
};

// Convenience hooks for specific actions
export const useFilterActions = () => {
  const { dispatch } = useFilter();
  
  return {
    toggleIngredient: (id: number) => dispatch({ type: 'TOGGLE_INGREDIENT', id }),
    setMode: (mode: 'and' | 'or' | 'not') => dispatch({ type: 'SET_MODE', mode }),
    setMacroMode: (mode: 'and' | 'or' | 'not') => dispatch({ type: 'SET_MACRO_MODE', mode }),
    setMaxMissing: (value: number) => dispatch({ type: 'SET_MAX_MISSING', value }),
    toggleMacro: (name: string) => dispatch({ type: 'TOGGLE_MACRO', name }),
    toggleIngredientsVisibility: () => dispatch({ type: 'TOGGLE_INGREDIENTS_VISIBILITY' }),
    reorderIngredients: (ingredients: number[]) => dispatch({ type: 'REORDER_INGREDIENTS', ingredients }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
    loadState: (state: Partial<FilterState>) => dispatch({ type: 'LOAD_STATE', state }),
  };
};
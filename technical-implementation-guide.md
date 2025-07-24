# Technical Implementation Guide

## 1. Recipe List Component Replacement

### Current State
- **SuggestionsPage** (`frontend/src/pages/Suggestions.tsx:228-240`) uses `RecipeList` component
- **Suggestions component** (`frontend/src/components/Suggestions.tsx`) has better visual design with grid layout

### Implementation Steps

#### Step 1: Create Enhanced Suggestions Component
```typescript
// frontend/src/components/EnhancedSuggestions.tsx
import { Link } from 'react-router-dom';
import type { RecipeItem } from './RecipeList';

interface EnhancedSuggestionsProps {
  recipes: RecipeItem[];
  showCounts?: boolean;
  renderAction?: (recipe: RecipeItem) => ReactNode;
}

export default function EnhancedSuggestions({ 
  recipes, 
  showCounts, 
  renderAction 
}: EnhancedSuggestionsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {recipes.map((recipe, idx) => (
        <div
          key={recipe.id ?? idx}
          className="card flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          {recipe.thumb && (
            <img
              src={recipe.thumb}
              alt={recipe.name}
              className="h-64 w-full object-cover rounded"
            />
          )}
          <div className="p-4 flex-1 flex flex-col">
            <div className="font-semibold mb-2">{recipe.name}</div>
            {showCounts && (
              <div className="text-sm text-[var(--text-muted)] mb-3">
                {recipe.available_count} available / {recipe.missing_count} missing
              </div>
            )}
            {renderAction && (
              <div className="mt-auto">
                {renderAction(recipe)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Step 2: Update Suggestions Page
```typescript
// In frontend/src/pages/Suggestions.tsx:228-240
// Replace:
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

// With:
<EnhancedSuggestions
  recipes={recipes}
  showCounts
  renderAction={(r) =>
    r.id ? (
      <Link to={`/recipes/${r.id}`} className="button-search">
        Open
      </Link>
    ) : null
  }
/>
```

## 2. Performance Optimizations

### API Optimization
```typescript
// frontend/src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### Cached Data Layer
```typescript
// frontend/src/utils/cache.ts
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMinutes = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
}

export const apiCache = new SimpleCache();
```

## 3. State Management Improvements

### Filter Context
```typescript
// frontend/src/contexts/FilterContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';

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
  | { type: 'SET_MAX_MISSING'; value: number }
  | { type: 'TOGGLE_INGREDIENTS_VISIBILITY' };

const FilterContext = createContext<{
  state: FilterState;
  dispatch: React.Dispatch<FilterAction>;
} | null>(null);

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'TOGGLE_INGREDIENT':
      return {
        ...state,
        selectedIngredients: state.selectedIngredients.includes(action.id)
          ? state.selectedIngredients.filter(id => id !== action.id)
          : [...state.selectedIngredients, action.id]
      };
    // ... other cases
    default:
      return state;
  }
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(filterReducer, {
    selectedIngredients: [],
    mode: 'and',
    macroMode: 'or',
    maxMissing: 3,
    selectedMacros: [],
    showIngredients: false,
  });

  return (
    <FilterContext.Provider value={{ state, dispatch }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilter must be used within FilterProvider');
  return context;
};
```

## 4. Mobile Responsiveness Enhancements

### Touch-Friendly Components
```typescript
// frontend/src/components/TouchSlider.tsx
import { useState, useRef } from 'react';

interface TouchSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export default function TouchSlider({ 
  min, 
  max, 
  value, 
  onChange, 
  formatValue = (v) => String(v) 
}: TouchSliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="w-full">
      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        className={`
          accent-[var(--accent)] h-12 w-full max-w-xs sm:max-w-md md:max-w-lg 
          touch-manipulation cursor-pointer
          ${isDragging ? 'scale-105' : ''}
          transition-transform duration-150
        `}
        style={{ 
          maxWidth: '100%',
          // Enhanced thumb size for touch
          WebkitAppearance: 'none',
        }}
      />
      <div className="text-center mt-2 text-lg font-semibold">
        {formatValue(value)}
      </div>
    </div>
  );
}
```

## 5. Feature Additions Implementation

### Persistent Filters
```typescript
// frontend/src/hooks/usePersistentState.ts
import { useState, useEffect } from 'react';

export function usePersistentState<T>(
  key: string, 
  defaultValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [key, state]);

  return [state, setState];
}
```

### Recipe Favoriting System
```typescript
// Add to frontend/src/api.ts
export async function toggleFavorite(recipeId: number): Promise<void> {
  await fetch(`${API_BASE}/recipes/${recipeId}/favorite`, {
    method: 'POST',
  });
}

export async function getFavorites(): Promise<RecipeItem[]> {
  const res = await fetch(`${API_BASE}/recipes/favorites`);
  return res.json();
}
```

## 6. Implementation Order

1. **Phase 1: Core UI Enhancement**
   - Create EnhancedSuggestions component
   - Replace RecipeList in SuggestionsPage
   - Test visual consistency

2. **Phase 2: Performance**
   - Implement useDebounce hook
   - Add API caching layer
   - Optimize re-renders with React.memo

3. **Phase 3: State Management**
   - Create FilterContext
   - Implement persistent state
   - Migrate existing state logic

4. **Phase 4: Mobile & UX**
   - Enhance touch interactions
   - Improve responsive design
   - Add loading states

5. **Phase 5: New Features**
   - Implement favoriting system
   - Add recipe rating
   - Create export functionality

## 7. Testing Strategy

```typescript
// frontend/src/components/__tests__/EnhancedSuggestions.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EnhancedSuggestions from '../EnhancedSuggestions';

const mockRecipes = [
  {
    id: 1,
    name: 'Test Recipe',
    thumb: 'test.jpg',
    available_count: 5,
    missing_count: 2,
  },
];

test('renders recipe grid correctly', () => {
  render(
    <BrowserRouter>
      <EnhancedSuggestions recipes={mockRecipes} showCounts />
    </BrowserRouter>
  );
  
  expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  expect(screen.getByText('5 available / 2 missing')).toBeInTheDocument();
});
```

This implementation guide provides step-by-step instructions for all major improvements while maintaining the existing codebase structure and API compatibility.
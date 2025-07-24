import { memo } from 'react';
import type { RecipeItem } from './RecipeList';
import type { ReactNode } from 'react';

interface EnhancedSuggestionsProps {
  recipes: RecipeItem[];
  showCounts?: boolean;
  renderAction?: (recipe: RecipeItem) => ReactNode;
}

const EnhancedSuggestions = memo(function EnhancedSuggestions({ 
  recipes, 
  showCounts, 
  renderAction 
}: EnhancedSuggestionsProps) {
  if (recipes.length === 0) return null;

  return (
    <div className="card p-0">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
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
              <div className="font-semibold mb-2 flex items-center gap-2">
                {recipe.name}
                {typeof recipe.alcoholic === 'string' && recipe.alcoholic === 'Alcoholic' && (
                  <span title="Alcoholic">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <text
                        x="10"
                        y="14"
                        textAnchor="middle"
                        fontSize="10"
                        fill="currentColor"
                      >
                        %
                      </text>
                    </svg>
                  </span>
                )}
              </div>
              {showCounts && 
                typeof recipe.available_count === 'number' && 
                typeof recipe.missing_count === 'number' && (
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
    </div>
  );
});

export default EnhancedSuggestions;
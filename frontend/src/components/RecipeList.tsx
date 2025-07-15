import { useState } from 'react';
import type { NamedItem } from '../api';
import type { ReactNode } from 'react';

export interface RecipeItem {
  id?: number;
  name: string;
  alcoholic?: string | NamedItem | null;
  instructions?: string | null;
  thumb?: string | null;
  tags?: (string | NamedItem)[];
  categories?: (string | NamedItem)[];
  ibas?: (string | NamedItem)[];
  available_count?: number;
  missing_count?: number;
}

interface RecipeListProps {
  recipes: RecipeItem[];
  renderAction?: (recipe: RecipeItem) => ReactNode;
  showCounts?: boolean;
}

export default function RecipeList({
  recipes,
  renderAction,
  showCounts,
}: RecipeListProps) {
  const [expanded, setExpanded] = useState<number | string | null>(null);

  const getName = (value: string | NamedItem | undefined | null) =>
    typeof value === 'string' || value === null || value === undefined
      ? value
      : value.name;

  const joinNames = (items: (string | NamedItem)[] | undefined) =>
    items?.map((i) => (typeof i === 'string' ? i : i.name)).join(', ');

  return (
    <div className="card p-0">
      <ul className="divide-y divide-[var(--border)]">
        {recipes.map((r, idx) => {
          const key = r.id ?? idx;
          const expandedKey = expanded === key;
          return (
            <li key={key}>
              <div
                className="flex items-center gap-2 p-4 cursor-pointer mb-[5px] mt-[5px]"
                onClick={() => setExpanded(expandedKey ? null : key)}
              >
                <span className="flex-1 truncate font-semibold">{r.name}</span>
                {showCounts &&
                  typeof r.available_count === 'number' &&
                  typeof r.missing_count === 'number' && (
                    <span className="text-sm text-[var(--text-secondary)]">
                      {r.available_count} available / {r.missing_count} missing
                    </span>
                  )}
                {renderAction && (
                  <span onClick={(e) => e.stopPropagation()}>{renderAction(r)}</span>
                )}
              </div>
              {expandedKey && (
                <div className="flex h-52 w-full space-x-4 p-2 text-sm text-[var(--text-muted)] mb-4">
                  {r.thumb && (
                    <img
                      src={r.thumb}
                      alt={r.name}
                      className="h-48 w-48 rounded object-cover"
                    />
                  )}
                  <div className="flex flex-row items-start w-full">
                    <div className="flex flex-col justify-start items-start w-32 min-w-[100px]">
                      {r.alcoholic && (
                        <div className="flex items-center space-x-2 mb-2">
                          <p>{getName(r.alcoholic)}</p>
                          {getName(r.alcoholic) === 'Alcoholic' && (
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
                      )}
                      {r.categories && r.categories.length > 0 && (
                        <div className="mb-2">
                          <h4 className="font-semibold text-[var(--text-primary)]">Category</h4>
                          <p>{joinNames(r.categories)}</p>
                        </div>
                      )}
                      {r.tags && r.tags.length > 0 && (
                        <div className="mb-2">
                          <h4 className="font-semibold text-[var(--text-primary)]">Tags</h4>
                          <p>{joinNames(r.tags)}</p>
                        </div>
                      )}
                      {r.ibas && r.ibas.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-[var(--text-primary)]">IBA</h4>
                          <p>{joinNames(r.ibas)}</p>
                        </div>
                      )}
                    </div>
                    {r.instructions && (
                      <div className="ml-4 flex-1 min-w-[300px] max-w-[700px] space-y-2">
                        <h3 className="font-semibold text-[var(--text-primary)] mb-1">Instructions</h3>
                        <p>{r.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

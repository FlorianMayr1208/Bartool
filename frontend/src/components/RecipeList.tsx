import { useState } from 'react';
import { Link } from 'react-router-dom';
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


  const joinLinks = (
    items: (string | NamedItem)[] | undefined,
    param: 'tag' | 'category' | 'iba',
  ) =>
    items?.map((i, idx) => {
      const name = typeof i === 'string' ? i : i.name;
      return (
        <span key={name}>
          <Link
            to={`/search?${param}=${encodeURIComponent(name)}`}
            className="text-[var(--highlight)] hover:underline"
          >
            {name}
          </Link>
          {idx < items.length - 1 ? ', ' : ''}
        </span>
      );
    });

  // Helper to truncate instructions
  const truncate = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="card p-0">
      <ul className="divide-y divide-[var(--border)]">
        {recipes.map((r, idx) => {
          const key = r.id ?? idx;
          const expandedKey = expanded === key;
          return (
            <li key={key}>
              <div
                className="flex flex-col md:flex-row items-start md:items-center gap-2 p-4 cursor-pointer mb-[5px] mt-[5px] bg-[var(--bg-elevated-dark)]"
                onClick={() => setExpanded(expandedKey ? null : key)}
              >
                <span className="flex-1 truncate font-semibold flex items-center gap-2">
                  {r.name}
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
                </span>
                {showCounts &&
                  typeof r.available_count === 'number' &&
                  typeof r.missing_count === 'number' && (
                    <span className="text-sm text-[var(--text-secondary)] md:mr-8 mt-2 md:mt-0">
                      {r.available_count} available / {r.missing_count} missing
                    </span>
                  )}
                {renderAction && (
                  <span
                    className="mt-2 md:mt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderAction(r)}
                  </span>
                )}
              </div>
              {expandedKey && (
                <div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-52 w-full p-2 text-sm text-[var(--text-muted)] mb-8 mt-6"
                >
                  {/* Image */}
                  <div className="flex justify-center">
                    {r.thumb && (
                      <img
                        src={r.thumb}
                        alt={r.name}
                        className="h-50 w-50 rounded object-cover"
                      />
                    )}
                  </div>
                  {/* Instructions */}
                  <div className="flex flex-col justify-start items-start md:pl-8">
                    {r.instructions && (
                      <>
                        <h3 className="font-semibold text-[var(--text-primary)] mb-1">Instructions</h3>
                        <p>{truncate(r.instructions, 300)}</p>
                      </>
                    )}
                  </div>
                  {/* Categories, Tags, IBA */}
                  <div className="flex flex-col justify-start items-start md:pl-8">
                    {r.categories && r.categories.length > 0 && (
                      <div className="mb-2">
                        <h4 className="font-semibold text-[var(--text-primary)]">Category</h4>
                        <p>{joinLinks(r.categories, 'category')}</p>
                      </div>
                    )}
                    {r.tags && r.tags.length > 0 && (
                      <div className="mb-2">
                        <h4 className="font-semibold text-[var(--text-primary)]">Tags</h4>
                        <p>{joinLinks(r.tags, 'tag')}</p>
                      </div>
                    )}
                    {r.ibas && r.ibas.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">IBA</h4>
                        <p>{joinLinks(r.ibas, 'iba')}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Alcoholic/Non-Alcoholic */}
                  {/* Alcoholic/Non-Alcoholic removed from detail view */}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
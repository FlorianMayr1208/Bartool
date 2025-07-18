import Card from '../components/Card';
import {
  Box,
  BookOpen,
  ClipboardList,
  BarChart2,
  Search,
  Replace,
  Download,
  Upload,
} from 'lucide-react';
import { exportDatabase, importDatabase, healthCheck, getSuggestions } from '../api';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { RecipeItem } from '../components/RecipeList';

export default function Dashboard() {
  const [health, setHealth] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<RecipeItem[]>([]);
  useEffect(() => {
    healthCheck()
      .then((res) => setHealth(res.status))
      .catch(() => setHealth('error'));
    getSuggestions(3).then(setSuggestions).catch(() => setSuggestions([]));
  }, []);
  const features = [
    { to: '/inventory', title: 'Inventory', icon: <Box size={20} /> },
    { to: '/recipes', title: 'Recipes', icon: <BookOpen size={20} /> },
    { to: '/search', title: 'Recipe Finder', icon: <Search size={20} /> },
    { to: '/shopping-list', title: 'Shopping List', icon: <ClipboardList size={20} /> },
    { to: '/stats', title: 'Stats', icon: <BarChart2 size={20} /> },
    { to: '/synonyms', title: 'Synonyms', icon: <Replace size={20} /> },
    { to: '#', title: 'Export DB', icon: <Download size={20} />, action: 'export' },
    { to: '#', title: 'Import DB', icon: <Upload size={20} />, action: 'import' },
  ];

  const fileRef = useRef<HTMLInputElement>(null);

  const triggerExport = async () => {
    const blob = await exportDatabase();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bartool.sqlite';
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerImport = () => {
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importDatabase(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold font-display">Dashboard</h1>
      {health && (
        <div className="text-sm text-gray-500">Health: {health}</div>
      )}
      <p className="text-[var(--text-muted)]">Welcome to BarTool. Select an action below.</p>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {features.map((f) => (
          f.action === 'export' ? (
            <button
              key={f.title}
              onClick={triggerExport}
              className="card flex items-center gap-2 cursor-pointer transition hover:bg-blue-100 hover:shadow text-lg font-semibold"
            >
              {f.icon}
              {f.title}
            </button>
          ) : f.action === 'import' ? (
            <button
              key={f.title}
              onClick={triggerImport}
              className="card flex items-center gap-2 cursor-pointer transition hover:bg-blue-100 hover:shadow text-lg font-semibold"
            >
              {f.icon}
              {f.title}
            </button>
          ) : (
            <Card key={f.to} title={f.title} to={f.to} icon={f.icon} />
          )
        ))}
      </div>
      {suggestions.length > 0 && (
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
      )}
      <input
        type="file"
        ref={fileRef}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

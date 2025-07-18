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
          <div className="flex gap-4 overflow-x-auto pb-2">
            {suggestions.map((s, idx) => (
              <div key={s.id ?? idx} className="min-w-[10rem] card p-2 flex-shrink-0">
                {s.thumb && (
                  <img src={s.thumb} alt={s.name} className="h-24 w-full object-cover rounded" />
                )}
                <div className="font-semibold text-center mt-2">{s.name}</div>
                {typeof s.missing_count === 'number' && (
                  <div className="text-sm text-[var(--text-muted)] text-center">
                    Missing {s.missing_count}
                  </div>
                )}
              </div>
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

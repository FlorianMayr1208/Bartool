import Card from '../components/Card';
import {
  Box,
  BookOpen,
  ClipboardList,
  BarChart2,
  Search,
  Replace,
} from 'lucide-react';

export default function Dashboard() {
  const features = [
    { to: '/inventory', title: 'Inventory', icon: <Box size={20} /> },
    { to: '/recipes', title: 'Recipes', icon: <BookOpen size={20} /> },
    { to: '/recipes/find', title: 'Recipe Finder', icon: <Search size={20} /> },
    { to: '/shopping-list', title: 'Shopping List', icon: <ClipboardList size={20} /> },
    { to: '/stats', title: 'Stats', icon: <BarChart2 size={20} /> },
    { to: '/synonyms', title: 'Synonyms', icon: <Replace size={20} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-[var(--text-muted)]">Welcome to BarTool. Select an action below.</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <Card key={f.to} title={f.title} to={f.to} icon={f.icon} />
        ))}
      </div>
    </div>
  );
}

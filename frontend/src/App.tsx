import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import ShoppingList from './pages/ShoppingList';
import Stats from './pages/Stats';
import { healthCheck } from './api';
import './App.css';

export default function App() {
  const [health, setHealth] = useState<string | null>(null);
  useEffect(() => {
    healthCheck()
      .then((res) => setHealth(res.status))
      .catch(() => setHealth('error'));
  }, []);

  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4 space-x-2">
          <Link to="/">Dashboard</Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/recipes">Recipes</Link>
          <Link to="/shopping-list">Shopping List</Link>
          <Link to="/stats">Stats</Link>
        </nav>
        {health && (
          <div className="mb-4 text-sm text-gray-500">Health: {health}</div>
        )}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
    </Router>
  );
}

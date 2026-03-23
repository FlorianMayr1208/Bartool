import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Synonyms from './pages/Synonyms';
import { healthCheck } from './api';
import Navbar from './components/Navbar';
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
      <Navbar />
      <main className="container mx-auto p-4">
        {health && (
          <div className="mb-4 text-sm text-gray-500">Health: {health}</div>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/synonyms" element={<Synonyms />} />
        </Routes>
      </main>
    </Router>
  );
}

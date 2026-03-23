import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Synonyms from './pages/Synonyms';
import Navbar from './components/Navbar';
import './App.css';

export default function App() {
  return (
    <Router>
      <Navbar />
      <main className="container mx-auto p-4">
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

import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-white font-semibold' : 'text-gray-300 hover:text-white';

  return (
    <header className="bg-gray-800">
      <nav className="container mx-auto flex items-center space-x-4 p-4">
        <NavLink to="/" className={linkClass} end>
          Dashboard
        </NavLink>
        <NavLink to="/inventory" className={linkClass}>
          Inventory
        </NavLink>
        <NavLink to="/recipes" className={linkClass}>
          Recipes
        </NavLink>
        <NavLink to="/shopping-list" className={linkClass}>
          Shopping List
        </NavLink>
        <NavLink to="/stats" className={linkClass}>
          Stats
        </NavLink>
      </nav>
    </header>
  );
}

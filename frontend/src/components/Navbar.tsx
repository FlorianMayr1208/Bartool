import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-[var(--accent)] font-semibold'
      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]';

  return (
    <header className="bg-[var(--bg-elevated)] border-b border-[var(--border)] text-[var(--text-primary)]">
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
        <NavLink to="/synonyms" className={linkClass}>
          Synonyms
        </NavLink>
      </nav>
    </header>
  );
}

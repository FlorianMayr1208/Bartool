import { NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-3 py-2 rounded-brand font-medium transition-colors",
      isActive
        ? "bg-[var(--accent)] text-black"
        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]",
    ].join(" ");

  return (
    <header className="bg-[var(--bg-elevated)] border-b border-[var(--border)] text-[var(--text-primary)]">
      <nav className="container mx-auto flex flex-wrap items-center gap-4 p-4">
        <NavLink to="/" className={linkClass} end>
          Dashboard
        </NavLink>
        <NavLink to="/inventory" className={linkClass}>
          Inventory
        </NavLink>
        <NavLink to="/recipes" className={linkClass}>
          Recipes
        </NavLink>
        <NavLink to="/recipes/find" className={linkClass}>
          Recipe Finder
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

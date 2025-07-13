import { NavLink } from "react-router-dom";




export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "relative px-4 py-2 rounded-full font-semibold transition-all duration-300 no-underline",
      isActive
        ? "bg-[var(--accent)] text-black shadow-md p-3" +
          "" +
          " pl-[10px] pr-[10px] pt-[5px] pb-[5px]"
        : "text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-primary)]",
      "hover:scale-105",
    ].join(" ");

  return (
    <header className="bg-[var(--bg-elevated)] border-b border-[var(--border)] text-[var(--text-primary)] shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between py-3 px-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-[var(--accent)]">Bartool</span>
        </div>
        <div className="flex gap-4 md:gap-8 mr:gap-8" style={{ gap: "32px" }}>
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
        </div>
      </nav>
    </header>
  );
}

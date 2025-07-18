import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Drawer from "./Drawer";
import TabletSwitch from "./TabletSwitch";




export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "relative flex items-center justify-center px-3 py-2 font-semibold transition-all duration-300 no-underline hover:scale-105",
      isActive
        ? "bg-[var(--accent)] text-black shadow-md rounded-[var(--brand-radius)]"
        : "text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-primary)]",
    ].join(" ");

  const Links = () => (
    <>
      <NavLink to="/" className={linkClass} end onClick={() => setOpen(false)}>
        Dashboard
      </NavLink>
      <NavLink to="/inventory" className={linkClass} onClick={() => setOpen(false)}>
        Inventory
      </NavLink>
      <NavLink to="/recipes" className={linkClass} onClick={() => setOpen(false)}>
        Recipes
      </NavLink>
      <NavLink to="/suggest" className={linkClass} onClick={() => setOpen(false)}>
        Suggestions
      </NavLink>
      <NavLink to="/search" className={linkClass} onClick={() => setOpen(false)}>
        Recipe Search
      </NavLink>
      <NavLink to="/shopping-list" className={linkClass} onClick={() => setOpen(false)}>
        Shopping List
      </NavLink>
      {/* <NavLink to="/stats" className={linkClass} onClick={() => setOpen(false)}>
        Stats
      </NavLink> */}
      <NavLink to="/synonyms" className={linkClass} onClick={() => setOpen(false)}>
        Synonyms
      </NavLink>
    </>
  );

  return (
    <header className="bg-[var(--bg-elevated)] border-b border-[var(--border)] text-[var(--text-primary)] shadow-lg sticky top-0 z-50 rounded-[var(--brand-radius)]">
      <nav className="max-w-screen-xl mx-auto flex items-center justify-between py-3 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            className="text-3xl font-bold tracking-tight text-[var(--accent)]"
          >
            Bartool
          </NavLink>
        </div>
        <button
          className="md:hidden p-2 hover:bg-[var(--bg-primary)] rounded-[var(--brand-radius)]"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:flex gap-4 md:gap-6 items-center">
          <Links />
          {/* <ForceTabletButton /> */}
        </div>
      </nav>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <div className="p-4 space-y-4">
          <button className="p-2 rounded" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
          <nav className="flex flex-col gap-2">
            <Links />
          </nav>
          <TabletSwitch />
          {/* <ForceTabletButton /> */}
        </div>
      </Drawer>
    </header>
  );
}

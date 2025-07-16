/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface ViewportContextValue {
  forceTablet: boolean;
  toggleForceTablet: () => void;
}

const ViewportContext = createContext<ViewportContextValue | undefined>(undefined);

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [forceTablet, setForceTablet] = useState(() => {
    const stored = localStorage.getItem("forceTablet");
    return stored === "true";
  });

  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>("meta[name=viewport]");
    if (!meta) return;
    if (forceTablet) {
      meta.setAttribute("content", "width=768");
    } else {
      meta.setAttribute("content", "width=device-width, initial-scale=1.0");
    }
  }, [forceTablet]);

  const toggleForceTablet = () => {
    setForceTablet((prev) => {
      const next = !prev;
      localStorage.setItem("forceTablet", String(next));
      return next;
    });
  };

  return (
    <ViewportContext.Provider value={{ forceTablet, toggleForceTablet }}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport() {
  const ctx = useContext(ViewportContext);
  if (!ctx) throw new Error("useViewport must be used within ViewportProvider");
  return ctx;
}

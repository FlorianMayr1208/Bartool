import type { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Drawer({ open, onClose, children }: DrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? '' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`absolute left-0 top-0 h-full w-[min(96vw,540px)] bg-[var(--bg-elevated)] shadow-brand transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {children}
      </div>
    </div>
  );
}

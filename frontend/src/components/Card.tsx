import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  title: string;
  to: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function Card({ title, to, icon, children }: CardProps) {
  return (
    <Link
      to={to}
      className="card block rounded-brand shadow-brand transition hover:bg-[var(--bg-elevated-dark)]/80"
    >
      <div className="flex items-center gap-2 text-lg font-semibold">
        {icon}
        {title}
      </div>
      {children && (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{children}</p>
      )}
    </Link>
  );
}

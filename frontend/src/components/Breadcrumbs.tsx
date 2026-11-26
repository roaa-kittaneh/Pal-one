import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items, tone = 'default' }: { items: Crumb[]; tone?: 'default' | 'inverse' }) {
  const { t } = useLanguage();
  const all: Crumb[] = [{ label: t.nav.home, to: '/' }, ...items];
  const base = tone === 'inverse' ? 'text-white/70' : 'text-muted';
  const link = tone === 'inverse' ? 'hover:text-white' : 'hover:text-heading';
  const current = tone === 'inverse' ? 'text-white/90' : 'text-ink';
  return (
    <nav aria-label="Breadcrumb" className={`text-[11px] ${base}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {c.to && i < all.length - 1 ? (
              <Link to={c.to} className={link}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className={current}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

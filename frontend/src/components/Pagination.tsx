import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  const { t } = useLanguage();
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5">
      {page > 1 && (
        <button type="button" onClick={() => onChange(page - 1)} className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-heading hover:bg-chip">
          <ArrowRight className="flip-rtl size-3.5 rotate-180" aria-hidden="true" />
          {t.explorePage.previous}
        </button>
      )}
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-label={t.explorePage.page(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`size-9 rounded-lg text-xs font-semibold transition-colors ${
            p === page ? 'bg-pine text-white' : 'text-heading hover:bg-chip'
          }`}
        >
          {p}
        </button>
      ))}
      {page < pageCount && (
        <button type="button" onClick={() => onChange(page + 1)} className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-heading hover:bg-chip">
          {t.explorePage.next}
          <ArrowRight className="flip-rtl size-3.5" aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}

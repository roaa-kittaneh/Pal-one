import { SearchX } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export function EmptyState({ onClear, clearLabel }: { onClear?: () => void; clearLabel?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-chip text-heading">
        <SearchX className="size-6" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h3 className="font-display mt-4 text-lg font-semibold text-heading">{t.empty.title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{t.empty.text}</p>
      {onClear && (
        <button type="button" onClick={onClear} className="btn-primary mt-6">
          {clearLabel ?? t.empty.clearSearch}
        </button>
      )}
    </div>
  );
}

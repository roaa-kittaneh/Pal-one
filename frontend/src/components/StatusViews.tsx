import { RefreshCw, TriangleAlert } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

/** Placeholder cards with the same footprint as ServiceCard / CategoryCard. */
export function CardGridSkeleton({
  count = 3,
  variant = 'service',
  className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6',
}: {
  count?: number;
  variant?: 'service' | 'category';
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <div className={className} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t.status.loading}</span>
      {Array.from({ length: count }, (_, i) =>
        variant === 'category' ? (
          <div key={i} className="flex animate-pulse items-center gap-4 rounded-2xl border border-line bg-white p-4 sm:min-h-[96px] lg:min-h-[108px] lg:px-5">
            <span className="size-10 rounded-lg bg-chip lg:size-11" />
            <span className="flex-1 space-y-2">
              <span className="block h-3 w-2/3 rounded bg-chip" />
              <span className="block h-2.5 w-1/2 rounded bg-chip/70" />
            </span>
          </div>
        ) : (
          <div key={i} className="flex min-h-[236px] animate-pulse flex-col rounded-2xl border border-line bg-white p-5 lg:p-6">
            <div className="flex gap-3">
              <span className="size-10 rounded-lg bg-chip lg:size-11" />
              <span className="flex-1 space-y-2 pt-1">
                <span className="block h-2 w-1/4 rounded bg-chip" />
                <span className="block h-3.5 w-1/2 rounded bg-chip" />
              </span>
            </div>
            <span className="mt-6 block h-2.5 w-full rounded bg-chip/70" />
            <span className="mt-2 block h-2.5 w-4/5 rounded bg-chip/70" />
            <span className="mt-auto block border-t border-line pt-4">
              <span className="block h-3 w-1/4 rounded bg-chip" />
            </span>
          </div>
        ),
      )}
    </div>
  );
}

export function ErrorState({ onRetry, compact = false }: { onRetry?: () => void; compact?: boolean }) {
  const { t } = useLanguage();
  return (
    <div
      role="alert"
      className={`flex flex-col items-center rounded-2xl border border-line bg-white px-6 text-center ${compact ? 'py-8' : 'py-14'}`}
    >
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-blush text-heading">
        <TriangleAlert className="size-6" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h3 className="font-display mt-4 text-lg font-semibold text-heading">{t.status.errorTitle}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted">{t.status.errorText}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary mt-6">
          <RefreshCw className="size-4" aria-hidden="true" />
          {t.status.retry}
        </button>
      )}
    </div>
  );
}

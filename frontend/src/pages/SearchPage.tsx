import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CategoryCard } from '../components/CategoryCard';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { Select } from '../components/Select';
import { ServiceCard } from '../components/ServiceCard';
import { CardGridSkeleton, ErrorState } from '../components/StatusViews';
import { useCategories, useSearch } from '../hooks/useCatalog';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLanguage } from '../hooks/useLanguage';
import type { SortOption } from '../types';

const PAGE_SIZE = 12;

export default function SearchPage() {
  const { t, lang } = useLanguage();
  const sp = t.searchPage;
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = (params.get('q') ?? '').trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
  const sortParam = params.get('sort') as SortOption | null;
  const sort: SortOption = sortParam === 'recent' || sortParam === 'alphabetical' ? sortParam : 'recommended';
  useDocumentTitle(q ? sp.resultsFor(q) : t.search.button);

  const results = useSearch({ q, sort, lang, page, pageSize: PAGE_SIZE });
  const categories = useCategories();
  const pagination = results.data?.pagination;

  const clear = () => navigate('/search');
  const setParam = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        if (value === null) n.delete(key);
        else n.set(key, value);
        if (key !== 'page') n.delete('page');
        return n;
      },
      { replace: key !== 'page' },
    );

  return (
    <>
      <section className="bg-mist">
        <div className="container-page py-8 sm:py-10 lg:py-12">
          <Breadcrumbs items={[{ label: t.search.button }]} />
          <h1 className="font-display mt-6 text-[32px] leading-tight font-semibold tracking-[-0.02em] break-words text-heading sm:text-[44px] lg:mt-8 lg:text-[48px]">
            {q ? sp.resultsFor(q) : sp.title}
          </h1>
          <SearchBar key={q} className="mt-6 max-w-[780px]" defaultValue={q} autoFocus={!q} />
          {q && (
            <p className="mt-4 text-[13px] text-muted" aria-live="polite">
              {pagination ? sp.count(pagination.total) : t.status.loading}
            </p>
          )}
        </div>
      </section>

      <section className="container-page py-10 lg:py-14">
        {!q ? (
          <>
            <h2 className="font-display text-xl font-semibold text-heading sm:text-2xl">{sp.promptTitle}</h2>
            <p className="mt-2 text-sm text-muted">{sp.promptText}</p>
            <p className="eyebrow mt-8 text-heading">{sp.popular}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.search.suggestions.map((s) => (
                <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="rounded-full border border-line bg-white px-4 py-2 text-[13px] text-heading hover:border-sage">
                  {s}
                </Link>
              ))}
            </div>
            <p className="eyebrow mt-10 text-heading">{sp.browseCategories}</p>
            {categories.data ? (
              <div className="mt-3 grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {categories.data.data.map((c) => (
                  <CategoryCard key={c.slug} category={c} />
                ))}
              </div>
            ) : categories.error ? (
              <div className="mt-3">
                <ErrorState compact onRetry={categories.retry} />
              </div>
            ) : (
              <CardGridSkeleton count={8} variant="category" className="mt-3 grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-6" />
            )}
          </>
        ) : results.error && !results.data ? (
          <ErrorState onRetry={results.retry} />
        ) : !results.data ? (
          <CardGridSkeleton count={6} />
        ) : results.data.data.length === 0 ? (
          <EmptyState onClear={clear} clearLabel={t.empty.clearSearch} />
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <Select<SortOption>
                label={t.sort.label}
                value={sort}
                onChange={(v) => setParam('sort', v === 'recommended' ? null : v)}
                options={(['recommended', 'recent', 'alphabetical'] as const).map((s) => ({ value: s, label: t.sort[s] }))}
                className="w-52"
              />
            </div>
            <div className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 ${results.loading ? 'opacity-60' : ''}`}>
              {results.data.data.map((s) => (
                <ServiceCard key={s.slug} service={s} showLocation />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-7 flex justify-end">
                <Pagination
                  page={Math.min(page, pagination.totalPages)}
                  pageCount={pagination.totalPages}
                  onChange={(p) => {
                    setParam('page', p === 1 ? null : String(p));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

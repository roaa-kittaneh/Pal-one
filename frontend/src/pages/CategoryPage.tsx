import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LOCATIONS, SERVICE_TYPES } from '../../../shared/constants';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { Select } from '../components/Select';
import { ServiceCard } from '../components/ServiceCard';
import { CardGridSkeleton, ErrorState } from '../components/StatusViews';
import { useCategories, useCategory, useServices } from '../hooks/useCatalog';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLanguage } from '../hooks/useLanguage';
import { useUrlFilters } from '../hooks/useUrlFilters';
import type { CategoryTint, LocationId, ServiceType, SortOption } from '../types';

const PAGE_SIZE = 9;

const tintBg: Record<CategoryTint, string> = {
  mist: 'bg-mist',
  lavender: 'bg-lavender',
  sky: 'bg-sky',
  sand: 'bg-sand',
  blush: 'bg-blush',
  mint: 'bg-mint',
};

export default function CategoryPage() {
  const { slug = '' } = useParams();
  const { t, lang, loc } = useLanguage();
  const cp = t.categoryPage;
  const f = useUrlFilters();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Live search box: local state, debounced into the URL / API request.
  const [searchInput, setSearchInput] = useState(f.q);
  const debouncedQ = useDebouncedValue(searchInput, 250);
  useEffect(() => {
    if (debouncedQ !== f.q) f.update({ q: debouncedQ.trim() || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);
  useEffect(() => setSearchInput(f.q), [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Only the category itself is needed here (servicesLimit=0); results come from the paged services query.
  const categoryReq = useCategory(slug, 0);
  const allCategories = useCategories();
  const results = useServices({
    category: slug,
    q: f.q,
    subcategory: f.sub,
    type: f.types.slice(0, 1),
    location: f.location,
    sort: f.sort,
    lang,
    page: f.page,
    pageSize: PAGE_SIZE,
  });

  const category = categoryReq.data?.data;
  useDocumentTitle(category ? loc(category, 'name') : categoryReq.error?.isNotFound ? cp.notFoundTitle : undefined);

  // If the requested page no longer exists (filters narrowed the results), jump to the last page.
  const pagination = results.data?.pagination;
  useEffect(() => {
    if (pagination && f.page > pagination.totalPages) f.update({ page: String(pagination.totalPages) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.totalPages, f.page]);

  if (categoryReq.error?.isNotFound) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-heading">{cp.notFoundTitle}</h1>
        <p className="mt-3 text-muted">{cp.notFoundText}</p>
        <Link to="/categories" className="btn-primary mt-7">
          {cp.notFoundCta}
        </Link>
      </div>
    );
  }
  if (categoryReq.error && !category) {
    return (
      <div className="container-page py-16">
        <ErrorState onRetry={categoryReq.retry} />
      </div>
    );
  }
  if (!category) {
    return (
      <>
        <section className="bg-mist">
          <div className="container-page h-[340px] animate-pulse py-10" aria-busy="true" />
        </section>
        <section className="container-page py-10 lg:py-12">
          <CardGridSkeleton count={6} />
        </section>
      </>
    );
  }

  const subNames = category.subcategories.map((s) => loc(s, 'name')).join(lang === 'ar' ? '، ' : ', ');
  const hasFilters = Boolean(f.q || f.sub || f.types.length || f.location);
  const others = (allCategories.data?.data ?? []).filter((c) => c.slug !== category.slug).slice(0, 4);
  // Offer only locations that have services in this category
  const facetLocations = new Set(results.data?.facets.locations.map((l) => l.location));
  const availableLocations = LOCATIONS.filter((l) => facetLocations.has(l) || l === f.location);
  const total = pagination?.total ?? category.serviceCount;

  const goToPage = (p: number) => {
    f.update({ page: String(p) });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={tintBg[category.tint] ?? 'bg-mist'}>
        <div className="container-page py-8 sm:py-10 lg:pt-8 lg:pb-14">
          <Breadcrumbs items={[{ label: t.nav.categories, to: '/categories' }, { label: loc(category, 'name') }]} />
          <CategoryIcon icon={category.icon} className="mt-8 size-6 text-heading lg:mt-10" />
          <h1 className="font-display mt-4 text-[34px] leading-tight font-semibold tracking-[-0.02em] text-heading sm:text-[44px] lg:text-[48px]">
            {loc(category, 'headline')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">{loc(category, 'description')}</p>

          {/* Subcategory quick filters */}
          <div className="mt-7 flex flex-wrap items-center gap-x-1 gap-y-2 text-[13px] lg:mt-9">
            {category.subcategories.map((s, i) => (
              <span key={s.slug} className="flex items-center gap-1">
                {i > 0 && (
                  <span aria-hidden="true" className="px-2 text-muted">
                    ·
                  </span>
                )}
                <button
                  type="button"
                  aria-pressed={f.sub === s.slug}
                  onClick={() => f.update({ sub: f.sub === s.slug ? null : s.slug })}
                  className={`rounded-md px-1.5 py-1 transition-colors hover:text-pine ${
                    f.sub === s.slug ? 'bg-white/70 font-semibold text-pine' : 'text-ink'
                  }`}
                >
                  {loc(s, 'name')}
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────── */}
      <section className="container-page py-10 lg:py-12">
        <div ref={resultsRef} className="flex scroll-mt-24 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-heading sm:text-[28px]">{cp.heading(loc(category, 'name'))}</h2>
            <p className="mt-2 text-[13px] text-muted" aria-live="polite">
              {cp.countLine(total, subNames)}
            </p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-end">
            <label className="relative sm:col-span-2 lg:w-60">
              <span className="sr-only">{cp.searchPlaceholder}</span>
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={searchInput}
                maxLength={100}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={cp.searchPlaceholder}
                className="h-10 w-full rounded-lg border border-line bg-white ps-9 pe-3 text-xs outline-none focus:border-sage"
              />
            </label>
            <Select<ServiceType | ''>
              label={cp.serviceType}
              value={f.types[0] ?? ''}
              onChange={(v) => f.update({ type: v || null })}
              options={[{ value: '', label: cp.allTypes }, ...SERVICE_TYPES.map((s) => ({ value: s, label: t.serviceTypeFilter[s] }))]}
              className="lg:w-52"
            />
            {availableLocations.length > 1 && (
              <Select<LocationId | ''>
                label={cp.location}
                value={f.location}
                onChange={(v) => f.update({ location: v || null })}
                options={[{ value: '', label: cp.allLocations }, ...availableLocations.map((l) => ({ value: l, label: t.location[l] }))]}
                className="lg:w-44"
              />
            )}
            <Select<SortOption>
              label={t.sort.label}
              value={f.sort}
              onChange={(v) => f.update({ sort: v })}
              options={(['recommended', 'recent', 'alphabetical'] as const).map((s) => ({ value: s, label: t.sort[s] }))}
              className="lg:w-48"
            />
          </div>
        </div>

        <div className={`mt-6 transition-opacity lg:mt-7 ${results.loading && results.data ? 'opacity-60' : ''}`}>
          {results.error && !results.data ? (
            <ErrorState onRetry={results.retry} />
          ) : !results.data ? (
            <CardGridSkeleton count={Math.min(PAGE_SIZE, category.serviceCount || 3)} />
          ) : results.data.data.length === 0 ? (
            <EmptyState
              onClear={
                hasFilters
                  ? () => {
                      setSearchInput('');
                      f.clear();
                    }
                  : undefined
              }
              clearLabel={t.empty.clearFilters}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {results.data.data.map((s) => (
                <ServiceCard key={s.slug} service={s} eyebrow="subcategory" showLocation />
              ))}
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-7 flex justify-end">
            <Pagination page={Math.min(f.page, pagination.totalPages)} pageCount={pagination.totalPages} onChange={goToPage} />
          </div>
        )}

        {/* Other categories (replaces the "suggest a service" panel, which is out of scope) */}
        {others.length > 0 && (
          <div className="mt-8 rounded-[20px] bg-mist p-6 lg:mt-10 lg:p-8">
            <p className="eyebrow text-heading">{cp.otherCategories}</p>
            <div className="mt-4 grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {others.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          </div>
        )}

        <p className="mt-10 text-xs text-muted">{cp.disclaimer}</p>
      </section>
    </>
  );
}

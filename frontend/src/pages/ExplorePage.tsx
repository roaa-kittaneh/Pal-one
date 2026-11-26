import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LOCATIONS, SERVICE_TYPES } from '../../../shared/constants';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { Select } from '../components/Select';
import { ServiceCard } from '../components/ServiceCard';
import { CardGridSkeleton, ErrorState } from '../components/StatusViews';
import { useCategories, useServices } from '../hooks/useCatalog';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLanguage } from '../hooks/useLanguage';
import { useUrlFilters } from '../hooks/useUrlFilters';
import type { LocationId, ServiceType, SortOption } from '../types';

const PAGE_SIZE = 6;

export default function ExplorePage() {
  const { t, lang, loc } = useLanguage();
  const e = t.explorePage;
  const f = useUrlFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  useDocumentTitle(t.nav.explore);

  const categoriesReq = useCategories();
  const categories = categoriesReq.data?.data ?? [];
  const selectedCategory = categories.find((c) => c.slug === f.category);

  const results = useServices({
    q: f.q,
    category: f.category,
    subcategory: f.sub,
    type: f.types,
    location: f.location,
    sort: f.sort,
    lang,
    page: f.page,
    pageSize: PAGE_SIZE,
  });
  const items = results.data?.data ?? [];
  const pagination = results.data?.pagination;
  const total = pagination?.total ?? 0;
  const pageCount = pagination?.totalPages ?? 1;
  const page = Math.min(f.page, pageCount);
  const from = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, total);

  // Per-category counts (respecting the other filters) come from the API facets.
  const facetCounts = new Map(results.data?.facets.categories.map((c) => [c.slug, c.count]));
  const facetTotal = [...facetCounts.values()].reduce((a, b) => a + b, 0);

  // If the requested page no longer exists (filters narrowed the results), jump to the last page.
  useEffect(() => {
    if (pagination && f.page > pagination.totalPages) f.update({ page: String(pagination.totalPages) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.totalPages, f.page]);

  // Close the mobile filter drawer when moving up to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setFiltersOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const goToPage = (p: number) => {
    f.update({ page: String(p) });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleType = (type: ServiceType) => {
    const next = f.types.includes(type) ? f.types.filter((x) => x !== type) : [...f.types, type];
    f.update({ type: next.join(',') || null });
  };

  const sidebar = (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h2 className="font-display text-base font-semibold text-heading lg:text-lg">{e.filterTitle}</h2>
        <button type="button" onClick={f.clear} className="text-xs font-medium text-pine hover:text-pine-hover disabled:opacity-40" disabled={!f.hasFilters}>
          {e.reset}
        </button>
      </div>

      {/* Category */}
      <div role="group" className="border-b border-line py-5">
        <p className="eyebrow mb-3 text-heading">{e.category}</p>
        <ul className="space-y-0.5">
          {[{ id: '', label: e.allCategories, count: facetTotal }, ...categories.map((c) => ({ id: c.slug, label: loc(c, 'name'), count: facetCounts.get(c.slug) ?? 0 }))].map((c) => {
            const active = f.category === c.id;
            return (
              <li key={c.id || 'all'}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => f.update({ category: c.id || null, sub: null })}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-start text-[13px] transition-colors ${
                    active ? 'bg-chip font-semibold text-heading' : 'text-ink/85 hover:bg-offwhite'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="text-[11px] text-muted">{results.data ? c.count : ''}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Subcategory — only when a category is selected */}
      {selectedCategory && (
        <div className="border-b border-line py-5">
          <Select<string>
            label={e.subcategory}
            inlineLabel={false}
            value={f.sub}
            onChange={(v) => f.update({ sub: v || null })}
            options={[{ value: '', label: e.allSubcategories }, ...selectedCategory.subcategories.map((s) => ({ value: s.slug, label: loc(s, 'name') }))]}
          />
        </div>
      )}

      {/* Service type */}
      <div role="group" className="border-b border-line py-5">
        <p className="eyebrow mb-3 text-heading">{e.serviceType}</p>
        <div className="space-y-2.5">
          {SERVICE_TYPES.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink/85">
              <input
                type="checkbox"
                checked={f.types.includes(type)}
                onChange={() => toggleType(type)}
                className="size-4 rounded border-line accent-pine"
              />
              {t.serviceTypeFilter[type]}
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="py-5">
        <Select<LocationId | ''>
          label={e.location}
          inlineLabel={false}
          value={f.location}
          onChange={(v) => f.update({ location: v || null })}
          options={[{ value: '', label: e.allLocations }, ...LOCATIONS.map((l) => ({ value: l, label: t.location[l] }))]}
        />
      </div>

      <p className="text-[11px] leading-relaxed text-muted">{e.note}</p>
    </div>
  );

  return (
    <div className="container-page pt-6 pb-14 lg:pt-8 lg:pb-16">
      <Breadcrumbs items={[{ label: t.nav.explore }]} />
      <h1 className="font-display mt-6 text-[34px] leading-tight font-semibold tracking-[-0.02em] text-heading sm:text-[44px] lg:text-[48px]">
        {e.title}
      </h1>
      <p className="mt-2 text-sm text-muted sm:text-base">{e.subtitle}</p>

      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
        <SearchBar
          className="w-full lg:max-w-[1000px] lg:flex-1"
          defaultValue={f.q}
          onSearch={(q) => f.update({ q: q || null })}
        />
        <p className="text-[13px] text-muted lg:w-52">{e.sideNote}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">{sidebar}</aside>

        <div ref={resultsRef} className="min-w-0 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-heading lg:text-xl" aria-live="polite">
              {results.data ? e.resultsCount(total) : t.status.loading}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="btn-outline h-10 px-3 text-xs lg:hidden"
              >
                {filtersOpen ? <X className="size-4" /> : <SlidersHorizontal className="size-4" />}
                {filtersOpen ? e.hideFilters : e.filters}
                {f.hasFilters && !filtersOpen && <span className="size-1.5 rounded-full bg-pine-hover" />}
              </button>
              <Select<SortOption>
                label={t.sort.label}
                value={f.sort}
                onChange={(v) => f.update({ sort: v })}
                options={(['recommended', 'recent', 'alphabetical'] as const).map((s) => ({ value: s, label: t.sort[s] }))}
                className="w-44 sm:w-52"
              />
            </div>
          </div>

          {filtersOpen && <div className="mt-4 lg:hidden">{sidebar}</div>}

          <div className={`mt-5 transition-opacity ${results.loading && results.data ? 'opacity-60' : ''}`}>
            {results.error && !results.data ? (
              <ErrorState onRetry={results.retry} />
            ) : !results.data ? (
              <CardGridSkeleton count={PAGE_SIZE} className="grid gap-4 md:grid-cols-2 lg:gap-6" />
            ) : items.length === 0 ? (
              <EmptyState onClear={f.clear} clearLabel={t.empty.clearFilters} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
                {items.map((s) => (
                  <ServiceCard key={s.slug} service={s} showLocation />
                ))}
              </div>
            )}
          </div>

          {total > 0 && (
            <div className="mt-7 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">{e.showing(from, to, total)}</p>
              <Pagination page={page} pageCount={pageCount} onChange={goToPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Breadcrumbs } from '../components/Breadcrumbs';
import { CategoryTile } from '../components/CategoryCard';
import { SearchBar } from '../components/SearchBar';
import { CardGridSkeleton, ErrorState } from '../components/StatusViews';
import { useCategories, useStatistics } from '../hooks/useCatalog';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLanguage } from '../hooks/useLanguage';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const c = t.categoriesPage;
  useDocumentTitle(t.nav.categories);
  const categories = useCategories();
  const stats = useStatistics();
  const grid = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4';

  return (
    <>
      <section className="bg-mist">
        <div className="container-page py-8 sm:py-10 lg:py-12">
          <Breadcrumbs items={[{ label: t.nav.categories }]} />
          <h1 className="font-display mt-6 text-[34px] leading-tight font-semibold tracking-[-0.02em] text-heading sm:text-[44px] lg:mt-8 lg:text-[48px]">
            {c.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">{c.subtitle}</p>
          <SearchBar className="mt-7 max-w-[780px]" />
        </div>
      </section>

      <section className="container-page py-12 lg:py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2 lg:mb-7">
          <h2 className="font-display text-2xl font-semibold text-heading sm:text-[28px]">{c.heading}</h2>
          {stats.data && (
            <p className="text-[13px] text-muted">{c.summary(stats.data.data.totalCategories, stats.data.data.totalServices)}</p>
          )}
        </div>
        {categories.error && !categories.data ? (
          <ErrorState onRetry={categories.retry} />
        ) : !categories.data ? (
          <CardGridSkeleton count={8} className={grid} />
        ) : (
          <div className={grid}>
            {categories.data.data.map((cat) => (
              <CategoryTile key={cat.slug} category={cat} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

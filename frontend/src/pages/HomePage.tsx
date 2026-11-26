import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryCard } from '../components/CategoryCard';
import { SearchBar } from '../components/SearchBar';
import { SectionHeader } from '../components/SectionHeader';
import { ServiceCard } from '../components/ServiceCard';
import { CardGridSkeleton, ErrorState } from '../components/StatusViews';
import { useCategories, useFeaturedServices, useRecentServices, useStatistics } from '../hooks/useCatalog';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLanguage } from '../hooks/useLanguage';

export default function HomePage() {
  const { t } = useLanguage();
  const h = t.home;
  useDocumentTitle(t.tagline);
  const categories = useCategories();
  const featured = useFeaturedServices(3);
  const recent = useRecentServices(3);
  const stats = useStatistics();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-mist">
        <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 lg:py-[52px] xl:grid-cols-[minmax(0,1fr)_410px] xl:gap-16">
          <div className="min-w-0 lg:pt-1">
            <p className="eyebrow text-heading">{h.eyebrow}</p>
            <h1 className="font-display mt-6 text-[38px] leading-[1.15] font-semibold tracking-[-0.02em] text-heading sm:text-5xl lg:text-[56px] xl:text-[62px]">
              {h.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-7 text-sm text-muted sm:text-base">{h.subtitle}</p>
            <SearchBar className="mt-6 max-w-[780px]" />
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[13px] text-muted">
              <span>{t.search.try}</span>
              {t.search.suggestions.map((s) => (
                <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="text-ink/80 hover:text-pine hover:underline">
                  {s}
                </Link>
              ))}
            </div>
          </div>

          <aside className="self-start rounded-[20px] bg-forest p-6 text-white lg:p-7">
            <p className="eyebrow text-lime-ink">{h.heroCard.eyebrow}</p>
            <h2 className="font-display mt-4 text-2xl leading-tight font-semibold lg:text-[30px]">{h.heroCard.title}</h2>
            <ul className="mt-4">
              {h.heroCard.items.map((item, i) => (
                <li key={item.to} className={i > 0 ? 'border-t border-white/12' : ''}>
                  <Link to={item.to} className="group flex items-start justify-between gap-3 py-4 lg:py-[18px]">
                    <span>
                      <span className="block text-sm font-medium lg:text-base">{item.title}</span>
                      <span className="mt-1 block text-[11px] text-white/60 lg:text-xs">{item.sub}</span>
                    </span>
                    <ArrowUpRight
                      className="mt-0.5 size-4 shrink-0 text-lime-ink transition-transform group-hover:-translate-y-0.5 rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="container-page pt-12 pb-4 sm:pt-16">
        <SectionHeader
          eyebrow={h.categoriesEyebrow}
          title={h.categoriesTitle}
          link={{ to: '/categories', label: h.viewAllCategories }}
        />
        {categories.error && !categories.data ? (
          <ErrorState compact onRetry={categories.retry} />
        ) : !categories.data ? (
          <CardGridSkeleton count={8} variant="category" className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-6" />
        ) : (
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {categories.data.data.map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        )}
      </section>

      {/* ── Featured ─────────────────────────────────────── */}
      <section className="container-page py-12 lg:py-16">
        <SectionHeader title={h.featuredTitle} subtitle={h.featuredSub} link={{ to: '/services', label: h.exploreAll }} />
        {featured.error && !featured.data ? (
          <ErrorState compact onRetry={featured.retry} />
        ) : !featured.data ? (
          <CardGridSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {featured.data.data.map((s) => (
              <ServiceCard key={s.slug} service={s} badge="none" />
            ))}
          </div>
        )}
      </section>

      {/* ── Recently added ───────────────────────────────── */}
      <section className="container-page pb-14 lg:pb-16">
        <SectionHeader
          title={h.recentTitle}
          subtitle={h.recentSub}
          link={{ to: '/services?sort=recent', label: h.exploreAll }}
        />
        {recent.error && !recent.data ? (
          <ErrorState compact onRetry={recent.retry} />
        ) : !recent.data ? (
          <CardGridSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {recent.data.data.map((s) => (
              <ServiceCard key={s.slug} service={s} badge="recent" />
            ))}
          </div>
        )}
      </section>

      {/* ── How it works / About ─────────────────────────── */}
      <section id="about" className="scroll-mt-16 bg-[#eff1ea]">
        <div className="container-page py-12 sm:py-16">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-heading sm:text-[28px] lg:text-[32px]">{h.howTitle}</h2>
          <ol className="mt-9 grid gap-8 md:grid-cols-3 md:gap-8">
            {h.steps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <span className="font-display text-[28px] leading-none font-medium text-heading lg:text-[34px]" dir="ltr">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block text-base font-semibold text-heading lg:text-lg">{step.title}</span>
                  <span className="mt-2 block text-[13px] text-muted">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-14 text-xs text-muted">
            {h.howNote}
            {stats.data && (
              <>
                <span aria-hidden="true"> · </span>
                {t.stats(stats.data.data.totalServices, stats.data.data.totalCategories)}
              </>
            )}
          </p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="container-page py-8">
        <div className="flex flex-col gap-5 rounded-[20px] bg-lime px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8 lg:py-11">
          <div>
            <h2 className="font-display text-xl font-semibold text-heading sm:text-2xl lg:text-[28px]">{h.ctaTitle}</h2>
            <p className="mt-3 text-sm text-heading/80">{h.ctaText}</p>
          </div>
          <Link to="/services" className="btn-primary h-12 self-start bg-forest-soft px-7 hover:bg-forest sm:self-auto lg:px-10">
            {h.ctaButton}
          </Link>
        </div>
      </section>
      <div className="h-6" />
    </>
  );
}

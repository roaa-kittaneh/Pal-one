import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import type { CategoryDTO, CategorySummary } from '../types';
import { IconChip } from './CategoryIcon';

/** Compact category card — homepage grid (Figma 01). */
export function CategoryCard({ category }: { category: CategorySummary }) {
  const { loc } = useLanguage();
  return (
    <Link
      to={`/categories/${category.slug}`}
      className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card transition-all hover:border-sage/60 hover:shadow-card-hover sm:min-h-[96px] lg:min-h-[108px] lg:px-5"
    >
      <IconChip icon={category.icon} />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-heading lg:text-base">{loc(category, 'name')}</span>
        <span className="mt-1 block truncate text-xs text-muted">{loc(category, 'tagline')}</span>
      </span>
    </Link>
  );
}

/** Larger tile — Categories page. Shows both languages, description and service count. */
export function CategoryTile({ category }: { category: CategoryDTO }) {
  const { t, lang, loc } = useLanguage();
  const count = category.serviceCount;
  const otherName = lang === 'ar' ? category.nameEn : category.nameAr;
  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:border-sage/60 hover:shadow-card-hover sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <IconChip icon={category.icon} size="lg" />
        <span className="rounded-full bg-chip px-2.5 py-1 text-[11px] font-medium text-heading">
          {t.categoriesPage.count(count)}
        </span>
      </div>
      <h3 className="font-display mt-5 text-lg font-semibold text-heading">{loc(category, 'name')}</h3>
      <p className="mt-0.5 text-[13px] text-sage">
        <bdi lang={lang === 'ar' ? 'en' : 'ar'}>{otherName}</bdi>
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">{loc(category, 'description')}</p>
      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t border-line pt-3.5 text-[13px] font-semibold text-pine">
          <span>{t.categoriesPage.browse}</span>
          <ArrowRight className="flip-rtl size-4 text-heading" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import type { ServiceDTO } from '../types';
import { isRecentlyAdded, serviceDescription, serviceName } from '../utils/format';
import { IconChip } from './CategoryIcon';

interface ServiceCardProps {
  service: ServiceDTO;
  /** Eyebrow shows the subcategory (category pages) or the category (everywhere else). */
  eyebrow?: 'category' | 'subcategory';
  showLocation?: boolean;
  /** Force-show the "Recently added" badge (homepage section) — otherwise shown automatically. */
  badge?: 'recent' | 'none' | 'auto';
}

export function ServiceCard({ service, eyebrow = 'category', showLocation, badge = 'auto' }: ServiceCardProps) {
  const { t, lang, loc } = useLanguage();
  const { category, subcategory } = service;
  const eyebrowText = eyebrow === 'subcategory' && subcategory ? loc(subcategory, 'name') : loc(category, 'name');
  const href = `/services/${service.slug}`;
  const showRecent = badge === 'recent' || (badge === 'auto' && isRecentlyAdded(service));
  const langs =
    service.languages.length === 2 ? t.languages.both : service.languages.map((l) => t.languages[l]).join(' · ');

  const meta = [t.serviceType[service.serviceType], eyebrow === 'subcategory' ? langs : null, showLocation ? t.location[service.location] : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover lg:p-6">
      <div className="flex items-start gap-3">
        <IconChip icon={category.icon} />
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-pine">{eyebrowText}</p>
          <h3 className="font-display mt-0.5 text-base leading-snug font-semibold text-heading lg:text-lg">
            {/* Stretched link: whole card is clickable */}
            <Link to={href} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
              {serviceName(service, lang)}
            </Link>
          </h3>
        </div>
        {showRecent && (
          <span className="shrink-0 rounded-full bg-lime px-2 py-0.5 text-[10px] font-semibold text-heading">
            {t.card.recentlyAdded}
          </span>
        )}
      </div>

      <p className="mt-5 line-clamp-3 text-[13px] leading-relaxed text-muted lg:text-sm">{serviceDescription(service, lang)}</p>
      <p className="mt-5 text-xs text-muted">{meta}</p>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t border-line pt-4 text-[13px] font-semibold text-pine lg:text-sm">
          <span>{t.card.viewService}</span>
          <ArrowRight className="flip-rtl size-4 text-heading transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

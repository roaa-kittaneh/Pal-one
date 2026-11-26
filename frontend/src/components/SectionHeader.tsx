import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  link,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  link?: { to: string; label: string };
}) {
  return (
    <div className="mb-6 flex lg:mb-7 flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        {eyebrow && <p className="eyebrow mb-2 text-heading">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-heading sm:text-[28px] lg:text-[32px]">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
      {link && (
        <Link to={link.to} className="inline-flex items-center gap-1 pb-1.5 text-[13px] font-medium text-pine hover:text-pine-hover">
          {link.label}
          <ArrowRight className="flip-rtl size-3" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

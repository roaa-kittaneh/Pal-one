import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Logo } from './Logo';

export function Footer() {
  const { t, lang } = useLanguage();
  const primary = [
    { to: '/', label: t.footer.discover },
    { to: '/categories', label: t.footer.categories },
    { to: '/services', label: t.footer.explore },
    { to: '/#about', label: t.footer.about },
  ];
  const secondary = [
    { to: '/privacy', label: t.footer.privacy },
    { to: '/terms', label: t.footer.terms },
  ];
  const altLang = lang === 'ar' ? 'en' : 'ar';

  return (
    <footer className="bg-forest text-white">
      <div className="container-page py-10 sm:py-14">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Logo tone="lime" />
            <p className="mt-4 text-sm text-white/85 lg:text-[15px]">{t.tagline}</p>
            <p className="mt-3 text-sm text-white/70 lg:text-[15px]">
              <bdi lang={altLang}>{t.taglineAlt}</bdi>
            </p>
          </div>
          <nav aria-label={t.footer.nav} className="space-y-5 text-[13px]">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {primary.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/90 hover:text-lime">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {secondary.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/75 hover:text-lime">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 grid gap-3 border-t border-white/10 pt-7 text-xs text-white/65 md:grid-cols-2">
          <p>
            {t.footer.copyright} <span className="text-white/50">{t.footer.demo}</span>
          </p>
          <p className="inline-flex items-center gap-1">
            {t.footer.external}
            <ArrowUpRight className="size-3 rtl:-scale-x-100" aria-hidden="true" />
          </p>
        </div>
      </div>
    </footer>
  );
}

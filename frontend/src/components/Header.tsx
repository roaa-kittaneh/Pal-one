import { Menu, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';

export function Header() {
  const { t } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close overlays whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Lock page scroll behind the mobile menu
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isAbout = location.pathname === '/' && location.hash === '#about';
  const links = [
    { to: '/', label: t.nav.discover, active: location.pathname === '/' && !isAbout },
    { to: '/categories', label: t.nav.categories, active: location.pathname.startsWith('/categories') },
    { to: '/#about', label: t.nav.about, active: isAbout },
  ];
  const exploreActive = location.pathname === '/services';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-16 items-center gap-4 lg:h-[88px]">
        <Logo />

        <nav aria-label={t.nav.main} className="hidden flex-1 justify-center md:flex">
          <ul className="flex items-center gap-1 lg:gap-8">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  aria-current={l.active ? 'page' : undefined}
                  className={`rounded-md px-2.5 py-2 text-sm transition-colors hover:text-heading ${
                    l.active ? 'font-semibold text-heading' : 'text-muted'
                  }`}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1 md:ms-0 lg:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-controls="header-search"
            aria-label={t.nav.openSearch}
            className="inline-flex size-9 items-center justify-center rounded-md text-heading hover:bg-chip"
          >
            {searchOpen ? <X className="size-[18px]" /> : <Search className="size-[18px]" strokeWidth={1.8} />}
          </button>
          <LanguageSwitcher />
          <Link
            to="/services"
            aria-current={exploreActive ? 'page' : undefined}
            className="btn-primary hidden h-11 px-5 text-sm md:inline-flex lg:h-[46px] lg:px-7"
          >
            {t.nav.explore}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t.nav.menu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex size-9 items-center justify-center rounded-md text-heading hover:bg-chip md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div id="header-search" className="border-t border-line bg-white">
          <div className="container-page py-4">
            <SearchBar size="md" autoFocus />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t.nav.main}>
          <button
            type="button"
            aria-label={t.nav.close}
            className="absolute inset-0 bg-forest/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 end-0 flex w-[min(340px,88vw)] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t.nav.close}
                className="inline-flex size-9 items-center justify-center rounded-md text-heading hover:bg-chip"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label={t.nav.main} className="flex-1 overflow-y-auto px-4 py-5">
              <SearchBar size="md" />
              <ul className="mt-6 space-y-1">
                {[...links, { to: '/services', label: t.nav.explore, active: exploreActive }].map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      aria-current={l.active ? 'page' : undefined}
                      className={`block rounded-lg px-3 py-3 text-[15px] ${
                        l.active ? 'bg-chip font-semibold text-heading' : 'text-ink hover:bg-offwhite'
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-line p-4">
              <LanguageSwitcher className="w-full border border-line py-2.5" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

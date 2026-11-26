import { useLanguage } from '../hooks/useLanguage';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { t, lang, toggleLang } = useLanguage();
  const target = lang === 'ar' ? 'en' : 'ar';
  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t.lang.switchAria}
      lang={target}
      className={`rounded-md px-2 py-1.5 text-sm text-heading transition-colors hover:bg-chip ${
        target === 'ar' ? 'font-arabic' : ''
      } ${className}`}
      style={target === 'ar' ? { fontFamily: 'IBM Plex Sans Arabic, sans-serif' } : { fontFamily: 'Inter, sans-serif' }}
    >
      {t.lang.switchTo}
    </button>
  );
}

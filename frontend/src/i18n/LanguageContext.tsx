import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Bilingual, Lang, Localized } from '../types';
import { ar } from './ar';
import { en, type Dict } from './en';

const STORAGE_KEY = 'pal-one:lang';
const dictionaries: Record<Lang, Dict> = { ar, en };

function readStoredLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'ar' || v === 'en') return v;
  } catch {
    /* storage unavailable — fall back to default */
  }
  return 'ar'; // Arabic is the default language
}

export interface LanguageContextValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  t: Dict;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Pick the current-language value of a bilingual field. */
  pick: (value: Localized) => string;
  /** Read `<key>Ar` / `<key>En` from an API object, e.g. loc(category, 'name'). */
  loc: <K extends string>(obj: Bilingual<K>, key: K) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState((l) => (l === 'ar' ? 'en' : 'ar')), []);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir, t: dictionaries[lang], setLang, toggleLang, pick: (v) => v[lang],
      loc: (obj, key) => (lang === 'ar' ? obj[`${key}Ar`] : obj[`${key}En`]),
    }),
    [lang, dir, setLang, toggleLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

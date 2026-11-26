/**
 * Normalize text for search: lower-case Latin, strip Arabic diacritics and
 * tatweel, and fold common Arabic letter variants (أ إ آ → ا, ة → ه, ى → ي …).
 */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // Latin accents
    .replace(/[ً-ٰٟـ]/g, '') // Arabic harakat, superscript alef, tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Punctuation and LIKE wildcards (% _) become spaces, so user input can
    // never act as a pattern in SQL `LIKE` comparisons.
    .replace(/[·\-_.,،؛:;!?؟()"'“”«»%\\/\[\]{}<>@#$^&*+=|~`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strip the Arabic definite article so "الجامعة" matches "جامعة". */
function stem(token: string): string {
  return token.length > 3 && token.startsWith('ال') ? token.slice(2) : token;
}

export function tokenize(input: string): string[] {
  return normalize(input).split(' ').filter(Boolean).map(stem);
}

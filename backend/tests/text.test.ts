/** Unit tests for the shared search normalization (used by API search and the seed). */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildServiceSearchText } from '../../shared/search.js';
import { normalize, tokenize } from '../../shared/text.js';

describe('shared/text', () => {
  test('lower-cases and strips Latin accents', () => {
    assert.equal(normalize('Café BIRZEIT'), 'cafe birzeit');
  });
  test('folds Arabic letter variants and removes diacritics / tatweel', () => {
    assert.equal(normalize('أإآٱ'), 'اااا');
    assert.equal(normalize('جامعة'), 'جامعه');
    assert.equal(normalize('مستشفى'), 'مستشفي');
    assert.equal(normalize('جَوّال'), 'جوال');
    assert.equal(normalize('فلـــسطين'), 'فلسطين');
  });
  test('turns punctuation and LIKE wildcards into spaces', () => {
    assert.equal(normalize("100% _off_ 'x'"), '100 off x');
    assert.equal(normalize('%_'), '');
  });
  test('tokenize drops the Arabic definite article', () => {
    assert.deepEqual(tokenize('الجامعة العربية'), ['جامعه', 'عربيه']);
    assert.deepEqual(tokenize('ال'), ['ال'], 'short words are kept');
  });
  test('buildServiceSearchText covers names, descriptions, category and subcategory', () => {
    const text = buildServiceSearchText({
      nameAr: 'جامعة بيرزيت',
      nameEn: 'Birzeit University',
      descriptionAr: 'وصف',
      descriptionEn: 'Description',
      category: { nameAr: 'التعليم', nameEn: 'Education', taglineAr: 'الجامعات', taglineEn: 'Universities' },
      subcategory: { nameAr: 'بوابات', nameEn: 'Student portals' },
    });
    for (const t of ['جامعه بيرزيت', 'birzeit university', 'description', 'education', 'student portals']) assert.ok(text.includes(t), t);
  });
});

/**
 * API integration tests: real Express app + real SQLite database.
 * Each run creates a brand-new throwaway database file
 * (database/.test-<pid>.db), applies the migrations and the seed to it,
 * and deletes it afterwards — the development database is never touched.
 *
 *   npm test
 */
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';

const { paths } = await import('../src/config/paths.js');
const dbName = `.test-${process.pid}.db`;
const dbFile = path.join(paths.root, 'database', dbName);
const seedScript = path.join(paths.root, 'database', 'prisma', 'seed.ts');
process.env.NODE_ENV = 'test';
// Relative to database/prisma/schema.prisma
process.env.DATABASE_URL = `file:../${dbName}`;

const runSeed = () => execSync(`npx tsx "${seedScript}"`, { stdio: 'pipe', env: process.env }).toString();

// New empty database: apply migrations (also verifies they run from scratch), then seed.
execSync('npx prisma migrate deploy', { stdio: 'pipe', env: process.env, cwd: path.join(paths.root, 'backend') });
runSeed();

const { createApp } = await import('../src/app.js');
const { prisma } = await import('../src/config/database.js');
const { hashPassword, verifyPassword } = await import('../src/utils/password.js');

const ORIGIN = 'http://localhost:5173';
let server: Server;
let base: string;

const listen = (app: ReturnType<typeof createApp>) =>
  new Promise<{ server: Server; base: string }>((resolve) => {
    const s = app.listen(0, () => resolve({ server: s, base: `http://127.0.0.1:${(s.address() as AddressInfo).port}/api` }));
  });

before(async () => {
  ({ server, base } = await listen(
    createApp({ CORS_ORIGIN: [ORIGIN], RATE_LIMIT_PER_MINUTE: 10_000, TRUST_PROXY: 0, SERVE_CLIENT: false }),
  ));
});
after(async () => {
  server.close();
  await prisma.$disconnect();
  for (const f of [dbFile, `${dbFile}-journal`]) rmSync(f, { force: true });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function get(path: string, headers: Record<string, string> = {}): Promise<{ status: number; body: any; res: Response }> {
  const res = await fetch(base + path, { headers });
  return { status: res.status, body: await res.json(), res };
}
const slugs = (body: { data: { slug: string }[] }) => body.data.map((s) => s.slug);
const q = encodeURIComponent;

describe('database', () => {
  test('connects, migrations applied and seed data present', async () => {
    const [categories, subcategories, services, drafts] = await Promise.all([
      prisma.category.count(),
      prisma.subcategory.count(),
      prisma.service.count(),
      prisma.service.count({ where: { status: 'draft' } }),
    ]);
    assert.equal(categories, 10);
    assert.equal(subcategories, 21);
    assert.equal(services, 26);
    assert.equal(drafts, 1);
    assert.equal(await prisma.service.count({ where: { searchText: '' } }), 0, 'search index built');
    assert.equal(await prisma.service.count({ where: { isVerified: true } }), 0, 'no verification claims');
    assert.equal(await prisma.service.count({ where: { officialWebsite: { not: null } } }), 0, 'no invented URLs');
  });

  test('seed is idempotent and never touches non-demo records', async () => {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: 'education' } });
    const real = await prisma.service.create({
      data: {
        slug: 'non-demo-record',
        nameAr: 'سجل حقيقي',
        nameEn: 'Real record',
        descriptionAr: 'x',
        descriptionEn: 'x',
        categoryId: category.id,
        serviceType: 'website',
        location: 'ramallah',
        status: 'draft',
      },
    });
    const before = await prisma.service.findUniqueOrThrow({ where: { slug: 'bank-of-palestine' } });
    const output = runSeed();
    assert.match(output, /0 services created, 26 updated/);
    assert.equal(await prisma.service.count(), 27, 'nothing duplicated');
    assert.equal(await prisma.serviceLanguage.count({ where: { service: { isDemo: true } } }), 46, 'child rows replaced, not duplicated');
    const after = await prisma.service.findUniqueOrThrow({ where: { slug: 'bank-of-palestine' } });
    assert.equal(after.id, before.id, 'ids are stable');
    assert.equal(after.createdAt.toISOString(), before.createdAt.toISOString(), 'createdAt preserved');
    const kept = await prisma.service.findUniqueOrThrow({ where: { slug: 'non-demo-record' } });
    assert.equal(kept.nameEn, 'Real record', 'non-demo record untouched');
    await prisma.service.delete({ where: { id: real.id } });
  });

  test('unique constraints are enforced', async () => {
    await assert.rejects(
      prisma.category.create({ data: { slug: 'education', nameAr: 'x', nameEn: 'x', descriptionAr: 'x', descriptionEn: 'x', icon: 'education' } }),
      /Unique constraint/,
    );
  });
});

describe('GET /api/statistics', () => {
  test('returns public counts only', async () => {
    const { status, body } = await get('/statistics');
    assert.equal(status, 200);
    assert.deepEqual(Object.keys(body.data).sort(), ['lastUpdated', 'totalCategories', 'totalServices', 'totalSubcategories', 'totalVerified']);
    assert.equal(body.data.totalServices, 25, 'draft excluded');
    assert.equal(body.data.totalCategories, 10);
    assert.equal(body.data.totalVerified, 0);
  });
});

describe('Categories API', () => {
  test('GET /categories lists active categories with counts', async () => {
    const { status, body } = await get('/categories');
    assert.equal(status, 200);
    assert.equal(body.data.length, 10);
    assert.equal(body.data[0].slug, 'banking-finance');
    const total = body.data.reduce((n: number, c: { serviceCount: number }) => n + c.serviceCount, 0);
    assert.equal(total, 25);
    const edu = body.data.find((c: { slug: string }) => c.slug === 'education');
    assert.equal(edu.serviceCount, 6, 'draft not counted');
    assert.deepEqual(edu.subcategories.map((s: { slug: string }) => s.slug), ['universities', 'student-portals', 'digital-learning']);
    assert.equal('id' in edu, false, 'internal ids are not exposed');
  });

  test('GET /categories/:slug returns the category and its services', async () => {
    const { status, body } = await get('/categories/education');
    assert.equal(status, 200);
    assert.equal(body.data.nameEn, 'Education');
    assert.equal(body.data.services.length, 6);
    assert.ok(!slugs({ data: body.data.services }).includes('unpublished-listing-demo'));
  });

  test('GET /categories/:slug?servicesLimit= limits embedded services', async () => {
    assert.equal((await get('/categories/education?servicesLimit=0')).body.data.services.length, 0);
    assert.equal((await get('/categories/education?servicesLimit=2')).body.data.services.length, 2);
    assert.equal((await get('/categories/education?servicesLimit=101')).status, 400);
  });

  test('unknown category → 404, malformed slug → 400', async () => {
    const missing = await get('/categories/does-not-exist');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.error.code, 'NOT_FOUND');
    const bad = await get(`/categories/${q('Bad_Slug!')}`);
    assert.equal(bad.status, 400);
    assert.equal(bad.body.error.code, 'VALIDATION_ERROR');
  });
});

describe('Services API', () => {
  test('pagination', async () => {
    const p1 = await get('/services?pageSize=10');
    assert.equal(p1.status, 200);
    assert.deepEqual(p1.body.pagination, { page: 1, pageSize: 10, total: 25, totalPages: 3 });
    assert.equal(p1.body.data.length, 10);
    const p3 = await get('/services?pageSize=10&page=3');
    assert.equal(p3.body.data.length, 5);
    const all = new Set([...slugs(p1.body), ...slugs((await get('/services?pageSize=10&page=2')).body), ...slugs(p3.body)]);
    assert.equal(all.size, 25, 'pages do not overlap');
    const beyond = await get('/services?pageSize=10&page=9');
    assert.equal(beyond.body.data.length, 0);
  });

  test('pagination validation', async () => {
    for (const bad of ['page=0', 'page=abc', 'pageSize=0', 'pageSize=51', 'page=1.5']) {
      const { status, body } = await get(`/services?${bad}`);
      assert.equal(status, 400, bad);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
      assert.ok(body.error.details.length > 0);
    }
  });

  test('filters: category, subcategory, type, location, featured', async () => {
    assert.equal((await get('/services?category=communication')).body.pagination.total, 3);
    assert.equal((await get('/services?subcategory=universities')).body.pagination.total, 4);
    const apps = (await get('/services?type=mobile-app&pageSize=50')).body;
    assert.ok(apps.data.every((s: { serviceType: string }) => s.serviceType !== 'website'), 'mobile-app also matches website-and-app');
    assert.ok(apps.data.some((s: { serviceType: string }) => s.serviceType === 'website-and-app'));
    const multi = (await get('/services?type=website&type=mobile-app')).body.pagination.total;
    assert.equal(multi, 25);
    const nablus = (await get('/services?location=nablus&pageSize=50')).body;
    assert.ok(nablus.data.length > 0 && nablus.data.every((s: { location: string }) => s.location === 'nablus'));
    const featured = (await get('/services?featured=true')).body;
    assert.deepEqual(slugs(featured).sort(), ['bank-of-palestine', 'birzeit-university', 'jawwal']);
    const combined = (await get('/services?category=education&location=birzeit&type=website')).body;
    assert.deepEqual(slugs(combined).sort(), ['birzeit-university', 'ritaj-birzeit']);
  });

  test('invalid filter values → 400', async () => {
    for (const bad of ['type=fax', 'location=mars', 'sort=random', 'featured=maybe', 'lang=fr', `category=${q('a b')}`]) {
      assert.equal((await get(`/services?${bad}`)).status, 400, bad);
    }
  });

  test('facets count categories independent of the category filter', async () => {
    const { body } = await get('/services?category=education&type=website');
    const facet = new Map(body.facets.categories.map((c: { slug: string; count: number }) => [c.slug, c.count]));
    assert.ok((facet.get('communication') as number) > 0, 'other categories still counted');
    assert.equal(facet.get('education'), body.pagination.total);
  });

  test('sorting: recommended, recent, alphabetical (en / ar)', async () => {
    const rec = slugs((await get('/services?pageSize=3')).body);
    assert.deepEqual(rec, ['bank-of-palestine', 'jawwal', 'birzeit-university'], 'featured first');
    const recent = (await get('/services?sort=recent&pageSize=50')).body.data;
    assert.equal(recent[0].slug, 'tatreez-learning-demo');
    const dates = recent.map((s: { dateAdded: string }) => s.dateAdded);
    assert.deepEqual(dates, [...dates].sort().reverse());
    const en = (await get('/services?sort=alphabetical&lang=en&pageSize=50')).body.data.map((s: { nameEn: string }) => s.nameEn);
    assert.deepEqual(en, [...en].sort());
    const ar = (await get('/services?sort=alphabetical&lang=ar&pageSize=50')).body.data.map((s: { nameAr: string }) => s.nameAr);
    assert.deepEqual(ar, [...ar].sort());
  });

  test('GET /services/featured and /services/recent', async () => {
    const featured = await get('/services/featured?limit=2');
    assert.equal(featured.status, 200);
    assert.equal(featured.body.data.length, 2);
    assert.ok(featured.body.data.every((s: { isFeatured: boolean }) => s.isFeatured));
    const recent = await get('/services/recent');
    assert.equal(recent.body.data.length, 6);
    assert.equal(recent.body.data[0].slug, 'tatreez-learning-demo', 'draft (newer) excluded');
    assert.equal((await get('/services/recent?limit=100')).status, 400);
  });

  test('GET /services/:slug returns full details and related services', async () => {
    const { status, body } = await get('/services/bank-of-palestine');
    assert.equal(status, 200);
    assert.equal(body.data.nameEn, 'Bank of Palestine');
    assert.equal(body.data.highlights.length, 3);
    assert.deepEqual(body.data.languages, ['ar', 'en']);
    assert.equal(body.data.officialWebsite, null);
    assert.equal(body.data.isDemo, true);
    assert.equal(body.related.length, 3);
    assert.equal(body.related[0].slug, 'palpay', 'same category first');
    for (const key of ['id', 'searchText', 'status', 'sortOrder', 'categoryId']) assert.equal(key in body.data, false, key);
  });

  test('draft and unknown services → 404', async () => {
    assert.equal((await get('/services/unpublished-listing-demo')).status, 404);
    assert.equal((await get('/services/no-such-service')).status, 404);
  });
});

describe('Search API', () => {
  const search = async (term: string, extra = '') => (await get(`/search?q=${q(term)}&pageSize=50${extra}`)).body;

  test('English names, case-insensitive, name matches rank first', async () => {
    const r = await search('BIRZEIT');
    assert.deepEqual(slugs(r).slice(0, 2).sort(), ['birzeit-university', 'ritaj-birzeit']);
    assert.equal(slugs(await search('bank'))[0], 'bank-of-palestine');
  });

  test('Arabic names with letter-variant folding', async () => {
    assert.equal(slugs(await search('بنك فلسطين'))[0], 'bank-of-palestine');
    // ة/ه folding and the definite article: "الجامعه" matches "جامعة …"
    const unis = slugs(await search('الجامعه'));
    for (const s of ['birzeit-university', 'an-najah-university', 'al-quds-university', 'bethlehem-university']) assert.ok(unis.includes(s), s);
    // diacritics are ignored
    assert.ok(slugs(await search('جَوّال')).includes('jawwal'));
    // hamza variants: اوريدو ↔ أوريدو
    assert.ok(slugs(await search('اوريدو')).includes('ooredoo-palestine'));
  });

  test('descriptions, category and subcategory names', async () => {
    assert.ok(slugs(await search('ambulance')).includes('palestine-red-crescent'), 'English description');
    assert.ok(slugs(await search('الإسعاف')).includes('palestine-red-crescent'), 'Arabic description');
    const health = await search('healthcare');
    assert.ok(health.data.length >= 2 && health.data.every((s: { category: { slug: string } }) => s.category.slug === 'healthcare'));
    assert.deepEqual(slugs(await search('student portals')), ['ritaj-birzeit'], 'subcategory name');
    assert.ok(slugs(await search('المواصلات')).length >= 2, 'Arabic category name');
  });

  test('filters, pagination and drafts', async () => {
    const r = await search('university', '&location=nablus');
    assert.deepEqual(slugs(r), ['an-najah-university']);
    const paged = (await get(`/search?q=${q('university')}&pageSize=2&page=2`)).body;
    assert.equal(paged.data.length, 2);
    assert.equal(paged.pagination.page, 2);
    assert.equal((await search('unpublished')).data.length, 0);
  });

  test('validation and safe handling of special characters', async () => {
    assert.equal((await get('/search')).status, 400);
    assert.equal((await get('/search?q=')).status, 400);
    assert.equal((await get(`/search?q=${'a'.repeat(101)}`)).status, 400);
    assert.equal((await search('%')).data.length, 0, 'LIKE wildcard does not match everything');
    assert.equal((await search('_')).data.length, 0);
    const injection = await get(`/search?q=${q("' OR 1=1; DROP TABLE Service; --")}`);
    assert.equal(injection.status, 200);
    assert.equal(injection.body.data.length, 0);
    assert.equal(await prisma.service.count(), 26, 'table intact');
  });
});

describe('Errors & security', () => {
  test('health check reports database status', async () => {
    const { status, body, res } = await get('/health');
    assert.equal(status, 200);
    assert.deepEqual(body.data, { status: 'ok', database: 'up' });
    assert.equal(res.headers.get('cache-control'), 'no-store');
  });

  test('successful GETs are briefly cacheable, errors are never cached', async () => {
    assert.equal((await get('/categories')).res.headers.get('cache-control'), 'public, max-age=30');
    for (const p of ['/services/nope', '/services?page=0', '/admin/users', '/nope']) {
      assert.equal((await get(p)).res.headers.get('cache-control'), 'no-store', p);
    }
  });

  test('oversized type parameter is rejected', async () => {
    assert.equal((await get(`/services?type=${'website,'.repeat(50)}`)).status, 400);
  });

  test('unknown API route → JSON 404', async () => {
    const { status, body } = await get('/nope');
    assert.equal(status, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  test('admin routes are separate and closed', async () => {
    const { status, body } = await get('/admin/users');
    assert.equal(status, 403);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  test('no admin data or password hashes in any public response', async () => {
    await prisma.adminUser.upsert({
      where: { email: 'test-admin@example.com' },
      create: { email: 'test-admin@example.com', name: 'Test', passwordHash: await hashPassword('correct horse battery'), role: 'admin' },
      update: {},
    });
    const paths = ['/statistics', '/categories', '/categories/education', '/services?pageSize=50', '/services/bank-of-palestine', `/search?q=admin`];
    for (const p of paths) {
      const text = await (await fetch(base + p)).text();
      assert.ok(!/passwordHash|test-admin@example\.com|scrypt\$/.test(text), p);
    }
  });

  test('passwords are stored as scrypt hashes', async () => {
    const hash = await hashPassword('correct horse battery');
    assert.match(hash, /^scrypt\$\d+\$/);
    assert.ok(!hash.includes('correct horse battery'));
    assert.equal(await verifyPassword('correct horse battery', hash), true);
    assert.equal(await verifyPassword('wrong password', hash), false);
  });

  test('security headers and CORS', async () => {
    const { res } = await get('/categories', { Origin: ORIGIN });
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-powered-by'), null);
    assert.ok(res.headers.get('content-security-policy'));
    assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
    const other = await get('/categories', { Origin: 'https://evil.example' });
    assert.equal(other.res.headers.get('access-control-allow-origin'), null);
  });

  test('rate limiting returns 429 with a JSON error', async () => {
    const limited = await listen(createApp({ CORS_ORIGIN: [ORIGIN], RATE_LIMIT_PER_MINUTE: 3, TRUST_PROXY: 0, SERVE_CLIENT: false }));
    try {
      const statuses = [];
      for (let i = 0; i < 4; i++) statuses.push((await fetch(`${limited.base}/health`)).status);
      assert.deepEqual(statuses, [200, 200, 200, 429]);
      const body = (await (await fetch(`${limited.base}/health`)).json()) as { error: { code: string } };
      assert.equal(body.error.code, 'RATE_LIMITED');
    } finally {
      limited.server.close();
    }
  });
});

/**
 * Seed the database with DEMONSTRATION content (see seed-data.ts).
 *
 * Non-destructive and idempotent: categories, subcategories and services are
 * upserted by slug. Records that are not part of the seed (and AdminUser) are
 * never modified or deleted. Re-running it refreshes the demo records.
 *
 *   npm run db:seed          (from the project root)
 */
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { buildServiceSearchText } from '../../shared/search.js';
import { seedCategories, seedServices } from './seed-data.js';

const rootEnv = path.resolve(import.meta.dirname, '../../.env');
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PAL-ONE demonstration data (upsert by slug)…');
  const stats = { categories: 0, subcategories: 0, servicesCreated: 0, servicesUpdated: 0 };

  const categoryIds = new Map<string, number>();
  const subcategories = new Map<string, { id: number; categorySlug: string }>();

  for (const [i, { subcategories: subs, ...c }] of seedCategories.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { ...c, sortOrder: i },
      update: { ...c, sortOrder: i },
    });
    categoryIds.set(c.slug, category.id);
    stats.categories++;

    for (const [j, s] of subs.entries()) {
      const data = { ...s, sortOrder: j, categoryId: category.id };
      const sub = await prisma.subcategory.upsert({ where: { slug: s.slug }, create: data, update: data });
      subcategories.set(s.slug, { id: sub.id, categorySlug: c.slug });
      stats.subcategories++;
    }
  }

  const seededIds: number[] = [];
  for (const [i, s] of seedServices.entries()) {
    const categoryId = categoryIds.get(s.category);
    if (!categoryId) throw new Error(`Unknown category "${s.category}" for service "${s.slug}"`);
    const sub = s.subcategory ? subcategories.get(s.subcategory) : undefined;
    if (s.subcategory && (!sub || sub.categorySlug !== s.category)) {
      throw new Error(`Subcategory "${s.subcategory}" does not belong to "${s.category}" (service "${s.slug}")`);
    }

    const fields = {
      nameAr: s.nameAr,
      nameEn: s.nameEn,
      descriptionAr: s.descriptionAr,
      descriptionEn: s.descriptionEn,
      categoryId,
      subcategoryId: sub?.id ?? null,
      serviceType: s.serviceType,
      location: s.location,
      isFeatured: s.isFeatured ?? false,
      isDemo: true,
      status: s.status ?? 'published',
      sortOrder: i,
    };
    const existing = await prisma.service.findUnique({ where: { slug: s.slug }, select: { id: true } });
    const createdAt = new Date(`${s.createdAt}T09:00:00Z`);

    const service = existing
      ? await prisma.service.update({ where: { id: existing.id }, data: fields })
      : await prisma.service.create({
          data: {
            ...fields,
            slug: s.slug,
            // Official links / contact details are intentionally left NULL and
            // isVerified false: never invented for demo data.
            createdAt,
            updatedAt: createdAt,
          },
        });
    if (existing) stats.servicesUpdated++;
    else stats.servicesCreated++;
    seededIds.push(service.id);

    // Child rows belong to the seeded service: replace them with the seed's version.
    await prisma.$transaction([
      prisma.serviceLanguage.deleteMany({ where: { serviceId: service.id } }),
      prisma.serviceLanguage.createMany({ data: s.languages.map((language) => ({ serviceId: service.id, language })) }),
      prisma.serviceHighlight.deleteMany({ where: { serviceId: service.id } }),
      prisma.serviceHighlight.createMany({
        data: (s.highlights ?? []).map((h, position) => ({ ...h, position, serviceId: service.id })),
      }),
    ]);
  }

  // Refresh the normalized search column of the seeded services.
  const rows = await prisma.service.findMany({
    where: { id: { in: seededIds } },
    include: { category: true, subcategory: true },
  });
  await prisma.$transaction(
    rows.map((r) => prisma.service.update({ where: { id: r.id }, data: { searchText: buildServiceSearchText(r) } })),
  );

  console.log(
    `✓ ${stats.categories} categories, ${stats.subcategories} subcategories, ` +
      `${stats.servicesCreated} services created, ${stats.servicesUpdated} updated (search index refreshed)`,
  );
}

main()
  .catch((err) => {
    console.error('✖ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

import type { PrismaClient } from '@prisma/client';
import { buildServiceSearchText } from '../../../shared/search.js';

/**
 * SQLite's LIKE is only case-insensitive for ASCII and knows nothing about
 * Arabic letter variants, so each service stores a pre-normalized
 * `searchText` column. Queries are normalized the same way (shared/text.ts)
 * and matched with `contains`.
 *
 * Call `rebuildSearchIndex` after creating/updating services, categories or
 * subcategories (the seed script does this automatically).
 */
export async function rebuildSearchIndex(db: PrismaClient, serviceIds?: number[]): Promise<number> {
  const services = await db.service.findMany({
    where: serviceIds ? { id: { in: serviceIds } } : undefined,
    include: { category: true, subcategory: true },
  });
  await db.$transaction(
    services.map((s) => db.service.update({ where: { id: s.id }, data: { searchText: buildServiceSearchText(s) } })),
  );
  return services.length;
}

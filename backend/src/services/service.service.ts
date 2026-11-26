import type { Prisma } from '@prisma/client';
import type { ServiceDetailDTO, ServiceDTO, ServiceFacets, ServiceListResponse } from '../../../shared/api.js';
import type { LocationId, ServiceType } from '../../../shared/constants.js';
import { normalize, tokenize } from '../../../shared/text.js';
import { prisma } from '../config/database.js';
import type { ServiceListQuery as ServiceFilters } from '../validators/service.validators.js';
import { serviceCardSelect, serviceDetailSelect, toServiceDetailDTO, toServiceDTO } from './mappers.js';

/** Only published services in active categories are ever public. */
export const publicServiceWhere: Prisma.ServiceWhereInput = {
  status: 'published',
  category: { isActive: true },
};

/** A "website" (or "mobile-app") filter also matches services that offer both. */
function typeCondition(types: ServiceType[]): Prisma.ServiceWhereInput {
  const values = new Set<string>(types);
  if (values.has('website') || values.has('mobile-app')) values.add('website-and-app');
  return { serviceType: { in: [...values] } };
}

type Facet = 'category' | 'location';

/** Build the WHERE clause. `omit` drops one facet so its counts can be computed. */
function buildWhere(f: Partial<ServiceFilters>, omit?: Facet): Prisma.ServiceWhereInput {
  const and: Prisma.ServiceWhereInput[] = [publicServiceWhere];
  if (f.category && omit !== 'category') and.push({ category: { slug: f.category } });
  if (f.subcategory && omit !== 'category') and.push({ subcategory: { slug: f.subcategory } });
  if (f.type?.length) and.push(typeCondition(f.type));
  if (f.location && omit !== 'location') and.push({ location: f.location });
  if (f.featured !== undefined) and.push({ isFeatured: f.featured });
  // Each normalized token must appear in the pre-normalized search column.
  // Values are bound parameters; normalize() strips LIKE wildcards (% _).
  for (const token of tokenize(f.q ?? '')) and.push({ searchText: { contains: token } });
  return { AND: and };
}

function orderBy(f: Pick<ServiceFilters, 'sort' | 'lang'>): Prisma.ServiceOrderByWithRelationInput[] {
  switch (f.sort) {
    case 'recent':
      return [{ createdAt: 'desc' }, { id: 'desc' }];
    case 'alphabetical':
      return [f.lang === 'ar' ? { nameAr: 'asc' } : { nameEn: 'asc' }, { id: 'asc' }];
    case 'recommended':
    default:
      return [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }];
  }
}

/** Name matches rank above description/category matches for "recommended" search results. */
function relevance(row: { nameAr: string; nameEn: string }, q: string): number {
  const query = normalize(q);
  const names = normalize(`${row.nameAr} ${row.nameEn}`);
  if (names.startsWith(query)) return 3;
  if (names.includes(query)) return 2;
  return tokenize(q).some((t) => names.includes(t)) ? 1 : 0;
}

async function getFacets(f: Partial<ServiceFilters>): Promise<ServiceFacets> {
  const [byCategory, byLocation, categories] = await Promise.all([
    prisma.service.groupBy({ by: ['categoryId'], where: buildWhere(f, 'category'), _count: { _all: true } }),
    prisma.service.groupBy({ by: ['location'], where: buildWhere(f, 'location'), _count: { _all: true } }),
    prisma.category.findMany({ where: { isActive: true }, select: { id: true, slug: true } }),
  ]);
  const slugById = new Map(categories.map((c) => [c.id, c.slug]));
  return {
    categories: byCategory
      .filter((r) => slugById.has(r.categoryId))
      .map((r) => ({ slug: slugById.get(r.categoryId)!, count: r._count._all })),
    locations: byLocation.map((r) => ({ location: r.location as LocationId, count: r._count._all })),
  };
}

export async function listServices(f: ServiceFilters): Promise<ServiceListResponse> {
  // A query made only of punctuation/wildcards normalizes to nothing: match nothing, not everything.
  if (f.q?.trim() && tokenize(f.q).length === 0) {
    return {
      data: [],
      pagination: { page: f.page, pageSize: f.pageSize, total: 0, totalPages: 1 },
      facets: { categories: [], locations: [] },
    };
  }
  const where = buildWhere(f);
  const skip = (f.page - 1) * f.pageSize;
  let data: ServiceDTO[];
  let total: number;

  if (f.q && f.sort === 'recommended') {
    // Relevance ranking can't be expressed in SQLite ORDER BY, so rank the
    // (small) set of matching ids in memory, then load only the requested page.
    const matches = await prisma.service.findMany({
      where,
      select: { id: true, nameAr: true, nameEn: true },
      orderBy: orderBy(f),
    });
    total = matches.length;
    const ranked = matches
      .map((m, i) => ({ id: m.id, score: relevance(m, f.q!), i }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .slice(skip, skip + f.pageSize)
      .map((m) => m.id);
    const rows = await prisma.service.findMany({ where: { id: { in: ranked } }, select: { id: true, ...serviceCardSelect } });
    const byId = new Map(rows.map((r) => [r.id, r]));
    data = ranked.map((id) => toServiceDTO(byId.get(id)!));
  } else {
    const [rows, count] = await prisma.$transaction([
      prisma.service.findMany({ where, select: serviceCardSelect, orderBy: orderBy(f), skip, take: f.pageSize }),
      prisma.service.count({ where }),
    ]);
    data = rows.map(toServiceDTO);
    total = count;
  }

  return {
    data,
    pagination: { page: f.page, pageSize: f.pageSize, total, totalPages: Math.max(1, Math.ceil(total / f.pageSize)) },
    facets: await getFacets(f),
  };
}

export async function getFeaturedServices(limit: number): Promise<ServiceDTO[]> {
  const rows = await prisma.service.findMany({
    where: { ...publicServiceWhere, isFeatured: true },
    select: serviceCardSelect,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    take: limit,
  });
  return rows.map(toServiceDTO);
}

export async function getRecentServices(limit: number): Promise<ServiceDTO[]> {
  const rows = await prisma.service.findMany({
    where: publicServiceWhere,
    select: serviceCardSelect,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
  });
  return rows.map(toServiceDTO);
}

export async function getServiceBySlug(slug: string): Promise<{ service: ServiceDetailDTO; related: ServiceDTO[] } | null> {
  const row = await prisma.service.findFirst({
    where: { ...publicServiceWhere, slug },
    select: { id: true, categoryId: true, ...serviceDetailSelect },
  });
  if (!row) return null;

  // Related: same category first, then featured services from elsewhere.
  const sameCategory = await prisma.service.findMany({
    where: { ...publicServiceWhere, categoryId: row.categoryId, id: { not: row.id } },
    select: { id: true, ...serviceCardSelect },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    take: 3,
  });
  const fill =
    sameCategory.length < 3
      ? await prisma.service.findMany({
          where: { ...publicServiceWhere, id: { notIn: [row.id, ...sameCategory.map((s) => s.id)] } },
          select: { id: true, ...serviceCardSelect },
          orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
          take: 3 - sameCategory.length,
        })
      : [];

  return { service: toServiceDetailDTO(row), related: [...sameCategory, ...fill].map(toServiceDTO) };
}

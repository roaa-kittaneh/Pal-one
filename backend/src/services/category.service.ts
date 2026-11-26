import type { Prisma } from '@prisma/client';
import type { CategoryDTO, ServiceDTO } from '../../../shared/api.js';
import { prisma } from '../config/database.js';
import { serviceCardSelect, toCategorySummary, toServiceDTO } from './mappers.js';
import { publicServiceWhere } from './service.service.js';

const publicServices = { where: { status: 'published' } } as const;

const categorySelect = {
  slug: true,
  nameAr: true,
  nameEn: true,
  taglineAr: true,
  taglineEn: true,
  icon: true,
  tint: true,
  descriptionAr: true,
  descriptionEn: true,
  headlineAr: true,
  headlineEn: true,
  image: true,
  _count: { select: { services: publicServices } },
  subcategories: {
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: {
      slug: true,
      nameAr: true,
      nameEn: true,
      descriptionAr: true,
      descriptionEn: true,
      _count: { select: { services: publicServices } },
    },
  },
} satisfies Prisma.CategorySelect;

type CategoryRow = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;

const toCategoryDTO = ({ _count, subcategories, descriptionAr, descriptionEn, headlineAr, headlineEn, image, ...summary }: CategoryRow): CategoryDTO => ({
  ...toCategorySummary(summary),
  descriptionAr,
  descriptionEn,
  headlineAr,
  headlineEn,
  image,
  serviceCount: _count.services,
  subcategories: subcategories.map(({ _count: c, ...s }) => ({ ...s, serviceCount: c.services })),
});

export async function listCategories(): Promise<CategoryDTO[]> {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: categorySelect,
  });
  return rows.map(toCategoryDTO);
}

/** A category with up to `servicesLimit` of its published services (curated order). */
export async function getCategoryWithServices(
  slug: string,
  servicesLimit = 100,
): Promise<(CategoryDTO & { services: ServiceDTO[] }) | null> {
  const row = await prisma.category.findFirst({ where: { slug, isActive: true }, select: categorySelect });
  if (!row) return null;
  const services =
    servicesLimit === 0
      ? []
      : await prisma.service.findMany({
          where: { ...publicServiceWhere, category: { slug } },
          select: serviceCardSelect,
          orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }],
          take: servicesLimit,
        });
  return { ...toCategoryDTO(row), services: services.map(toServiceDTO) };
}

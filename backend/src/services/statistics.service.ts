import type { Statistics } from '../../../shared/api.js';
import { prisma } from '../config/database.js';
import { publicServiceWhere } from './service.service.js';

/** Public, aggregate-only numbers. Nothing about admins or unpublished content. */
export async function getStatistics(): Promise<Statistics> {
  const [totalServices, totalCategories, totalSubcategories, totalVerified, latest] = await prisma.$transaction([
    prisma.service.count({ where: publicServiceWhere }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.subcategory.count({ where: { category: { isActive: true } } }),
    prisma.service.count({ where: { ...publicServiceWhere, isVerified: true } }),
    prisma.service.findFirst({ where: publicServiceWhere, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
  ]);
  return {
    totalServices,
    totalCategories,
    totalSubcategories,
    totalVerified,
    lastUpdated: latest?.updatedAt.toISOString() ?? null,
  };
}

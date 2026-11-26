/**
 * Create or update an administrator from the command line (there is no public
 * registration). The password is read from the ADMIN_PASSWORD environment
 * variable so it never appears in shell history or process listings, and is
 * stored only as a scrypt hash.
 *
 *   ADMIN_PASSWORD='…' npm run admin:create -- --email admin@example.com --name "Site Admin" [--role admin]
 *   (run from the project root)
 */
import { PrismaClient } from '@prisma/client';
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { ADMIN_ROLES } from '../../shared/constants.js';
// Importing env loads and validates the project-root .env (DATABASE_URL).
import '../src/config/env.js';
import { hashPassword } from '../src/utils/password.js';

const { values } = parseArgs({
  options: { email: { type: 'string' }, name: { type: 'string' }, role: { type: 'string', default: 'editor' } },
});

const input = z
  .object({
    email: z.email(),
    name: z.string().trim().min(1).max(100),
    role: z.enum(ADMIN_ROLES),
    password: z.string().min(12, 'ADMIN_PASSWORD must be at least 12 characters'),
  })
  .safeParse({ ...values, password: process.env.ADMIN_PASSWORD });

if (!input.success) {
  for (const i of input.error.issues) console.error(`✖ ${i.path.join('.')}: ${i.message}`);
  process.exit(1);
}

const prisma = new PrismaClient();
const { email, name, role, password } = input.data;
const passwordHash = await hashPassword(password);
const admin = await prisma.adminUser.upsert({
  where: { email },
  create: { email, name, role, passwordHash },
  update: { name, role, passwordHash },
  select: { id: true, email: true, role: true },
});
console.log(`✓ Admin saved: ${admin.email} (${admin.role})`);
await prisma.$disconnect();

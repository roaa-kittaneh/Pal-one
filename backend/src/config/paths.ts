import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The monorepo root: the nearest ancestor of this file whose package.json
 * declares npm workspaces. Works from backend/src (tsx) and backend/dist (node),
 * whatever the current working directory is.
 */
function findProjectRoot(start: string): string {
  let dir = start;
  for (;;) {
    const pkg = path.join(dir, 'package.json');
    if (existsSync(pkg)) {
      try {
        if (JSON.parse(readFileSync(pkg, 'utf8')).workspaces) return dir;
      } catch {
        /* keep looking */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error('Could not locate the PAL-ONE project root (package.json with "workspaces").');
    dir = parent;
  }
}

export const projectRoot = findProjectRoot(path.dirname(fileURLToPath(import.meta.url)));

export const paths = {
  root: projectRoot,
  envFile: path.join(projectRoot, '.env'),
  prismaDir: path.join(projectRoot, 'database', 'prisma'),
  frontendDist: path.join(projectRoot, 'frontend', 'dist'),
};

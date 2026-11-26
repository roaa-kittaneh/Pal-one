import { Router, type NextFunction, type Request, type Response } from 'express';
import { HttpError } from '../utils/httpError.js';

/**
 * Administrative API — kept on its own router and URL prefix (/api/admin),
 * separate from the public read-only API.
 *
 * Phase 1 ships the AdminUser data model only: there is no login,
 * registration or session handling yet, so every admin request is refused.
 * When authentication is added, replace `requireAdmin` with a real check
 * (e.g. session/JWT verified against AdminUser + role) and add routes below.
 */
function requireAdmin(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(403, 'FORBIDDEN', 'The admin API is not enabled yet.'));
}

export const adminRoutes = Router();
adminRoutes.use(requireAdmin);

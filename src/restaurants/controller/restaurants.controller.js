import { ok } from '../../../utils/http.js';
import * as svc from '../service/restaurants.service.js';

export async function search(req, res, next) {
  try {
    const { query, type, page, size, radius } = req.query;
    const d = await svc.search({ query, type, page, size, radius });
    return ok(res, d);
  } catch (e) { next(e); }
}
// src/restaurants/controller/restaurants.controller.js
import * as svc from '../service/restaurants.service.js';
import { parseSearchQuery, parseSuggestQuery } from '../dto/request/restaurants.request.dto.js';

function ok(res, data) {
  return res.status(200).json({ ok: true, data });
}

export async function search(req, res, next) {
  try {
    const dto = parseSearchQuery(req.query);
    const data = await svc.search(dto);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function suggest(req, res, next) {
  try {
    const dto = parseSuggestQuery(req.query);
    const data = await svc.suggest(dto);
    return ok(res, data);
  } catch (e) { next(e); }
}
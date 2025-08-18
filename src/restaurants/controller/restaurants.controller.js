import * as svc from '../service/restaurants.service.js';

// 공통 응답 헬퍼 (프로젝트에 이미 있으면 그거 쓰세요)
function ok(res, data) {
  return res.status(200).json({ ok: true, data });
}

export async function search(req, res, next) {
  try {
    const data = await svc.search(req.query);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function suggest(req, res, next) {
  try {
    const data = await svc.suggest(req.query);
    return ok(res, data);
  } catch (e) { next(e); }
}
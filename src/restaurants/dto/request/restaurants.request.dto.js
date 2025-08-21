// src/restaurants/dto/request/restaurants.request.dto.js
const toInt = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function parseSearchQuery(q = {}) {
  const query = (q.query || '').trim();
  const page  = Math.max(1, toInt(q.page, 1));
  const size  = Math.min(50, Math.max(1, toInt(q.size, 20)));

  // 클라이언트가 category 또는 type을 보낼 수 있으니 양쪽 다 수용
  const rawCategory = (q.category || q.type || '').trim();
  const ALLOWED = new Set(['Korean','Chinese','Japanese']);
  const category = ALLOWED.has(rawCategory) ? rawCategory : undefined;

  return { query, category, page, size };
}

export function parseSuggestQuery(q = {}) {
  const query = (q.query || '').trim();
  const limit = Math.min(20, Math.max(1, toInt(q.limit, 10)));
  return { query, limit };
}
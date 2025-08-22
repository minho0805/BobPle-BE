// src/restaurants/dto/request/restaurants.request.dto.js
const toInt = (v, def) => {
  // 배열로 오는 케이스 방지
  if (Array.isArray(v)) v = v[0];
  // null/undefined/빈문자열은 기본값
  if (v === null || v === undefined || v === '') return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

const normStr = (v) => (typeof v === 'string' ? v.trim() : '');

export function parseSearchQuery(q = {}) {
  const query = normStr(q.query).slice(0, 100); // 과도한 길이 방지(옵션)
  const page  = Math.max(1, toInt(q.page, 1));
  const size  = Math.min(50, Math.max(1, toInt(q.size, 20)));

  // category 또는 type 둘 다 수용 + 대소문자/한글 매핑 허용
  const raw = normStr(q.category) || normStr(q.type);
  const map = {
    korean: 'Korean', '한식': 'Korean',
    chinese: 'Chinese', '중식': 'Chinese',
    japanese: 'Japanese', '일식': 'Japanese'
  };
  const key = raw.toLowerCase();
  const cat = map[key] || raw; // 이미 영문 정식값이 오면 그대로
  const ALLOWED = new Set(['Korean','Chinese','Japanese']);
  const category = ALLOWED.has(cat) ? cat : undefined;

  return { query, category, page, size };
}

export function parseSuggestQuery(q = {}) {
  const query = normStr(q.query).slice(0, 100);
  const limit = Math.min(20, Math.max(1, toInt(q.limit, 10)));
  return { query, limit };
}
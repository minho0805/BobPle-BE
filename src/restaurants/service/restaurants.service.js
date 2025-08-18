import * as repo from '../repository/restaurants.repository.js';

// 프론트 탭과 매칭되는 카테고리만 허용
const ALLOWED = new Set(['Korean', 'Chinese', 'Japanese']); // 필요시 Western 등 추가

export async function search(q) {
  const query = (q.query || '').trim();
  const page = Math.max(1, Number(q.page || 1));
  const size = Math.min(50, Math.max(1, Number(q.size || 20)));
  const category = (q.category && ALLOWED.has(q.category)) ? q.category : undefined;

  const { items, total } = await repo.search({ query, category, page, size });
  const counts = await repo.counts(query);

  return { items, page, size, total, counts };
}

export async function suggest(q) {
  const query = (q.query || '').trim();
  if (!query) return { items: [] };
  const limit = Math.min(20, Math.max(1, Number(q.limit || 10)));
  const items = await repo.suggest({ query, limit });
  return { items };
}
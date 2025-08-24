// src/events/event/controller/event.controller.js
import { PrismaClient } from '@prisma/client';

// 전역 싱글톤 (개발 중 핫리로드 시 중복 생성 방지)
const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) globalThis.__prisma = prisma;
// 쿼리 파서(내장): page, size, keyword, restaurantId, orderBy
function parseListQuery(q = {}) {
  const page = Math.max(parseInt(q.page ?? '1', 10) || 1, 1);
  const sizeRaw = parseInt(q.size ?? '10', 10) || 10;
  const size = Math.min(Math.max(sizeRaw, 1), 50); // 1~50
  const orderBy = (q.orderBy === 'oldest') ? 'asc' : 'desc';
  const restaurantId = q.restaurantId ? Number(q.restaurantId) : undefined;
  const keyword = (q.keyword ?? '').trim();

  return { page, size, orderBy, restaurantId, keyword };
}

export async function list(req, res, next) {
  try {
    const { page, size, orderBy, restaurantId, keyword } = parseListQuery(req.query);

    const where = {};
    if (restaurantId) where.restaurant_id = restaurantId;
    if (keyword) {
      where.OR = [
        { title:   { contains: keyword } },
        { content: { contains: keyword } },
      ];
    }

    const skip = (page - 1) * size;

    const [items, total] = await Promise.all([
      prisma.events.findMany({
        where,
        orderBy: { id: orderBy },     // 필요시 created_at 등으로 교체
        skip,
        take: size,
      }),
      prisma.events.count({ where }),
    ]);

    return res.json({
      resultType: 'SUCCESS',
      error: null,
      success: {
        page, size, total, items,
      },
    });
  } catch (e) {
    return next(e);
  }
}
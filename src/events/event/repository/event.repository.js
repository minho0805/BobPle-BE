import { PrismaClient } from '../../../generated/prisma/index.js';
const prisma = new PrismaClient();

const toNZInt = (v, d=0) => { const n = Number(v); return Number.isInteger(n) && n >= 0 ? n : d; };

/** 목록 조회 (페이지네이션, 최신순) */
export function findMany(skip = 0, take = 6) {
  const _skip = toNZInt(skip, 0);
  const _take = Math.min(50, Math.max(1, Number(take) || 6)); // 1~50
  return prisma.events.findMany({
    skip: _skip,
    take: _take,
    orderBy: { createdAt: 'desc' },
    include: {
      users: { select: { id: true, nickname: true } }, // creator
      restaurants: true,
      _count: { select: { eventApplications: true } }, // 가벼운 참가자 수
    },
  });
}

/** 전체 개수 */
export function countAll() {
  return prisma.events.count();
}

/** 상세 + 참가자 포함 */
export function findByIdWithParticipants(eventId) {
  const id = Number(eventId);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid eventId');

  return prisma.events.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, nickname: true } }, // creator
      restaurants: true,                                // ✅ 상세에도 식당 포함
      eventApplications: {
        orderBy: { createdAt: 'asc' },                 // ✅ 신청자 정렬
        include: {
          users: { select: { id: true, nickname: true } }, // applicant
        },
      },
    },
  });
}

/** 수정 (화이트리스트) */
export function updateById(eventId, data) {
  const id = Number(eventId);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid eventId');

  const allowed = ['title','content','restaurantId','startAt','endAt','updatedAt'];
  const safe = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));

  return prisma.events.update({
    where: { id },
    data: safe,
  });
}

/** 삭제 (자식 먼저 → 부모) */
export async function deleteById(eventId) {
  const id = Number(eventId);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid eventId');

  return prisma.$transaction(async (tx) => {
    await tx.eventApplications.deleteMany({ where: { eventId: id } });
    await tx.comments.deleteMany({ where: { eventId: id } });
    await tx.chats.deleteMany({ where: { eventId: id } });
    return tx.events.delete({ where: { id } });
  });
}
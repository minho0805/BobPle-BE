// src/events/event/repository/event.repository.js
import { PrismaClient } from "../../../generated/prisma/index.js";

// ✅ PrismaClient 싱글턴(핫리로드/테스트 안전)
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__bobplePrisma ?? new PrismaClient();
if (!globalForPrisma.__bobplePrisma) globalForPrisma.__bobplePrisma = prisma;

/** 숫자 가드 */
function toPosInt(v, def = 0) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : def;
}

/** 목록 조회 (페이지네이션, 최신순) */
export function findMany(skip = 0, take = 6) {
  const _skip = toPosInt(skip, 0);
  const _take = toPosInt(take, 6);

  return prisma.events.findMany({
    skip: _skip,
    take: _take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      restaurantId: true,
      startAt: true,
      endAt: true,
      createdAt: true,
      users: { select: { id: true, nickname: true } }, // 관계명 확인
      restaurants: { select: { id: true, name: true } }, // 관계명 확인
      _count: { select: { eventApplications: true } }, // ⚡ 가볍게 카운트만
    },
  });
}

/** 전체 개수 (findMany와 where 조건 일치시켜야 함) */
export function countAll(/* filters */) {
  return prisma.events.count({
    // where: { ...filters }  // findMany와 동일 조건
  });
}

/** 상세 + 참가자 포함 */
export function findByIdWithParticipants(eventId) {
  const id = Number(eventId);
  if (!Number.isInteger(id) || id <= 0) {
    const e = new Error("Invalid eventId");
    e.status = 400;
    throw e;
  }

  return prisma.events.findUnique({
    where: { id },
    include: {
      // 작성자
      users: { select: { id: true, nickname: true } }, // 관계명이 user면 user로
      // 식당
      restaurants: true, // 관계명이 restaurant면 restaurant로
      // 참가 신청 + 신청자
      eventApplications: {
        orderBy: { createdAt: "asc" },
        include: {
          users: { select: { id: true, nickname: true } }, // 관계명이 user면 user로
        },
      },
    },
  });
}

/** 수정 */
export function updateById(eventId, data) {
  const id = Number(eventId);
  if (!Number.isInteger(id) || id <= 0) {
    const e = new Error("Invalid eventId");
    e.status = 400;
    throw e;
  }
  return prisma.events.update({ where: { id }, data });
}

/** 삭제 */
export function deleteById(eventId) {
  const id = Number(eventId);
  if (!Number.isInteger(id) || id <= 0) {
    const e = new Error("Invalid eventId");
    e.status = 400;
    throw e;
  }
  return prisma.events.delete({ where: { id } });
}

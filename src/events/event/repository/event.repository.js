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
    // ⚠️ 아래 릴레이션명은 schema.prisma와 동일해야 함
    include: {
      users: { select: { id: true, nickname: true } }, // 작성자(creator) 관계명이 users 라면 OK
      restaurants: true, // 식당 관계명이 restaurants 라면 OK
      eventApplications: true, // 참가신청들
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
  if (!Number.isInteger(id) || id <= 0) {
    const e = new Error("Invalid eventId");
    e.status = 400;
    throw e;
  }

  return prisma.events.findUnique({
    where: { id },
    include: {
      // 작성자
      users: { select: { id: true, nickname: true } }, // ← schema가 user(단수)면 여기를 user로 교체
      // 식당
      restaurants: true, // ← schema가 restaurant(단수)면 restaurant로 교체
      // 참가 신청 + 신청자
      eventApplications: {
        orderBy: { createdAt: "asc" },
        include: {
          users: { select: { id: true, nickname: true } }, // ← schema가 user(단수)면 user로 교체
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
  return prisma.events.update({
    where: { id },
    data,
  });
}

/** 삭제 */
export function deleteById(eventId) {
  const id = Number(eventId);
  if (!Number.isInteger(id) || id <= 0) {
    const e = new Error("Invalid eventId");
    e.status = 400;
    throw e;
  }
  return prisma.events.delete({
    where: { id },
  });
}

// src/events/event/repository/event.repository.js
import { PrismaClient } from '../../../generated/prisma/index.js';
const prisma = new PrismaClient();

/** 목록 조회 (페이지네이션, 최신순) */
export function findMany(skip = 0, take = 6) {
  return prisma.events.findMany({
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      users: { select: { id: true, nickname: true } }, // creator
      restaurants: true,
      eventApplications: true,
    },
  });
}

/** 전체 개수 */
export function countAll() {
  return prisma.events.count();
}

/** 상세 + 참가자 포함 */
export function findByIdWithParticipants(eventId) {
  return prisma.events.findUnique({
    where: { id: Number(eventId) },
    include: {
      users: { select: { id: true, nickname: true } }, // creator
      eventApplications: {
        include: {
          users: { select: { id: true, nickname: true } }, // applicant
        },
      },
    },
  });
}

/** 수정 */
export function updateById(eventId, data) {
  return prisma.events.update({
    where: { id: Number(eventId) },
    data,
  });
}

/** 삭제 */
export function deleteById(eventId) {
  return prisma.events.delete({
    where: { id: Number(eventId) },
  });
}
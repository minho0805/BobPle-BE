// src/events/application/repository/application.repository.js
import { PrismaClient } from '../../../generated/prisma/index.js';
const prisma = new PrismaClient();

/** 내부: 트랜잭션 클라이언트 선택 (없으면 기본 prisma) */
const cli = (tx) => tx ?? prisma;

/** (eventId, creatorId) 한 쌍으로 단건 조회 */
export function findOneByPair({ eventId, creatorId }, tx) {
  return cli(tx).eventApplications.findFirst({
    where: { eventId: Number(eventId), creatorId: Number(creatorId) },
  });
}

/** 신청 생성 */
export function create({ eventId, creatorId }, tx) {
  return cli(tx).eventApplications.create({
    data: {
      eventId: Number(eventId),
      creatorId: Number(creatorId),
    },
  });
}

/** (eventId, creatorId) 한 쌍으로 삭제 (멱등, count 반환) */
export function deleteByPair({ eventId, creatorId }, tx) {
  return cli(tx).eventApplications.deleteMany({
    where: { eventId: Number(eventId), creatorId: Number(creatorId) },
  });
}

/** 신청자 기준 목록 조회 (페이지네이션) */
export function findByApplicant({ creatorId, skip = 0, take = 10 }, tx) {
  return cli(tx).eventApplications.findMany({
    where: { creatorId: Number(creatorId) },
    skip: Math.max(0, Number(skip) || 0),
    take: Math.min(50, Math.max(1, Number(take) || 10)),
    orderBy: { createdAt: 'desc' },
    include: {
      // 신청 레코드의 유저(본인)
      users: { select: { id: true, nickname: true } },
      // 연결된 이벤트 정보(호스트/식당 포함하면 프론트가 바로 쓰기 편함)
      events: {
        include: {
          users: { select: { id: true, nickname: true } }, // host
          restaurants: true,
          _count: { select: { eventApplications: true } },
        },
      },
    },
  });
}

/** 신청자 기준 총 개수 */
export function countByApplicant({ creatorId }, tx) {
  return cli(tx).eventApplications.count({
    where: { creatorId: Number(creatorId) },
  });
}

/** applicationId로 단건 조회 (스펙: 취소용) */
export function findById(id, tx) {
  return cli(tx).eventApplications.findUnique({
    where: { id: Number(id) },
  });
}

/** applicationId로 삭제 (멱등, count 반환) */
export function deleteById(id, tx) {
  return cli(tx).eventApplications.deleteMany({
    where: { id: Number(id) },
  });
}
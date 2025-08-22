// src/events/application/repository/application.repository.js
import { PrismaClient } from '../../../generated/prisma'; // ⚠️ 경로는 프로젝트 구조에 맞게 조정
const prisma = new PrismaClient();

// 한 유저가 특정 이벤트에 신청했는지 조회
export function findOneByPair({ event_id, applicant_id }) {
  return prisma.eventApplications.findFirst({
    where: {
      eventId: event_id,
      creatorId: applicant_id, // 신청자 = creatorId (스키마 그대로)
    },
    include: {
      events: true, // 신청 대상 이벤트
      users: true,  // 신청자
    },
  });
}

// 신청 생성
export function create({ event_id, applicant_id }) {
  return prisma.eventApplications.create({
    data: {
      eventId: event_id,
      creatorId: applicant_id,
    },
  });
}

// 신청 삭제 (복수 가능성을 고려하여 deleteMany)
export function deleteByPair({ event_id, applicant_id }) {
  return prisma.eventApplications.deleteMany({
    where: {
      eventId: event_id,
      creatorId: applicant_id,
    },
  });
}

// 내가 신청한 목록 (페이지네이션)
export function findByApplicant({ applicant_id, skip = 0, take = 10 }) {
  return prisma.eventApplications.findMany({
    where: { creatorId: applicant_id },
    include: {
      events: true,
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
}

export function countByApplicant({ applicant_id }) {
  return prisma.eventApplications.count({
    where: { creatorId: applicant_id },
  });
}
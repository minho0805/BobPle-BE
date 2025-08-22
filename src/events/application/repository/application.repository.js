// src/events/application/repository/application.repository.js
import { PrismaClient } from '../../../generated/prisma/index.js';
const prisma = new PrismaClient();

const toInt = (v, def=0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

/* 이벤트(밥약) 단건 조회 */
export const findEventById = (id) =>
  prisma.events.findUnique({ where: { id: toInt(id) } }); // 모델명 확인 필요 (events vs event)

/* 특정 이벤트에서 내가 낸 신청 찾기 */
export const findMyApplicationForEvent = (eventId, userId) =>
  prisma.eventApplications.findFirst({
    where: { eventId: toInt(eventId), creatorId: toInt(userId) },
  });

/* 이벤트에 신청 생성 (P2002 중복키 처리 권장: 서비스에서 try/catch) */
export const createApplication = (eventId, userId) =>
  prisma.eventApplications.create({
    data: { eventId: toInt(eventId), creatorId: toInt(userId) },
  });

/* 신청 아이디로 단일 신청 찾기 */
export const findApplicationById = (id) =>
  prisma.eventApplications.findUnique({ where: { id: toInt(id) } });

/* 신청 아이디로 신청 삭제 
   - 보안 강화 버전: 사용자 본인 것만 삭제 (creatorId 검사)
   - 복합 where가 불가하면 아래처럼 두 단계로 처리하거나, schema에 @@unique([id, creatorId]) 혹은 @@index 후 transaction으로 검증하세요.
*/
export const deleteApplication = async (id, userId) => {
  // 1) 소유권 확인
  const app = await prisma.eventApplications.findUnique({
    where: { id: toInt(id) },
    select: { id: true, creatorId: true },
  });
  if (!app) return null;
  if (app.creatorId !== toInt(userId)) {
    const err = new Error('FORBIDDEN');
    err.statusCode = 403;
    throw err;
  }
  // 2) 삭제
  return prisma.eventApplications.delete({ where: { id: app.id } });
};

/* 내가 낸 신청 목록 (페이징) + 이벤트 정보 포함 */
export const listMyApplications = (userId, skip, take) =>
  prisma.eventApplications.findMany({
    where: { creatorId: toInt(userId) },
    include: { events: true }, // 리레이션 필드명 확인 (events vs event)
    orderBy: { id: 'desc' },
    skip: Math.max(0, toInt(skip)),
    take: Math.max(1, toInt(take, 10)),
  });

/* 내가 낸 신청 개수 */
export const countMyApplications = (userId) =>
  prisma.eventApplications.count({ where: { creatorId: toInt(userId) } });
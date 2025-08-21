import client from '../../generated/prisma/index.js'; // 파일 위치에 맞춰 경로 조정
const { PrismaClient } = client;

const prisma = new PrismaClient();
/* 아이디로 이벤트(밥약) 찾기 
*/
export const findEvent = (id) =>
  prisma.events.findUnique({ where: { id: Number(id) } });

/* 특정 이벤트에서 내가 낸 신청(밥약 신청) 찾기 */
export const findMyAppForEvent = (eventId, userId) =>
  prisma.eventApplications.findFirst({
    where: { eventId: Number(eventId), creatorId: Number(userId) },
  });

/* 이벤트에 신청(밥약 신청) 생성하기 */
export const createApp = (eventId, userId) =>
  prisma.eventApplications.create({
    data: { eventId: Number(eventId), creatorId: Number(userId) },
  });

/* 신청 아이디로 단일 신청 찾기 */
export const findAppById = (id) =>
  prisma.eventApplications.findUnique({ where: { id: Number(id) } });

/* 신청 아이디로 신청 삭제하기 */
export const deleteAppById = (id) =>
  prisma.eventApplications.delete({ where: { id: Number(id) } });

/* 내가 낸 신청 전체 목록 가져오기 (페이징 지원: skip, take)
   - 해당 신청과 연결된 이벤트(events) 정보도 함께 포함 */
export const listMine = (userId, skip, take) =>
  prisma.eventApplications.findMany({
    where: { creatorId: Number(userId) },
    include: { events: true },
    orderBy: { id: 'desc' }, // 최신순
    skip, 
    take,
  });

/* 내가 낸 신청 개수 세기 */
export const countMine = (userId) =>
  prisma.eventApplications.count({ where: { creatorId: Number(userId) } });
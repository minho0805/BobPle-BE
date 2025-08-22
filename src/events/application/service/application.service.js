// src/events/application/service/application.service.js
import * as appRepo from '../repository/application.repository.js';
import { PrismaClient } from '../../../generated/prisma'; // 경로 확인
const prisma = new PrismaClient();

/**
 * 신청 생성
 * - creatorId(=신청자) = req.user.id
 * - eventId            = path param
 * - 자기 글에는 신청 불가
 * - 중복 신청 방지
 */
export async function apply(eventId, user) {
  const creatorId = user?.id; // 신청자
  const evIdNum = Number(eventId);

  if (!Number.isFinite(evIdNum)) throw new Error('INVALID_EVENT_ID');
  if (!creatorId) throw new Error('UNAUTHORIZED');

  // 이벤트 확인
  const ev = await prisma.events.findUnique({ where: { id: evIdNum } });
  if (!ev) throw new Error('EVENT_NOT_FOUND');
  if (ev.creatorId === creatorId) throw new Error('CANNOT_APPLY_OWN_EVENT');

  // 중복 신청 체크
  const exists = await appRepo.findOneByPair({ eventId: evIdNum, creatorId });
  if (exists) return exists;

  // 생성
  return appRepo.create({ eventId: evIdNum, creatorId });
}

/**
 * 신청 취소
 * - 기본: 본인(req.user.id) 취소
 * - 옵션: :creator_id 가 숫자면, 이벤트 호스트가 해당 신청자 취소 (호스트 권한 필요)
 */
export async function cancel(eventId, creatorIdParam, user) {
  const me = user?.id;
  const evIdNum = Number(eventId);

  if (!Number.isFinite(evIdNum)) throw new Error('INVALID_EVENT_ID');
  if (!me) throw new Error('UNAUTHORIZED');

  const ev = await prisma.events.findUnique({ where: { id: evIdNum } });
  if (!ev) throw new Error('EVENT_NOT_FOUND');

  // 취소 대상 신청자 결정
  let targetCreatorId;
  if (!creatorIdParam || creatorIdParam === 'me') {
    targetCreatorId = me;
  } else {
    const parsed = Number(creatorIdParam);
    if (!Number.isFinite(parsed)) throw new Error('INVALID_APPLICANT_ID');
    if (ev.creatorId !== me) throw new Error('FORBIDDEN'); // 호스트만 타 유저 취소
    targetCreatorId = parsed;
  }

  const result = await appRepo.deleteByPair({ eventId: evIdNum, creatorId: targetCreatorId });
  return { deleted: result.count ?? 0 };
}

/**
 * 내가 신청한 목록
 * - 페이지네이션: ?page=1&size=10
 */
export async function mine(user, query = {}) {
  const creatorId = user?.id; // 신청자
  if (!creatorId) throw new Error('UNAUTHORIZED');

  const page = Math.max(1, Number(query.page) || 1);
  const size = Math.min(50, Math.max(1, Number(query.size) || 10));
  const skip = (page - 1) * size;
  const take = size;

  const [items, total] = await Promise.all([
    appRepo.findByApplicant({ creatorId, skip, take }),
    appRepo.countByApplicant({ creatorId }),
  ]);

  return { page, size, total, items };
}
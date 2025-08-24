import * as appRepo from '../repository/application.repository.js';
import { PrismaClient } from '../../../generated/prisma/index.js';
const prisma = new PrismaClient();

function toPosInt(n) { const v = Number(n); return Number.isInteger(v) && v > 0 ? v : NaN; }
const err = (msg, status) => Object.assign(new Error(msg), { status });

/** 밥약 신청 생성 */
export async function apply(eventId, user) {
  const creatorId = toPosInt(user?.id);
  const evId = toPosInt(eventId);

  if (!evId) throw err('INVALID_EVENT_ID', 400);
  if (!creatorId) throw err('UNAUTHORIZED', 401);

  const ev = await prisma.events.findUnique({ where: { id: evId } });
  if (!ev) throw err('EVENT_NOT_FOUND', 404);
  if (ev.creatorId === creatorId) throw err('CANNOT_APPLY_OWN_EVENT', 400);

  // 경쟁조건 방지: 확인+생성 트랜잭션
  return prisma.$transaction(async (tx) => {
    const exists = await appRepo.findOneByPair({ eventId: evId, creatorId }, tx);
    if (exists) return exists;
    return appRepo.create({ eventId: evId, creatorId }, tx);
  });
}

/** 밥약 신청 취소 (기존: me 또는 creatorId) */
export async function cancel(eventId, creatorIdParam, user) {
  const me = toPosInt(user?.id);
  const evId = toPosInt(eventId);

  if (!evId) throw err('INVALID_EVENT_ID', 400);
  if (!me) throw err('UNAUTHORIZED', 401);

  const ev = await prisma.events.findUnique({ where: { id: evId } });
  if (!ev) throw err('EVENT_NOT_FOUND', 404);

  // 취소 대상 결정
  let targetCreatorId;
  if (!creatorIdParam || creatorIdParam === 'me') {
    targetCreatorId = me;
  } else {
    const parsed = toPosInt(creatorIdParam);
    if (!parsed) throw err('INVALID_APPLICANT_ID', 400);
    if (ev.creatorId !== me) throw err('FORBIDDEN', 403); // 호스트만 타 유저 취소
    targetCreatorId = parsed;
  }

  const result = await appRepo.deleteByPair({ eventId: evId, creatorId: targetCreatorId });
  return { deleted: result.count ?? 0 }; // 멱등 유지
}

/** 내가 신청한 밥약 리스트 */
export async function mine(user, query = {}) {
  const creatorId = toPosInt(user?.id);
  if (!creatorId) throw err('UNAUTHORIZED', 401);

  const page = Math.max(1, toPosInt(query.page) || 1);
  const size = Math.min(50, Math.max(1, toPosInt(query.size) || 10));
  const skip = (page - 1) * size;
  const take = size;

  const [items, total] = await Promise.all([
    appRepo.findByApplicant({ creatorId, skip, take }),
    appRepo.countByApplicant({ creatorId }),
  ]);

  return { page, size, total, items };
}

/** 🔸 스펙용: applicationId 기반 취소
 * DELETE /events/:eventId/application/:applicationId/cancel
 * 권한: 호스트(ev.creatorId) 또는 본인(app.creatorId)만 가능
 */
export async function cancelByApplicationId(eventId, applicationId, user) {
  const evId = toPosInt(eventId);
  const appId = toPosInt(applicationId);
  const me = toPosInt(user?.id);

  if (!evId) throw err('INVALID_EVENT_ID', 400);
  if (!appId) throw err('INVALID_APPLICATION_ID', 400);
  if (!me) throw err('UNAUTHORIZED', 401);

  const ev = await prisma.events.findUnique({ where: { id: evId } });
  if (!ev) throw err('EVENT_NOT_FOUND', 404);

  const app = await appRepo.findById(appId);
  if (!app || app.eventId !== evId) throw err('APPLICATION_NOT_FOUND', 404);

  if (ev.creatorId !== me && app.creatorId !== me) throw err('FORBIDDEN', 403);

  const result = await appRepo.deleteById(appId);
  return { deleted: result.count ?? (result ? 1 : 0) };
}
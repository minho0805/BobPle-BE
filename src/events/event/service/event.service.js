import {
  findByIdWithParticipants,
  findMany,
  countAll,
  updateById,
  deleteById,
} from "../repository/event.repository.js";

const buildChatUrl = (ev) => `/chats/event/${ev.id}`;

/**
 * 목록 조회
 * q.page, q.size(또는 q.limit) 지원
 */
export async function list(q) {
  const page = Number(q?.page ?? 1);
  const size = Number(q?.size ?? q?.limit ?? 10);

  const [items, total] = await Promise.all([
    findMany((page - 1) * size, size),
    countAll(),
  ]);

  // 응답 필드 일관(스네이크) + 부족한 값 가드
  const mapped = items.map((ev) => ({
    id: ev.id,
    title: ev.title,
    content: ev.content ?? null,
    restaurant_id: ev.restaurantId ?? ev.restaurant_id ?? null,
    start_at: ev.startAt ?? ev.start_at ?? null,
    end_at: ev.endAt ?? ev.end_at ?? null,
    chatUrl: buildChatUrl(ev),
  }));

  return { items: mapped, page, size, total };
}

/**
 * 상세 조회
 */
export async function detail(eventId) {
  const ev = await findByIdWithParticipants(eventId);
  if (!ev) throw new Error("not found");

  const participantsSrc = ev.eventApplications || ev.applications || [];
  const participants = participantsSrc.map((a) => ({
    id: a.users?.id ?? a.user?.id ?? null,
    nickname: a.users?.nickname ?? a.user?.nickname ?? null,
    applicationId: a.id,
  }));

  const creatorId =
    ev.creatorId ?? ev.userId ?? ev.users?.id ?? ev.user?.id ?? null;
  const creatorNickname = ev.users?.nickname ?? ev.user?.nickname ?? null;

  return {
    id: ev.id,
    title: ev.title,
    content: ev.content ?? null,
    restaurant_id: ev.restaurantId ?? ev.restaurant_id ?? null,
    start_at: ev.startAt ?? ev.start_at ?? null,
    end_at: ev.endAt ?? ev.end_at ?? null,
    creator: { id: creatorId, nickname: creatorNickname },
    participants_count: participants.length,
    participants,
    chatUrl: buildChatUrl(ev),
  };
}

/**
 * 수정
 */
export async function edit(eventId, patch, me) {
  const ev = await findByIdWithParticipants(eventId);
  if (!ev) throw new Error("not found");

  const creatorId = ev.creatorId ?? ev.userId ?? ev.users?.id ?? ev.user?.id;
  if (!me || creatorId !== me.id) {
    const err = new Error("FORBIDDEN");
    err.status = 403;
    throw err;
  }

  const allowed = {};
  if (patch.title !== undefined) allowed.title = patch.title;
  if (patch.content !== undefined) allowed.content = patch.content;
  if (patch.restaurantId !== undefined)
    allowed.restaurantId = Number(patch.restaurantId);
  if (patch.startAt !== undefined) allowed.startAt = patch.startAt;
  if (patch.endAt !== undefined) allowed.endAt = patch.endAt;

  const updated = await updateById(eventId, allowed);
  return { ...updated, chatUrl: buildChatUrl(updated) };
}

/**
 * 취소(삭제)
 */
export async function cancel(eventId, me) {
  const ev = await findByIdWithParticipants(eventId);
  if (!ev) throw new Error("not found");

  const creatorId = ev.creatorId ?? ev.userId ?? ev.users?.id ?? ev.user?.id;
  if (!me || creatorId !== me.id) {
    const err = new Error("FORBIDDEN");
    err.status = 403;
    throw err;
  }

  const id = Number(eventId);
  await deleteById(id);
  return { id, canceled: true };
}

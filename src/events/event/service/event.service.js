// src/events/event/service/event.service.js
import {
  findByIdWithParticipants,
  findMany,
  countAll,
  updateById,
  deleteById,
} from "../repository/event.repository.js";

const buildChatUrl = (ev) => `/chats/event/${ev.id}`;

/** 숫자 가드 */
function toIntSafe(v, def) {
  const n = parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) ? n : def;
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * 목록 조회
 * - creator/restaurant 객체 유지 + 호환 평탄 필드 동시 제공
 */
export async function list(q) {
  const pageRaw = q?.page ?? 1;
  const sizeRaw = q?.size ?? q?.limit ?? 12;

  const page = clamp(toIntSafe(pageRaw, 1), 1, 10_000);
  const size = clamp(toIntSafe(sizeRaw, 12), 1, 50);

  const [rows, total] = await Promise.all([
    findMany((page - 1) * size, size),
    countAll(),
  ]);

  const items = rows.map((ev) => {
    const restaurantObj = ev.restaurant
      ? { id: ev.restaurant.id, name: ev.restaurant.name }
      : ev.restaurants
        ? { id: ev.restaurants.id, name: ev.restaurants.name }
        : null;

    const creatorObj = ev.creator
      ? { id: ev.creator.id, nickname: ev.creator.nickname }
      : ev.user
        ? { id: ev.user.id, nickname: ev.user.nickname }
        : ev.users
          ? { id: ev.users.id, nickname: ev.users.nickname }
          : null;

    const restaurantIdCompat =
      restaurantObj?.id ?? ev.restaurantId ?? ev.restaurant_id ?? null;
    const creatorIdCompat =
      creatorObj?.id ??
      ev.creatorId ??
      ev.userId ??
      ev.creator_id ??
      ev.user_id ??
      null;

    const start_at = ev.startAt ?? ev.start_at ?? null;
    const end_at = ev.endAt ?? ev.end_at ?? null;
    const participants_count =
      ev.participants_count ??
      ev.participantsCount ??
      (Array.isArray(ev.participants) ? ev.participants.length : 0);

    return {
      id: ev.id,
      title: ev.title,
      content: ev.content ?? null,
      chatUrl: buildChatUrl(ev),

      creator: creatorObj,
      restaurant: restaurantObj,

      creatorId: creatorIdCompat,
      creator_id: creatorIdCompat,
      restaurantId: restaurantIdCompat,
      restaurant_id: restaurantIdCompat,

      start_at,
      end_at,
      startAt: start_at,
      endAt: end_at,
      participants_count,
      participantsCount: participants_count,
    };
  });

  return {
    items,
    page,
    size,
    total,
    totalPages: Math.max(1, Math.ceil(total / size)),
    hasNext: page * size < total,
    hasPrev: page > 1,
  };
}

/**
 * 상세 조회
 */
export async function detail(eventId) {
  const ev = await findByIdWithParticipants(eventId);
  if (!ev) {
    const err = new Error("not found");
    err.status = 404;
    throw err;
  }

  const participantsSrc =
    ev.eventApplications || ev.applications || ev.participants || [];
  const participants = participantsSrc.map((a) => ({
    id: a.users?.id ?? a.user?.id ?? null,
    nickname: a.users?.nickname ?? a.user?.nickname ?? null,
    applicationId: a.id ?? null,
  }));

  const creatorObj = ev.creator
    ? { id: ev.creator.id, nickname: ev.creator.nickname }
    : ev.user
      ? { id: ev.user.id, nickname: ev.user.nickname }
      : ev.users
        ? { id: ev.users.id, nickname: ev.users.nickname }
        : { id: ev.creatorId ?? ev.userId ?? null, nickname: null };

  const restaurantObj = ev.restaurant
    ? { id: ev.restaurant.id, name: ev.restaurant.name }
    : ev.restaurants
      ? { id: ev.restaurants.id, name: ev.restaurants.name }
      : { id: ev.restaurantId ?? ev.restaurant_id ?? null, name: null };

  const restaurant_id = restaurantObj.id ?? null;
  const start_at = ev.startAt ?? ev.start_at ?? null;
  const end_at = ev.endAt ?? ev.end_at ?? null;

  return {
    id: ev.id,
    title: ev.title,
    content: ev.content ?? null,
    chatUrl: buildChatUrl(ev),

    creator: creatorObj,
    restaurant: restaurantObj,

    restaurant_id,
    restaurantId: restaurant_id,
    start_at,
    end_at,
    startAt: start_at,
    endAt: end_at,

    participants_count: participants.length,
    participants,
    participantsCount: participants.length,
  };
}

/* ───────── 추가: 수정 ───────── */
export async function edit(eventId, patch, me) {
  const ev = await findByIdWithParticipants(eventId);
  if (!ev) {
    const err = new Error("not found");
    err.status = 404;
    throw err;
  }

  const creatorId = ev.creatorId ?? ev.userId ?? ev.users?.id ?? ev.user?.id;
  if (!me || creatorId !== me.id) {
    const err = new Error("FORBIDDEN");
    err.status = 403;
    throw err;
  }

  const allowed = {};
  if (patch.title !== undefined) allowed.title = String(patch.title);
  if (patch.content !== undefined) allowed.content = patch.content ?? null;
  if (patch.restaurantId !== undefined)
    allowed.restaurantId = Number(patch.restaurantId);
  if (patch.startAt !== undefined) allowed.startAt = patch.startAt; // ISO 권장
  if (patch.endAt !== undefined) allowed.endAt = patch.endAt;

  const updated = await updateById(eventId, allowed);

  const restaurant_id = updated.restaurantId ?? updated.restaurant_id ?? null;
  const start_at = updated.startAt ?? updated.start_at ?? null;
  const end_at = updated.endAt ?? updated.end_at ?? null;

  return {
    ...updated,
    chatUrl: buildChatUrl(updated),
    restaurant_id,
    start_at,
    end_at,
    restaurantId: restaurant_id,
    startAt: start_at,
    endAt: end_at,
  };
}

/* ───────── 추가: 취소(삭제) ───────── */
export async function cancel(eventId, me) {
  const ev = await findByIdWithParticipants(eventId);
  if (!ev) {
    const err = new Error("not found");
    err.status = 404;
    throw err;
  }

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

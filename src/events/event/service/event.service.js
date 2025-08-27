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
 * - q.page, q.size(또는 q.limit) 지원
 * - page/size 안전 가드 + 최대 50 제한
 * - FE 호환을 위해 snake_case와 camelCase를 동시에 내려줌(점진적 마이그레이션)
 */
export async function list(q) {
  const pageRaw = q?.page ?? 1;
  const sizeRaw = q?.size ?? q?.limit ?? 12;

  const page = clamp(toIntSafe(pageRaw, 1), 1, 10_000);
  const size = clamp(toIntSafe(sizeRaw, 12), 1, 50);

  const [items, total] = await Promise.all([
    findMany((page - 1) * size, size),
    countAll(), // ⚠️ 여기 where 필터가 있다면 findMany와 동일 조건을 꼭 사용하세요.
  ]);

  const mapped = items.map((ev) => {
    const restaurant_id = ev.restaurantId ?? ev.restaurant_id ?? null;
    const start_at = ev.startAt ?? ev.start_at ?? null;
    const end_at = ev.endAt ?? ev.end_at ?? null;
    const participants_count =
      ev.participants_count ??
      ev.participantsCount ??
      (Array.isArray(ev.participants) ? ev.participants.length : 0);

    // ✅ 호환용: snake_case + camelCase를 같이 내려줌
    return {
      // 공통/기본
      id: ev.id,
      title: ev.title,
      content: ev.content ?? null,
      chatUrl: buildChatUrl(ev),

      // snake_case
      restaurant_id,
      start_at,
      end_at,
      participants_count,

      // camelCase (FE에 이 키를 쓰는 코드가 있다면 바로 작동)
      restaurantId: restaurant_id,
      startAt: start_at,
      endAt: end_at,
      participantsCount: participants_count,
    };
  });

  return {
    items: mapped,
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
 * - 참가자/작성자 필드 안전 추출
 * - 목록과 동일하게 snake/camel 모두 제공
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

  const creatorId =
    ev.creatorId ?? ev.userId ?? ev.users?.id ?? ev.user?.id ?? null;
  const creatorNickname = ev.users?.nickname ?? ev.user?.nickname ?? null;

  const restaurant_id = ev.restaurantId ?? ev.restaurant_id ?? null;
  const start_at = ev.startAt ?? ev.start_at ?? null;
  const end_at = ev.endAt ?? ev.end_at ?? null;

  return {
    id: ev.id,
    title: ev.title,
    content: ev.content ?? null,
    chatUrl: buildChatUrl(ev),

    // snake_case
    restaurant_id,
    start_at,
    end_at,
    creator: { id: creatorId, nickname: creatorNickname },
    participants_count: participants.length,
    participants,

    // camelCase
    restaurantId: restaurant_id,
    startAt: start_at,
    endAt: end_at,
    participantsCount: participants.length,
  };
}

/**
 * 수정
 * - 허용 필드만 반영
 * - ISO 문자열/숫자 변환 유의
 */
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
  if (patch.startAt !== undefined) allowed.startAt = patch.startAt; // ISO string 권장
  if (patch.endAt !== undefined) allowed.endAt = patch.endAt; // ISO string 권장

  const updated = await updateById(eventId, allowed);

  // 응답도 호환 키 동시 제공
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

/**
 * 취소(삭제)
 */
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

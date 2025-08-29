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
 * - creator/restaurant 객체를 유지해서 FE가 닉네임/장소명을 바로 쓸 수 있게 함
 * - 동시에 구버전 호환을 위해 상위 id 필드도 같이 내려줌
 */
export async function list(q) {
  const pageRaw = q?.page ?? 1;
  const sizeRaw = q?.size ?? q?.limit ?? 12;

  const page = clamp(toIntSafe(pageRaw, 1), 1, 10_000);
  const size = clamp(toIntSafe(sizeRaw, 12), 1, 50);

  const [rows, total] = await Promise.all([
    // ⚠️ findMany가 반드시 creator/restaurant를 include하도록 repository에서 보장해야 합니다.
    //    (아래에 repo 체크리스트 첨부)
    findMany((page - 1) * size, size),
    countAll(),
  ]);

  const items = rows.map((ev) => {
    // repo가 조인해준 객체 우선 사용 (백업으로 다양한 필드명 대응)
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

    // 호환용 상위 id (가능한 모든 후보에서 뽑아서 채움)
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

      // ✅ 객체 그대로 제공 (FE에서 e.creator?.nickname, e.restaurant?.name 사용 가능)
      creator: creatorObj,
      restaurant: restaurantObj,

      // ✅ 호환용 평탄 필드(점진 마이그레이션)
      creatorId: creatorIdCompat,
      creator_id: creatorIdCompat,
      restaurantId: restaurantIdCompat,
      restaurant_id: restaurantIdCompat,

      // 날짜/참가자 (snake + camel 동시 제공)
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
 * - 목록과 동일하게 creator/restaurant 객체 + 호환 필드 제공
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

  // creator/restaurant 객체 구성 (여러 필드명 대응)
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

    // 객체
    creator: creatorObj,
    restaurant: restaurantObj,

    // 호환 필드
    restaurant_id,
    restaurantId: restaurant_id,
    start_at,
    end_at,
    startAt: start_at,
    endAt: end_at,

    // 참가자
    participants_count: participants.length,
    participants,
    participantsCount: participants.length,
  };
}

/*
 * 밥약 수정/취소는 기존 그대로 (필요한 경우만 평탄/객체 동시 유지)
 */

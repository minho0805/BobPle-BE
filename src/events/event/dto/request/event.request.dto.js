// src/events/event/dto/request/event.request.dto.js
const toPosInt = (v, def = 0) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : def;
};

export function parseListQuery(query) {
  const page = Math.max(1, toPosInt(query.page, 1));
  const size = Math.min(50, Math.max(1, toPosInt(query.size, 10)));
  return { page, size };
}

export function parseEventIdParam(params) {
  const eventId = toPosInt(params.eventId, NaN);
  if (!Number.isFinite(eventId)) {
    const err = new Error('Invalid eventId');
    err.status = 400;
    throw err;
  }
  return { eventId };
}

export function parseEditBody(body) {
  const out = {};

  if (body.title !== undefined) out.title = String(body.title).trim();
  if (body.content !== undefined) out.content = String(body.content).trim();

  if (body.restaurantId !== undefined) {
    const n = toPosInt(body.restaurantId, NaN);
    if (!Number.isFinite(n)) {
      const err = new Error('Invalid restaurantId');
      err.status = 400; throw err;
    }
    out.restaurantId = n;
  }

  let startAtDate, endAtDate;

  if (body.startAt !== undefined) {
    startAtDate = new Date(body.startAt);
    if (Number.isNaN(startAtDate.getTime())) {
      const err = new Error('Invalid startAt');
      err.status = 400; throw err;
    }
    out.startAt = startAtDate;
  }

  if (body.endAt !== undefined) {
    endAtDate = new Date(body.endAt);
    if (Number.isNaN(endAtDate.getTime())) {
      const err = new Error('Invalid endAt');
      err.status = 400; throw err;
    }
    out.endAt = endAtDate;
  }

  // ✅ 서로 관계 검증 (둘 다 있을 때만)
  if (startAtDate && endAtDate && endAtDate <= startAtDate) {
    const err = new Error('endAt must be after startAt');
    err.status = 400; throw err;
  }

  if (body.maxParticipants !== undefined) {
    const n = toPosInt(body.maxParticipants, NaN);
    if (!Number.isFinite(n)) {
      const err = new Error('Invalid maxParticipants');
      err.status = 400; throw err;
    }
    out.maxParticipants = n; // 응답용
  }

  // ⚠️ 스키마에 없는 필드는 무시 (또는 에러로 처리)
  // if (body.status !== undefined) { ... } // Events에 없음 → 제거

  return out;
}
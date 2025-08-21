// src/events/event/dto/request/event.request.dto.js
const toInt = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function parseListQuery(query) {
  const page = Math.max(1, toInt(query.page, 1));
  const size = Math.min(50, Math.max(1, toInt(query.size, 10)));
  return { page, size };
}

export function parseEventIdParam(params) {
  const eventId = toInt(params.eventId, NaN);
  if (!Number.isFinite(eventId) || eventId <= 0) {
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
    const n = toInt(body.restaurantId, NaN);
    if (!Number.isFinite(n) || n <= 0) {
      const err = new Error('Invalid restaurantId');
      err.status = 400; throw err;
    }
    out.restaurantId = n;
  }

  if (body.startAt !== undefined) {
    const d = new Date(body.startAt);
    if (Number.isNaN(d.getTime())) {
      const err = new Error('Invalid startAt');
      err.status = 400; throw err;
    }
    out.startAt = d; // Date 그대로 (service에서 그대로 저장)
  }
  if (body.endAt !== undefined) {
    const d = new Date(body.endAt);
    if (Number.isNaN(d.getTime())) {
      const err = new Error('Invalid endAt');
      err.status = 400; throw err;
    }
    out.endAt = d;
  }

  if (body.maxParticipants !== undefined) {
    const n = toInt(body.maxParticipants, NaN);
    if (!Number.isFinite(n) || n <= 0) {
      const err = new Error('Invalid maxParticipants');
      err.status = 400; throw err;
    }
    out.maxParticipants = n; // DB에 없으면 응답용으로만 활용 가능
  }

  if (body.status !== undefined) out.status = String(body.status);
  return out;
}
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
  if (body.restaurantName !== undefined) out.restaurantName = String(body.restaurantName).trim();

  if (body.startAt !== undefined) {
    const d = new Date(body.startAt);
    if (Number.isNaN(d.getTime())) {
      const err = new Error('Invalid startAt');
      err.status = 400;
      throw err;
    }
    out.startAt = d.toISOString();
  }
  if (body.endAt !== undefined) {
    const d = new Date(body.endAt);
    if (Number.isNaN(d.getTime())) {
      const err = new Error('Invalid endAt');
      err.status = 400;
      throw err;
    }
    out.endAt = d.toISOString();
  }
  if (body.maxParticipants !== undefined) {
    const n = toInt(body.maxParticipants, NaN);
    if (!Number.isFinite(n) || n <= 0) {
      const err = new Error('Invalid maxParticipants');
      err.status = 400;
      throw err;
    }
    out.maxParticipants = n;
  }
  if (body.status !== undefined) out.status = String(body.status);
  return out;
}
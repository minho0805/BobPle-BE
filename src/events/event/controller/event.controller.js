// GET /api/events
export async function list(req, res, next) {
  try {
    const dto = parseListQuery(req.query);
    const events = await svc.list(dto);
    return res.success(events, StatusCodes.OK);
  } catch (e) { next(e); }
}

// GET /api/events/:eventId
export async function detail(req, res, next) {
  try {
    const { eventId } = parseEventIdParam(req.params);
    const event = await svc.detail(eventId);
    return res.success(event, StatusCodes.OK);
  } catch (e) { next(e); }
}

// PATCH /api/events/:eventId   ← /edit suffix 제거 권장
export async function edit(req, res, next) {
  try {
    const { eventId } = parseEventIdParam(req.params);
    const body = parseEditBody(req.body);
    const updatedEvent = await svc.edit(eventId, body, req.user);
    return res.success(updatedEvent, StatusCodes.OK);
  } catch (e) { next(e); }
}

// PATCH /api/events/:eventId/cancel   ← POST → PATCH 권장
export async function cancel(req, res, next) {
  try {
    const { eventId } = parseEventIdParam(req.params);
    const result = await svc.cancel(eventId, req.user);
    return res.success(result, StatusCodes.OK);
  } catch (e) { next(e); }
}
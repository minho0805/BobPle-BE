// src/events/router/events.router.js
import { Router } from "express";
import { list, detail, edit, cancel } from "../event/service/event.service.js";

const r = Router();

/* 헬스체크 */
r.get("/_ping", (_req, res) => res.json({ ok: true, where: "/api/events" }));

/* 공통 로그 */
r.use((req, _res, next) => {
  console.log("[EVENTS] hit", req.method, req.originalUrl);
  next();
});

/* ────────────── 유틸 ────────────── */
const toPosInt = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
};

function onlyDigits404(req, res, next) {
  const { eventId } = req.params;
  if (!/^\d+$/.test(eventId)) {
    return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  }
  next();
}

function parseEventId(req, _res, next) {
  const id = Number(req.params.eventId);
  if (!Number.isInteger(id) || id <= 0) {
    const e = new Error("Invalid eventId");
    e.status = 404;
    return next(e);
  }
  req.eventId = id;
  next();
}

/* ────────────── 라우트 ────────────── */
/** GET /api/events */
r.get("/", async (req, res, next) => {
  try {
    const page = toPosInt(req.query.page, 1);
    const size = Math.min(50, toPosInt(req.query.size ?? req.query.limit, 12));
    const search = (req.query.search ?? "").trim();

    console.log("[HIT] GET /api/events", { page, size, search });

    const result = await list({ ...req.query, page, size, search });

    return res.status(200).json({
      ok: true,
      data: {
        items: result.items ?? [],
        pagination: {
          page: result.page ?? page,
          size: result.size ?? size,
          total: result.total ?? 0,
          totalPages: Math.max(
            1,
            Math.ceil((result.total ?? 0) / (result.size ?? size)),
          ),
          hasNext:
            (result.page ?? page) * (result.size ?? size) < (result.total ?? 0),
          hasPrev: (result.page ?? page) > 1,
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

/** GET /api/events/:eventId */
r.get("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await detail(req.eventId);
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    if (e.status === 404)
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    next(e);
  }
});

/** PUT /api/events/:eventId */
r.put("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await edit(req.eventId, req.body, req.user);
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/events/:eventId */
r.delete("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await cancel(req.eventId, req.user);
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

/* 이 라우터 하위에서만 404 */
r.use((_req, res) => res.status(404).json({ ok: false, error: "NOT_FOUND" }));

export default r;

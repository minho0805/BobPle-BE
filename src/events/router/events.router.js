import { Router } from "express";
import { list, detail, edit, cancel } from "../event/service/event.service.js";

const r = Router();

router.get("/api/events", (req, res) => {
  res.status(200).json({
    ok: true,
    via: "top-level router",
    got: "GET /api/events",
    query: req.query,
  });
});

r.get("/_ping", (_req, res) => res.json({ ok: true, where: "events-router" }));

// 개발/배포 공통: 실제 요청 도달 확인용 로그
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
    ß;
    const e = new Error("Invalid eventId");
    e.status = 404;
    throw e;
  }
  req.eventId = id;
  next();
}

/* ────────────── 라우트 ────────────── */
/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: 이벤트 목록
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 6, maximum: 50 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
r.get("/", async (req, res, next) => {
  try {
    const page = toPosInt(req.query.page, 1);
    const size = Math.min(50, toPosInt(req.query.size ?? req.query.limit, 12));

    console.log("[HIT] GET /api/events", {
      page,
      size,
      search: req.query.search ?? "",
    });

    const data = await list({ ...req.query, page, size });

    if (typeof res.success === "function") return res.success(data, 200);
    return res.status(200).json(
      data ?? {
        ok: true,
        events: [],
        pagination: {
          page,
          size,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    );
  } catch (e) {
    next(e);
  }
});

/*
  #swagger.tags = ['Events']
  #swagger.summary = '이벤트 상세'
  #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
  #swagger.responses[200] = { description: '상세' }
  #swagger.responses[404] = { description: 'not found' }
*/
r.get("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await detail(req.eventId);
    if (typeof res.success === "function") return res.success(data, 200);
    return res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

/*
  #swagger.tags = ['Events']
  #swagger.summary = '이벤트 수정'
  #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
  #swagger.requestBody = {
    required: true,
    content: { "application/json": { schema: { $ref: "#/components/schemas/EventEditDto" } } }
  }
  #swagger.responses[200] = { description: '수정된 이벤트' }
  #swagger.responses[401] = { description: 'unauthorized' }
  #swagger.responses[404] = { description: 'not found' }
*/
r.put("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await edit(req.eventId, req.body, req.user);
    if (typeof res.success === "function") return res.success(data, 200);
    return res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

/*
  #swagger.tags = ['Events']
  #swagger.summary = '이벤트 취소'
  #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
  #swagger.responses[200] = { description: '취소 결과' }
  #swagger.responses[401] = { description: 'unauthorized' }
  #swagger.responses[404] = { description: 'not found' }
*/
r.delete("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await cancel(req.eventId, req.user);
    if (typeof res.success === "function") return res.success(data, 200);
    return res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

// ✅ Express 5: catch-all JSON 404 (항상 마지막)
r.use((_req, res) => res.status(404).json({ ok: false, error: "NOT_FOUND" }));

export default r;

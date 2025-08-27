// src/events/router/events.router.js
import { Router } from "express";
import { list, detail, edit, cancel } from "../event/service/event.service.js";

const r = Router();
//개발용
r.use((req, _res, next) => {
  console.log("[EVENTS] hit", req.method, req.originalUrl);
  next();
});

/* ───────────────── 유틸 ───────────────── */
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
    throw e;
  }
  req.eventId = id;
  next();
}

/* ───────────────── 라우터 ───────────────── */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: 이벤트 목록
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 6
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
r.get("/", async (req, res, next) => {
  try {
    const page = toPosInt(req.query.page, 1);
    // limit, size 둘 다 받되 최대 50 제한
    const limit = Math.min(50, toPosInt(req.query.size ?? req.query.limit, 12));

    // 서비스 계층에 넘길 파라미터(검색어 등 추가 전달)
    const q = {
      ...req.query,
      page,
      size: limit, // 서비스는 size를 기대한다고 가정
    };

    // 로깅
    console.log("[HIT] GET /api/events", {
      page,
      limit,
      search: req.query.search ?? "",
    });

    const data = await list(q);

    // 표준 응답 (res.success 미들웨어가 있으면 활용)
    if (typeof res.success === "function") {
      return res.success(data, 200);
    }
    return res.status(200).json(
      // 서비스가 그대로 목록/페이지네이션을 리턴한다고 가정
      // 아니라면 여기서 형태를 맞춰주세요.
      data ?? {
        ok: true,
        events: [],
        pagination: {
          page,
          limit,
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
  #swagger.responses[200] = { description: '상세', schema: { $ref: '#/components/schemas/Event' } }
  #swagger.responses[404] = { description: 'not found' }
*/
r.get("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await detail(req.eventId);
    if (typeof res.success === "function") {
      return res.success(data, 200);
    }
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
  #swagger.responses[200] = { description: '수정된 이벤트', schema: { $ref: '#/components/schemas/Event' } }
  #swagger.responses[400] = { description: 'validation error' }
  #swagger.responses[401] = { description: 'unauthorized' }
  #swagger.responses[404] = { description: 'not found' }
*/
r.put("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await edit(req.eventId, req.body, req.user);
    if (typeof res.success === "function") {
      return res.success(data, 200);
    }
    return res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

/*
  #swagger.tags = ['Events']
  #swagger.summary = '이벤트 취소'
  #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
  #swagger.responses[200] = { description: '취소 결과', schema: { type: 'object', properties: { ok: { type: 'boolean', example: true } } } }
  #swagger.responses[401] = { description: 'unauthorized' }
  #swagger.responses[404] = { description: 'not found' }
*/
r.delete("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await cancel(req.eventId, req.user);
    if (typeof res.success === "function") {
      return res.success(data, 200);
    }
    return res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

// ✅ Express 5 호환: catch-all JSON 404 (이 라인은 항상 마지막!)
r.use((_req, res) => res.status(404).json({ ok: false, error: "NOT_FOUND" }));

export default r;

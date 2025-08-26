/*
  #swagger.components = {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
*/
import { Router } from "express";
import { list, detail, edit, cancel } from "../service/event.service.js";

const r = Router();

/* ✅ auth 미들웨어 동적 로딩 + 개발 우회 지원(Skip) */
let _authFn = null;
async function authMw(req, res, next) {
  try {
    // 프로덕션에서 우회 방지
    if (
      process.env.NODE_ENV === "production" &&
      process.env.SKIP_AUTH === "1"
    ) {
      const err = new Error("SKIP_AUTH must not be enabled in production");
      err.status = 500;
      return next(err);
    }

    // 개발 환경에서만 우회 허용
    if (
      process.env.SKIP_AUTH === "1" &&
      process.env.NODE_ENV !== "production"
    ) {
      if (!req.user) {
        const fakeId = Number(process.env.DEV_FAKE_USER_ID || 1);
        req.user = {
          id: fakeId,
          isCompleted: true,
          nickname: "tester" + fakeId,
        };
        if (!global.__authBypassWarned) {
          console.warn("[WARN] Auth bypass enabled (SKIP_AUTH=1) — dev only");
          global.__authBypassWarned = true;
        }
      }
      return next();
    }

    // 실제 인증 미들웨어 동적 로딩
    if (!_authFn) {
      const mod = await import("../../../auth/middleware/auth.middleware.js");
      const base = mod.authenticateAccessToken || mod.auth || mod.default;
      if (typeof base !== "function") {
        const err = new Error("AUTH_MIDDLEWARE_NOT_FOUND");
        err.status = 500;
        throw err;
      }
      _authFn = base;
    }

    return _authFn(req, res, (err) => {
      if (err) return next(err);

      // req.payload → req.user 매핑 보정
      if (!req.user && req.payload) {
        const p = req.payload;
        req.user = (p?.user || p) ?? null;
        if (!req.user?.id) {
          const e = new Error("UNAUTHORIZED");
          e.status = 401;
          return next(e);
        }
      }
      next();
    });
  } catch (e) {
    next(e);
  }
}

/* ──────────────────────────────────────────────────────────────
   목록 조회  GET /api/events
   ────────────────────────────────────────────────────────────── */
r.get("/", async (req, res, next) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 목록 조회'
    #swagger.description = '한 페이지에 6개씩 반환합니다.'
    #swagger.parameters['page'] = {
      in: 'query', required: false, schema: { type: 'integer', default: 1 },
      description: '페이지 번호(기본 1)'
    }
    #swagger.parameters['size'] = {
      in: 'query', required: false, schema: { type: 'integer', default: 6 },
      description: '페이지 크기(기본 6)'
    }
    #swagger.responses[200] = {
      description: '목록/페이지네이션 응답',
      content: {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              page:  { type: 'integer', example: 1 },
              size:  { type: 'integer', example: 6 },
              total: { type: 'integer', example: 25 },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id:           { type: 'integer', example: 1 },
                    title:        { type: 'string',  example: '점심 같이 드실 분' },
                    content:      { type: 'string',  example: '...' },
                    restaurantId: { type: 'integer', example: 3 },
                    startAt:      { type: 'string',  format: 'date-time', example: '2025-08-23T12:00:00.000Z' },
                    endAt:        { type: 'string',  format: 'date-time', example: '2025-08-23T13:00:00.000Z' },
                    creatorId:    { type: 'integer', example: 5 }
                  }
                }
              }
            }
          }
        }
      }
    }
  */
  try {
    const data = await list(req.query);
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

/* ──────────────────────────────────────────────────────────────
   상세 조회  GET /api/events/:eventId
   ────────────────────────────────────────────────────────────── */
r.get("/:eventId", async (req, res, next) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 상세 조회'
    #swagger.parameters['eventId'] = {
      in: 'path', required: true, schema: { type: 'integer' }, description: '이벤트 ID'
    }
    #swagger.responses[200] = { description: '상세 응답' }
    #swagger.responses[404] = { description: 'not found' }
  */
  try {
    const data = await detail(Number(req.params.eventId));
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

/* ──────────────────────────────────────────────────────────────
   수정  PATCH /api/events/:eventId  (인증 필요)
   ────────────────────────────────────────────────────────────── */
r.patch("/:eventId", authMw, async (req, res, next) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 수정'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer' } }
  */
  try {
    const data = await edit(Number(req.params.eventId), req.body, req.user);
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

/* ──────────────────────────────────────────────────────────────
   취소/삭제  DELETE /api/events/:eventId  (인증 필요)
   ────────────────────────────────────────────────────────────── */
r.delete("/:eventId", authMw, async (req, res, next) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 취소(삭제)'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer' } }
  */
  try {
    const data = await cancel(Number(req.params.eventId), req.user);
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

export default r;

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
    // 개발 편의: .env에 SKIP_AUTH=1 설정 시 인증 우회
    if (process.env.SKIP_AUTH === "1") {
      req.user = { id: 1, nickname: "tester1", isCompleted: true };
      return next();
    }

    if (!_authFn) {
      const mod = await import("../../../auth/middleware/auth.middleware.js");
      // named > default 우선순위
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

      // (필요 시) 기존 미들웨어가 req.payload를 채우는 경우 매핑
      if (!req.user && req.payload) {
        const p = req.payload;
        req.user = (p?.user || p) ?? null;
      }
      if (!req.user?.id) {
        const e = new Error("UNAUTHORIZED");
        e.status = 401;
        return next(e);
      }
      next();
    });
  } catch (e) {
    next(e);
  }
}

/* ──────────────────────────────────────────────────────────────
   목록 조회  GET /api/events/events
   ────────────────────────────────────────────────────────────── */
r.get("/events", async (req, res, next) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 목록 조회'
    #swagger.description = '한 페이지에 6개씩 반환합니다.'
    #swagger.parameters['page'] = {
      in: 'query',
      required: false,
      schema: { type: 'integer', default: 1 },
      description: '페이지 번호(기본 1)'
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
    return res.success(data, 200);
  } catch (e) {
    next(e);
  }
});

/* ──────────────────────────────────────────────────────────────
   상세 조회  GET /api/events/events/:eventId
   ────────────────────────────────────────────────────────────── */
r.get("/events/:eventId", async (req, res, next) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 상세 조회'
    #swagger.parameters['eventId'] = {
      in: 'path', required: true, schema: { type: 'integer' }, description: '이벤트 ID'
    }
    #swagger.responses[200] = {
      description: '상세 응답',
      content: {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              id:           { type: 'integer', example: 1 },
              title:        { type: 'string',  example: '점심 구해요' },
              content:      { type: 'string',  example: '...' },
              restaurantId: { type: 'integer', example: 3 },
              startAt:      { type: 'string',  format: 'date-time', example: '2025-08-23T12:00:00.000Z' },
              endAt:        { type: 'string',  format: 'date-time', example: '2025-08-23T13:00:00.000Z' },
              creator: {
                type: 'object',
                properties: {
                  id:       { type: 'integer', example: 5 },
                  nickname: { type: 'string',  example: 'minho' }
                }
              },
              participants_count: { type: 'integer', example: 2 },
              participants: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id:            { type: 'integer', example: 7 },
                    nickname:      { type: 'string',  example: 'alice' },
                    applicationId: { type: 'integer', example: 11 }
                  }
                }
              },
              chatUrl: { type: 'string', example: '/chats/event/1' }
            }
          }
        }
      }
    }
    #swagger.responses[404] = { description: 'not found' }
  */
  try {
    const data = await detail(Number(req.params.eventId));
    return res.success(data, 200);
  } catch (e) {
    next(e);
  }
});

/* ──────────────────────────────────────────────────────────────
   수정  PATCH /api/events/events/:eventId  (인증 필요)
   ────────────────────────────────────────────────────────────── */
r.patch("/events/:eventId", authMw, async (req, res, next) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 수정'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer' } }
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: 'object',
            properties: {
              title:        { type: 'string',  example: '제목 수정' },
              content:      { type: 'string',  example: '내용 수정' },
              restaurantId: { type: 'integer', example: 2 },
              startAt:      { type: 'string',  format: 'date-time', example: '2025-08-26T12:30:00.000Z' },
              endAt:        { type: 'string',  format: 'date-time', example: '2025-08-26T13:30:00.000Z' }
            },
            additionalProperties: false
          }
        }
      }
    }
    #swagger.responses[200] = {
      description: '수정 성공',
      content: { "application/json": { schema: { type: 'object', example: {
        id: 19, title: '제목 수정', content: '내용 수정', restaurantId: 2,
        startAt: '2025-08-26T12:30:00.000Z', endAt: '2025-08-26T13:30:00.000Z',
        updatedAt: '2025-08-26T12:40:00.000Z'
      }}}}
    }
    #swagger.responses[403] = { description: 'FORBIDDEN' }
  */
  try {
    const data = await edit(Number(req.params.eventId), req.body, req.user);
    return res.success(data, 200);
  } catch (e) {
    next(e);
  }
});

/* ──────────────────────────────────────────────────────────────
   취소/삭제  DELETE /api/events/events/:eventId  (인증 필요)
   ────────────────────────────────────────────────────────────── */
r.delete("/events/:eventId", authMw, async (req, res, next) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 취소(삭제)'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer' } }
    #swagger.responses[200] = {
      description: '삭제 결과',
      content: { "application/json": { schema: { type: 'object', example: { id: 19, canceled: true } } } }
    }
    #swagger.responses[403] = { description: 'FORBIDDEN' }
  */
  try {
    const data = await cancel(Number(req.params.eventId), req.user);
    return res.success(data, 200);
  } catch (e) {
    next(e);
  }
});

export default r;

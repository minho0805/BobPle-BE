// src/events/creation/router/creation.router.js
import { Router } from 'express';
import { createEvent } from '../controller/creation.controller.js';

const r = Router();

/* ✅ auth 미들웨어 동적 로딩 (미들웨어 파일 수정 불필요) */
let _authFn = null;
async function authMw(req, res, next) {
  try {
    // ✅ 개발용 인증 우회: .env에 SKIP_AUTH=1 이면 로그인 없이 통과
    if (process.env.SKIP_AUTH === '1') {
      req.user = { id: 1, isCompleted: true, nickname: 'tester1' };
      return next();
    }

    if (!_authFn) {
      const mod = await import('../../../auth/middleware/auth.middleware.js');
      const base = mod.authenticateAccessToken || mod.auth || mod.default;
      if (typeof base !== 'function') {
        const err = new Error('AUTH_MIDDLEWARE_NOT_FOUND');
        err.status = 500;
        throw err;
      }
      _authFn = base;
    }

    return _authFn(req, res, (err) => {
      if (err) return next(err);

      // 미들웨어가 채운 req.payload → 서비스에서 쓰는 req.user로 매핑
      if (!req.user && req.payload) {
        const p = req.payload;
        req.user = (p?.user || p) ?? null;
        if (!req.user?.id) {
          const e = new Error('UNAUTHORIZED');
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

/* -------------------------------------------------------
 * POST /api/events/creation
 * 최종 경로는 상위에서 app.use('/api/events', eventsRouter) 로 마운트된다고 가정
 * ----------------------------------------------------- */
r.post('/creation', authMw, (req, res, next) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 생성'
    #swagger.description = '밥약 이벤트를 생성합니다. 시간은 ISO Datetime(예: 2025-08-25T12:00:00.000Z)을 사용하세요.'
    #swagger.security = [{ bearerAuth: [] }]  // 문서 표기를 위한 것. 실제 인증은 쿠키/미들웨어로 처리되며, 개발 시 SKIP_AUTH=1로 우회 가능.

    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["title", "restaurantId", "startAt", "endAt"],
            properties: {
              title:           { type: "string", example: "점심 같이 드실 분" },
              content:         { type: "string", example: "간단히 먹어요" },
              restaurantId:    { type: "integer", example: 3 },
              startAt:         { type: "string", format: "date-time", example: "2025-08-25T12:00:00.000Z" },
              endAt:           { type: "string", format: "date-time", example: "2025-08-25T13:00:00.000Z" },
              maxParticipants: { type: "integer", minimum: 1, maximum: 4, example: 4, description: "옵션(응답용 안내)" }
            }
          }
        }
      }
    }

    #swagger.responses[201] = {
      description: "생성 성공",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id:          { type: "integer", example: 12 },
              title:       { type: "string", example: "점심 같이 드실 분" },
              content:     { type: "string", example: "간단히 먹어요" },
              restaurantId:{ type: "integer", example: 3 },
              startAt:     { type: "string", format: "date-time" },
              endAt:       { type: "string", format: "date-time" },
              creatorId:   { type: "integer", example: 1 },
              createdAt:   { type: "string", format: "date-time" },
              updatedAt:   { type: "string", format: "date-time" }
            }
          }
        }
      }
    }

    #swagger.responses[400] = {
      description: "검증 실패",
      content: { "application/json": { schema: { example: { message: "제대로 입력하세요" } } } }
    }

    #swagger.responses[401] = {
      description: "인증 필요(쿠키 없음/무효)",
      content: { "application/json": { schema: { example: { message: "UNAUTHORIZED" } } } }
    }
  */
  return createEvent(req, res, next);
});

export default r;
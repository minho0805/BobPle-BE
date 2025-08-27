// src/events/event/router/event.router.js
// ⚠️ 이 파일은 실제 라우터가 아님. 상위 라우터만 re-export 합니다.
// 실제 라우터는 src/events/router/events.router.js 입니다.

import { Router } from "express";
export { default } from "../../router/events.router.js";

/* ─────────────────────────────────────────────────────────────
 * 문서 전용 더미 라우트 (swagger-autogen 스캔용)
 * - 런타임에 app.use로 마운트되지 않음(실행 영향 없음)
 * - swagger.js는 index.js만 스캔하지만, import chain을 따라
 *   이 파일도 읽히므로 여기의 주석을 문서에 반영할 수 있음
 * ──────────────────────────────────────────────────────────── */

const __doc = Router();

/* 목록: GET /api/events */
__doc.get("/api/events", (_req, _res) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '이벤트 목록'
    #swagger.description = '페이지네이션으로 이벤트 목록을 반환합니다.'
    #swagger.parameters['page']  = { in: 'query', schema: { type: 'integer', example: 1, minimum: 1 } }
    #swagger.parameters['limit'] = { in: 'query', schema: { type: 'integer', example: 12, minimum: 1, maximum: 50 }, required: false }
    #swagger.parameters['size']  = { in: 'query', schema: { type: 'integer', example: 12, minimum: 1, maximum: 50 }, required: false, description: 'limit과 호환' }
    #swagger.parameters['search']= { in: 'query', schema: { type: 'string', example: '강남' }, required: false }
    #swagger.responses[200] = {
      description: '목록',
      schema: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          events: { type: 'array', items: { $ref: '#/components/schemas/Event' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 12 },
              total: { type: 'integer', example: 128 },
              totalPages: { type: 'integer', example: 11 },
              hasNext: { type: 'boolean', example: true },
              hasPrev: { type: 'boolean', example: false }
            }
          }
        }
      }
    }
  */
});

/* 상세: GET /api/events/:eventId */
__doc.get("/api/events/:eventId", (_req, _res) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '이벤트 상세'
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
    #swagger.responses[200] = { description: '상세', schema: { $ref: '#/components/schemas/Event' } }
    #swagger.responses[404] = { description: 'not found' }
  */
});

/* 생성: POST /api/events  (현재 BE가 /api/events/creation 사용 중이면 이 주석대로 바꾸길 권장) */
__doc.post("/api/events", (_req, _res) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '이벤트 생성'
    #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: "#/components/schemas/EventCreateDto" } } }
    }
    #swagger.responses[201] = { description: '생성됨', schema: { $ref: '#/components/schemas/Event' } }
    #swagger.responses[400] = { description: 'validation error' }
    #swagger.responses[401] = { description: 'unauthorized' }
  */
});

/* 신청 목록: GET /api/events/:eventId/application/ */
__doc.get("/api/events/:eventId/application/", (_req, _res) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '이벤트 신청 목록'
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
    #swagger.responses[200] = { description: '신청 목록' }
  */
});

/* 필요 시: 수정/취소도 명시 (PUT/DELETE) */
__doc.put("/api/events/:eventId", (_req, _res) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '이벤트 수정'
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
    #swagger.requestBody = { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EventEditDto" } } } }
    #swagger.responses[200] = { description: '수정됨' }
  */
});
__doc.delete("/api/events/:eventId", (_req, _res) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '이벤트 취소'
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
    #swagger.responses[200] = { description: '취소됨' }
  */
});

// 주의: __doc 라우터는 export도, 실제 마운트도 하지 않습니다.
// 목적은 오직 swagger-autogen이 이 파일을 읽을 때 주석을 인식하게 하는 것뿐입니다.
void __doc;

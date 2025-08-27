// src/events/event/router/event.router.js

// ⚠️ 이 파일은 실제 라우터가 아님. 상위 라우터만 re-export 합니다.
// 실제 라우터는 src/events/router/events.router.js 입니다.
export { default } from "../../router/events.router.js";

/* ─────────────────────────────────────────────────────────────
 * swagger-autogen 스캔용 더미 라우트
 * - 런타임에 app.use로 마운트되지 않음(실행 영향 없음)
 * - index.js → router.js → events.router.js 경로로 실제 라우팅은 처리됩니다.
 * - 여기의 주석만 문서화에 활용됩니다.
 * ──────────────────────────────────────────────────────────── */

import { Router } from "express";
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

/* 생성: POST /api/events (BE가 /api/events/creation 사용 중이면 거기에 맞춰 문서만 수정하세요) */
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

/* 수정/취소 */
__doc.put("/api/events/:eventId", (_req, _res) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '이벤트 수정'
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
    #swagger.requestBody = {
      required: true,
      content: { "application/json": { schema: { $ref: "#/components/schemas/EventEditDto" } } }
    }
    #swagger.responses[200] = { description: '수정됨' }
    #swagger.responses[400] = { description: 'validation error' }
    #swagger.responses[401] = { description: 'unauthorized' }
    #swagger.responses[404] = { description: 'not found' }
  */
});

__doc.delete("/api/events/:eventId", (_req, _res) => {
  /*
    #swagger.tags = ['Events']
    #swagger.summary = '이벤트 취소'
    #swagger.parameters['eventId'] = { in: 'path', required: true, schema: { type: 'integer', example: 21 } }
    #swagger.responses[200] = { description: '취소됨' }
    #swagger.responses[401] = { description: 'unauthorized' }
    #swagger.responses[404] = { description: 'not found' }
  */
});

// 주의: __doc 라우터는 export도, 실제 마운트도 하지 않습니다.
// 목적은 오직 swagger-autogen이 이 파일을 읽을 때 주석을 인식하게 하는 것뿐입니다.
void __doc;

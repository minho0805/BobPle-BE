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
import { Router } from 'express';
import { list, detail, edit, cancel } from '../service/event.service.js';

const r = Router();

/* ✅ auth 미들웨어 동적 로딩 래퍼 (미들웨어 파일 수정 불필요) */
let _authFn = null;
async function authMw(req, res, next) {
  try {
    if (!_authFn) {
      // 경로와 .js 확장자 주의!
      const mod = await import('../../../auth/middleware/auth.middleware.js');
      _authFn = mod.auth || mod.default; // named 또는 default 둘 다 지원
      if (typeof _authFn !== 'function') {
        const err = new Error('AUTH_MIDDLEWARE_NOT_FOUND');
        err.status = 500;
        throw err;
      }
    }
    return _authFn(req, res, next);
  } catch (e) {
    return next(e);
  }
}

// 목록 조회
r.get('/events', async (req, res, next) => {
  /*  
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 목록 조회'
    #swagger.description = '한 페이지에 6개씩 반환합니다.'
    #swagger.parameters['page'] = {
      in: 'query',
      type: 'integer',
      required: false,
      description: '페이지 번호(기본 1)'
    }
    #swagger.responses[200] = {
      description: '목록/페이지네이션 응답',
      schema: {
        page: 1,
        size: 6,
        total: 25,
        items: [
          { id: 1, title: '점심 같이 드실 분', content: '...', restaurantId: 3, startAt: '2025-08-23T12:00:00Z', endAt: '2025-08-23T13:00:00Z', creatorId: 5 }
        ]
      }
    }
  */
  try {
    const data = await list(req.query);
    return res.success(data, 200);
  } catch (e) { next(e); }
});

// 상세 조회
r.get('/events/:eventId', async (req, res, next) => {
  /*  
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 상세 조회'
    #swagger.parameters['eventId'] = {
      in: 'path', required: true, type: 'integer', description: '이벤트 ID'
    }
    #swagger.responses[200] = {
      description: '상세 응답',
      schema: {
        id: 1, title: '점심 구해요', content: '...', restaurant_id: 3,
        start_at: '2025-08-23T12:00:00Z', end_at: '2025-08-23T13:00:00Z',
        creator: { id: 5, nickname: 'minho' },
        participants_count: 2,
        participants: [{ id: 7, nickname: 'alice', applicationId: 11 }],
        chatUrl: '/chats/event/1'
      }
    }
    #swagger.responses[404] = { description: 'not found' }
  */
  try {
    const data = await detail(Number(req.params.eventId));
    return res.success(data, 200);
  } catch (e) { next(e); }
});

// 수정 (인증 필요)
r.patch('/events/:eventId', authMw, async (req, res, next) => {
  /*  
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 수정'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, type: 'integer' }
    #swagger.requestBody = {
      required: true,
      schema: { title: '제목', content: '내용', restaurantId: 3, startAt: '2025-08-23T12:00:00Z', endAt: '2025-08-23T13:00:00Z' }
    }
    #swagger.responses[200] = { description: '수정된 이벤트' }
    #swagger.responses[403] = { description: 'FORBIDDEN' }
  */
  try {
    const data = await edit(Number(req.params.eventId), req.body, req.user);
    return res.success(data, 200);
  } catch (e) { next(e); }
});

// 삭제/취소 (인증 필요)
r.delete('/events/:eventId', authMw, async (req, res, next) => {
  /*  
    #swagger.tags = ['Events']
    #swagger.summary = '밥약 이벤트 취소(삭제)'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '삭제 결과', schema: { id: 1, canceled: true } }
    #swagger.responses[403] = { description: 'FORBIDDEN' }
  */
  try {
    const data = await cancel(Number(req.params.eventId), req.user);
    return res.success(data, 200);
  } catch (e) { next(e); }
});

export default r;
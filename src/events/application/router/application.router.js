// src/events/application/router/application.router.js
import { Router } from 'express';
import {
  applyApplication,
  cancelApplication,
  myApplications,
} from '../controller/application.controller.js';

const r = Router();

// ✅ auth 동적 로딩 그대로 사용
let _authFn = null;
async function authMw(req, res, next) {
  try {
    if (!_authFn) {
      const mod = await import('../../../auth/middleware/auth.middleware.js');
      _authFn = mod.auth || mod.default;
      if (typeof _authFn !== 'function') {
        const err = new Error('AUTH_MIDDLEWARE_NOT_FOUND');
        err.status = 500;
        throw err;
      }
    }
    return _authFn(req, res, next);
  } catch (e) { return next(e); }
}

// 신청 생성
r.post('/events/:eventId/applications', authMw, (req, res, next) => {
  /*  
    #swagger.tags = ['Applications']
    #swagger.summary = '이벤트 신청'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, type: 'integer', description: '이벤트 ID' }
    #swagger.responses[201] = { description: '신청 생성됨' }
    #swagger.responses[400] = { description: 'INVALID_EVENT_ID 등' }
    #swagger.responses[401] = { description: 'UNAUTHORIZED' }
    #swagger.responses[403] = { description: 'CANNOT_APPLY_OWN_EVENT' }
  */
  return applyApplication(req, res, next);
});

// 본인 신청 취소
r.delete('/events/:eventId/applications/me', authMw, (req, res, next) => {
  /*  
    #swagger.tags = ['Applications']
    #swagger.summary = '내 신청 취소'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '삭제 결과', schema: { deleted: 1 } }
  */
  return cancelApplication(req, res, next);
});

// 호스트가 특정 신청자 취소  🔧 creator_id → creatorId
r.delete('/events/:eventId/applications/:creatorId', authMw, (req, res, next) => {
  /*  
    #swagger.tags = ['Applications']
    #swagger.summary = '호스트가 특정 신청자 취소'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, type: 'integer' }
    #swagger.parameters['creatorId'] = { in: 'path', required: true, type: 'integer', description: '취소 대상 신청자 ID' }
    #swagger.responses[200] = { description: '삭제 결과', schema: { deleted: 1 } }
    #swagger.responses[403] = { description: 'FORBIDDEN (호스트 아님)' }
  */
  return cancelApplication(req, res, next);
});

// 내가 신청한 목록
r.get('/me/applications', authMw, (req, res, next) => {
  /*  
    #swagger.tags = ['Applications']
    #swagger.summary = '내 신청 목록'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['page'] = { in: 'query', type: 'integer', required: false, description: '페이지(기본 1)' }
    #swagger.parameters['size'] = { in: 'query', type: 'integer', required: false, description: '페이지 크기(기본 10, 최대 50)' }
    #swagger.responses[200] = {
      description: '페이지네이션 목록',
      schema: { page: 1, size: 10, total: 3, items: [{ id: 11, eventId: 5, creatorId: 7 }] }
    }
  */
  return myApplications(req, res, next);
});

export default r;
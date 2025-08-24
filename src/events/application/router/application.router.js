// src/events/application/router/application.router.js
import express from 'express';
import {
  applyApplication,
  cancelApplication,
  cancelApplicationById,
  myApplications,
} from '../controller/application.controller.js';

const r = express.Router();

/* ✅ auth 미들웨어 동적 로딩 래퍼 (authenticateAccessToken 지원) */
let _authFn = null;
async function authMw(req, res, next) {
  try {
    // ✅ 개발용 인증 우회 (.env에 SKIP_AUTH=1 설정 시 로그인 없이 테스트)
    if (process.env.SKIP_AUTH === '1') {
      req.user = { id: 1, isCompleted: true, nickname: 'tester1' };
      return next();
    }

    if (!_authFn) {
      const mod = await import('../../../auth/middleware/auth.middleware.js');
      const base = mod.authenticateAccessToken || mod.auth || mod.default;
      if (typeof base !== 'function') {
        const err = new Error('AUTH_MIDDLEWARE_NOT_FOUND');
        err.status = 500; throw err;
      }
      _authFn = base;
    }

    // 원래 미들웨어 실행 (쿠키에서 토큰 검증)
    return _authFn(req, res, (err) => {
      if (err) return next(err);

      // req.payload -> req.user 매핑 (서비스 코드가 req.user.id 사용)
      if (!req.user && req.payload) {
        const p = req.payload;
        req.user = (p?.user || p) ?? null;
        if (!req.user?.id) { const e = new Error('UNAUTHORIZED'); e.status = 401; return next(e); }
      }
      return next();
    });
  } catch (e) { return next(e); }
}

/* ✅ 숫자 파라미터 검증 */
const toPosInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : NaN;
};
r.param('eventId', (req, res, next, val) => {
  const n = toPosInt(val);
  if (!n) { const err = new Error('Invalid eventId'); err.status = 400; return next(err); }
  req.params.eventId = n; next();
});
r.param('creatorId', (req, res, next, val) => {
  const n = toPosInt(val);
  if (!n) { const err = new Error('Invalid creatorId'); err.status = 400; return next(err); }
  req.params.creatorId = n; next();
});
r.param('applicationId', (req, res, next, val) => {
  const n = toPosInt(val);
  if (!n) { const err = new Error('Invalid applicationId'); err.status = 400; return next(err); }
  req.params.applicationId = n; next();
});

/* -------------------- Routes -------------------- */

/* 생성 (spec) -> POST /api/events/:eventId/application */
r.post('/events/:eventId/application', authMw, (req, res, next) => {
  /*
    #swagger.tags = ['Applications']
    #swagger.summary = '이벤트 신청 (spec)'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['eventId'] = { in: 'path', required: true, type: 'integer' }
    #swagger.responses[201] = { description: '신청 생성됨' }
  */
  return applyApplication(req, res, next);
});

/* 생성 (legacy) -> POST /api/events/:eventId/applications */
r.post('/events/:eventId/applications', authMw, (req, res, next) => {
  /*
    #swagger.tags = ['Applications']
    #swagger.summary = '이벤트 신청 (legacy)'
    #swagger.security = [{ bearerAuth: [] }]
  */
  return applyApplication(req, res, next);
});

/* 내 신청 취소 (legacy) -> DELETE /api/events/:eventId/applications/me */
r.delete('/events/:eventId/applications/me', authMw, (req, res, next) => {
  /*
    #swagger.tags = ['Applications']
    #swagger.summary = '내 신청 취소 (legacy)'
    #swagger.security = [{ bearerAuth: [] }]
  */
  return cancelApplication(req, res, next);
});

/* 호스트가 특정 신청자 취소 (legacy) -> DELETE /api/events/:eventId/applications/:creatorId */
r.delete('/events/:eventId/applications/:creatorId', authMw, (req, res, next) => {
  /*
    #swagger.tags = ['Applications']
    #swagger.summary = '호스트가 특정 신청자 취소 (legacy)'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['creatorId'] = { in: 'path', required: true, type: 'integer' }
  */
  return cancelApplication(req, res, next);
});

/* 신청 취소 (spec) -> DELETE /api/events/:eventId/application/:applicationId/cancel */
r.delete('/events/:eventId/application/:applicationId/cancel', authMw, (req, res, next) => {
  /*
    #swagger.tags = ['Applications']
    #swagger.summary = '신청 취소 (spec: applicationId 기반)'
    #swagger.security = [{ bearerAuth: [] }]
    #swagger.parameters['applicationId'] = { in: 'path', required: true, type: 'integer' }
    #swagger.responses[200] = { description: '삭제 결과', schema: { deleted: 1 } }
  */
  return cancelApplicationById(req, res, next);
});

/* 내가 신청한 목록 (spec alias) -> GET /api/events/me */
r.get('/events/me', authMw, (req, res, next) => {
  /*
    #swagger.tags = ['Applications']
    #swagger.summary = '내 신청 목록 (spec alias)'
    #swagger.security = [{ bearerAuth: [] }]
  */
  return myApplications(req, res, next);
});

export default r;
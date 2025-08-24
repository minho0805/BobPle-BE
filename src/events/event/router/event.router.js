// src/events/event/router/event.router.js
import { Router } from 'express';
import { list, detail, edit, cancel } from '../controller/event.controller.js';

const r = Router();

/* ✅ auth 미들웨어 동적 로딩 */
let _authFn = null;
async function authMw(req, res, next) {
  try {
    // 개발용 인증 우회 (.env에 SKIP_AUTH=1)
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

    return _authFn(req, res, (err) => {
      if (err) return next(err);
      if (!req.user && req.payload) {
        const p = req.payload;
        req.user = (p?.user || p) ?? null;
        if (!req.user?.id) { const e = new Error('UNAUTHORIZED'); e.status = 401; return next(e); }
      }
      next();
    });
  } catch (e) { next(e); }
}

/* ✅ :eventId 숫자 검증 */
r.param('eventId', (req, res, next, val) => {
  const n = Number(val);
  if (!Number.isInteger(n) || n <= 0) {
    const err = new Error('Invalid eventId'); err.status = 400; return next(err);
  }
  req.params.eventId = n;
  next();
});

/* 👉 여기부터 모두 /events 접두사 유지 */
/* 목록   -> GET /api/events */
r.get('/events', (req, res, next) => list(req, res, next));

/* 상세   -> GET /api/events/:eventId */
r.get('/events/:eventId', (req, res, next) => detail(req, res, next));

/* 수정   -> PUT /api/events/:eventId/edit */
r.put('/events/:eventId/edit', authMw, (req, res, next) => edit(req, res, next));

/* 취소   -> DELETE /api/events/:eventId/cancel */
r.delete('/events/:eventId/cancel', authMw, (req, res, next) => cancel(req, res, next));

export default r;
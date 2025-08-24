// src/events/creation/router/creation.router.js
import { Router } from 'express';
import { createEvent } from '../controller/creation.controller.js';

const r = Router();

/* ✅ auth 미들웨어 동적 로딩 (미들 수정 불필요) + 개발 우회 */
let _authFn = null;
async function authMw(req, res, next) {
  try {
    // 개발용: .env 에 SKIP_AUTH=1 넣으면 인증 우회
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

    // 쿠키 기반 인증 수행
    return _authFn(req, res, (err) => {
      if (err) return next(err);
      // req.payload → req.user 매핑
      if (!req.user && req.payload) {
        const p = req.payload;
        req.user = (p?.user || p) ?? null;
        if (!req.user?.id) {
          const e = new Error('UNAUTHORIZED');
          e.status = 401;
          return next(e);
        }
      }
      return next();
    });
  } catch (e) {
    return next(e);
  }
}

/**
 * @swagger
 * /api/events/creation:
 *   post:
 *     tags: [Events]
 *     summary: 밥약 생성
 *     description: 밥약 이벤트를 생성합니다. 시작/종료 시간은 ISO Datetime(예: 2025-08-25T12:00:00.000Z)을 사용합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, restaurantId, startAt, endAt]
 *             properties:
 *               title:
 *                 type: string
 *                 example: 점심 같이 드실 분
 *               content:
 *                 type: string
 *                 example: 간단히 먹어요
 *               restaurantId:
 *                 type: integer
 *                 example: 1
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-08-25T12:00:00.000Z
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-08-25T13:00:00.000Z
 *               maxParticipants:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *                 example: 4
 *                 description: DB에는 저장하지 않고 응답에만 포함(옵션)
 *     responses:
 *       201:
 *         description: 생성 성공
 *       400:
 *         description: 검증 실패
 *       401:
 *         description: 인증 필요
 */
r.post('/events/creation', authMw, createEvent);   // 최종 경로: POST /api/events/creation

export default r;
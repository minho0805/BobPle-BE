// src/events/application/router/application.router.js
import { Router } from 'express';
import { auth } from '../../../auth/middleware/auth.middleware.js';
import {
  applyApplication,
  cancelApplication,
  myApplications,
} from '../controller/application.controller.js';

const r = Router();

// 신청 생성
r.post('/events/:eventId/applications', auth, applyApplication);

// 신청 취소 (본인 취소)
r.delete('/events/:eventId/applications/me', auth, cancelApplication);

// 신청 취소 (호스트가 특정 신청자 취소)
r.delete('/events/:eventId/applications/:creator_id', auth, cancelApplication);

// 내가 신청한 목록
r.get('/me/applications', auth, myApplications);

export default r;
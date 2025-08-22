// src/events/application/router/application.router.js
import { Router } from 'express';
import {
  applyApplication,
  cancelApplication,
  myApplications,
} from '../controller/application.controller.js'; // <-- .js 필수 (ESM)

const router = Router();

// 신청 생성
router.post('/api/events/:eventId/application', applyApplication);

// 신청 취소
router.delete('/api/events/:eventId/application/:applicationId/cancel', cancelApplication);


// 내 신청 목록
router.get('/api/events/me', myApplications);

export default router;
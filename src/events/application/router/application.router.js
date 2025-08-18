import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth.js';
import * as ctrl from '../controller/application.controller.js';

const r = Router();
// 신청/취소
r.post('/:eventId/application', requireAuth, ctrl.apply);
r.post('/:eventId/application/:applicationId/cancel', requireAuth, ctrl.cancel);
// 내가 신청한 밥약
r.get('/me', requireAuth, ctrl.mine);

export default r;
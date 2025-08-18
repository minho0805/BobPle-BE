import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth.js';
import * as ctrl from '../controller/application.controller.js';

const r = Router();
r.post('/:eventId/application', requireAuth, ctrl.apply);
r.post('/:eventId/application/:applicationId/cancel', requireAuth, ctrl.cancel);
r.get('/me', requireAuth, ctrl.mine);
export default r;
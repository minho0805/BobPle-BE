import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth.js';
import * as ctrl from '../controller/event.controller.js';

const r = Router();
r.get('/', ctrl.list);
r.get('/:eventId', ctrl.detail);
r.patch('/:eventId/edit', requireAuth, ctrl.edit);
r.post('/:eventId/cancel', requireAuth, ctrl.cancel);
export default r;
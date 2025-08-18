import { Router } from 'express';
import * as ctrl from '../controller/event.controller.js';

const r = Router();
r.get('/', ctrl.list);
r.get('/:eventId', ctrl.detail);
r.patch('/:eventId/edit', ctrl.edit);
r.post('/:eventId/cancel', ctrl.cancel);
export default r;
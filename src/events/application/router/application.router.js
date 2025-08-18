import { Router } from 'express';
import * as ctrl from '../controller/application.controller.js';

const r = Router();
r.post('/:eventId/application', ctrl.apply);
r.post('/:eventId/application/:applicationId/cancel', ctrl.cancel);
r.get('/me', ctrl.mine);
export default r;
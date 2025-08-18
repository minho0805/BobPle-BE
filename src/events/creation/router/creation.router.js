import { Router } from 'express';
import { requireAuth } from '../../../middleware/auth.js';
import { creation } from '../controller/creation.controller.js';

const r = Router();
r.post('/creation', requireAuth, creation);
export default r;
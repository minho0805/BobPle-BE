import { Router } from 'express';
import { createEvent } from '../controller/creation.controller.js';

const r = Router();
r.post('/events', createEvent);
export default r;
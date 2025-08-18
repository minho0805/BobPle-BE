import { Router } from 'express';
import { creation } from '../controller/creation.controller.js';

const r = Router();
r.post('/creation', creation);
export default r;
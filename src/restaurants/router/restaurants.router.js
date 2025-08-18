import { Router } from 'express';
import { search } from '../controller/restaurants.controller.js';
const r = Router();
// /api/events/restaurants/search
r.get('/search', search);
export default r;
import { Router } from 'express';
import creationRouter from '../creation/router/creation.router.js';
import eventRouter from '../event/router/event.router.js';
import applicationRouter from '../application/router/application.router.js';
import restaurantsRouter from '../restaurants/router/restaurants.router.js';

const r = Router();

// 여기서 /api/events 하위 모든 도메인 라우터를 합친다.
r.use('/', eventRouter);               // GET /, GET /:eventId, PATCH /:eventId/edit, POST /:eventId/cancel
r.use('/', creationRouter);            // POST /creation
r.use('/', applicationRouter);         // POST /:eventId/application, POST /:eventId/application/:applicationId/cancel, GET /me
r.use('/restaurants', restaurantsRouter); // GET /restaurants/search

export default r;
// src/events/router/events.router.js
import express from 'express';

import creationRouter from '../creation/router/creation.router.js';
import eventRouter from '../event/router/event.router.js';
import applicationRouter from '../application/router/application.router.js';
import restaurantsRouter from '../../restaurants/router/restaurants.router.js';

const r = express.Router();

/**
 * 상위에서 app.use('/api', eventsRouter) 로 마운트한다고 가정
 * 등록 순서 중요: creation → application → event (경로 충돌 방지)
 */
r.use('/', creationRouter);       // POST /api/events/creation
r.use('/', applicationRouter);    // /api/events/:eventId/application, /api/events/me ...
r.use('/', eventRouter);          // /api/events, /api/events/:eventId, .../edit, .../cancel

// 식당 검색 (restaurantsRouter 내부 베이스에 맞춰)
r.use('/restaurants', restaurantsRouter);

export default r;
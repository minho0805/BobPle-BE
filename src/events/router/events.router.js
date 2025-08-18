import { Router } from 'express';

import creationRouter from '../creation/router/creation.router.js';
import eventRouter from '../event/router/event.router.js';
import applicationRouter from '../application/router/application.router.js';
import restaurantsRouter from '../../restaurants/router/restaurants.router.js'

const r = Router();

// /api/events 하위
r.use('/', eventRouter);                 // 리스트/상세/수정/취소
r.use('/', creationRouter);              // 생성
r.use('/', applicationRouter);           // 신청/신청취소/내 신청
r.use('/restaurants', restaurantsRouter);// 식당 검색

export default r;
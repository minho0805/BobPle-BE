import { Router } from 'express';
import * as ctrl from '../controller/restaurants.controller.js';

const r = Router();

// 목록 검색 (이름 부분일치 + 카테고리 탭 + 페이지네이션)
// GET /api/restaurants?query=라&category=Korean&page=1&size=20
r.get('/', ctrl.search);

// 자동완성(상단 입력창용)
// GET /api/restaurants/suggest?query=라&limit=10
r.get('/suggest', ctrl.suggest);

export default r;
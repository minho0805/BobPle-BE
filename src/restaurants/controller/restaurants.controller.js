// src/restaurants/controller/restaurants.controller.js
import * as svc from '../service/restaurants.service.js';

export async function search(req, res, next) {
  /*
    #swagger.tags = ['Restaurants']
    #swagger.summary = '식당 검색'
    #swagger.description = '쿼리, 카테고리, 좌표, 반경으로 식당 목록을 검색합니다.'
    #swagger.parameters['query'] = {
        in: 'query',
        description: '검색어',
        required: false,
        type: 'string'
    }
    #swagger.parameters['category'] = {
        in: 'query',
        description: '카테고리 (Korean | Chinese | Japanese)',
        required: false,
        type: 'string'
    }
    #swagger.parameters['page'] = { in: 'query', type: 'integer', default: 1 }
    #swagger.parameters['size'] = { in: 'query', type: 'integer', default: 20 }
    #swagger.responses[200] = {
        description: '검색 결과',
        schema: {
          ok: true,
          data: {
            page: 1,
            size: 20,
            total: 134,
            items: [
              {
                id: 1,
                name: "바람난오리궁뎅이",
                category: "Korean",
                address: "서울...",
                lat: 37.616057,
                lng: 127.003125
              }
            ]
          }
        }
    }
  */
  try {
    const data = await svc.search(req.query);
    return res.ok(data);
  } catch (e) { next(e); }
}
export async function suggest(req, res, next) {
  try {
    const data = await repo.suggest(req.query);
    return ok(res, data);
  } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const data = await repo.findById(req.params.id);
    if (!data) return res.status(404).json({ ok:false, error:'NOT_FOUND' });
    return ok(res, data);
  } catch (e) { next(e); }
}
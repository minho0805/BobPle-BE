import {
  apply  as applyService,
  cancel as cancelService,
  mine   as mineService,
} from '../service/application.service.js';

// 컨트롤러: 신청
export const apply = async (req, res, next) => {
  try {
    return ok(res, await applyService(req.params.eventId, req.user));
  } catch (e) { next(e); }
};

// 컨트롤러: 취소
export const cancel = async (req, res, next) => {
  try {
    return ok(res, await cancelService(req.params.eventId, req.params.applicationId, req.user));
  } catch (e) { next(e); }
};

// 컨트롤러: 내 신청 목록
export const mine = async (req, res, next) => {
  try {
    return ok(res, await mineService(req.user, req.query));
  } catch (e) { next(e); }
};
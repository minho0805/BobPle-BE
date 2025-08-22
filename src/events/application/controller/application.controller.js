// src/events/application/controller/application.controller.js
import { StatusCodes } from 'http-status-codes';
import { apply, cancel, mine } from '../service/application.service.js';

// 신청 생성
export const applyApplication = async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    const data = await apply(eventId, req.user);
    return res.success(data, StatusCodes.CREATED); // 201
  } catch (e) { next(e); }
};

// 신청 취소
// 경로 예시: DELETE /events/:eventId/applications/me
//         또는 DELETE /events/:eventId/applications/:creator_id
export const cancelApplication = async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    const creatorIdParam = req.params.creator_id; // 선택적. 'me' 혹은 특정 유저 id
    const data = await cancel(eventId, creatorIdParam, req.user);
    return res.success(data, StatusCodes.OK);
  } catch (e) { next(e); }
};

// 내 신청 목록
export const myApplications = async (req, res, next) => {
  try {
    const data = await mine(req.user, req.query);
    return res.success(data, StatusCodes.OK);
  } catch (e) { next(e); }
};
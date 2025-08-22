// src/events/application/controller/application.controller.js
import { StatusCodes } from 'http-status-codes';
import { apply, cancel, mine } from '../service/application.service.js';

// 신청 생성
export const applyApplication = async (req, res, next) => {
  try {
    const data = await apply(req.params.eventId, req.user);
    return res.success(data, StatusCodes.CREATED); // 201
  } catch (e) { next(e); }
};

// 신청 취소
export const cancelApplication = async (req, res, next) => {
  try {
    const data = await cancel(req.params.eventId, req.params.applicationId, req.user);
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
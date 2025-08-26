// 위치 : src/events/application/controller/application.controller.js
import { StatusCodes } from "http-status-codes";
import { apply, cancel, mine } from "../service/application.service.js";

// 신청 생성
export const applyApplication = async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId); // ✅ eventId (camelCase)
    const application = await apply(eventId, req.user);
    return res.success(application, StatusCodes.CREATED); // 201
  } catch (e) {
    next(e);
  }
};

/* 밥약 신청 취소
 */
export const cancelApplication = async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId); // ✅ eventId
    const creatorId = req.params.creatorId; // ✅ creatorId
    const result = await cancel(eventId, creatorId, req.user);
    return res.success(result, StatusCodes.OK);
  } catch (e) {
    next(e);
  }
};

// 내 신청 목록
export const myApplications = async (req, res, next) => {
  try {
    const applications = await mine(req.user, req.query);
    return res.success(applications, StatusCodes.OK);
  } catch (e) {
    next(e);
  }
};

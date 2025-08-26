// src/events/application/controller/application.controller.js
import { StatusCodes } from "http-status-codes";
import { apply, cancel, mine } from "../service/application.service.js";

/** 공통 실패 응답 헬퍼 — 전역 핸들러를 안 건드리고 동일한 포맷 유지 */
function fail(res, status, errorCode, reason, data = null) {
  return res.status(status).json({
    resultType: "FAIL",
    error: { errorCode, reason, data },
    success: null,
  });
}

/** 숫자형 경로 파라미터 파싱 */
function parseId(raw, name = "id") {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    const err = new Error(`INVALID_${name.toUpperCase()}`);
    err.status = StatusCodes.BAD_REQUEST;
    err.code = `INVALID_${name.toUpperCase()}`;
    throw err;
  }
  return n;
}

// 신청 생성
export const applyApplication = async (req, res, next) => {
  try {
    const eventId = parseId(req.params.eventId, "event_id");
    const application = await apply(eventId, req.user);
    return res.success(application, StatusCodes.CREATED); // 201
  } catch (e) {
    // 서비스에서 던지는 신호를 여기서만 매핑 (핵심 공용 파일 수정 X)
    if (e?.code === "EVENT_NOT_FOUND" || e?.message === "EVENT_NOT_FOUND") {
      return fail(
        res,
        StatusCodes.NOT_FOUND,
        "EVENT_NOT_FOUND",
        "EVENT_NOT_FOUND",
      );
    }
    if (
      e?.code?.startsWith?.("INVALID_") ||
      e?.status === StatusCodes.BAD_REQUEST
    ) {
      return fail(
        res,
        StatusCodes.BAD_REQUEST,
        e.code ?? "BAD_REQUEST",
        e.message ?? "BAD_REQUEST",
      );
    }
    // 나머지는 전역 에러핸들러로
    next(e);
  }
};

/* 밥약 신청 취소 */
export const cancelApplication = async (req, res, next) => {
  try {
    const eventId = parseId(req.params.eventId, "event_id");

    // 호스트가 특정 신청자 취소: 숫자, 내 신청 취소: "me"
    const creatorIdRaw = req.params.creatorId;
    const creatorId =
      creatorIdRaw === undefined || creatorIdRaw === "me"
        ? "me"
        : parseId(creatorIdRaw, "creator_id");

    const result = await cancel(eventId, creatorId, req.user);
    return res.success(result, StatusCodes.OK);
  } catch (e) {
    if (e?.code === "EVENT_NOT_FOUND" || e?.message === "EVENT_NOT_FOUND") {
      return fail(
        res,
        StatusCodes.NOT_FOUND,
        "EVENT_NOT_FOUND",
        "EVENT_NOT_FOUND",
      );
    }
    // (선택) 서비스에서 아래 같은 코드가 온다면 매핑
    if (e?.code === "APPLICATION_NOT_FOUND") {
      return fail(
        res,
        StatusCodes.NOT_FOUND,
        "APPLICATION_NOT_FOUND",
        "APPLICATION_NOT_FOUND",
      );
    }
    if (
      e?.code?.startsWith?.("INVALID_") ||
      e?.status === StatusCodes.BAD_REQUEST
    ) {
      return fail(
        res,
        StatusCodes.BAD_REQUEST,
        e.code ?? "BAD_REQUEST",
        e.message ?? "BAD_REQUEST",
      );
    }
    next(e);
  }
};

// 내 신청 목록
export const myApplications = async (req, res, next) => {
  try {
    const applications = await mine(req.user, req.query);
    return res.success(applications, StatusCodes.OK);
  } catch (e) {
    if (
      e?.code?.startsWith?.("INVALID_") ||
      e?.status === StatusCodes.BAD_REQUEST
    ) {
      return fail(
        res,
        StatusCodes.BAD_REQUEST,
        e.code ?? "BAD_REQUEST",
        e.message ?? "BAD_REQUEST",
      );
    }
    next(e);
  }
};

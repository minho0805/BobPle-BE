// src/events/application/controller/application.controller.js
import { StatusCodes } from "http-status-codes";
import { apply, cancel, mine } from "../service/application.service.js";

/** 공통 실패 응답 헬퍼 */
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

// ───────── 신청 생성 ─────────
export const applyApplication = async (req, res, next) => {
  try {
    const eventId = parseId(req.params.eventId, "event_id");
    const application = await apply(eventId, req.user);
    return res.success(application, StatusCodes.CREATED); // 201
  } catch (e) {
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
    next(e);
  }
};

// ───────── 신청 취소(내 신청/호스트 특정 취소 모두) ─────────
export const cancelApplication = async (req, res, next) => {
  try {
    const eventId = parseId(req.params.eventId, "event_id");

    // 호스트가 특정 신청자 취소면 숫자, 내 신청 취소면 "me"
    const creatorIdRaw = req.params.creatorId;
    const creatorId =
      creatorIdRaw === undefined || creatorIdRaw === "me"
        ? "me"
        : parseId(creatorIdRaw, "creator_id");

    const result = await cancel(eventId, creatorId, req.user);
    return res.success(result, StatusCodes.OK); // 200
  } catch (e) {
    const code = e?.code || e?.message;

    if (code === "EVENT_NOT_FOUND") {
      return fail(
        res,
        StatusCodes.NOT_FOUND,
        "EVENT_NOT_FOUND",
        "EVENT_NOT_FOUND",
      );
    }
    if (code === "APPLICATION_NOT_FOUND") {
      return fail(
        res,
        StatusCodes.NOT_FOUND,
        "APPLICATION_NOT_FOUND",
        "APPLICATION_NOT_FOUND",
      );
    }
    if (code === "FORBIDDEN") {
      return fail(res, StatusCodes.FORBIDDEN, "FORBIDDEN", "FORBIDDEN");
    }
    if (code === "UNAUTHORIZED") {
      return fail(
        res,
        StatusCodes.UNAUTHORIZED,
        "UNAUTHORIZED",
        "UNAUTHORIZED",
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

// ───────── 내 신청 목록 ─────────
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

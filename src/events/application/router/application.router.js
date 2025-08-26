import { Router } from "express";
import {
  applyApplication,
  cancelApplication,
  myApplications,
} from "../controller/application.controller.js";

const r = Router();

/*
  #swagger.components = {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    }
  }
*/

/* ✅ 동적 인증 래퍼 (authenticateAccessToken > auth > default) + 개발 우회(SKIP_AUTH=1) */
/* 인증 동적로딩 + 개발우회 */
let _authFn = null;
async function authMw(req, res, next) {
  try {
    // ✅ 프로덕션 강제 차단: 실수로 우회 켜고 배포하면 서버가 뜨지 않게
    if (
      process.env.NODE_ENV === "production" &&
      process.env.SKIP_AUTH === "1"
    ) {
      const err = new Error("SKIP_AUTH must not be enabled in production");
      err.status = 500;
      return next(err); // 또는 process.exit(1) 을 서버 부팅 시점에 적용
    }

    // ✅ 개발 환경에서만 우회 허용
    if (
      process.env.SKIP_AUTH === "1" &&
      process.env.NODE_ENV !== "production"
    ) {
      if (!req.user) {
        // 필요시 .env 에서 DEV_FAKE_USER_ID 로 바꿀 수 있게
        const fakeId = Number(process.env.DEV_FAKE_USER_ID || 1);
        req.user = {
          id: fakeId,
          isCompleted: true,
          nickname: "tester" + fakeId,
        };
        // 선택: 한 번만 경고 로그
        if (!global.__authBypassWarned) {
          console.warn("[WARN] Auth bypass enabled (SKIP_AUTH=1) — dev only");
          global.__authBypassWarned = true;
        }
      }
      return next();
    }

    // ✅ 실제 인증 미들웨어 동적 로딩
    if (!_authFn) {
      const mod = await import("../../../auth/middleware/auth.middleware.js");
      const base = mod.authenticateAccessToken || mod.auth || mod.default;
      if (typeof base !== "function") {
        const err = new Error("AUTH_MIDDLEWARE_NOT_FOUND");
        err.status = 500;
        throw err;
      }
      _authFn = base;
    }

    return _authFn(req, res, (err) => {
      if (err) return next(err);

      // auth.middleware.js 가 req.payload만 채우는 구조라면 user로 매핑
      if (!req.user && req.payload) {
        const p = req.payload;
        // payload 구조에 맞게 매핑 (예: { id, isCompleted, nickname } 등)
        req.user = (p?.user || p) ?? null;
        if (!req.user?.id) {
          const e = new Error("UNAUTHORIZED");
          e.status = 401;
          return next(e);
        }
      }
      next();
    });
  } catch (e) {
    next(e);
  }
}

/* ─────────────────────────  신청 생성  ───────────────────────── */
/*
  #swagger.tags = ['Applications']
  #swagger.summary = '이벤트 신청'
  #swagger.description = '특정 이벤트에 참가 신청합니다.'
  #swagger.security = [{ bearerAuth: [] }]
  #swagger.parameters['eventId'] = {
    in: 'path', required: true, schema: { type: 'integer' }, description: '이벤트 ID'
  }
  #swagger.requestBody = {
    required: false,
    content: {
      "application/json": {
        schema: {
          type: 'object',
          properties: {
            note: { type: 'string', example: '간단한 자기소개/요청사항' }
          },
          additionalProperties: false
        }
      }
    }
  }
  #swagger.responses[201] = {
    description: '신청 생성됨',
    content: {"application/json": {schema: {example: {
      resultType: "SUCCESS",
      error: null,
      success: { id: 101, eventId: 19, creatorId: 1, createdAt: "2025-08-26T06:00:00.000Z" }
    }}}}
  }
  #swagger.responses[400] = { description: '검증 실패/이미 신청함/자기 글 신청 등' }
  #swagger.responses[401] = { description: '인증 필요' }
  #swagger.responses[404] = { description: '이벤트가 존재하지 않음' }
*/
r.post("/:eventId/applications", authMw, applyApplication);

/* ─────────────────────────  내 신청 취소  ───────────────────────── */
/*
  #swagger.tags = ['Applications']
  #swagger.summary = '내 신청 취소'
  #swagger.description = '내가 해당 이벤트에 넣은 신청을 취소합니다.'
  #swagger.security = [{ bearerAuth: [] }]
  #swagger.parameters['eventId'] = {
    in: 'path', required: true, schema: { type: 'integer' }, description: '이벤트 ID'
  }
  #swagger.responses[200] = {
    description: '삭제 결과',
    content: {"application/json": {schema: {example: {
      resultType: "SUCCESS",
      error: null,
      success: { deleted: 1 }
    }}}}
  }
*/
r.delete("/:eventId/applications/me", authMw, cancelApplication);

/* ───────────────────  호스트가 특정 신청자 취소  ─────────────────── */
/*
  #swagger.tags = ['Applications']
  #swagger.summary = '호스트가 특정 신청자 취소'
  #swagger.description = '해당 이벤트의 작성자(호스트)가 특정 신청자를 취소합니다.'
  #swagger.security = [{ bearerAuth: [] }]
  #swagger.parameters['eventId'] = {
    in: 'path', required: true, schema: { type: 'integer' }, description: '이벤트 ID'
  }
  #swagger.parameters['creatorId'] = {
    in: 'path', required: true, schema: { type: 'integer' }, description: '취소할 신청자(유저) ID'
  }
  #swagger.responses[200] = {
    description: '삭제 결과',
    content: {"application/json": {schema: {example: {
      resultType: "SUCCESS",
      error: null,
      success: { deleted: 1 }
    }}}}
  }
  #swagger.responses[403] = { description: 'FORBIDDEN (호스트 아님)' }
*/
r.delete("/:eventId/applications/:creatorId", authMw, cancelApplication);

/* ─────────────────────────  내가 신청한 목록  ───────────────────────── */
/*
  #swagger.tags = ['Applications']
  #swagger.summary = '내 신청 목록'
  #swagger.description = '내가 신청한 이벤트 목록을 페이지네이션으로 반환합니다.'
  #swagger.security = [{ bearerAuth: [] }]
  #swagger.parameters['page'] = {
    in: 'query', required: false, schema: { type: 'integer', minimum: 1 }, description: '페이지(기본 1)'
  }
  #swagger.parameters['size'] = {
    in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 50 }, description: '페이지 크기(기본 10, 최대 50)'
  }
  #swagger.responses[200] = {
    description: '페이지네이션 목록',
    content: {"application/json": {schema: {example: {
      resultType: "SUCCESS",
      error: null,
      success: {
        page: 1,
        size: 10,
        total: 3,
        items: [{ id: 11, eventId: 5, creatorId: 1, createdAt: "2025-08-20T10:00:00.000Z" }]
      }
    }}}}
  }
*/
r.get("/me/applications", authMw, myApplications);

r.delete(
  "/:eventId/application/:applicationId/cancel",
  authMw,
  async (req, res, next) => {
    try {
      const eventId = Number(req.params.eventId);
      const applicationId = Number(req.params.applicationId);
      if (!Number.isInteger(eventId) || !Number.isInteger(applicationId)) {
        return res.fail(
          { errorCode: "BAD_REQUEST", reason: "INVALID_PATH" },
          400,
        );
      }

      // 권한: 본인 신청이거나, 이벤트 작성자만 허용
      // repo 에 단건 조회 추가 필요 (아래 참고)
      const app = await appRepo.findById(applicationId);
      if (!app || app.eventId !== eventId) {
        return res.fail(
          {
            errorCode: "APPLICATION_NOT_FOUND",
            reason: "APPLICATION_NOT_FOUND",
          },
          404,
        );
      }

      // 이벤트 작성자 확인
      const ev = await eventRepo.findById(eventId);
      const isHost = ev?.creatorId === req.user.id;
      const isOwner = app.creatorId === req.user.id;
      if (!isHost && !isOwner) {
        return res.fail({ errorCode: "FORBIDDEN", reason: "FORBIDDEN" }, 403);
      }

      const result = await appRepo.deleteById(applicationId);
      return res.success({ deleted: result?.count ?? (result ? 1 : 0) }, 200);
    } catch (e) {
      next(e);
    }
  },
);

export default r;

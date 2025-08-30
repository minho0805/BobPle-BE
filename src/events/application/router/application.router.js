// src/events/application/router/application.router.js
import { Router } from "express";
import {
  applyApplication,
  cancelApplication,
  myApplications,
} from "../controller/application.controller.js";

import * as appRepo from "../repository/application.repository.js";
import * as eventRepo from "../../event/repository/event.repository.js";

const r = Router();

/* ───────── utils ───────── */
const onlyDigits400 = (names) => (req, res, next) => {
  for (const n of names) {
    const v = req.params[n];
    if (v !== undefined && !/^\d+$/.test(String(v))) {
      return res.fail(
        { errorCode: "BAD_REQUEST", reason: `INVALID_${n.toUpperCase()}` },
        400,
      );
    }
  }
  next();
};

/* ───────── auth (dev 우회 지원) ───────── */
let _authFn = null;
async function authMw(req, res, next) {
  try {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.SKIP_AUTH === "1"
    ) {
      const err = new Error("SKIP_AUTH must not be enabled in production");
      err.status = 500;
      return next(err);
    }
    if (
      process.env.SKIP_AUTH === "1" &&
      process.env.NODE_ENV !== "production"
    ) {
      if (!req.user) {
        const fakeId = Number(process.env.DEV_FAKE_USER_ID || 1);
        req.user = {
          id: fakeId,
          isCompleted: true,
          nickname: "tester" + fakeId,
        };
        if (!global.__authBypassWarned) {
          console.warn("[WARN] Auth bypass enabled (SKIP_AUTH=1) — dev only");
          global.__authBypassWarned = true;
        }
      }
      return next();
    }
    if (!_authFn) {
      const mod = await import("../../../auth/middleware/auth.middleware.js");
      _authFn = mod.authenticateAccessToken || mod.auth || mod.default;
      if (typeof _authFn !== "function") {
        const e = new Error("AUTH_MIDDLEWARE_NOT_FOUND");
        e.status = 500;
        throw e;
      }
    }
    return _authFn(req, res, (err) => {
      if (err) return next(err);
      if (!req.user && req.payload) {
        const p = req.payload;
        req.user = (p?.user || p) ?? null;
      }
      if (!req.user?.id) {
        const e = new Error("UNAUTHORIZED");
        e.status = 401;
        return next(e);
      }
      next();
    });
  } catch (e) {
    next(e);
  }
}

/* ───────── Routes (복수형 기존 경로: 호환 유지) ───────── */
r.post(
  "/:eventId/applications",
  onlyDigits400(["eventId"]),
  authMw,
  applyApplication,
);

r.delete(
  "/:eventId/applications/me",
  onlyDigits400(["eventId"]),
  authMw,
  cancelApplication,
);

r.delete(
  "/:eventId/applications/:creatorId",
  onlyDigits400(["eventId", "creatorId"]),
  authMw,
  cancelApplication,
);

r.get("/me/applications", authMw, myApplications);

/* ───────── 명세서 단수형 경로 (공식) ───────── */
// 신청: POST /api/events/:eventId/application
r.post(
  "/:eventId/application",
  onlyDigits400(["eventId"]),
  authMw,
  applyApplication,
);

// 신청 취소(by applicationId): DELETE /api/events/:eventId/application/:applicationId/cancel
r.delete(
  "/:eventId/application/:applicationId/cancel",
  onlyDigits400(["eventId", "applicationId"]),
  authMw,
  async (req, res, next) => {
    try {
      const eventId = Number(req.params.eventId);
      const applicationId = Number(req.params.applicationId);

      // 신청 존재/소속 이벤트 확인
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

      // 권한: 본인 신청자이거나 이벤트 작성자
      const ev = await eventRepo.findById(eventId);
      const isHost = ev?.creatorId === req.user.id;
      const isOwner = app.creatorId === req.user.id;
      if (!isHost && !isOwner) {
        return res.fail({ errorCode: "FORBIDDEN", reason: "FORBIDDEN" }, 403);
      }

      await appRepo.deleteById(applicationId);
      return res.success({ deleted: 1 }, 200);
    } catch (e) {
      next(e);
    }
  },
);

// 명세서: GET /api/events/me
r.get("/me", authMw, myApplications);

export default r;

import { Router } from "express";
import {
  applyApplication,
  cancelApplication,
  myApplications,
} from "../controller/application.controller.js";

const r = Router();

/* ✅ 동적 인증 래퍼 (authenticateAccessToken > auth > default) + 개발 우회(SKIP_AUTH=1) */
let _authFn = null;
async function authMw(req, res, next) {
  try {
    // 프로덕션에서 우회 금지
    if (
      process.env.NODE_ENV === "production" &&
      process.env.SKIP_AUTH === "1"
    ) {
      const err = new Error("SKIP_AUTH must not be enabled in production");
      err.status = 500;
      return next(err);
    }

    // 개발 우회
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

    // 실제 인증 미들웨어 동적 로딩
    if (!_authFn) {
      const mod = await import("../../../auth/middleware/auth.middleware.js");
      _authFn = mod.authenticateAccessToken || mod.auth || mod.default;
      if (typeof _authFn !== "function") {
        const err = new Error("AUTH_MIDDLEWARE_NOT_FOUND");
        err.status = 500;
        throw err;
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

/* ───────── Routes ───────── */
r.post("/:eventId/applications", authMw, applyApplication);
r.delete("/:eventId/applications/me", authMw, cancelApplication);
r.delete("/:eventId/applications/:creatorId", authMw, cancelApplication);
r.get("/me/applications", authMw, myApplications);

/* (스웨거 호환 경로를 쓰는 경우 아래 alias도 유지)
r.post("/:eventId/application", authMw, applyApplication);
r.delete("/:eventId/application/:applicationId/cancel", authMw, cancelByApplicationIdHandler);
*/

export default r;

// src/events/event/router/event.router.js
import { Router } from "express";
import {
  list,
  detail,
  edit,
  cancel as cancelEvent,
} from "../service/event.service.js";

const r = Router();

/* ───────── 공용 유틸 ───────── */
function onlyDigits404(req, res, next) {
  const { eventId } = req.params;
  if (eventId !== undefined && !/^\d+$/.test(String(eventId))) {
    return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  }
  next();
}

/* 인증 미들웨어 (개발 우회 지원) */
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

    // 실제 인증 미들웨어 로드
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
        req.user = (req.payload?.user || req.payload) ?? null;
      }
      next();
    });
  } catch (e) {
    next(e);
  }
}

/* ───────── 목록 ───────── */
/**
 * #swagger.tags = ['Events']
 * #swagger.summary = '밥약 목록 조회'
 * #swagger.description = '페이징, 검색, 정렬 옵션으로 전체 이벤트 목록을 가져옵니다.'
 */
r.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
    const sizeOrLimit = req.query.size ?? req.query.limit ?? "12";
    const size = Math.max(1, Math.min(50, parseInt(sizeOrLimit, 10) || 12));
    const search = (req.query.search ?? "").trim();
    const sort = (req.query.sort ?? "latest").trim();

    const result = await list({ page, size, search, sort });

    return res.status(200).json({
      ok: true,
      data: {
        items: result.items,
        pagination: {
          page,
          size,
          total: result.total,
          totalPages: Math.max(1, Math.ceil(result.total / size)),
          hasNext: page * size < result.total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

/* ───────── 상세 ───────── */
/**
 * #swagger.tags = ['Events']
 * #swagger.summary = '밥약 상세 조회'
 * #swagger.description = '이벤트 ID로 특정 밥약 상세 정보를 조회합니다.'
 */
r.get("/:eventId", onlyDigits404, async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const item = await detail(id);
    return res.status(200).json({ ok: true, data: { item } });
  } catch (e) {
    if (e?.status === 404) {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    next(e);
  }
});

/* ───────── 수정 ───────── */
/**
 * #swagger.tags = ['Events']
 * #swagger.summary = '밥약 수정'
 * #swagger.description = '작성자가 이벤트 정보를 수정합니다.'
 */
r.put("/:eventId/edit", onlyDigits404, authMw, async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const updated = await edit(id, req.body, req.user);
    return res.status(200).json({ ok: true, data: { item: updated } });
  } catch (e) {
    if (e?.status === 403) {
      return res.status(403).json({ ok: false, error: "FORBIDDEN" });
    }
    if (e?.status === 404) {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    next(e);
  }
});

/* ───────── 삭제(취소) ───────── */
/**
 * #swagger.tags = ['Events']
 * #swagger.summary = '밥약 취소/삭제'
 * #swagger.description = '작성자가 이벤트를 취소(삭제)합니다.'
 */
r.delete("/:eventId/cancel", onlyDigits404, authMw, async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const result = await cancelEvent(id, req.user);
    return res.status(200).json({ ok: true, data: result });
  } catch (e) {
    if (e?.status === 403) {
      return res.status(403).json({ ok: false, error: "FORBIDDEN" });
    }
    if (e?.status === 404) {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    next(e);
  }
});

/* ───────── 호환 알리아스 ───────── */
/**
 * #swagger.tags = ['Events']
 * #swagger.summary = '밥약 수정 (PATCH 알리아스)'
 */
r.patch("/:eventId", onlyDigits404, authMw, async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const updated = await edit(id, req.body, req.user);
    return res.status(200).json({ ok: true, data: { item: updated } });
  } catch (e) {
    next(e);
  }
});

/**
 * #swagger.tags = ['Events']
 * #swagger.summary = '밥약 취소/삭제 (DELETE 알리아스)'
 */
r.delete("/:eventId", onlyDigits404, authMw, async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const result = await cancelEvent(id, req.user);
    return res.status(200).json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
});

export default r;

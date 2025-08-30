// src/events/event/router/event.router.js
import { Router } from "express";
import { list, detail, edit, cancel } from "../service/event.service.js";

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
      next();
    });
  } catch (e) {
    next(e);
  }
}

/* ───────── 목록 ───────── */
/** GET /api/events */
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
/** GET /api/events/:eventId */
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
/** PUT /api/events/:eventId/edit */
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
/** DELETE /api/events/:eventId/cancel */
r.delete("/:eventId/cancel", onlyDigits404, authMw, async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const result = await cancel(id, req.user);
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

/* ───────── 호환 알리아스(선택) ─────────
   - 일부 클라이언트가 PATCH /:id, DELETE /:id 로만 호출할 때 404 방지용
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

r.delete("/:eventId", onlyDigits404, authMw, async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const result = await cancel(id, req.user);
    return res.status(200).json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
});

export default r;

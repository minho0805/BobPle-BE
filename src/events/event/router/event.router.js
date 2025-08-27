// 실제로 app.use로 마운트되는 라우터 파일 (예: src/events/router/event.router.js)
import { Router } from "express";
import * as svc from "../service/event.service.js";

const r = Router();

/** GET /api/events */
r.get("/", async (req, res, next) => {
  try {
    // page, size, limit 모든 이름을 수용 + 기본값
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10) || 1);
    const sizeOrLimit = req.query.size ?? req.query.limit ?? "12";
    const size = Math.max(1, Math.min(50, parseInt(sizeOrLimit, 10) || 12));
    const search = (req.query.search ?? "").trim();
    const sort = (req.query.sort ?? "latest").trim();

    const result = await svc.list({ page, size, search, sort });

    // ✅ FE가 쓰기 편한 통일 스키마
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

/** GET /api/events/:eventId */
r.get("/:eventId", async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    }
    const data = await svc.detail(id);
    if (!data) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

export default r;

// src/events/router/events.router.js
import { Router } from "express";
import { list, detail, edit, cancel } from "../event/service/event.service.js";

const r = Router();

/* ──────────── 유틸 ──────────── */
// 숫자 아닌 eventId는 404로(원하면 400으로 바꿔도 됨)
function onlyDigits404(req, res, next) {
  const { eventId } = req.params;
  if (!/^\d+$/.test(eventId)) {
    return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  }
  next();
}
function parseEventId(req, res, next) {
  const id = Number(req.params.eventId);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  }
  req.eventId = id;
  next();
}

/* ──────────── 라우터 ──────────── */
// 목록
r.get("/", async (req, res, next) => {
  console.log(
    "[HIT] GET /api/events (list) page=",
    req.query.page,
    "size=",
    req.query.size,
  );
  try {
    const page = Number(req.query.page) || 1;
    const size = Number(req.query.size) || 6;
    const data = await list({ ...req.query, page, size });
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

// 상세
r.get("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await detail(req.eventId);
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

// 수정 (PUT /:eventId)
r.put("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await edit(req.eventId, req.body, req.user);
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

// 취소 (DELETE /:eventId)
r.delete("/:eventId", onlyDigits404, parseEventId, async (req, res, next) => {
  try {
    const data = await cancel(req.eventId, req.user);
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

export default r;

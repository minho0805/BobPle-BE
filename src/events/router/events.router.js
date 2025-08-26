// src/events/router/events.router.js
import { Router } from "express";
import { list, detail, edit, cancel } from "../event/service/event.service.js";

/* ── 실제 엔드포인트들을 담는 하위 라우터 ── */
const api = Router();

// 목록
api.get("/", async (req, res, next) => {
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
api.get("/:eventId(\\d+)", async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const data = await detail(id);
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

// 수정 (PUT /:eventId)
api.put("/:eventId(\\d+)", async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const data = await edit(id, req.body, req.user);
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

// 취소 (DELETE /:eventId)
api.delete("/:eventId(\\d+)", async (req, res, next) => {
  try {
    const id = Number(req.params.eventId);
    const data = await cancel(id, req.user);
    return res.success ? res.success(data, 200) : res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

/* ── 어댑터 라우터: 어디에 마운트되든 동작 ──
   - index.js가 app.use("/api/events", router)로 마운트하면:
       "/"에 붙은 api가  →  /api/events/*  로 동작
   - index.js가 app.use("/api", router)로 마운트하면:
       "/events"에 붙은 api가  →  /api/events/* 로 동작
*/
const adapter = Router();
adapter.use("/", api); // 케이스: app.use("/api/events", adapter)
adapter.use("/events", api); // 케이스: app.use("/api", adapter)

// (선택) 기타 경로 404
adapter.all("*", (_req, res) => {
  res.status(404).json({ ok: false, error: "NOT_FOUND" });
});

export default adapter;

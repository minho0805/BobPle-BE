// src/events/router/events.router.js
import { Router } from "express";

// 하위 라우터들
import eventRouter from "../event/router/event.router.js"; // GET /, GET/PUT/DELETE /:eventId
import creationRouter from "../creation/router/creation.router.js"; // POST /
import applicationRouter from "../application/router/application.router.js"; // (있다면) 신청 관련
import restaurantsRouter from "../../restaurants/router/restaurants.router.js"; // (있다면) 식당 관련

const r = Router();

/* 헬스체크 */
r.get("/_ping", (_req, res) => res.json({ ok: true, where: "/api/events" }));

/* 공통 로그 */
r.use((req, _res, next) => {
  console.log("[EVENTS] hit", req.method, req.originalUrl);
  next();
});

/* 하위 라우터 마운트 (여기서는 절대경로 쓰지 않음) */
r.use("/", eventRouter); // 리스트/상세/수정/취소 → '/', '/:eventId'
r.use("/", creationRouter); // 생성 → 'POST /'  == POST /api/events
r.use("/", applicationRouter); // 신청 관련 경로들(있다면)
r.use("/restaurants", restaurantsRouter); // 필요 시

/* 이 블록 하위에서만 404 */
r.use((_req, res) => res.status(404).json({ ok: false, error: "NOT_FOUND" }));

export default r;

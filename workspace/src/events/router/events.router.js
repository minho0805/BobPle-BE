// src/events/router/events.router.js
import { Router } from "express";

// 하위 라우터 (절대경로 금지: 내부에서 '/' 기준으로만 정의)
import eventRouter from "../event/router/event.router.js"; // GET /, GET/PUT/DELETE /:eventId
import creationRouter from "../creation/router/creation.router.js"; // POST /
import applicationRouter from "../application/router/application.router.js"; // /:eventId/applications 등
import restaurantsRouter from "../../restaurants/router/restaurants.router.js"; // /restaurants/*

const r = Router();

/* 헬스체크 */
r.get("/_ping", (_req, res) => res.json({ ok: true, where: "/api/events" }));

/* 공통 로그 */
r.use((req, _res, next) => {
  console.log("[EVENTS] hit", req.method, req.originalUrl);
  next();
});

// /* 프리플라이트(CORS) & HEAD 허용 — (전역 CORS 미들웨어가 있다면 생략 가능) */
// r.options("/*", (_req, res) => res.sendStatus(204));
// r.head("/*", (_req, res) => res.sendStatus(200));

/* 하위 라우터 마운트 (상대 경로만) */
r.use("/", eventRouter); // '/', '/:eventId'
r.use("/", creationRouter); // 'POST /'
r.use("/", applicationRouter); // 신청 관련 경로들
r.use("/restaurants", restaurantsRouter);

/* 서브 라우터 404 (여기 블록 내에서만) */
r.use((req, res) => {
  res
    .status(404)
    .json({ ok: false, error: "NOT_FOUND", path: req.originalUrl });
});

export default r;

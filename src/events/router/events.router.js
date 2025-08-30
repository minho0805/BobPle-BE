import { Router } from "express";

// 하위 라우터 (절대경로 금지: 내부에서 '/' 기준으로만 정의)
import applicationRouter from "../application/router/application.router.js"; // 신청 관련
import eventRouter from "../event/router/event.router.js"; // GET /, GET/PUT/DELETE /:eventId
import creationRouter from "../creation/router/creation.router.js"; // POST /
import restaurantsRouter from "../../restaurants/router/restaurants.router.js";
import commentsRouter from "../comments/router/comments.router.js";

const r = Router();

/* 헬스체크 */
r.get("/_ping", (_req, res) => res.json({ ok: true, where: "/api/events" }));

/* 공통 로그 */
r.use((req, _res, next) => {
  console.log("[EVENTS] hit", req.method, req.originalUrl);
  next();
});

/* 하위 라우터 마운트 (상대 경로만)
   ⚠️ applicationRouter를 먼저 마운트해서 catch-all 404에 막히지 않게 한다.
*/
r.use("/", applicationRouter); // ← 먼저
r.use("/", eventRouter);
r.use("/", creationRouter);
r.use("/restaurants", restaurantsRouter);
r.use("/:eventId/comments", commentsRouter);

/* 서브 라우터 404 (여기 블록 내에서만) */
r.use((req, res) => {
  res
    .status(404)
    .json({ ok: false, error: "NOT_FOUND", path: req.originalUrl });
});

export default r;

import { Router } from "express";
import {
  applyApplication,
  cancelApplicationByCreator, // 복수형: me | :creatorId
  cancelApplicationById, // 단수형: :applicationId/cancel
  myApplications,
} from "../controller/application.controller.js";
import authMw from "../../../auth/middlewares/auth.middleware.js"; // 경로 맞춰주세요

const r = Router();

// 디버그 로그(선택)
r.use((req, _res, next) => {
  console.log("[APPLICATION] hit", req.method, req.originalUrl);
  next();
});

/* ───── 명세(Swagger) 단수형 경로 ─────
   최종: POST   /api/events/:eventId/application
   최종: DELETE /api/events/:eventId/application/:applicationId/cancel
*/
r.post("/:eventId/application", authMw, applyApplication);
r.delete(
  "/:eventId/application/:applicationId/cancel",
  authMw,
  cancelApplicationById,
);

/* ───── 복수형(기존) 경로 호환 ─────
   최종: POST   /api/events/:eventId/applications
   최종: DELETE /api/events/:eventId/applications/me
   최종: DELETE /api/events/:eventId/applications/:creatorId
   최종: GET    /api/events/me/applications
*/
r.post("/:eventId/applications", authMw, applyApplication);
r.delete("/:eventId/applications/me", authMw, cancelApplicationByCreator);
r.delete(
  "/:eventId/applications/:creatorId",
  authMw,
  cancelApplicationByCreator,
);
r.get("/me/applications", authMw, myApplications);

export default r;

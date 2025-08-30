// 파일: src/events/application/router/application.router.js
import * as appRepo from "../repository/application.repository.js";
// 이벤트 단건 조회용 (프로젝트 경로/함수명에 맞게 수정)
import * as eventRepo from "../../event/repository/event.repository.js";

// ...위쪽 코드는 그대로...

/* ───────── Routes (복수형 기존 경로) ───────── */
r.post("/:eventId/applications", authMw, applyApplication);
r.delete("/:eventId/applications/me", authMw, cancelApplication);
r.delete("/:eventId/applications/:creatorId", authMw, cancelApplication);
r.get("/me/applications", authMw, myApplications);

/* ───────── Swagger 호환 단수형 alias ───────── */
r.post("/:eventId/application", authMw, applyApplication);

r.delete(
  "/:eventId/application/:applicationId/cancel",
  authMw,
  async (req, res, next) => {
    try {
      const eventId = Number(req.params.eventId);
      const applicationId = Number(req.params.applicationId);
      if (!Number.isInteger(eventId) || !Number.isInteger(applicationId)) {
        return res.fail(
          { errorCode: "BAD_REQUEST", reason: "INVALID_PATH" },
          400,
        );
      }

      // 신청 존재/소속 이벤트 확인
      const app = await appRepo.findById(applicationId);
      if (!app || app.eventId !== eventId) {
        return res.fail(
          {
            errorCode: "APPLICATION_NOT_FOUND",
            reason: "APPLICATION_NOT_FOUND",
          },
          404,
        );
      }

      // 권한: 본인 신청자이거나 이벤트 작성자
      const ev = await eventRepo.findById(eventId);
      const isHost = ev?.creatorId === req.user.id;
      const isOwner = app.creatorId === req.user.id;
      if (!isHost && !isOwner) {
        return res.fail({ errorCode: "FORBIDDEN", reason: "FORBIDDEN" }, 403);
      }

      await appRepo.deleteById(applicationId);
      return res.success({ deleted: 1 }, 200);
    } catch (e) {
      next(e);
    }
  },
);

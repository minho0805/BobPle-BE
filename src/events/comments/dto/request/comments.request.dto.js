// src/events/comments/dto/request/comments.request.dto.js

import { InvalidInputValueError } from "../../../../error.js";

/** 공통: 숫자 파싱 유틸 */
const toInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};

/** POST /api/events/:eventId/comments  */
export const bodyToCreateComment = (req) => {
  const eventId = toInt(req.params?.eventId);
  const content = String(req.body?.content ?? "").trim();

  // 로그인 미들웨어가 세팅한 payload 사용
  const creatorId = req.payload?.id ?? req.payload?.userId ?? null;

  if (!eventId || Number.isNaN(eventId)) {
    throw new InvalidInputValueError("invalid eventId");
  }
  if (!creatorId) {
    throw new InvalidInputValueError("invalid creatorId");
  }
  if (!content) {
    throw new InvalidInputValueError("content is required");
  }

  return { eventId, creatorId, content };
};

/** GET /api/events/:eventId/comments?page=&size=  */
export const queryToListComments = (req) => {
  const eventId = toInt(req.params?.eventId);
  if (!eventId || Number.isNaN(eventId)) {
    throw new InvalidInputValueError("invalid eventId");
  }

  // 기본값: page=1, size=10, size 상한 50
  let page = toInt(req.query?.page ?? 1);
  let size = toInt(req.query?.size ?? 10);

  if (!page || page < 1) page = 1;
  if (!size || size < 1) size = 10;
  if (size > 50) size = 50;

  return { eventId, page, size };
};

/** DELETE /api/events/:eventId/comments/:commentId */
export const paramsToDeleteComment = (req) => {
  const eventId = toInt(req.params?.eventId);
  const commentId = toInt(req.params?.commentId);
  const requesterId = req.payload?.id ?? req.payload?.userId ?? null;

  if (!eventId || Number.isNaN(eventId)) {
    throw new InvalidInputValueError("invalid eventId");
  }
  if (!commentId || Number.isNaN(commentId)) {
    throw new InvalidInputValueError("invalid commentId");
  }
  if (!requesterId) {
    throw new InvalidInputValueError("invalid requester");
  }

  // 서비스 레이어에서 본인 댓글/권한 체크에 활용
  return { eventId, commentId, requesterId };
};

// src/events/router/events.router.js
import { Router } from "express";

// 하위 라우터들
import creationRouter from "../creation/router/creation.router.js";
import eventRouter from "../event/router/event.router.js";
import applicationRouter from "../application/router/application.router.js";
import restaurantsRouter from "../../restaurants/router/restaurants.router.js"; // /api/events/restaurants

const r = Router();

// (선택) 디버그 로그
console.log("[events] events.router.js loaded");

// /api/events 하위에 매핑
// ⚠️ 하위 라우터들은 전부 "루트('/') 기준"이어야 최종 경로가 /api/events/* 로 맞습니다.
r.use("/", eventRouter); // 목록/상세/수정/삭제:  GET/PUT/DELETE /api/events[/:eventId]
r.use("/", creationRouter); // 생성:               POST /api/events
r.use("/", applicationRouter); // 신청/취소/내 신청:   /api/events/* (하위 라우터 정의에 따름)
r.use("/restaurants", restaurantsRouter); // 식당 검색: /api/events/restaurants

export default r;

// src/events/application/service/application.service.js

import {
  findMyAppForEvent,
  createApp,
  deleteAppById as deleteAppByIdRepo, // ✅ 별칭으로 충돌 제거
  listMine as listMineRepo,
  countMine as countMineRepo,
} from '../repository/application.repository.js';

// (필요하다면) 이벤트 유효성 검사용
// import { findEvent } from '../../event/repository/event.repository.js';

// 신청 생성
export const apply = async (eventId, user) => {
  const exists = await findMyAppForEvent(eventId, user.id);
  if (exists) throw new Error('ALREADY_APPLIED');

  return await createApp(eventId, user.id);
};

// 신청 취소
export const cancel = async (eventId, applicationId, user) => {
  return await deleteAppByIdRepo(applicationId);
};

// 내 신청 목록
export const mine = async (user, query = {}) => {
  const page = Number(query.page ?? 1);
  const size = Number(query.size ?? 10);
  const take = size;
  const skip = (page - 1) * size;

  const [rows, total] = await Promise.all([
    listMineRepo(user.id, skip, take),
    countMineRepo(user.id),
  ]);

  return { total, page, size, rows };
};
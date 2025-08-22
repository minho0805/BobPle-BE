import {
  findMyApplicationForEvent,
  createApplication,
  deleteApplication,
  listMyApplications,
  countMyApplications,
} from '../repository/application.repository.js';

// 신청 생성
export const apply = async (eventId, user) => {
  const exists = await findMyApplicationForEvent(eventId, user.id);
  if (exists) throw new Error('ALREADY_APPLIED');

  return await createApplication(eventId, user.id);
};

// 신청 취소
export const cancel = async (eventId, applicationId, user) => {
  // 보안 강화를 위해 applicationId + user.id 체크를 권장
  return await deleteApplication(applicationId);
};

// 내 신청 목록
export const mine = async (user, query = {}) => {
  const page = Number(query.page ?? 1);
  const size = Number(query.size ?? 10);
  const skip = (page - 1) * size;
  const take = size;

  const [rows, total] = await Promise.all([
    listMyApplications(user.id, skip, take),
    countMyApplications(user.id),
  ]);

  return { total, page, size, rows };
};
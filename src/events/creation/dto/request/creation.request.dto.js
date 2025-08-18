// 기존 date + start_time + end_time 로직 제거하고,
// start_at / end_at 를 그대로 받아 검증합니다.

export function parseCreateBody(body = {}) {
  const {
    title,
    content,
    restaurant_id,

    // 둘 다 필수 (ISO datetime)
    start_at,   // e.g. "2025-08-22T18:30:00.000Z" 또는 "2025-08-22 18:30"
    end_at,     // e.g. "2025-08-22T20:00:00.000Z"

    // (옵션) 최대 참여자 수 — 1~4만 허용, DB 저장은 안 하고 응답에만 전달
    max_participants,
  } = body;

  if (!title || !restaurant_id || !start_at || !end_at) {
    throw new Error('제대로 입력하세요');
  }

  const start = new Date(start_at);
  const end   = new Date(end_at);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('잘못된 시간입니다.');
  }
  if (start <= new Date()) {
    throw new Error('시작 시간은 현재보다 미래에 가능합니다');
  }
  if (end <= start) {
    throw new Error('종료 시간은 시작 시간보다 미래에 가능합니다. ');
  }

  // 최대 참여자 수: 1~4만 허용 (스키마에 컬럼이 없으므로 저장은 못 하고 응답에만 반영)
  let maxP = max_participants ?? 4;
  maxP = Number(maxP);
  if (!Number.isFinite(maxP) || maxP < 1 || maxP > 4) {
    throw new Error('최대 참여 인원은 1~4명입니다.');
  }

  return {
    title,
    content: content ?? '',
    restaurant_id: Number(restaurant_id),
    start_at: start,
    end_at: end,
    max_participants: maxP,
  };
}
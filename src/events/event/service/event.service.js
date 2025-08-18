import { findByIdWithParticipants, findMany, countAll, updateById, deleteById } from '../repository/event.repository.js';
import { buildChatUrl } from '../../../utils/chat.js';

export async function list(q){
  const page = Number(q.page || 1), size = Number(q.size || 10);
  const [items, total] = await Promise.all([
    findMany((page-1)*size, size),
    countAll(),
  ]);
  return {
    items: items.map(ev => ({ ...ev, chatUrl: buildChatUrl(ev) })),
    page, size, total
  };
}

export async function detail(eventId){
  const ev = await findByIdWithParticipants(eventId);
  if(!ev) throw new Error('not found');

  const participants = (ev.eventApplications || []).map(a => ({
    id: a.users?.id,
    nickname: a.users?.nickname,
    applicationId: a.id,
  }));

  return {
    id: ev.id,
    title: ev.title,
    content: ev.content,
    restaurant_id: ev.restaurantId,
    start_at: ev.startAt,
    end_at: ev.endAt,
    creator: { id: ev.users?.id, nickname: ev.users?.nickname },
    participants_count: participants.length,   // ← 현재 스키마상 최대 1
    participants,
    chatUrl: buildChatUrl(ev),
  };
}

export async function edit(eventId, patch, me){
  const allowed = {};
  if (patch.title) allowed.title = patch.title;
  if (patch.content) allowed.content = patch.content;
  if (patch.restaurant_id) allowed.restaurantId = Number(patch.restaurant_id);
  if (patch.start_at) allowed.startAt = new Date(patch.start_at);
  if (patch.end_at) allowed.endAt = new Date(patch.end_at);

  const updated = await updateById(eventId, allowed);
  return { ...updated, chatUrl: buildChatUrl(updated) };
}

export async function cancel(eventId){
  const id = Number(eventId);
  await deleteById(id);
  return { id, canceled: true };
}
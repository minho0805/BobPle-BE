// src/events/event/service/event.service.js
import {
  findByIdWithParticipants,
  findMany,
  countAll,
  updateById,
  deleteById,
} from '../repository/event.repository.js';

const buildChatUrl = (ev) => `/chats/event/${ev.id}`; // 필요 시 실제 규칙으로 교체

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
    participants_count: participants.length,
    participants,
    chatUrl: buildChatUrl(ev),
  };
}

export async function edit(eventId, patch, me){
  const ev = await findByIdWithParticipants(eventId);
  if (!ev) throw new Error('not found');
  if (!me || ev.creatorId !== me.id) {
    const err = new Error('FORBIDDEN'); err.status = 403; throw err;
  }

  const allowed = {};
  if (patch.title !== undefined) allowed.title = patch.title;
  if (patch.content !== undefined) allowed.content = patch.content;
  if (patch.restaurantId !== undefined) allowed.restaurantId = Number(patch.restaurantId);
  if (patch.startAt !== undefined) allowed.startAt = patch.startAt;
  if (patch.endAt !== undefined) allowed.endAt = patch.endAt;

  const updated = await updateById(eventId, allowed);
  return { ...updated, chatUrl: buildChatUrl(updated) };
}

export async function cancel(eventId, me){
  const ev = await findByIdWithParticipants(eventId);
  if (!ev) throw new Error('not found');
  if (!me || ev.creatorId !== me.id) {
    const err = new Error('FORBIDDEN'); err.status = 403; throw err;
  }
  const id = Number(eventId);
  await deleteById(id);
  return { id, canceled: true };
}
import * as repo from '../repository/application.repository.js';

export async function apply(eventId, me){
  const ev = await repo.findEvent(eventId);
  if(!ev) throw new Error('event not found');
  if(ev.startAt <= new Date()) throw new Error('already past');

  // 중복 체크 (스키마상 eventId/creatorId가 @unique라 DB에서도 막히긴 함)
  const exists = await repo.findMyAppForEvent(eventId, me.id);
  if(exists) throw new Error('already applied');

  try{
    return await repo.createApp(eventId, me.id);
  }catch(e){
    // unique 제약 위반 시 친절한 메시지로 변환
    if (e.code === 'P2002') throw new Error('already applied');
    throw e;
  }
}

export async function cancel(eventId, applicationId, me){
  const app = await repo.findAppById(applicationId);
  if(!app) throw new Error('not applied');
  if(app.creatorId !== me.id) throw new Error('forbidden');
  if(app.eventId !== Number(eventId)) throw new Error('invalid application for event');

  await repo.deleteAppById(applicationId);
  return { id: Number(applicationId), canceled: true };
}

export async function mine(me, q){
  const page = Number(q.page || 1), size = Number(q.size || 10);
  const [items, total] = await Promise.all([
    repo.listMine(me.id, (page-1)*size, size),
    repo.countMine(me.id),
  ]);
  return { items, page, size, total };
}
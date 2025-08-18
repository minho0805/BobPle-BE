import { findMany, countAll, findById, updateById } from '../repository/event.repository.js';
import { buildChatUrl } from '../../../utils/chat.js';

export async function list(q){
  const page=Number(q.page||1), size=Number(q.size||10);
  const [items,total]=await Promise.all([ findMany((page-1)*size,size), countAll() ]);
  return { items: items.map(p=>({ ...p, chatUrl: buildChatUrl(p) })), page, size, total };
}
export async function detail(eventId){
  const post = await findById(eventId); if(!post) throw new Error('not found');
  const { author, ...rest } = post; return { ...rest, chatUrl: buildChatUrl(post), author };
}
export async function edit(eventId, patch, me){
  const cur = await findById(eventId); if(!cur) throw new Error('not found');
  if(cur.authorId !== me.id) throw new Error('forbidden');
  if(cur.status === 'CANCELED') throw new Error('cannot update canceled post');
  const updated = await updateById(eventId, {
    title: patch.title ?? cur.title,
    content: patch.content ?? cur.content,
    restaurantName: patch.restaurantName ?? cur.restaurantName,
    startAt: patch.startAt ?? cur.startAt,
    endAt: patch.endAt ?? cur.endAt,
    maxParticipants: patch.maxParticipants ?? cur.maxParticipants,
    status: patch.status ?? cur.status,
  });
  return { ...updated, chatUrl: buildChatUrl(updated) };
}
export async function cancel(eventId, me){
  const cur = await findById(eventId); if(!cur) throw new Error('not found');
  if(cur.authorId !== me.id) throw new Error('forbidden');
  const updated = await updateById(eventId, { status:'CANCELED' });
  return { ...updated, chatUrl: buildChatUrl(updated) };
}
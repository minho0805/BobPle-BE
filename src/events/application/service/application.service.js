import { prisma } from '../../../db/client.js';
import * as repo from '../repository/application.repository.js';

export async function apply(eventId, me){
  return prisma.$transaction(async (tx)=>{
    const post = await tx.mealPost.findUnique({ where:{ id: BigInt(eventId) } });
    if(!post) throw new Error('post not found');
    if(post.status!=='OPEN') throw new Error('post not open');
    if(post.startAt <= new Date()) throw new Error('already past');

    const exists = await tx.application.findUnique({ where:{ postId_userId:{ postId: BigInt(eventId), userId: me.id } } });
    if(exists) throw new Error('already applied');

    const applied = await tx.application.count({ where:{ postId: BigInt(eventId), status:'APPLIED' } });
    if(applied >= post.maxParticipants) throw new Error('full');

    return tx.application.create({ data:{ postId: BigInt(eventId), userId: me.id, status:'APPLIED' } });
  }, { isolationLevel: 'Serializable' });
}

export async function cancel(eventId, applicationId, me){
  const app = await repo.findAppById(BigInt(applicationId));
  if(!app) throw new Error('not applied');
  if(app.userId !== me.id) throw new Error('forbidden');
  if(app.postId !== BigInt(eventId)) throw new Error('invalid application for event');
  if(app.status==='CANCELED') return app;
  return repo.cancelApp(BigInt(applicationId));
}

export async function mine(me, q){
  const page=Number(q.page||1), size=Number(q.size||10);
  const [items,total]=await Promise.all([
    repo.listMine(me.id,(page-1)*size,size),
    repo.countMine(me.id)
  ]);
  return { items, page, size, total };
}
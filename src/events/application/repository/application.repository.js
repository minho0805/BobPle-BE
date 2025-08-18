import { prisma } from '../../../db/client.js';
export const findPost = (id)=> prisma.mealPost.findUnique({ where:{ id } });
export const findAppByUnique = (postId,userId)=> prisma.application.findUnique({ where:{ postId_userId:{ postId, userId } } });
export const countApplied = (postId)=> prisma.application.count({ where:{ postId, status:'APPLIED' } });
export const createApp = (postId,userId)=> prisma.application.create({ data:{ postId, userId, status:'APPLIED' } });
export const findAppById = (id)=> prisma.application.findUnique({ where:{ id } });
export const cancelApp = (id)=> prisma.application.update({ where:{ id }, data:{ status:'CANCELED', canceledAt: new Date() } });
export const listMine = (userId, skip, take)=> prisma.application.findMany({
  where:{ userId, status:'APPLIED' }, orderBy:{ id:'desc' }, skip, take, include:{ post:true }
});
export const countMine = (userId)=> prisma.application.count({ where:{ userId, status:'APPLIED' } });
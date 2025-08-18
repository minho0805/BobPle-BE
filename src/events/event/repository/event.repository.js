import { prisma } from '../../../db/client.js';
export const findMany = (skip,take)=> prisma.mealPost.findMany({ orderBy:{id:'desc'}, skip, take });
export const countAll = ()=> prisma.mealPost.count();
export const findById = (id)=> prisma.mealPost.findUnique({ where:{ id: BigInt(id) }, include:{ author:true } });
export const updateById = (id,data)=> prisma.mealPost.update({ where:{ id: BigInt(id) }, data });
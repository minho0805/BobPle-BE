import { prisma } from '../../../db/client.js';
export const createPost = (data) => prisma.mealPost.create({ data });
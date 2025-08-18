import { prisma } from '../../../db/client.js';

export const insertEvent = (data) => prisma.events.create({ data });
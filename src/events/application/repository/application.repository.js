import { prisma } from '../../../db/client.js';

export const findEvent = (id) =>
  prisma.events.findUnique({ where: { id: Number(id) } });

export const findMyAppForEvent = (eventId, userId) =>
  prisma.eventApplications.findFirst({
    where: { eventId: Number(eventId), creatorId: Number(userId) },
  });

export const createApp = (eventId, userId) =>
  prisma.eventApplications.create({
    data: { eventId: Number(eventId), creatorId: Number(userId) },
  });

export const findAppById = (id) =>
  prisma.eventApplications.findUnique({ where: { id: Number(id) } });

export const deleteAppById = (id) =>
  prisma.eventApplications.delete({ where: { id: Number(id) } });

export const listMine = (userId, skip, take) =>
  prisma.eventApplications.findMany({
    where: { creatorId: Number(userId) },
    include: { events: true },
    orderBy: { id: 'desc' },
    skip, take,
  });

export const countMine = (userId) =>
  prisma.eventApplications.count({ where: { creatorId: Number(userId) } });
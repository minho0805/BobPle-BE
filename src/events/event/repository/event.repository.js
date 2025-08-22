// src/events/event/repository/event.repository.js
import { PrismaClient } from '../../../generated/prisma/index.js';
const prisma = new PrismaClient();

export const findByIdWithParticipants = (id) =>
  prisma.events.findUnique({
    where: { id: Number(id) },
    include: {
      users: { select: { id: true, nickname: true } }, // 작성자
      eventApplications: {
        include: {
          users: { select: { id: true, nickname: true } }, // 신청자
        },
        orderBy: { id: 'asc' },
      },
    },
  });

export const findMany = (skip, take) =>
  prisma.events.findMany({ orderBy: { id: 'desc' }, skip, take });

export const countAll = () => prisma.events.count();

export const updateById = (id, data) =>
  prisma.events.update({ where: { id: Number(id) }, data });

export const deleteById = (id) =>
  prisma.events.delete({ where: { id: Number(id) } });
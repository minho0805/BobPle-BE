import { prisma } from '../../../db/client.js';   


export async function create(dto, user) {
  return prisma.events.create({
    data: {
      title: dto.title,
      content: dto.content,
      startAt: dto.startAt,
      endAt: dto.endAt,
      creatorId: user.id,
      restaurantId: dto.restaurantId,
    },
  });
}
import { prisma } from "../../db.config.js";
export const findRestaurants = async (data) => {
  return await prisma.restaurants.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      address: true,
      telephone: true,
      mapx: true,
      mapy: true,
      isSponsored: true,
    },
    where: data.options,
    orderBy: {
      isSponsored: "desc",
    },
    skip: (data.page - 1) * data.take,
    take: data.take,
  });
};

export const countRestaurants = async (options) => {
  return await prisma.restaurants.count({
    where: options,
  });
};
export const findRestaurantById = async (data) => {
  return await prisma.restaurants.findFirst({
    select: {
      name: true,
      category: true,
      address: true,
      telephone: true,
      mapx: true,
      mapy: true,
      isSponsored: true,
    },
    where: {
      id: data.restaurantId,
    },
  });
};

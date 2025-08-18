import { prisma } from '../../db/client.js';

// 목록 검색
export async function search({ query, category, page, size }) {
  const where = {
    ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
    ...(category ? { category } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.restaurants.findMany({
      where,
      orderBy: [{ name: 'asc' }],
      skip: (page - 1) * size,
      take: size,
      select: {
        id: true, name: true, category: true, address: true,
        telephone: true, mapx: true, mapy: true,
      },
    }),
    prisma.restaurants.count({ where }),
  ]);

  return { items, total };
}

// 탭 카운트 (전체/한/중/일)
export async function counts(query) {
  const whereBase = query ? { name: { contains: query, mode: 'insensitive' } } : {};
  const [all, kr, ch, jp] = await Promise.all([
    prisma.restaurants.count({ where: whereBase }),
    prisma.restaurants.count({ where: { ...whereBase, category: 'Korean'   } }),
    prisma.restaurants.count({ where: { ...whereBase, category: 'Chinese'  } }),
    prisma.restaurants.count({ where: { ...whereBase, category: 'Japanese' } }),
  ]);
  return { all, Korean: kr, Chinese: ch, Japanese: jp };
}

// 자동완성
export async function suggest({ query, limit }) {
  return prisma.restaurants.findMany({
    where: { name: { contains: query, mode: 'insensitive' } },
    orderBy: [{ name: 'asc' }],
    take: limit,
    select: { id: true, name: true, category: true },
  });
}
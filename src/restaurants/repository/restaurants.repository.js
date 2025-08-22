// src/restaurants/repository/restaurants.repository.js
import { PrismaClient } from '../../generated/prisma/client.js';
const prisma = new PrismaClient();

function toCard(r){
  const lat = r.mapy / 1e7;
  const lng = r.mapx / 1e7;
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    address: r.address,
    rating: r.rating ?? null,       // 없으면 FE에서 숨김 처리
    reviewCount: r.reviewCount ?? null,
    openingHours: r.openingHours ?? null,
    tags: r.tags ?? [],
    lat, lng
  };
}

export async function search({ query, category, page, size, lat, lng, radius }) {
  // 1차: 텍스트/카테고리 필터로 가져오기
  const where = {
    ...(category && { category }),
    ...(query && { name: { contains: query } })
  };
  const [list, total] = await Promise.all([
    prisma.restaurant.findMany({
      where, skip: (page-1)*size, take: size,
      orderBy: { name: 'asc' }
    }),
    prisma.restaurant.count({ where })
  ]);

  // 2차: 좌표가 들어오면 거리 계산 및 radius 필터(메모리상; 데이터가 15개라 충분히 빠름)
  let items = list.map(toCard);
  if (lat != null && lng != null) {
    const R = 6371000; // meters
    const d2r = (d)=> d*Math.PI/180;
    items = items.map(it=>{
      const dLat = d2r(it.lat - lat);
      const dLng = d2r(it.lng - lng);
      const a = Math.sin(dLat/2)**2 + Math.cos(d2r(lat))*Math.cos(d2r(it.lat))*Math.sin(dLng/2)**2;
      const distanceMeters = 2*R*Math.asin(Math.sqrt(a));
      return { ...it, distanceMeters: Math.round(distanceMeters) };
    }).sort((a,b)=> (a.distanceMeters??0)-(b.distanceMeters??0));

    if (radius) items = items.filter(it => it.distanceMeters <= radius);
  }

  return { items, page, size, total };
}

export async function suggest({ query }) {
  if (!query) return [];
  const rows = await prisma.restaurant.findMany({
    where: { name: { startsWith: query } }, take: 8, orderBy: { name: 'asc' }
  });
  return rows.map(r=> r.name);
}

export async function findById(id) {
  const r = await prisma.restaurant.findUnique({ where: { id: Number(id) }});
  return r ? toCard(r) : null;
}
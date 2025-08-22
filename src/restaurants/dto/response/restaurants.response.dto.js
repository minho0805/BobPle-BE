// src/restaurants/dto/response/restaurants.response.dto.js
export const toSearchResponse = (row) => {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    address: row.address,
    telephone: row.telephone,
    // mapx/mapy → 위도/경도로 변환 (소수점 좌표)
    lat: row.mapy / 1e7,
    lng: row.mapx / 1e7,
    isSponsored: row.is_sponsored,
    // rating / reviewCount / openingHours / tags 있으면 그대로 노출
    rating: row.rating ?? null,
    reviewCount: row.reviewCount ?? 0,
    openingHours: row.openingHours ?? null,
    tags: row.tags ?? []
  };
};

// 여러 개 처리 편의용
export const toSearchListResponse = (rows=[]) => rows.map(toSearchResponse);
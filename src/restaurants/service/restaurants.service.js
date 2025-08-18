import { searchLocal } from '../repository/restaurants.repository.js';
import { tm128ToWgs84, haversine } from '../../../utils/geo.js';
import { config } from '../../../config/env.js';

const normalize = (it)=>({
  name:(it.title||'').replace(/<[^>]+>/g,''),
  category: it.category||'',
  tel: it.telephone||null,
  address: it.roadAddress || it.address || '',
  link: it.link || '',
  mapx: Number(it.mapx), mapy: Number(it.mapy),
});

async function resolveCenter(){
  const { data } = await searchLocal({ query: config.CENTER_QUERY || '서경대학교', display:1, start:1, sort:'random' });
  const item=(data.data?.items||data.items||[])[0];
  if(!item) throw new Error('CENTER_QUERY geocode failed');
  const { lat, lon } = tm128ToWgs84(item.mapx, item.mapy);
  return { lat, lon };
}

export async function search({ query, type, page=1, size=20, radius }){
  const q = (query && String(query).trim()) || '음식점';
  const display = Math.min(Math.max(Number(size),1),30);
  const start = (Number(page)-1)*display + 1;

  const { data } = await searchLocal({ query:q, display, start, sort:'random' });
  let items=(data.items||[]).map(normalize);
  if(type) items = items.filter(i=> (i.category||'').includes(type));

  const center = await resolveCenter();
  const r = Number(radius || config.RADIUS_M || 1000);

  const enriched = items.map(i=>{
    const { lat, lon } = tm128ToWgs84(i.mapx, i.mapy);
    const distance = haversine(center.lat, center.lon, lat, lon);
    return { ...i, lat, lon, distance };
  }).filter(i=> i.distance <= r).sort((a,b)=> a.distance - b.distance);

  return { center:{...center, radius:r}, page:Number(page), size:display, count:enriched.length, items:enriched };
}
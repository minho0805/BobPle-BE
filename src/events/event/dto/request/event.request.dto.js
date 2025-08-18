export function parseUpdateBody(body){
  const out = {};
  if(body.title) out.title = body.title;
  if(body.content) out.content = body.content;
  if(body.restaurantName) out.restaurantName = body.restaurantName;
  if(body.maxParticipants) out.maxParticipants = Number(body.maxParticipants);
  if(body.startAt){ const s=new Date(body.startAt); if(isNaN(s)||s<=new Date()) throw new Error('invalid startAt'); out.startAt=s; }
  if(body.endAt){ const e=new Date(body.endAt); if(isNaN(e)) throw new Error('invalid endAt'); out.endAt=e; }
  if(out.endAt && out.startAt && out.endAt <= out.startAt) throw new Error('endAt must be after startAt');
  if(body.status) out.status = body.status; // OPEN/CLOSED/CANCELED
  return out;
}
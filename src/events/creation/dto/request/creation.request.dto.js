export function parseCreateBody(body){
  const { title, content, restaurantName, startAt, endAt, maxParticipants } = body || {};
  if(!title || !content || !startAt || !endAt || !maxParticipants) throw new Error('missing fields');
  const start=new Date(startAt), end=new Date(endAt);
  if(isNaN(start)||isNaN(end)) throw new Error('invalid datetime');
  if(start<=new Date()) throw new Error('startAt must be future');
  if(end<=start) throw new Error('endAt must be after startAt');
  return { title, content, restaurantName, start, end, maxParticipants:Number(maxParticipants) };
}
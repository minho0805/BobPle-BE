export function parseUpdateBody(body = {}) {
  const patch = {};
  if (body.title) patch.title = body.title;
  if (body.content) patch.content = body.content;
  if (body.restaurant_id) patch.restaurant_id = Number(body.restaurant_id);
  if (body.start_at) {
    const s = new Date(body.start_at);
    if (isNaN(s) || s <= new Date()) throw new Error('invalid start_at');
    patch.start_at = s;
  }
  if (body.end_at) {
    const e = new Date(body.end_at);
    if (isNaN(e)) throw new Error('invalid end_at');
    patch.end_at = e;
  }
  if (patch.start_at && patch.end_at && patch.end_at <= patch.start_at) {
    throw new Error('end_at must be after start_at');
  }
  return patch;
}
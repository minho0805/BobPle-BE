import { createPost } from '../repository/creation.repository.js';
import { buildChatUrl } from '../../../utils/chat.js';

export async function create({ title, content, restaurantName, start, end, maxParticipants }, me){
  const post = await createPost({
    title, content, restaurantName, startAt: start, endAt: end, maxParticipants, authorId: me.id
  });
  return { ...post, chatUrl: buildChatUrl(post) };
}
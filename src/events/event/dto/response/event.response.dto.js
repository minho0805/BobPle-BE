import { buildChatUrl } from '../../../utils/chat.js';
export const toEventResponse = (post) => ({ ...post, chatUrl: buildChatUrl(post) });
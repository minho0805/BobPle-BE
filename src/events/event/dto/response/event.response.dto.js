import { buildChatUrl } from '../../../utils/chat.js';
export const toEventResponse = (ev) => ({ ...ev, chatUrl: buildChatUrl(ev) });
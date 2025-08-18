import axios from 'axios';
import { config } from '../../../config/env.js';
const NAVER_LOCAL = 'https://openapi.naver.com/v1/search/local.json';
const headers = () => ({
  'X-Naver-Client-Id': config.NAVER_CLIENT_ID,
  'X-Naver-Client-Secret': config.NAVER_CLIENT_SECRET,
});
export const searchLocal = (params) => axios.get(NAVER_LOCAL, { headers: headers(), params });
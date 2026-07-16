import http from 'k6/http';
import { BASE_URL } from '../config/environment.js';

export function getListSasaran(token, page = 1, limit = 100) {
  const url = `${BASE_URL}/sasarans?page=${page}&limit=${limit}`;

  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  };

  return http.get(url, params);
}
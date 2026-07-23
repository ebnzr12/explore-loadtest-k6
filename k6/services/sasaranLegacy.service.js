import http from 'k6/http';
import { BASE_URL } from '../config/environment.js';

export function getListSasaranLegacy(token, page = 1, limit = 100) {
  const url = `${BASE_URL}/legacy/api/sasarans?page=${page}&limit=${limit}`;
  // const url = `http://192.168.255.6:3000/api/sasarans?page=${page}&limit=${limit}`;

  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  };

  return http.get(url, params);
}
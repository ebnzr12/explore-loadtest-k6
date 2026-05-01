import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ✅ LOGIN SEKALI DI AWAL
export function setup() {
  const res = http.post(
    'https://dev-app.epusconnext.id/api/auth/login',
    JSON.stringify({
      phone_number: '089944556677',
      pin: '555555',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Correlation-Id': uuid(),
        'X-MAC-Address': 'android-test-device',
      },
    }
  );

  if (res.status !== 200) {
    console.log("LOGIN SETUP GAGAL");
    console.log(res.body);
    return null;
  }

  const token = res.json('data.access_token');
  return { token };
}

// ✅ DIPAKAI SEMUA VU
export default function (data) {
  if (!data || !data.token) {
    console.log("TOKEN TIDAK ADA");
    return;
  }

const url = 'https://dev-app.epusconnext.id/api/audit-logs' +
  '?page=1' +
  '&api=/api/pemeriksaans' +
  '&unique_device=android-test-device' +
  '&last_sync=2026-04-28T06:43:09Z' +
  '&limit=2000';

  const res = http.get(url, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${data.token}`,
    'X-Correlation-Id': uuid(),
  },
});

  if (res.status !== 200) {
  console.log(`STATUS: ${res.status}`);
  console.log(`BODY: ${res.body}`);
  console.log(`URL: ${url}`);
}

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  sleep(1);
}
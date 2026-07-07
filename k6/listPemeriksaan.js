import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 1,
  duration: '5s',
  // iterations: '1'
};

export default function() {
  const body = {
      phone_number: '082373275824',
      pin: '112233'
    };

  const loginRes = http.post('https://dev-app.epusconnext.id/api/auth/login',JSON.stringify(body), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
  });
  
  // ==========================
  // DEBUG TOKEN
  // ==========================

  const token = loginRes.json('data.access_token');
  console.log(token)

  const authParams = {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    },
  };

  const pemeriksaan = http.get(
    'https://dev-app.epusconnext.id/api/pemeriksaans/?sasaran_id=3c946248-b8b1-406e-9299-e2c5d6115f36',
    authParams
  );
  // let kunjungan = http.get('http://dev-app.epusconnext.id/api/kunjungans/?sasaran_id=23eb5f2d-fe30-4347-85a3-b8c76eb43eef');
  check(loginRes, {
    "status is 200": (r) => r.status === 200,
  });

  check(pemeriksaan, { "status is 200": (kunjungan) => kunjungan.status === 200 });
  sleep(1);

  // let res = http.post(url, payload);
}

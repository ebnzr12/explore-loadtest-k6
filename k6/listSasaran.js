import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 3,
  // duration: '20s',
};

export default function() {
  const body = {
      phone_number: '081311223311',
      pin: '112233'
    };
    http.post('http://dev-app.epusconnext.id/api/auth/login',JSON.stringify(body), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
  let res = http.get('http://dev-app.epusconnext.id/api/audit-logs');
  check(res, { "status is 200": (res) => res.status === 200 });
  sleep(1);

  let res = http.post(url, payload);
}

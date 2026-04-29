import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 1,
  // iterations: 1,
};

export default function() {
  // const unikID = new Date().getTime();
  const body = {
    phone_number: '081311223311',
    pin: '112233'
  };
  const res = http.post('http://dev-app.epusconnext.id/api/auth/login',JSON.stringify(body), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  const resBody = res.json(); // Mengambil token dari response login
  check(res, { "status is 200": (res) => res.status === 200 });  
  sleep(1);
}

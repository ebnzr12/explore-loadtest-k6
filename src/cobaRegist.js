import http from 'k6/http';
import {sleep,check} from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
};

export default function () {
  const unikID = new Date().getTime();
  const body = {
    username: `ebnzr${unikID}`,
    password: 'pa55word'
  };

  const res = http.post('https://quickpizza.grafana.com/api/users', JSON.stringify(body), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });
  console.log(`STATUS: ${res.status}`);
  console.log(`BODY: ${res.body}`);

  check(res, {
    'status is 201': (r) => r.status === 201,
  });
  // check(res, { "status is 200": (res) => res.status === 200 });
  // sleep(1);
}
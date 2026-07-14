import http from 'k6/http';
import {sleep,check} from 'k6';

export const options = {
  vus: 5,
  duration: '10s',
};

export default function () {
  const unikID = new Date().getTime();
  const body = {
    username: `ebnzr${unikID}`,
    password: 'pa55word',
    name: 'ebenezer'
  };

  const res = http.post('http://localhost:3000/api/users', JSON.stringify(body), {
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
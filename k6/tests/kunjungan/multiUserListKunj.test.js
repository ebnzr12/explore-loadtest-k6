import http from 'k6/http';
import { check } from 'k6';

const users = [
  {
    phone_number: '089911223312',
    pin: '112233',
  },
  {
    phone_number: '089911223313',
    pin: '112233',
  },
  {
    phone_number: '085282069642',
    pin: '112233',
  },
  {
    phone_number: '089911223311',
    pin: '112233',
  },
  {
    phone_number: '081273099290',
    pin: '112233',
  },
];

export const options = {
  vus: users.length,
  iterations: users.length,
};

export default function () {
  // Setiap VU memakai akun yang berbeda
  const user = users[__VU - 1];

  const loginRes = http.post(
    'https://dev-app.epusconnext.id/api/auth/login',
    JSON.stringify({
      phone_number: user.phone_number,
      pin: user.pin,
    }),
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );

  check(loginRes, {
    'Login status 200': (r) => r.status === 200,
  });

  // Kalau login gagal, hentikan iterasi ini
  if (loginRes.status !== 200) {
    console.log(`Login gagal untuk ${user.phone_number}`);
    return;
  }

  const token = loginRes.json('data.access_token');

  const authParams = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const kunjunganRes = http.get(
    'https://dev-app.epusconnext.id/api/kunjungans/?sasaran_id=23eb5f2d-fe30-4347-85a3-b8c76eb43eef',
    authParams
  );

  check(kunjunganRes, {
    'List Kunjungan status 200': (r) => r.status === 200,
  });

  console.log(
    `[VU ${__VU}] ${user.phone_number} -> Login: ${loginRes.status}, Kunjungan: ${kunjunganRes.status}`
  );
}
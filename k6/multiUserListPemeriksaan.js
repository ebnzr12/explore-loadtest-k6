import http from 'k6/http';
import { check } from 'k6';

const users = [
  {
    phone_number: '082373275824',
    pin: '112233',
  },
  {
    phone_number: '082376329465',
    pin: '112233',
  },
  {
    phone_number: '081291426034',
    pin: '112233',
  },
  {
    phone_number: '08117177624',
    pin: '112233',
  },
  {
    phone_number: '085269144003',
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

  const pemeriksaanRes = http.get(
    'https://dev-app.epusconnext.id/api/pemeriksaans/?sasaran_id=0f2c3b9d-c800-4bcc-bfd2-eed8c25d5b3e',
    authParams
  );

  check(pemeriksaanRes, {
    'List Pemeriksaan status 200': (r) => r.status === 200,
  });

  console.log(
    `[VU ${__VU}] ${user.phone_number} -> Login: ${loginRes.status}, Pemeriksaan: ${pemeriksaanRes.status}`
  );
}
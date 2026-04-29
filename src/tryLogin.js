import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
};

export default function() {

    // INI UNTUK REGISTRASI DULU SEBELUM LOGIN
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
    check(res, {
  'status is 200': (r) => r.status === 200,
});

    // INI UNTUK LOGIN SETELAH REGISTRASI
    const loginBody = {
      username: `ebnzr${unikID}`,
      password: 'pa55word',
    }
    
    const resLogin = http.post('http://localhost:3000/api/users/login', JSON.stringify(loginBody), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    const resBody = resLogin.json(); // Mengambil token dari response login
    
    const resCurrent = http.get('http://localhost:3000/api/users/current', {
      headers: {
        'Accept': 'application/json',
        'AUTHORIZATION': resBody.data.token, 
      }
    });

    const currentBody = resCurrent.json(); 
}

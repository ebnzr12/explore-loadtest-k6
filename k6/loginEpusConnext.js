import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 3,
  duration: '8s',
};

export default function() {
  // const unikID = new Date().getTime();
  const body = {
    phone_number: '081311223312',
    pin: '112233'
  };

  const params = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  const loginResponse = http.post('https://dev-app.epusconnext.id/api/auth/login',JSON.stringify(body), params);

  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    // 'login success true': (r) => r.json('success') === true,
  });

  //AMBIL TOKEN NYA
  const token = loginResponse.json('data.access_token');
  console.log(`Bearer Token: ${token}`);

  // const authParams = {
  //   headers:{
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   }
  // };

   const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

  const listSasaranRes = http.get('https://dev-app.epusconnext.id/api/audit-logs?page=1&api=/api/sasarans&unique_device=android-pq3a.190705.09121607-783437513-23127pn0cc-gracelte&last_sync=2026-04-23T08:30:36Z&limit=1000', {headers});
  
  const responseListsasaran = listSasaranRes.json();
  console.log(responseListsasaran);

  check(listSasaranRes,{
    'List sasaran: 200': (r) => r.status === 200,
  });

  sleep(1);
}

import http from 'k6/http';
import {sleep,check, fail} from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
};

export default function () {
  const unikID = new Date().getTime();
  const body = {
    username: `ebnzr${unikID}`,
    password: 'pa55word'
  };

  const registRes = http.post('https://quickpizza.grafana.com/api/users', JSON.stringify(body), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });
  if(registRes.status !== 200){
    fail(`Failed to register ebnzr${unikID}`);
  }

  const loginBody = {
    username: `ebnzr${unikID}`,
    password: 'pa55word'
  }

  const response = http.post('https://quickpizza.grafana.com/api/users/token/login?set_cookie=true', JSON.stringify(loginBody), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  const responseBody = response.json();

  const homePage = http.get('https://quickpizza.grafana.com/api/ratings', {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  const homeBody = homePage.json();


}
import http from 'k6/http';
import { sleep, check } from 'k6';
import { constantVus } from '../../scenarios/constantVus.js';
import { performanceThresholds } from '../../config/thresholds.js';
import { getTimestamp } from '../../utils/Timestamp.js';
import { users } from '../../data/user.data.js';
import { login } from '../../services/auth.service.js';
import { getListKunjungan } from '../../services/kunjungan.service.js';
import { generateReport } from '../../utils/report.js';

export const options = {
   ...constantVus(5,'30s'),
   thresholds: performanceThresholds
}

export function setup(){
  const user = users[0];

  const response = login(
    user.phone_number,
    user.pin
  );

  check(response,{
    'login status is 200': (r) => r.status === 200,
  });

  const token = response.json('data.access_token');

  return {
    token: token
  };
}

export default function(data){
  const response = getListKunjungan(
    data.token,
    1,
    100
  );

  check(response,{
    'list kunjungan status is 200': (r) => r.status === 200
  });

  sleep(1);
}

export function handleSummary(data){
  return generateReport(
    data,
    'Kunjungan',
    `ListKunjungan_${getTimestamp()}`
  )
}
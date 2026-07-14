import http from 'k6/http';
import { sleep, check } from 'k6';
import { login } from '../../services/auth.service.js';
import { getListPemeriksaan } from '../../services/pemeriksaan.service.js';
import { users } from '../../data/user.data.js';
import { constantVus } from '../../scenarios/constantVus.js';
import { getTimestamp } from '../../utils/Timestamp.js';
import { generateReport } from '../../utils/report.js';
import { baselineThresholds } from '../../config/thresholds.js';

export const options = {
  ...constantVus(5, '10s'),
  thresholds: baselineThresholds
}

export function setup(){
  const user = users[0];

  const response = login(
    user.phone_number,
    user.pin
  );

  check(response, {
    'login status is 200': (r) => r.status === 200,
  });

  const token = response.json('data.access_token');

  return {
    token: token
  };
}

export default function(data) {
  const response = getListPemeriksaan(
    data.token,
    1,
    100
  );

  check(response, {
    'list pemeriksaan status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

export function handleSummary(data){
  return generateReport(
    data,
    'Pemeriksaan',
    `ListPemeriksaan_${getTimestamp()}`
  );
}

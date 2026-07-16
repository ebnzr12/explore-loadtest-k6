import http from 'k6/http';
import { sleep, check } from 'k6';
import { constantVus } from '../../scenarios/constantVus.js';
import { performanceThresholds } from '../../config/thresholds.js';
import { login } from '../../services/auth.service.js';
import { getListSasaran } from '../../services/sasaran.service.js';
import { generateReport } from '../../utils/report.js';
import { getTimestamp } from '../../utils/Timestamp.js';
import { users } from '../../data/user.data.js';

//=========== SKENARIO ===========
export const options = {
  ...constantVus(5, '20s'),
  thresholds: performanceThresholds
}

export function setup(){

  //=========== USER YANG DIGUNAKAN UNTUK LOGIN ===========
  const user = users[1];

  //CREDENTIAL USER LOGIN
  const response = login(
    user.phone_number,
    user.pin
  );

  //=========== CEK RESPONSE LOGIN ===========
  check(response, {
    'login status is 200': (r) => r.status === 200
  });

  //=========== GET TOKEN SAAT LOGIN ===========
  const token = response.json('data.access_token');

  return {
    token: token
  };
}


// =========== ENDPOINT DARI SASARAN ===========
export default function(data){
  
  // =========== CEK RESPONSE SASARAN ===========
  const response = getListSasaran(
    data.token,
    1,
    100
  );

  check(response, {
    'list sasaran status is 200': (r) => r.status === 200
  });

  sleep(1);
}

export function handleSummary(data){
  return generateReport(
    data,
    'Sasaran',
    `ListSasaran_${getTimestamp()}`
  );
}


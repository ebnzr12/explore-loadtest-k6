import http from 'k6/http';
import { sleep, check } from 'k6';
// import { constantVus } from '../../scenarios/constantVus.js';
import { performanceThresholds } from '../../config/thresholds.js';
import { getTimestamp } from '../../utils/Timestamp.js';
import { users } from '../../data/user.data.js';
import { login } from '../../services/auth.service.js';
// import { getListKunjungan } from '../../services/kunjungan.service.js';
import { generateReport } from '../../utils/report.js';
import { smokeTest, loadTest, stressTest, spikeTest, rampUp } from '../../scenarios/indexScenario.js';
import { getListKunjunganLegacy } from '../../services/kunjunganLegacy.service.js';

export const options = {
  // ...constantVus(10, '60s'),
  scenarios: {
    // smoke_test: smokeTest,
    // load_test: loadTest,
    // stress_test: stressTest,
    spike_test:spikeTest,
    // ramp_Up: rampUp
  },
  thresholds: performanceThresholds,
};

export function setup(){
  const tokens = [];

//=========== LOGIN SEMUA USER DARI DATA ===========

  for (let i = 0; i < users.length; i++){
  const user = users[i];

  //CREDENTIAL USER LOGIN
  const response = login(
      user.phone_number,
      user.pin
    );

//=========== CEK RESPONSE LOGIN ===========
    check(response, {
      [`login status for user ${i+1} is 200`]: (r) => r.status === 200
    });

//=========== GET TOKEN SAAT LOGIN ===========
    const token = response.json('data.access_token');
    tokens.push(token);
  }
    return {
      tokens: tokens
    };
}

// =========== ENDPOINT DARI SASARAN ===========
export default function(data){

// =========== Dapatkan token berdasarkan VU index ===========
const tokenIndex = (__VU - 1) % data.tokens.length;
const token = data.tokens[tokenIndex];

// =========== CEK RESPONSE KUNJUNGAN ===========
  const response = getListKunjunganLegacy(
    token,
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


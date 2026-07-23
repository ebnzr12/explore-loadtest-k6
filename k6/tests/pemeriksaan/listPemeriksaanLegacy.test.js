import http from 'k6/http';
import { sleep, check } from 'k6';
import { login } from '../../services/auth.service.js';
// import { getListPemeriksaan } from '../../services/pemeriksaan.service.js';
import { users } from '../../data/user.data.js';
// import { constantVus } from '../../scenarios/smokeTest.js';
import { getTimestamp } from '../../utils/Timestamp.js';
import { generateReport } from '../../utils/report.js';
import { performanceThresholds } from '../../config/thresholds.js';
import { smokeTest, loadTest, stressTest, spikeTest, rampUp } from '../../scenarios/indexScenario.js';
import { getListPemeriksaanLegacy } from '../../services/pemeriksaanLegacy.service.js';

export const options = {
  // ...constantVus(10, '60s'),
  scenarios:{
    // smoke_test: smokeTest,
    // load_test: loadTest,
    stress_test: stressTest,
    // spike_test:spikeTest,
    // ramp_up: rampUp
  },
  thresholds: performanceThresholds
}

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

// =========== ENDPOINT DARI PEMERIKSAAN ===========
export default function(data) {
 
 // =========== DAPATKAN TOKEN BERDASARKAN VU INDEX =========== 
  const tokenIndex = (__VU - 1) % data.tokens.length;
  const token = data.tokens[tokenIndex];
  // console.log("------------------------",token)

  // =========== CEK RESPONSE PEMERIKSAAN ===========
  const response = getListPemeriksaanLegacy(
    token,
    1,
    100
  );
  
  // if (response.status != 200){
  //   console.log(response.body)
  // }

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

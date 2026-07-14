import http from 'k6/http';
import { sleep, check } from 'k6';
import { login } from '../../services/auth.service.js';
import { users } from '../../data/user.data.js';
import { constantVus } from '../../scenarios/constantVus.js';
import { getTimestamp } from '../../utils/Timestamp.js';
import { generateReport } from '../../utils/report.js';
import { baselineThresholds } from '../../config/thresholds.js';

export const options = {
  ...constantVus(5, '10s'),
  thresholds: baselineThresholds
};

export default function() {
  // const unikID = new Date().getTime();
  const user = users[0];
  
  const response = login(
    user.phone_number,
    user.pin
  );
  
  console.log(`Status: ${response.status}`)
  check(response, {
    'login status is 200': (r) => r.status === 200,
    // 'login success true': (r) => r.json('success') === true,
  });

}
  export function handleSummary(data){
      return generateReport(
        data,
        'Login',
        `login_${getTimestamp()}`
      )
    }
    sleep(1);

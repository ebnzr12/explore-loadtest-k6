export const loadTest = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '10s', target: 5 },
    { duration: '30s', target: 20 },
    { duration: '1m', target: 30 },
    { duration: '30s', target: 20 },
    { duration: '10s', target: 5 },
  ],
};
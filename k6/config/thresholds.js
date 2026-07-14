export const baselineThresholds = {
  http_req_failed: ['rate<0.01'],
};

export const performanceThresholds = {
  http_req_duration: ['p(95)<=500'],
  http_req_failed: ['rate<0.01'],
};
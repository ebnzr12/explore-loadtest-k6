export const spikeTest = {
    executor: 'ramping-vus',
    startVus: 1,
    stages: [
        { duration: '1m', target: 10 },
        { duration: '10s', target: 50 },
        { duration: '1m', target: 30 },
        { duration: '30s', target: 20 },
        { duration: '10s', target: 10 },
    ],
}
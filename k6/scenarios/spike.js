export const spike = {
    executor: 'ramping-vus',
    startVus: 1,
    stages: [
        { duration:'10s' , target:1 },
        { duration:'30s' , target:100 },
        { duration:'1m' , target:100 },
        { duration:'30s', target:20 },
        { duration:'10s' , target:1 },
    ],
}
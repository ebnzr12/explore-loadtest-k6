export const stressTest = {
    executor: 'ramping-vus',
    startVus: 0,
    stages:[
        {duration:'1m' , target:50 },
        {duration:'1m' , target:100 },
        {duration:'1m' , target:200 },
        {duration:'1m' , target:300 },
        {duration:'1m' , target:0 },
    ]
}
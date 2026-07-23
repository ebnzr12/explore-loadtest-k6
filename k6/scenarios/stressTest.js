export const stressTest = {
    executor: 'ramping-vus',
    startVus: 0,
    stages:[
        {duration:'2m' , target:10 },
        {duration:'2m' , target:40 },
        {duration:'2m' , target:70 },
        {duration:'2m' , target:100 },
    ]
}
export const rampUp = {
        scenarios:{
            ramp_up: {
                executor: 'ramping-vus',
                startVus:0,
                stages:[
                    {duration: '30s', target: 15},
                    {duration: '3m', target: 15},
                    {duration: '5m', target: 15},
                    {duration: '3m', target: 15},
                    {duration: '30s', target: 0}
                ]
            },
        }
    }
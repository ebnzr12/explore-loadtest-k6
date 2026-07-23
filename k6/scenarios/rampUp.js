export const rampUp = {
                executor: 'ramping-vus',
                startVus:0,
                stages:[
                    {duration: '1m', target: 10},
                    {duration: '1m', target: 20},
                    {duration: '1m', target: 30},
                    {duration: '1m', target: 50},
                ]
            }
// {duration: '1m', target: 10},
//                     {duration: '1m', target: 20},
//                     {duration: '1m', target: 50},
//                     {duration: '1m', target: 70},
            
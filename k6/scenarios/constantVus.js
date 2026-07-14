export function constantVus(vus, duration) {
    return {
        scenarios:{
            constant_vus: {
                executor: 'constant-vus',
                vus: vus,
                duration: duration,
            },
        },
    };
}
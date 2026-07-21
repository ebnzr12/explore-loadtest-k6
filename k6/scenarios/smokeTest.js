export function smokeTest(vus, duration) {
    return {
        scenarios:{
            smoke_test: {
                executor: 'constant-vus',
                vus: vus,
                duration: duration,
            },
        },
    };
}
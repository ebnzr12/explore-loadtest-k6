export const smokeTest = {
        scenarios:{
            load_test: {
                executor: 'constant-vus',
                vus: 50,
                duration: "5m",
            },
        }
    }
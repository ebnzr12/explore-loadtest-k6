export function constantArrivalRate(
    rate,
    duration,
    preAllocatedVUs,
    maxVUs
) {
    return {
        scenarios: {
            constant_arrival_rate: {
                executor: 'constant-arrival-rate',
                rate: rate,
                timeUnit: '1m',
                duration: duration,
                preAllocatedVUs: preAllocatedVUs,
                maxVUs: maxVUs,
            },
        },
    };
}
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
    vus: 1,
    iterations: 1,

    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500'],
    },
};

const auditLogTrend = new Trend('audit_log_duration');
const loginSuccessRate = new Rate('login_success');

const BASE_URL = 'https://dev-app.epusconnext.id';
const LIMIT = 100;

export function setup() {
    const payload = JSON.stringify({
        phone_number: '081411223311',
        pin: '112233',
    });

    const params = {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };

    const loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        payload,
        params
    );

    const success = check(loginRes, {
        'Login Success': (r) => r.status === 200,
    });

    loginSuccessRate.add(success);

    if (!success) {
        throw new Error(`Login gagal: ${loginRes.status}`);
    }

    return {
        token: loginRes.json('data.access_token'),
    };
}

export default function (data) {

    const authParams = {
        headers: {
            Authorization: `Bearer ${data.token}`,
            Accept: 'application/json',
        },
    };

    group('GET Audit Logs Pagination', () => {

        // Request pertama
        const firstPage = http.get(
            `${BASE_URL}/api/audit-logs?page=1&api=/api/kunjungans&unique_device=android-bp2a.250605.031.a3-5398725-sm-a065f-a06&last_sync=2026-07-05T09:15:34Z&limit=${LIMIT}`,
            authParams
        );

        check(firstPage, {
            'First page status 200': (r) => r.status === 200,
        });

        auditLogTrend.add(firstPage.timings.duration);

        const totalPage = firstPage.json('meta.total_page');

        console.log(`Total Page : ${totalPage}`);

        // Request halaman 2 sampai halaman terakhir
        for (let page = 2; page <= totalPage; page++) {

            const res = http.get(
                `${BASE_URL}/api/audit-logs?page=${page}&api=/api/kunjungans&unique_device=android-bp2a.250605.031.a3-5398725-sm-a065f-a06&last_sync=2026-07-05T09:15:34Z&limit=${LIMIT}`,
                authParams
            );

            auditLogTrend.add(res.timings.duration);

            check(res, {
                [`Page ${page} status 200`]: (r) => r.status === 200,
                [`Page ${page} < 1s`]: (r) => r.timings.duration < 1000,
            });

            console.log(
                `Page ${page}/${totalPage} | ${res.timings.duration.toFixed(2)} ms`
            );
        }
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        "reportKunjungan(0707261118).html": htmlReport(data),
    };
}
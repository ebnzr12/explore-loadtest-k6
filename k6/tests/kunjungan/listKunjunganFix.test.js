import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import encoding from 'k6/encoding';
import exec from 'k6/execution';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { getTimestamp } from '../helper/Timestamp.js';

export const options = {
    vus: 1,
    // duration: '10s',
    iterations: 1,

    thresholds: {
        http_req_failed: ['rate<0.01'],      // Error < 1%
        http_req_duration: ['p(95)<1100'],   // 95% request < 1 detik
    },
};

const kunjunganTrend = new Trend('kunjungan_duration');
const loginSuccessRate = new Rate('login_success');

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
        'https://dev-app.epusconnext.id/api/auth/login',
        payload,
        params
    );

    const success = check(loginRes, {
        'Login Success': (r) => r.status === 200,
    });

    loginSuccessRate.add(success);

    if (!success) {
        throw new Error(
            `Login gagal.\nStatus: ${loginRes.status}\nBody: ${loginRes.body}`
        );
    }

    const token = loginRes.json('data.access_token');

    console.log(`Token berhasil didapat.`);

    return {
        token,
    };
}

export default function (data) {

    const authParams = {
        headers: {
            Authorization: `Bearer ${data.token}`,
            Accept: 'application/json',
        },
    };

    const BASE_URL = 'https://dev-app.epusconnext.id/api';
    group('GET Kunjungan', function () {

            // Request pertama untuk mengetahui jumlah halaman
        const firstRes = http.get(
            `${BASE_URL}/kunjungans?page=1&limit=100`,
            authParams
        );

        check(firstRes, {
            'Page 1 success': (r) => r.status === 200,
        });

        const totalPage = firstRes.json('meta.total_page');

        console.log(`Total Page: ${totalPage}`);

        // Request seluruh halaman
        for (let page = 1; page <= totalPage; page++) {
            const res = http.get(
                `${BASE_URL}/kunjungans?page=${page}&limit=100`,
                authParams
            );

            check(res, {
                [`Page ${page} success`]: (r) => r.status === 200,
            });
            kunjunganTrend.add(res.timings.duration);
            console.log(
                `Page ${page} | Duration: ${res.timings.duration.toFixed(2)} ms`
            );
            check(res, {
                'Status 200': (r) => r.status === 200,
                'Response < 1s': (r) => r.timings.duration < 1000,
            });
        }

        // Aktifkan hanya saat debugging
        // console.log(res.body);
    });

    sleep(1);
}

export function handleSummary(data) {
    return {
        [`Report_Performance/Kunjungan/Kunjungan_limit100(${getTimestamp()}).html`]: htmlReport(data),
    };
}
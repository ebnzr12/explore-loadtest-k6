import http from 'k6/http';
import { BASE_URL } from '../config/environment.js';
import { check } from 'k6';

export function login(phoneNumber, pin){
    const url = `${BASE_URL}/auth/login`;

    const payload = JSON.stringify({
        phone_number: phoneNumber,
        pin: pin,
    });

    const params = {
        headers : {
            'Content-Type': 'application/json',
        }
    };

    console.log(`Payload:${payload}`);
    const response = http.post(url, payload, params);

    check(response, {
        'Login status is 200': (res) => res.status === 200
    });
    console.log(`Response: ${response.body}`);

    return response; 
}
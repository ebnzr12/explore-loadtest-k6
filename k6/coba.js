import http from 'k6/http';

export default function () {
    let res = http.get('http://localhost:3001/tests');

    console.log("STATUS:", res.status);
    console.log("BODY:", res.body);
}
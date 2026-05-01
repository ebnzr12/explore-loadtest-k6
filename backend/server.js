const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dataFolder = path.join(__dirname, 'data');

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

/**
 * ==========================
 * 📊 METRICS (FIXED NDJSON)
 * ==========================
 */
app.get('/metrics', (req, res) => {
  try {
    const { test } = req.query;

    // Jika parameter test ada, gunakan file tersebut, jika tidak ambil semua file
    const files = test ? [test] : fs.readdirSync(dataFolder).filter(f => f.endsWith('.json'));

    if (files.length === 0 || (test && !fs.existsSync(path.join(dataFolder, test)))) {
      return res.json({
        totalRequests: 0,
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        medianLatency: 0,
        successRate: 0,
        rps: 0,
        statusCodes: {},
        errors: {},
        latencySeries: []
      });
    }

    let totalRequests = 0;
    let totalLatency = 0;
    let latencyCount = 0;
    let latencyValues = [];
    let failedRequests = 0;
    let maxVus = 0;
    let currentVus = 0;
    let errorBreakdown = {};
    let statusDistribution = {};
    let latencySeries = [];
    let i = 0;

    for (const file of files) {
      const raw = fs.readFileSync(path.join(dataFolder, file), 'utf-8');

      // 🔥 IMPORTANT: NDJSON HANDLER
      const lines = raw.split('\n').filter(Boolean);

      for (const line of lines) {
        let obj;

        try {
          obj = JSON.parse(line);
        } catch {
          continue;
        }

        // TRACK CURRENT VUs
        if (obj.metric === 'vus') {
          currentVus = obj.data?.value || 0;
          maxVus = Math.max(maxVus, currentVus);
        }

        // REQUEST COUNT
        if (obj.metric === 'http_reqs') {
          totalRequests += obj.data?.value || 1;
        }

        // STATUS CODE DISTRIBUTION
        if (obj.data?.tags?.status) {
          const status = obj.data.tags.status;
          statusDistribution[status] = (statusDistribution[status] || 0) + 1;
        }

        // LATENCY
        if (obj.metric === 'http_req_duration' && obj.data?.value) {
          const val = obj.data.value;

          totalLatency += val;
          latencyCount++;
          latencyValues.push(val);

          latencySeries.push({
            time: i++,
            value: val,
            vus: currentVus
          });
        }

        // ERROR RATE
        if (obj.metric === 'http_req_failed') {
          failedRequests += obj.data?.value || 0;
          if (obj.data?.value === 1) {
            const errMsg = obj.data?.tags?.error || 'Unknown Error';
            errorBreakdown[errMsg] = (errorBreakdown[errMsg] || 0) + 1;
          }
        }
      }
    }

    // Hitung Persentil
    latencyValues.sort((a, b) => a - b);
    const getPercentile = (p) => {
      if (latencyValues.length === 0) return 0;
      return latencyValues[Math.floor(latencyValues.length * p)];
    };

    const p95Latency = getPercentile(0.95);
    const p99Latency = getPercentile(0.99);
    const medianLatency = getPercentile(0.50);

    const avgLatency = latencyCount
      ? totalLatency / latencyCount
      : 0;

    const successRate = totalRequests
      ? ((totalRequests - failedRequests) / totalRequests) * 100
      : 100;

    const rps = totalRequests / Math.max(files.length, 1);

    res.json({
      totalRequests,
      avgLatency,
      p95Latency,
      p99Latency,
      medianLatency,
      maxVus,
      successRate: successRate.toFixed(2),
      rps: rps.toFixed(2),
      statusCodes: statusDistribution,
      errors: errorBreakdown,
      latencySeries
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ==========================
 * 📁 TEST LIST
 * ==========================
 */
app.get('/tests', (req, res) => {
  try {
    const files = fs.readdirSync(dataFolder)
      .filter(f => f.endsWith('.json'))
      .map(file => {
        const stats = fs.statSync(path.join(dataFolder, file));
        return { name: file, time: stats.mtime };
      })
      .sort((a, b) => b.time - a.time); // Urutkan yang terbaru di atas

    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ==========================
 * 🚀 START
 * ==========================
 */
app.listen(PORT, () => {
  console.log(`🔥 Backend running http://localhost:${PORT}`);
});

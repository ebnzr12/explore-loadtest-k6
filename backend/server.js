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
    const files = fs.readdirSync(dataFolder)
      .filter(f => f.endsWith('.json'));

    if (files.length === 0) {
      return res.json({
        totalRequests: 0,
        avgLatency: 0,
        successRate: 0,
        rps: 0,
        latencySeries: []
      });
    }

    let totalRequests = 0;
    let totalLatency = 0;
    let latencyCount = 0;
    let failedRequests = 0;
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

        // REQUEST COUNT
        if (obj.metric === 'http_reqs') {
          totalRequests += obj.data?.value || 1;
        }

        // LATENCY
        if (obj.metric === 'http_req_duration' && obj.data?.value) {
          const val = obj.data.value;

          totalLatency += val;
          latencyCount++;

          latencySeries.push({
            time: i++,
            value: val
          });
        }

        // ERROR RATE
        if (obj.metric === 'http_req_failed') {
          failedRequests += obj.data?.value || 0;
        }
      }
    }

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
      successRate: successRate.toFixed(2),
      rps: rps.toFixed(2),
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
      .map(file => ({ name: file }));

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
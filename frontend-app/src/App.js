import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

function App() {
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [metrics, setMetrics] = useState(null)

  // load tests
  useEffect(() => {
    axios.get('http://localhost:3001/tests')
      .then(res => {
        setTests(res.data)
        if (res.data.length > 0) {
          setSelectedTest(res.data[0].name)
        }
      })
  }, [])

  // load metrics
  useEffect(() => {
    axios.get('http://localhost:3001/metrics')
      .then(res => setMetrics(res.data))
  }, [selectedTest])

  const latencyData = metrics?.latencySeries || []

  const totalRequests = metrics?.totalRequests || 0
  const avgLatency = metrics?.avgLatency || 0
  const successRate = metrics?.successRate || 0
  const rps = metrics?.rps || 0

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      color: 'white',
      padding: 20,
      display: 'grid',
      gridTemplateColumns: '250px 1fr'
    }}>

      {/* SIDEBAR */}
      <div style={{
        borderRight: '1px solid rgba(255,255,255,0.1)',
        paddingRight: 10
      }}>
        <h3>📊 Tests</h3>

        {tests.map((t, i) => (
          <div key={i}
            onClick={() => setSelectedTest(t.name)}
            style={{
              padding: 10,
              marginBottom: 5,
              cursor: 'pointer',
              background: selectedTest === t.name ? '#1e293b' : 'transparent',
              borderRadius: 8
            }}
          >
            {t.name}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ paddingLeft: 20 }}>
        <h1>🚀 K6 Dashboard</h1>

        {/* CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          marginTop: 20
        }}>
          <Card title="Total Requests" value={totalRequests} />
          <Card title="Avg Latency" value={avgLatency} />
          <Card title="Success Rate" value={`${successRate}%`} />
          <Card title="RPS" value={rps} />
        </div>

        {/* CHART */}
        <div style={{ marginTop: 40 }}>
          <Box title="Latency">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={latencyData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </div>

      </div>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div style={{
      background: '#1e293b',
      padding: 20,
      borderRadius: 12
    }}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  )
}

function Box({ title, children }) {
  return (
    <div style={{
      background: '#1e293b',
      padding: 20,
      borderRadius: 12
    }}>
      <h3>{title}</h3>
      {children}
    </div>
  )
}

export default App
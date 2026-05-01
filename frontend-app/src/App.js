import { useEffect, useState } from 'react'
import axios from 'axios'
import './index.css'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts'

function App() {
  const [tests, setTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Ambil daftar file test
  useEffect(() => {
    axios.get('http://localhost:3001/tests')
      .then(res => {
        setTests(res.data)
        if (res.data.length > 0) {
          setSelectedTest(res.data[0].name)
        }
      })
  }, [])

  // 2. Load metrics dengan auto-refresh 5 detik
  useEffect(() => {
    if (!selectedTest) return
    const fetchData = () => {
      axios.get(`http://localhost:3001/metrics?test=${selectedTest}`)
        .then(res => setMetrics(res.data))
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [selectedTest])

  const latencyData = metrics?.latencySeries || []
  const totalRequests = metrics?.totalRequests || 0
  const avgLatency = metrics?.avgLatency ? Number(metrics.avgLatency).toFixed(1) : 0
  const p95Latency = metrics?.p95Latency ? Number(metrics.p95Latency).toFixed(1) : 0
  const p99Latency = metrics?.p99Latency ? Number(metrics.p99Latency).toFixed(1) : 0
  const medianLatency = metrics?.medianLatency ? Number(metrics.medianLatency).toFixed(1) : 0
  const successRate = metrics?.successRate || 0
  const statusCodes = metrics?.statusCodes || {}
  const errors = metrics?.errors || {}
  const rps = metrics?.rps || 0
  const vus = metrics?.maxVus || 0

  const filteredTests = tests.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const statusData = Object.entries(statusCodes).map(([name, value]) => ({ name, value }))
  const testTime = tests.find(t => t.name === selectedTest)?.time

  const COLORS = {
    '200': '#10b981', '201': '#10b981', '400': '#f59e0b', '401': '#f59e0b', '404': '#f59e0b', '500': '#ef4444', '503': '#ef4444'
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans w-full overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-slate-800/60 bg-[#020617] flex flex-col p-6 sticky top-0 h-screen flex-shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 text-white">⚡</div>
          <h2 className="text-xl font-bold tracking-tight text-indigo-400 italic uppercase">explore k6</h2>
        </div>

        <div className="mb-6 px-2">
          <input 
            type="text" 
            placeholder="Search test..." 
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-all text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <nav className="space-y-1 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 flex justify-between items-center">
            Recent Runs <span>{filteredTests.length}</span>
          </p>
          {filteredTests.map((t, i) => (
            <button key={i}
              onClick={() => setSelectedTest(t.name)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group flex items-center justify-between border mb-1 ${
                selectedTest === t.name 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                : 'text-slate-400 border-transparent hover:bg-slate-800/40'
              }`}
            >
              <span className="truncate text-xs font-medium">{t.name}</span>
              {selectedTest === t.name && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-1 uppercase italic">Load Dashboard</h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest flex items-center gap-4">
              <span>File: <span className="text-indigo-400 font-mono">{selectedTest}</span></span>
              {testTime && (
                <span className="flex items-center gap-2 border-l border-slate-800 pl-4">
                  <span className="text-slate-600">📅</span> {new Date(testTime).toLocaleString('id-ID')}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-2xl text-[10px] font-bold text-slate-300 backdrop-blur-md w-fit shadow-2xl">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             LIVE FEED
          </div>
        </header>

        {/* CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card title="Total Requests" value={Number(totalRequests).toLocaleString()} icon="📥" />
          <Card title="Peak Load" value={`${vus} VUs`} icon="👥" />
          <Card title="Avg Latency" value={`${avgLatency}ms`} icon="🕒" />
          <Card title="Median" value={`${medianLatency}ms`} icon="⚖️" />
          <Card title="P95 Latency" value={`${p95Latency}ms`} icon="📈" />
          <Card title="P99 Latency" value={`${p99Latency}ms`} icon="🔥" />
          <Card title="Success Rate" 
                value={`${successRate}%`} 
                icon="🎯"
                color={successRate < 95 ? 'text-rose-400' : 'text-emerald-400'} 
          />
          <Card title="Throughput" value={`${rps} RPS`} icon="⚡" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* STATUS DISTRIBUTION (QA Favorite) */}
          <section className="lg:col-span-1 bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 lowercase">
              <span className="w-1 h-6 bg-emerald-500 rounded-full" /> Status Distribution
            </h3>
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {statusData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span className="w-2 h-2 rounded-full" style={{ background: COLORS[entry.name] || '#6366f1' }} />
                        {entry.name}: {entry.value}
                    </div>
                ))}
            </div>
          </section>

          {/* PERFORMANCE CORRELATION */}
          <section className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3 lowercase">
              <span className="w-1 h-6 bg-indigo-500 rounded-full" />
              performance correlation
            </h3>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2"><span className="w-3 h-1 bg-indigo-500 rounded-full" /> Latency (ms)</div>
               <div className="flex items-center gap-2"><span className="w-3 h-1 bg-amber-500 rounded-full" /> Load (VUs)</div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="0" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis yAxisId="left" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}ms`} />
                <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} VUs`} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={false} animationDuration={300} />
                <Line yAxisId="right" type="monotone" dataKey="vus" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        </div>

        {/* ERROR BREAKDOWN */}
        {Object.keys(errors).length > 0 && (
          <section className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 lowercase">
               <span className="w-1 h-6 bg-rose-500 rounded-full" />
               incident logs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-2">Error Payload</th>
                    <th className="px-6 py-2">Total Count</th>
                    <th className="px-6 py-2 text-right">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(errors).map(([msg, count], idx) => (
                    <tr key={idx} className="group transition-all hover:scale-[1.01]">
                      <td className="px-6 py-5 bg-slate-800/40 rounded-l-2xl text-rose-300 font-mono text-xs border-y border-l border-slate-800/50 italic">{msg}</td>
                      <td className="px-6 py-5 bg-slate-800/40 border-y border-slate-800/50"><span className="text-white font-bold">{count}</span></td>
                      <td className="px-6 py-5 bg-slate-800/40 rounded-r-2xl border-y border-r border-slate-800/50 text-right">
                         <span className="px-3 py-1 bg-rose-500/20 text-rose-500 text-[10px] font-black rounded-lg border border-rose-500/20 uppercase">Failed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function Card({ title, value, color = 'text-white', icon }) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl shadow-lg backdrop-blur-md hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all duration-500 group">
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.15em]">{title}</p>
        <span className="text-xl grayscale group-hover:grayscale-0 transition-all duration-500">{icon}</span>
      </div>
      <h2 className={`text-3xl font-black tracking-tighter ${color}`}>{value}</h2>
    </div>
  )
}
export default App

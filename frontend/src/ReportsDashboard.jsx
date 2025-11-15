import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
)

const BASE = 'http://localhost:4000'
const endpointMap = {
  monthlySafety: `${BASE}/api/reports/monthly-safety`,
  hotspotAnalysis: `${BASE}/api/reports/hotspot-analysis`,
  emergencyResponse: `${BASE}/api/reports/emergency-response`,
  monthlyTrends: `${BASE}/api/reports/monthly-trends`,
  riskFactors: `${BASE}/api/reports/risk-factors`,
  severityDistribution: `${BASE}/api/reports/severity-distribution`,
}

export default function ReportsDashboard() {
  const [reports, setReports] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        const keys = Object.keys(endpointMap)
        const promises = keys.map((k) => axios.get(endpointMap[k]))
        const results = await Promise.all(promises)
        const data = {}
        keys.forEach((k, i) => (data[k] = results[i].data))
        setReports(data)
      } catch (err) {
        setError(err.message || 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <div className="reports-dashboard">Loading reports...</div>
  if (error) return <div className="reports-dashboard error">Error: {error}</div>

  const severity = reports.severityDistribution || {}
  const severityLabels = severity.labels || ['Fatal', 'Serious', 'Slight']
  const severityValues = severity.counts || [0, 0, 0]

  const monthly = reports.monthlyTrends || {}
  const months = monthly.months || []
  const monthValues = monthly.counts || []

  const riskFactors = reports.riskFactors || {}
  const topFactors = riskFactors.top_risk_factors || []

  const hotspots = reports.hotspotAnalysis || {}
  const topHotspots = hotspots.top_hotspots || []

  const emergency = reports.emergencyResponse || {}

  return (
    <div className="reports-dashboard">
      <h2>Analytics & Reports</h2>

      <section className="report-row">
        <div className="card">
          <h3>Monthly Trends</h3>
          <Line
            data={{ labels: months, datasets: [{ label: 'Accidents', data: monthValues, borderColor: '#1976d2', tension: 0.3 }] }}
            options={{ maintainAspectRatio: false }}
            height={240}
          />
        </div>

        <div className="card">
          <h3>Severity Distribution</h3>
          <Pie
            data={{ labels: severityLabels, datasets: [{ data: severityValues, backgroundColor: ['#d32f2f', '#f57c00', '#388e3c'] }] }}
            options={{ maintainAspectRatio: false }}
            height={240}
          />
        </div>
      </section>

      <section className="report-row">
        <div className="card wide">
          <h3>Top Risk Factors</h3>
          <table className="report-table">
            <thead>
              <tr><th>Factor</th><th>Count</th></tr>
            </thead>
            <tbody>
              {topFactors.map((f, i) => (
                <tr key={i}><td>{f.factor || f.name}</td><td>{f.count ?? f.value ?? ''}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card wide">
          <h3>Hotspot Analysis (Top locations)</h3>
          <table className="report-table">
            <thead>
              <tr><th>Location</th><th>Incidents</th></tr>
            </thead>
            <tbody>
              {topHotspots.map((h, i) => (
                <tr key={i}><td>{h.location || h.name}</td><td>{h.count ?? h.incidents ?? ''}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="report-row">
        <div className="card wide">
          <h3>Emergency Response Metrics</h3>
          <table className="report-table">
            <thead>
              <tr><th>Metric</th><th>Value</th></tr>
            </thead>
            <tbody>
              <tr><td>Average Response Time (s)</td><td>{emergency.avg_response_time ?? 'N/A'}</td></tr>
              <tr><td>On-scene within 10min</td><td>{emergency.percent_within_10min ?? 'N/A'}</td></tr>
              <tr><td>Total Responses</td><td>{emergency.total_responses ?? 'N/A'}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card wide">
          <h3>Monthly Safety Summary</h3>
          <table className="report-table">
            <thead>
              <tr><th>Month</th><th>Accidents</th><th>Fatal</th><th>Serious</th><th>Slight</th></tr>
            </thead>
            <tbody>
              {(reports.monthlySafety || []).map((m, i) => (
                <tr key={i}>
                  <td>{m.month}</td>
                  <td>{m.total}</td>
                  <td>{m.fatal ?? 0}</td>
                  <td>{m.serious ?? 0}</td>
                  <td>{m.slight ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

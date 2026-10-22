import React, { useState } from 'react'

function TaskAnalyticsChart({ tasks = [] }) {
  const [chartType, setChartType] = useState('priority')

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const pendingTasks = totalTasks - completedTasks

  const priorityCounts = {
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  }

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="analytics-chart-panel">
      <div className="analytics-header">
        <div>
          <h3>📊 Heavy Analytics & Task Performance Insights</h3>
          <p className="analytics-sub">
            (Lazy loaded on-demand dynamic chunk: <code>TaskAnalyticsChart.js</code>)
          </p>
        </div>
        <div className="chart-controls">
          <button
            type="button"
            className={`chart-tab ${chartType === 'priority' ? 'active' : ''}`}
            onClick={() => setChartType('priority')}
          >
            Priority Breakdown
          </button>
          <button
            type="button"
            className={`chart-tab ${chartType === 'status' ? 'active' : ''}`}
            onClick={() => setChartType('status')}
          >
            Completion Ratio
          </button>
        </div>
      </div>

      <div className="analytics-body">
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Total Tasks</span>
            <span className="metric-val">{totalTasks}</span>
          </div>
          <div className="metric-card success">
            <span className="metric-label">Completed</span>
            <span className="metric-val">{completedTasks}</span>
          </div>
          <div className="metric-card warning">
            <span className="metric-label">Pending</span>
            <span className="metric-val">{pendingTasks}</span>
          </div>
          <div className="metric-card highlight">
            <span className="metric-label">Completion Rate</span>
            <span className="metric-val">{completionRate}%</span>
          </div>
        </div>

        {chartType === 'priority' ? (
          <div className="chart-visualization">
            <h4>Priority Distribution Bar Chart</h4>
            <div className="bar-chart-container">
              <div className="bar-group">
                <span className="bar-label">High ({priorityCounts.high})</span>
                <div className="bar-track">
                  <div
                    className="bar-fill high-fill"
                    style={{
                      width: `${totalTasks ? (priorityCounts.high / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bar-group">
                <span className="bar-label">Medium ({priorityCounts.medium})</span>
                <div className="bar-track">
                  <div
                    className="bar-fill medium-fill"
                    style={{
                      width: `${totalTasks ? (priorityCounts.medium / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bar-group">
                <span className="bar-label">Low ({priorityCounts.low})</span>
                <div className="bar-track">
                  <div
                    className="bar-fill low-fill"
                    style={{
                      width: `${totalTasks ? (priorityCounts.low / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="chart-visualization">
            <h4>Completion Status SVG Donut Gauge</h4>
            <div className="donut-wrap">
              <svg viewBox="0 0 36 36" className="donut-svg">
                <path
                  className="donut-ring"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3.8"
                />
                <path
                  className="donut-segment"
                  strokeDasharray={`${completionRate}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#667eea"
                  strokeWidth="3.8"
                  strokeDashoffset="25"
                />
                <text x="18" y="20.35" className="donut-text" textAnchor="middle">
                  {completionRate}%
                </text>
              </svg>
              <div className="donut-legend">
                <p>
                  <span className="legend-dot done" /> Done: {completedTasks}
                </p>
                <p>
                  <span className="legend-dot pending" /> Pending: {pendingTasks}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskAnalyticsChart

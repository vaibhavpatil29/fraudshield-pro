import { useEffect, useMemo, useState } from 'react'
import { transactionsApi, alertsApi } from '../services/api'
import type { ReactNode } from 'react'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

/* =========================================================
   TYPES
========================================================= */

interface CardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

interface StatCardProps {
  label: string
  value: string | number
  sub: string
  color?: string
  icon: string
}

interface Alert {
  id: string | number
  merchant?: string
  user_id?: string
  amount?: number
  fraud_score?: number
  status?: string
  created_at?: string
}

/* =========================================================
   HELPERS
========================================================= */

const riskColor = (score: number) => {
  if (score >= 0.7) return 'var(--red)'
  if (score >= 0.3) return 'var(--amber)'
  return 'var(--emerald)'
}

const riskBackground = (score: number) => {
  if (score >= 0.7) return 'var(--red-dim)'
  if (score >= 0.3) return 'var(--amber-dim)'
  return 'var(--emerald-dim)'
}

const formatAmount = (amount: number = 0) => {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

const formatTime = (date?: string) => {
  if (!date) return '--'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return '--'
  }

  return parsedDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* =========================================================
   CARD
========================================================= */

const Card = ({
  children,
  className = '',
  style,
}: CardProps) => {
  return (
    <div
      className={`dashboard-card ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  label,
  value,
  sub,
  color = 'var(--indigo)',
  icon,
}: StatCardProps) => {
  return (
    <div className="stat-card">

      <div className="stat-card-header">

        <div className="stat-label">
          {label}
        </div>

        <div
          className="stat-icon"
          style={{
            color,
            background:
              'color-mix(in srgb, ' +
              color +
              ' 10%, transparent)',
          }}
        >
          {icon}
        </div>

      </div>

      <div
        className="stat-value tabular"
        style={{
          color:
            color === 'var(--indigo)'
              ? 'var(--text-1)'
              : color,
        }}
      >
        {value}
      </div>

      <div className="stat-sub">
        {sub}
      </div>

    </div>
  )
}

/* =========================================================
   CHART TOOLTIP
========================================================= */

const ChartTooltip = ({
  active,
  payload,
  label,
}: any) => {

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="chart-tooltip">

      <div className="tooltip-label">
        {label}
      </div>

      {payload.map((item: any) => (
        <div
          key={item.name}
          className="tooltip-row"
        >

          <span
            className="tooltip-dot"
            style={{
              background: item.color,
            }}
          />

          <span>
            {item.name}
          </span>

          <strong>
            {item.value}
          </strong>

        </div>
      ))}

    </div>
  )
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {

  const [stats, setStats] = useState<any>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const load = async () => {

    try {

      const [
        statsResponse,
        alertsResponse,
      ] = await Promise.all([
        transactionsApi.stats(),
        alertsApi.list({
          limit: 6,
        }),
      ])

      setStats(
        statsResponse.data
      )

      setAlerts(
        alertsResponse.data?.alerts || []
      )

    } catch (error) {

      console.error(
        'Dashboard loading failed:',
        error
      )

    } finally {

      setLoading(false)

    }
  }

  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {

    load()

    const timer = setInterval(
      load,
      5000
    )

    return () => {
      clearInterval(timer)
    }

  }, [])

  /* =======================================================
     TRANSACTION CHART
  ======================================================= */

  const transactionData = useMemo(() => {

    if (!stats) {
      return []
    }

    return [
      {
        name: 'Approved',
        value: stats.approved ?? 0,
        color: 'var(--emerald)',
      },
      {
        name: 'Flagged',
        value: stats.flagged ?? 0,
        color: 'var(--amber)',
      },
      {
        name: 'Blocked',
        value: stats.blocked ?? 0,
        color: 'var(--red)',
      },
    ]

  }, [stats])

  /* =======================================================
     RISK CHART
  ======================================================= */

  const riskData = useMemo(() => {

    if (!stats) {
      return []
    }

    return [
      {
        name: 'Low Risk',
        value: stats.approved ?? 0,
        color: 'var(--emerald)',
      },
      {
        name: 'Medium Risk',
        value: stats.flagged ?? 0,
        color: 'var(--amber)',
      },
      {
        name: 'High Risk',
        value: stats.blocked ?? 0,
        color: 'var(--red)',
      },
    ]

  }, [stats])

  const riskTotal = riskData.reduce(
    (sum, item) =>
      sum + item.value,
    0
  )

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {

    return (
      <>
        <style>
          {dashboardStyles}
        </style>

        <div className="dashboard-loading">

          <div className="loading-spinner" />

          <div className="loading-title">
            Loading FraudShield
          </div>

          <div className="loading-subtitle">
            Connecting to the fraud detection engine...
          </div>

        </div>
      </>
    )
  }

  /* =======================================================
     MAIN DASHBOARD
  ======================================================= */

  return (
    <>
      <style>
        {dashboardStyles}
      </style>

      <div className="dashboard-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dashboard-header">

          <div>

            <div className="dashboard-breadcrumb">

              <span className="breadcrumb-dot" />

              FRAUD INTELLIGENCE

            </div>

            <h1>
              Security Overview
            </h1>

            <p>
              Monitor payment activity and identify
              suspicious transactions in real time.
            </p>

          </div>

          <div className="engine-status">

            <div className="engine-status-icon">
              <span />
            </div>

            <div>

              <strong>
                Detection Engine
              </strong>

              <small>
                Operational · Live
              </small>

            </div>

          </div>

        </header>


        {/* =================================================
            KPI SECTION
        ================================================= */}

        <section className="stats-grid">

          <StatCard
            label="Total Transactions"
            value={
              stats?.total_transactions ?? 0
            }
            sub="All transactions processed"
            icon="⇄"
          />

          <StatCard
            label="Fraud Rate"
            value={`${stats?.fraud_rate ?? 0}%`}
            sub={`${(
              (stats?.flagged ?? 0) +
              (stats?.blocked ?? 0)
            )} suspicious transactions`}
            color="var(--amber)"
            icon="◎"
          />

          <StatCard
            label="Flagged"
            value={
              stats?.flagged ?? 0
            }
            sub="Awaiting analyst review"
            color="var(--amber)"
            icon="⚑"
          />

          <StatCard
            label="Blocked"
            value={
              stats?.blocked ?? 0
            }
            sub="Automatically prevented"
            color="var(--red)"
            icon="⊘"
          />

          <StatCard
            label="Average Risk"
            value={
              stats?.avg_fraud_score ?? 0
            }
            sub="Portfolio-wide risk score"
            color="var(--violet)"
            icon="◈"
          />

        </section>


        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="analytics-grid">

          {/* ===============================================
              TRANSACTION BREAKDOWN
          =============================================== */}

          <Card>

            <div className="card-header">

              <div>

                <div className="card-title">
                  Transaction Intelligence
                </div>

                <div className="card-subtitle">
                  Distribution of processed transactions
                </div>

              </div>

              <div className="live-badge">

                <span />

                LIVE

              </div>

            </div>

            <div className="chart-wrapper">

              <ResponsiveContainer
                width="100%"
                height={245}
              >

                <BarChart
                  data={transactionData}
                  barSize={44}
                  margin={{
                    top: 15,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >

                  <XAxis
                    dataKey="name"
                    stroke="var(--text-3)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="var(--text-3)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    content={
                      <ChartTooltip />
                    }
                    cursor={{
                      fill:
                        'rgba(79,70,229,.035)',
                    }}
                  />

                  <Bar
                    dataKey="value"
                    radius={[
                      7,
                      7,
                      2,
                      2,
                    ]}
                  >

                    {transactionData.map(
                      (item, index) => (
                        <Cell
                          key={index}
                          fill={item.color}
                        />
                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>

            <div className="chart-legend">

              {transactionData.map(
                item => (

                  <div
                    key={item.name}
                    className="legend-item"
                  >

                    <div className="legend-left">

                      <span
                        className="legend-dot"
                        style={{
                          background:
                            item.color,
                        }}
                      />

                      <span>
                        {item.name}
                      </span>

                    </div>

                    <strong>
                      {item.value}
                    </strong>

                  </div>

                )
              )}

            </div>

          </Card>


          {/* ===============================================
              RISK DISTRIBUTION
          =============================================== */}

          <Card>

            <div className="card-header">

              <div>

                <div className="card-title">
                  Risk Distribution
                </div>

                <div className="card-subtitle">
                  Current transaction risk profile
                </div>

              </div>

            </div>

            <div className="risk-chart">

              <ResponsiveContainer
                width="100%"
                height={165}
              >

                <PieChart>

                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    stroke="var(--chart-stroke)"
                    strokeWidth={3}
                  >

                    {riskData.map(
                      (item, index) => (
                        <Cell
                          key={index}
                          fill={item.color}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    content={
                      <ChartTooltip />
                    }
                  />

                </PieChart>

              </ResponsiveContainer>

              <div className="risk-center">

                <strong>
                  {riskTotal}
                </strong>

                <span>
                  transactions
                </span>

              </div>

            </div>

            <div className="risk-breakdown">

              {riskData.map(
                item => {

                  const percentage =
                    riskTotal > 0
                      ? Math.round(
                          (item.value /
                            riskTotal) *
                            100
                        )
                      : 0

                  return (

                    <div
                      key={item.name}
                      className="risk-row"
                    >

                      <div className="risk-name">

                        <span
                          className="risk-dot"
                          style={{
                            background:
                              item.color,
                          }}
                        />

                        {item.name}

                      </div>

                      <div className="risk-values">

                        <strong>
                          {item.value}
                        </strong>

                        <span>
                          {percentage}%
                        </span>

                      </div>

                    </div>

                  )
                }
              )}

            </div>

          </Card>

        </section>


        {/* =================================================
            RECENT ALERTS
        ================================================= */}

        <Card className="alerts-card">

          <div className="alerts-header">

            <div>

              <div className="card-title">
                Recent Fraud Alerts
              </div>

              <div className="card-subtitle">
                Latest suspicious transactions requiring
                attention
              </div>

            </div>

            <a
              href="/alerts"
              className="view-all"
            >
              View all alerts
              <span>→</span>
            </a>

          </div>


          {alerts.length === 0 ? (

            <div className="empty-alerts">

              <div className="empty-icon">
                ✓
              </div>

              <strong>
                No suspicious activity detected
              </strong>

              <span>
                Your transaction pipeline is currently clear.
              </span>

            </div>

          ) : (

            <div className="alerts-table">

              {/* TABLE HEADER */}

              <div className="alert-table-header">

                <span>
                  TRANSACTION
                </span>

                <span>
                  AMOUNT
                </span>

                <span>
                  RISK SCORE
                </span>

                <span>
                  STATUS
                </span>

                <span>
                  TIME
                </span>

              </div>


              {/* TABLE ROWS */}

              {alerts.map(
                alert => {

                  const score =
                    alert.fraud_score ?? 0

                  const status =
                    alert.status ?? 'pending'

                  return (

                    <div
                      key={alert.id}
                      className="alert-table-row"
                    >

                      {/* TRANSACTION */}

                      <div className="transaction-cell">

                        <div
                          className="merchant-avatar"
                          style={{
                            color:
                              riskColor(score),
                            background:
                              riskBackground(score),
                          }}
                        >
                          {alert.merchant
                            ?.charAt(0)
                            ?.toUpperCase() || 'F'}
                        </div>

                        <div className="merchant-info">

                          <strong>
                            {alert.merchant ||
                              'Unknown Merchant'}
                          </strong>

                          <span>
                            {alert.user_id ||
                              'Unknown user'}
                          </span>

                        </div>

                      </div>


                      {/* AMOUNT */}

                      <div className="amount-cell tabular">
                        {formatAmount(
                          alert.amount
                        )}
                      </div>


                      {/* RISK */}

                      <div className="risk-score-cell">

                        <span
                          className="risk-badge"
                          style={{
                            color:
                              riskColor(score),
                            background:
                              riskBackground(score),
                          }}
                        >
                          {(
                            score * 100
                          ).toFixed(1)}
                          %
                        </span>

                        <div className="risk-track">

                          <div
                            style={{
                              width: `${Math.min(
                                score * 100,
                                100
                              )}%`,
                              background:
                                riskColor(score),
                            }}
                          />

                        </div>

                      </div>


                      {/* STATUS */}

                      <div>

                        <span
                          className="status-badge"
                          style={{
                            color:
                              status === 'pending'
                                ? 'var(--amber)'
                                : status ===
                                  'true_positive'
                                ? 'var(--red)'
                                : 'var(--indigo)',

                            background:
                              status === 'pending'
                                ? 'var(--amber-dim)'
                                : status ===
                                  'true_positive'
                                ? 'var(--red-dim)'
                                : 'var(--indigo-dim)',
                          }}
                        >

                          <span />

                          {status === 'pending'
                            ? 'Pending'
                            : status ===
                              'true_positive'
                            ? 'Confirmed'
                            : 'Dismissed'}

                        </span>

                      </div>


                      {/* TIME */}

                      <div className="time-cell">
                        {formatTime(
                          alert.created_at
                        )}
                      </div>

                    </div>

                  )
                }
              )}

            </div>

          )}

        </Card>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="dashboard-footer">

          <div className="pipeline-status">

            <span />

            Fraud detection pipeline operational

          </div>

          <span>
            Auto-refreshing every 5 seconds
          </span>

        </div>

      </div>
    </>
  )
}


/* =========================================================
   PROFESSIONAL LIGHT THEME
========================================================= */

const dashboardStyles = `
/* Dashboard consumes the global theme variables defined by Layout.tsx. */
.dashboard-page {
  --chart-stroke: var(--bg-card, #FFFFFF);
}

/* =========================================================
   PAGE
========================================================= */

.dashboard-page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 28px 30px 35px;

  background: var(--bg-base);

  color: var(--text-1);

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}


/* =========================================================
   HEADER
========================================================= */

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 25px;

  margin-bottom: 24px;
}

.dashboard-breadcrumb {
  display: flex;
  align-items: center;

  gap: 7px;

  margin-bottom: 8px;

  color: var(--indigo);

  font-size: 10px;
  font-weight: 750;

  letter-spacing: .12em;
}

.breadcrumb-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: var(--indigo);
}

.dashboard-header h1 {
  margin: 0;

  color: var(--text-1);

  font-size: 27px;
  line-height: 1.15;

  font-weight: 750;

  letter-spacing: -.045em;
}

.dashboard-header p {
  margin: 7px 0 0;

  max-width: 600px;

  color: var(--text-2);

  font-size: 12px;
  line-height: 1.5;
}


/* =========================================================
   ENGINE STATUS
========================================================= */

.engine-status {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 10px 13px;

  background: var(--bg-card);

  border: 1px solid var(--border);

  border-radius: 10px;

  box-shadow:
    0 1px 2px rgba(15,23,42,.03);
}

.engine-status-icon {
  width: 27px;
  height: 27px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--emerald-dim);
}

.engine-status-icon span {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: var(--emerald);

  box-shadow:
    0 0 0 4px rgba(16,185,129,.10);
}

.engine-status strong {
  display: block;

  color: var(--text-2);

  font-size: 10px;
  font-weight: 650;
}

.engine-status small {
  display: block;

  margin-top: 2px;

  color: var(--emerald);

  font-size: 9px;
}


/* =========================================================
   STAT CARDS
========================================================= */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(5, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 15px;
}

.stat-card {
  position: relative;

  min-height: 112px;

  padding: 16px;

  box-sizing: border-box;

  background: var(--bg-card);

  border: 1px solid var(--border-soft);

  border-radius: 12px;

  box-shadow:
    0 1px 2px rgba(15,23,42,.025);

  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  border-color: var(--border);

  box-shadow:
    0 8px 22px rgba(15,23,42,.06);
}

.stat-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.stat-label {
  color: var(--text-2);

  font-size: 9px;
  font-weight: 700;

  letter-spacing: .075em;

  text-transform: uppercase;
}

.stat-icon {
  width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  font-size: 13px;
  font-weight: 700;
}

.stat-value {
  margin-top: 15px;

  font-size: 25px;
  line-height: 1;

  font-weight: 750;

  letter-spacing: -.045em;
}

.stat-sub {
  margin-top: 8px;

  color: var(--text-3);

  font-size: 9px;
}


/* =========================================================
   GENERIC CARD
========================================================= */

.dashboard-card {
  box-sizing: border-box;

  background: var(--bg-card);

  border: 1px solid var(--border-soft);

  border-radius: 13px;

  padding: 18px;

  box-shadow:
    0 1px 2px rgba(15,23,42,.025);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 15px;
}

.card-title {
  color: var(--text-1);

  font-size: 12px;
  font-weight: 700;
}

.card-subtitle {
  margin-top: 4px;

  color: var(--text-3);

  font-size: 10px;
}


/* =========================================================
   LIVE BADGE
========================================================= */

.live-badge {
  display: inline-flex;
  align-items: center;

  gap: 5px;

  padding: 5px 7px;

  color: var(--emerald);

  background: var(--emerald-dim);

  border: 1px solid var(--emerald-dim);

  border-radius: 5px;

  font-size: 8px;
  font-weight: 750;

  letter-spacing: .08em;
}

.live-badge span {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--emerald);
}


/* =========================================================
   ANALYTICS GRID
========================================================= */

.analytics-grid {
  display: grid;

  grid-template-columns:
    minmax(0, 1.45fr)
    minmax(300px, 1fr);

  gap: 15px;

  margin-bottom: 15px;
}


/* =========================================================
   BAR CHART
========================================================= */

.chart-wrapper {
  height: 245px;

  margin-top: 10px;
}

.chart-tooltip {
  min-width: 130px;

  padding: 10px 12px;

  background: var(--bg-card);

  border: 1px solid var(--border);

  border-radius: 9px;

  box-shadow:
    0 10px 30px rgba(15,23,42,.10);
}

.tooltip-label {
  margin-bottom: 6px;

  color: var(--text-2);

  font-size: 9px;
  font-weight: 600;
}

.tooltip-row {
  display: flex;
  align-items: center;

  gap: 6px;

  margin-top: 4px;

  color: var(--text-2);

  font-size: 10px;
}

.tooltip-row strong {
  margin-left: auto;

  color: var(--text-1);

  font-weight: 700;
}

.tooltip-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;
}


/* =========================================================
   LEGEND
========================================================= */

.chart-legend {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 8px;

  padding-top: 9px;

  border-top:
    1px solid var(--border-soft);
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 7px 8px;

  background: var(--bg-card2);

  border-radius: 7px;
}

.legend-left {
  display: flex;
  align-items: center;

  gap: 6px;

  color: var(--text-2);

  font-size: 9px;
}

.legend-item strong {
  color: var(--text-1);

  font-size: 10px;
}

.legend-dot {
  width: 6px;
  height: 6px;

  flex-shrink: 0;

  border-radius: 50%;
}


/* =========================================================
   RISK CHART
========================================================= */

.risk-chart {
  position: relative;

  height: 165px;
}

.risk-center {
  position: absolute;

  inset: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  flex-direction: column;

  pointer-events: none;
}

.risk-center strong {
  color: var(--text-1);

  font-size: 23px;
  font-weight: 750;

  letter-spacing: -.04em;
}

.risk-center span {
  margin-top: 2px;

  color: var(--text-3);

  font-size: 8px;
}


/* =========================================================
   RISK BREAKDOWN
========================================================= */

.risk-breakdown {
  display: flex;

  flex-direction: column;

  gap: 6px;
}

.risk-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 8px 9px;

  background: var(--bg-card2);

  border: 1px solid var(--bg-hover);

  border-radius: 7px;
}

.risk-name {
  display: flex;
  align-items: center;

  gap: 7px;

  color: var(--text-2);

  font-size: 10px;
}

.risk-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;
}

.risk-values {
  display: flex;
  align-items: center;

  gap: 8px;
}

.risk-values strong {
  color: var(--text-1);

  font-size: 10px;
}

.risk-values span {
  min-width: 28px;

  color: var(--text-3);

  font-size: 9px;

  text-align: right;
}


/* =========================================================
   ALERTS CARD
========================================================= */

.alerts-card {
  padding: 0;

  overflow: hidden;
}

.alerts-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 18px;

  border-bottom:
    1px solid var(--border-soft);
}

.view-all {
  display: inline-flex;
  align-items: center;

  gap: 6px;

  color: var(--indigo);

  text-decoration: none;

  font-size: 10px;
  font-weight: 650;
}

.view-all:hover {
  color: var(--indigo);
}

.view-all span {
  font-size: 14px;

  transition:
    transform .15s ease;
}

.view-all:hover span {
  transform:
    translateX(2px);
}


/* =========================================================
   ALERT TABLE
========================================================= */

.alerts-table {
  width: 100%;
}

.alert-table-header,
.alert-table-row {
  display: grid;

  grid-template-columns:
    2.1fr
    1fr
    1.1fr
    1fr
    .7fr;

  gap: 14px;

  align-items: center;
}

.alert-table-header {
  padding: 10px 18px;

  color: var(--text-3);

  background: var(--bg-card2);

  border-bottom:
    1px solid var(--border-soft);

  font-size: 8px;

  font-weight: 700;

  letter-spacing: .08em;
}

.alert-table-row {
  padding: 12px 18px;

  border-bottom:
    1px solid var(--border-soft);

  transition:
    background .15s ease;
}

.alert-table-row:last-child {
  border-bottom: none;
}

.alert-table-row:hover {
  background: var(--bg-hover);
}


/* =========================================================
   TRANSACTION CELL
========================================================= */

.transaction-cell {
  display: flex;

  align-items: center;

  gap: 9px;

  min-width: 0;
}

.merchant-avatar {
  width: 31px;
  height: 31px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 8px;

  font-size: 11px;
  font-weight: 750;
}

.merchant-info {
  min-width: 0;
}

.merchant-info strong {
  display: block;

  overflow: hidden;

  color: var(--text-1);

  font-size: 10px;
  font-weight: 650;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.merchant-info span {
  display: block;

  overflow: hidden;

  margin-top: 3px;

  color: var(--text-3);

  font-size: 8px;

  text-overflow: ellipsis;
  white-space: nowrap;
}


/* =========================================================
   AMOUNT
========================================================= */

.amount-cell {
  color: var(--text-1);

  font-size: 10px;

  font-weight: 650;
}


/* =========================================================
   RISK SCORE
========================================================= */

.risk-score-cell {
  min-width: 0;
}

.risk-badge {
  display: inline-block;

  padding: 3px 7px;

  border-radius: 5px;

  font-size: 9px;

  font-weight: 700;
}

.risk-track {
  width: 65px;
  height: 3px;

  margin-top: 5px;

  overflow: hidden;

  background: var(--border);

  border-radius: 4px;
}

.risk-track > div {
  height: 100%;

  border-radius: 4px;

  transition:
    width .5s ease;
}


/* =========================================================
   STATUS
========================================================= */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding: 4px 7px;

  border-radius: 5px;

  font-size: 8px;

  font-weight: 650;
}

.status-badge > span {
  width: 4px;
  height: 4px;

  border-radius: 50%;

  background: currentColor;
}


/* =========================================================
   TIME
========================================================= */

.time-cell {
  color: var(--text-3);

  font-size: 9px;
}


/* =========================================================
   EMPTY ALERT STATE
========================================================= */

.empty-alerts {
  min-height: 180px;

  display: flex;

  align-items: center;
  justify-content: center;

  flex-direction: column;

  gap: 5px;

  color: var(--text-3);
}

.empty-icon {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 5px;

  color: var(--emerald);

  background: var(--emerald-dim);

  border: 1px solid var(--emerald-dim);

  border-radius: 11px;

  font-size: 17px;
  font-weight: 700;
}

.empty-alerts strong {
  color: var(--text-2);

  font-size: 11px;
}

.empty-alerts span {
  font-size: 9px;
}


/* =========================================================
   FOOTER
========================================================= */

.dashboard-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-top: 12px;

  padding: 0 3px;

  color: var(--text-3);

  font-size: 8px;
}

.pipeline-status {
  display: flex;

  align-items: center;

  gap: 6px;
}

.pipeline-status > span {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--emerald);

  box-shadow:
    0 0 0 3px rgba(16,185,129,.08);
}


/* =========================================================
   LOADING
========================================================= */

.dashboard-loading {
  min-height: 70vh;

  display: flex;

  align-items: center;
  justify-content: center;

  flex-direction: column;

  background: var(--bg-base);

  color: var(--text-1);
}

.loading-spinner {
  width: 30px;
  height: 30px;

  margin-bottom: 15px;

  border:
    2px solid var(--border);

  border-top-color:
    var(--indigo);

  border-radius: 50%;

  animation:
    dashboard-spin .75s linear infinite;
}

.loading-title {
  color: var(--text-2);

  font-size: 12px;

  font-weight: 650;
}

.loading-subtitle {
  margin-top: 5px;

  color: var(--text-3);

  font-size: 9px;
}

@keyframes dashboard-spin {

  to {
    transform:
      rotate(360deg);
  }

}


/* =========================================================
   RESPONSIVE — TABLET
========================================================= */

@media (max-width: 1150px) {

  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .analytics-grid {
    grid-template-columns:
      1fr;
  }

}


/* =========================================================
   RESPONSIVE — SMALL TABLET
========================================================= */

@media (max-width: 800px) {

  .dashboard-page {
    padding:
      22px 20px 30px;
  }

  .dashboard-header {
    flex-direction: column;
  }

  .engine-status {
    width: fit-content;
  }

  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .alert-table-header,
  .alert-table-row {
    grid-template-columns:
      2fr
      1fr
      1fr;
  }

  .alert-table-header span:nth-child(4),
  .alert-table-header span:nth-child(5),

  .alert-table-row > div:nth-child(4),
  .alert-table-row > div:nth-child(5) {
    display: none;
  }

}


/* =========================================================
   RESPONSIVE — MOBILE
========================================================= */

@media (max-width: 520px) {

  .dashboard-page {
    padding:
      18px 14px 25px;
  }

  .dashboard-header h1 {
    font-size: 23px;
  }

  .dashboard-header p {
    font-size: 11px;
  }

  .stats-grid {
    grid-template-columns:
      1fr;
  }

  .analytics-grid {
    gap: 12px;
  }

  .chart-legend {
    grid-template-columns:
      1fr;
  }

  .alerts-header {
    align-items: flex-start;

    flex-direction: column;
  }

  .dashboard-footer {
    flex-direction: column;

    align-items: flex-start;
  }

}
`
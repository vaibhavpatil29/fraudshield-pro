import { useEffect, useMemo, useState } from 'react'
import { alertsApi } from '../services/api'

const riskColor = (score: number) =>
  score > 0.6 ? 'var(--red)' :
  score > 0.3 ? 'var(--amber)' :
  'var(--emerald)'

const riskBg = (score: number) =>
  score > 0.6 ? 'var(--red-dim)' :
  score > 0.3 ? 'var(--amber-dim)' :
  'var(--emerald-dim)'

const riskLabel = (score: number) =>
  score > 0.6 ? 'High Risk' :
  score > 0.3 ? 'Medium Risk' :
  'Low Risk'

const formatAmount = (amount: number) =>
  `₹${amount?.toLocaleString('en-IN') || '0'}`

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export default function Alerts() {

  const [alerts, setAlerts] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  /* ======================================================
     LOAD ALERTS
  ====================================================== */

  const load = async () => {

    try {

      const res = await alertsApi.list({
        limit: 100,
      })

      setAlerts(
        res.data.alerts || []
      )

    } catch (error) {

      console.error(
        'Failed to load alerts:',
        error
      )

    } finally {

      setLoading(false)

    }
  }

  /* ======================================================
     AUTO REFRESH
  ====================================================== */

  useEffect(() => {

    load()

    const timer = setInterval(
      load,
      4000
    )

    return () =>
      clearInterval(timer)

  }, [])

  /* ======================================================
     UPDATE ALERT
  ====================================================== */

  const mark = async (
    id: string,
    status: string
  ) => {

    try {

      setUpdating(true)

      await alertsApi.update(
        id,
        status
      )

      await load()

      setSelected(
        (prev: any) =>
          prev
            ? {
                ...prev,
                status,
              }
            : null
      )

    } catch (error) {

      console.error(
        'Failed to update alert:',
        error
      )

    } finally {

      setUpdating(false)

    }
  }

  /* ======================================================
     STATISTICS
  ====================================================== */

  const stats = useMemo(() => {

    return {

      total:
        alerts.length,

      pending:
        alerts.filter(
          a =>
            a.status === 'pending'
        ).length,

      highRisk:
        alerts.filter(
          a =>
            a.fraud_score > 0.6
        ).length,

      confirmed:
        alerts.filter(
          a =>
            a.status ===
            'true_positive'
        ).length,

    }

  }, [alerts])

  /* ======================================================
     FILTERED ALERTS
  ====================================================== */

  const filtered = useMemo(() => {

    return alerts.filter(alert => {

      const matchesFilter =
        filter === 'all' ||
        alert.status === filter

      const query =
        search
          .toLowerCase()
          .trim()

      const matchesSearch =
        !query ||
        alert.merchant
          ?.toLowerCase()
          .includes(query) ||
        alert.user_id
          ?.toLowerCase()
          .includes(query) ||
        alert.id
          ?.toLowerCase()
          .includes(query)

      return (
        matchesFilter &&
        matchesSearch
      )
    })

  }, [
    alerts,
    filter,
    search,
  ])

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <>
      <style>{alertsStyles}</style>

      <div className="alerts-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="alerts-header">

          <div>

            <div className="alerts-eyebrow">

              <span className="eyebrow-dot" />

              FRAUD INTELLIGENCE CENTER

            </div>

            <h1>
              Live Alerts
            </h1>

            <p>
              Monitor, investigate and resolve
              suspicious payment activity in real time.
            </p>

          </div>

          <div className="engine-status">

            <div className="engine-icon">

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


        {/* ==================================================
            KPI CARDS
        ================================================== */}

        <section className="stats-grid">

          <StatCard
            label="Total Alerts"
            value={stats.total}
            description="All detected transactions"
            icon="◈"
            color="var(--indigo)"
          />

          <StatCard
            label="Pending Review"
            value={stats.pending}
            description="Require analyst attention"
            icon="◷"
            color="var(--amber)"
          />

          <StatCard
            label="High Risk"
            value={stats.highRisk}
            description="Fraud score above 60%"
            icon="!"
            color="var(--red)"
          />

          <StatCard
            label="Confirmed Fraud"
            value={stats.confirmed}
            description="Verified by analysts"
            icon="✓"
            color="var(--emerald)"
          />

        </section>


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div
          className={
            `alerts-layout ${
              selected
                ? 'has-detail'
                : 'no-detail'
            }`
          }
        >

          {/* =================================================
              ALERT LIST
          ================================================= */}

          <main>

            {/* TOOLBAR */}

            <div className="toolbar">

              <div className="search-wrapper">

                <span className="search-icon">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={e =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search merchant, user or alert ID..."
                />

                {search && (

                  <button
                    className="clear-search"
                    onClick={() =>
                      setSearch('')
                    }
                  >
                    ×
                  </button>

                )}

              </div>

              <div className="result-count">

                <strong>
                  {filtered.length}
                </strong>

                alerts

              </div>

            </div>


            {/* FILTERS */}

            <div className="filter-bar">

              <div className="filter-tabs">

                {[
                  ['all', 'All'],
                  ['pending', 'Pending'],
                  [
                    'true_positive',
                    'Confirmed',
                  ],
                  [
                    'false_positive',
                    'Dismissed',
                  ],
                ].map(
                  ([value, label]) => (

                    <button
                      key={value}
                      className={
                        `filter-button ${
                          filter === value
                            ? 'active'
                            : ''
                        }`
                      }
                      onClick={() =>
                        setFilter(value)
                      }
                    >

                      {label}

                      {filter === value && (
                        <span className="filter-active-dot" />
                      )}

                    </button>

                  )
                )}

              </div>

              <div className="refresh-indicator">

                <span />

                Updates automatically

              </div>

            </div>


            {/* ALERTS */}

            {loading ? (

              <div className="loading-card">

                <div className="spinner" />

                <strong>
                  Loading fraud intelligence
                </strong>

                <span>
                  Connecting to the detection engine...
                </span>

              </div>

            ) : filtered.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ✓
                </div>

                <div className="empty-title">
                  No alerts found
                </div>

                <div className="empty-description">
                  No transactions match your current
                  search or filters.
                </div>

                {(search ||
                  filter !== 'all') && (

                  <button
                    className="reset-button"
                    onClick={() => {
                      setSearch('')
                      setFilter('all')
                    }}
                  >
                    Clear filters
                  </button>

                )}

              </div>

            ) : (

              <div className="alert-list">

                {filtered.map(alert => {

                  const score =
                    alert.fraud_score || 0

                  const riskClass =
                    score > 0.6
                      ? 'high'
                      : score > 0.3
                      ? 'medium'
                      : 'low'

                  const isSelected =
                    selected?.id ===
                    alert.id

                  return (

                    <div
                      key={alert.id}
                      className={
                        `alert-row ${
                          isSelected
                            ? 'selected'
                            : ''
                        }`
                      }
                      onClick={() =>
                        setSelected(
                          isSelected
                            ? null
                            : alert
                        )
                      }
                    >

                      {/* RISK ICON */}

                      <div
                        className={
                          `risk-icon ${riskClass}`
                        }
                        style={{
                          background:
                            riskBg(score),
                          color:
                            riskColor(score),
                        }}
                      >

                        {score > 0.6
                          ? '!'
                          : score > 0.3
                          ? '△'
                          : '✓'}

                      </div>


                      {/* TRANSACTION */}

                      <div className="alert-main">

                        <div className="merchant-line">

                          <span className="merchant-avatar">

                            {alert.merchant
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              'F'}

                          </span>

                          <div>

                            <div className="merchant-name">

                              {alert.merchant ||
                                'Unknown Merchant'}

                            </div>

                            <div className="transaction-meta">

                              {alert.user_id ||
                                'Unknown user'}

                              <span>
                                •
                              </span>

                              {formatDate(
                                alert.created_at
                              )}

                              <span>
                                •
                              </span>

                              {formatTime(
                                alert.created_at
                              )}

                            </div>

                          </div>

                        </div>

                      </div>


                      {/* AMOUNT */}

                      <div className="amount-block">

                        <div className="amount tabular">

                          {formatAmount(
                            alert.amount
                          )}

                        </div>

                        <span
                          className="risk-pill"
                          style={{
                            background:
                              riskBg(score),
                            color:
                              riskColor(score),
                          }}
                        >

                          {(
                            score * 100
                          ).toFixed(1)}
                          % risk

                        </span>

                      </div>


                      {/* STATUS */}

                      <div className="status-container">

                        <StatusBadge
                          status={
                            alert.status
                          }
                        />

                      </div>


                      {/* CHEVRON */}

                      <div
                        className={
                          `row-chevron ${
                            isSelected
                              ? 'open'
                              : ''
                          }`
                        }
                      >
                        ›
                      </div>

                    </div>

                  )
                })}

              </div>

            )}

          </main>


          {/* =================================================
              INVESTIGATION PANEL
          ================================================= */}

          {selected && (

            <aside className="detail-panel">

              {/* DETAIL HEADER */}

              <div className="detail-header">

                <div>

                  <div className="detail-eyebrow">

                    <span />

                    INVESTIGATION

                  </div>

                  <div className="detail-title">
                    Alert Details
                  </div>

                </div>

                <button
                  className="close-button"
                  onClick={() =>
                    setSelected(null)
                  }
                >
                  ×
                </button>

              </div>


              <div className="detail-content">

                {/* TRANSACTION SUMMARY */}

                <div className="transaction-summary">

                  <div className="summary-top">

                    <div>

                      <div className="detail-label">
                        MERCHANT
                      </div>

                      <div className="detail-merchant">
                        {selected.merchant ||
                          'Unknown Merchant'}
                      </div>

                    </div>

                    <div
                      className="summary-risk-icon"
                      style={{
                        background:
                          riskBg(
                            selected.fraud_score
                          ),
                        color:
                          riskColor(
                            selected.fraud_score
                          ),
                      }}
                    >

                      {selected.fraud_score >
                      0.6
                        ? '!'
                        : selected.fraud_score >
                          0.3
                        ? '△'
                        : '✓'}

                    </div>

                  </div>

                  <div className="summary-divider" />

                  <div className="detail-label">
                    TRANSACTION AMOUNT
                  </div>

                  <div className="detail-amount tabular">

                    {formatAmount(
                      selected.amount
                    )}

                  </div>

                  <div className="transaction-id">

                    ID: {selected.id}

                  </div>

                </div>


                {/* RISK SCORE */}

                <section className="risk-section">

                  <div className="risk-top">

                    <div>

                      <div className="detail-label">
                        FRAUD RISK SCORE
                      </div>

                      <div
                        className="risk-score tabular"
                        style={{
                          color:
                            riskColor(
                              selected.fraud_score
                            ),
                        }}
                      >

                        {(
                          selected.fraud_score *
                          100
                        ).toFixed(1)}
                        %

                      </div>

                    </div>

                    <div
                      className="risk-label"
                      style={{
                        background:
                          riskBg(
                            selected.fraud_score
                          ),
                        color:
                          riskColor(
                            selected.fraud_score
                          ),
                      }}
                    >

                      {riskLabel(
                        selected.fraud_score
                      )}

                    </div>

                  </div>

                  <div className="score-track">

                    <div
                      className="score-fill"
                      style={{
                        width:
                          `${Math.min(
                            selected.fraud_score *
                              100,
                            100
                          )}%`,
                        background:
                          riskColor(
                            selected.fraud_score
                          ),
                      }}
                    />

                  </div>

                  <div className="score-scale">

                    <span>
                      Low
                    </span>

                    <span>
                      Medium
                    </span>

                    <span>
                      High
                    </span>

                  </div>

                </section>


                {/* EXPLAINABILITY */}

                {selected.shap_reasons?.length >
                  0 && (

                  <section className="explain-section">

                    <div className="explain-title">

                      <div>

                        <strong>
                          Why was this flagged?
                        </strong>

                        <span>
                          Model decision factors
                        </span>

                      </div>

                      <div className="xai-badge">
                        XAI / SHAP
                      </div>

                    </div>


                    <div className="reason-list">

                      {selected.shap_reasons.map(
                        (
                          reason: any,
                          index: number
                        ) => (

                          <div
                            key={index}
                            className={
                              `reason-card ${
                                reason.rule_triggered
                                  ? 'rule'
                                  : ''
                              }`
                            }
                          >

                            {reason.rule_triggered ? (

                              <div className="reason-row">

                                <div
                                  className="reason-symbol"
                                  style={{
                                    color:
                                      'var(--amber)',
                                    background:
                                      'var(--amber-dim)',
                                  }}
                                >
                                  !
                                </div>

                                <div>

                                  <div
                                    className="reason-title"
                                    style={{
                                      color:
                                        'var(--amber)',
                                    }}
                                  >
                                    Rule triggered
                                  </div>

                                  <div className="reason-description">
                                    {
                                      reason.rule_triggered
                                    }

                                    {' → '}

                                    {
                                      reason.rule_action
                                    }
                                  </div>

                                </div>

                              </div>

                            ) : (

                              <div className="reason-row">

                                <div
                                  className="reason-symbol"
                                  style={{
                                    color:
                                      reason.direction ===
                                      'increases'
                                        ? 'var(--red)'
                                        : 'var(--emerald)',

                                    background:
                                      reason.direction ===
                                      'increases'
                                        ? 'var(--red-dim)'
                                        : 'var(--emerald-dim)',
                                  }}
                                >

                                  {reason.direction ===
                                  'increases'
                                    ? '↑'
                                    : '↓'}

                                </div>

                                <div>

                                  <div className="reason-title">
                                    {reason.label}
                                  </div>

                                  <div className="reason-description">

                                    {reason.direction}
                                    {' fraud risk · '}
                                    {reason.impact}
                                    {' impact'}

                                  </div>

                                </div>

                              </div>

                            )}

                          </div>

                        )
                      )}

                    </div>

                  </section>

                )}


                {/* TRANSACTION INFORMATION */}

                <section className="info-section">

                  <div className="info-title">
                    Transaction Information
                  </div>

                  <div className="info-grid">

                    <div>
                      <span>
                        User
                      </span>

                      <strong>
                        {selected.user_id ||
                          'Unknown'}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Detected
                      </span>

                      <strong>
                        {formatTime(
                          selected.created_at
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Status
                      </span>

                      <strong>
                        {selected.status ===
                        'pending'
                          ? 'Pending Review'
                          : selected.status ===
                            'true_positive'
                          ? 'Confirmed Fraud'
                          : 'False Alarm'}
                      </strong>
                    </div>

                  </div>

                </section>


                {/* ACTIONS */}

                {selected.status ===
                'pending' ? (

                  <div className="action-section">

                    <div className="action-title">
                      Analyst Decision
                    </div>

                    <div className="action-grid">

                      <button
                        className="action-button confirm-button"
                        disabled={updating}
                        onClick={() =>
                          mark(
                            selected.id,
                            'true_positive'
                          )
                        }
                      >

                        <span>
                          ✓
                        </span>

                        {updating
                          ? 'Updating...'
                          : 'Confirm Fraud'}

                      </button>

                      <button
                        className="action-button dismiss-button"
                        disabled={updating}
                        onClick={() =>
                          mark(
                            selected.id,
                            'false_positive'
                          )
                        }
                      >

                        <span>
                          ×
                        </span>

                        {updating
                          ? 'Updating...'
                          : 'False Alarm'}

                      </button>

                    </div>

                  </div>

                ) : (

                  <div
                    className="resolved-box"
                    style={{
                      background:
                        selected.status ===
                        'true_positive'
                          ? 'var(--red-dim)'
                          : 'var(--indigo-dim)',

                      color:
                        selected.status ===
                        'true_positive'
                          ? 'var(--red)'
                          : 'var(--indigo)',

                      border:
                        selected.status ===
                        'true_positive'
                          ? '1px solid var(--border)'
                          : '1px solid var(--border-acc)',
                    }}
                  >

                    <span>
                      {selected.status ===
                      'true_positive'
                        ? '✓'
                        : '×'}
                    </span>

                    {selected.status ===
                    'true_positive'
                      ? 'Confirmed as fraud'
                      : 'Marked as false alarm'}

                  </div>

                )}

              </div>

            </aside>

          )}

        </div>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="alerts-footer">

          <div>

            <span className="footer-dot" />

            Fraud detection pipeline operational

          </div>

          <span>
            Auto-refreshing every 4 seconds
          </span>

        </footer>

      </div>
    </>
  )
}


/* ==========================================================
   STAT CARD
========================================================== */

function StatCard({
  label,
  value,
  description,
  icon,
  color,
}: {
  label: string
  value: number
  description: string
  icon: string
  color: string
}) {

  return (

    <div className="stat-card">

      <div className="stat-card-top">

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

      <div className="stat-meta">
        {description}
      </div>

    </div>
  )
}


/* ==========================================================
   STATUS BADGE
========================================================== */

function StatusBadge({
  status,
}: {
  status: string
}) {

  const isPending =
    status === 'pending'

  const isConfirmed =
    status === 'true_positive'

  const background =
    isPending
      ? 'var(--amber-dim)'
      : isConfirmed
      ? 'var(--red-dim)'
      : 'var(--indigo-dim)'

  const color =
    isPending
      ? 'var(--amber)'
      : isConfirmed
      ? 'var(--red)'
      : 'var(--indigo)'

  const label =
    isPending
      ? 'Pending'
      : isConfirmed
      ? 'Confirmed'
      : 'Dismissed'

  return (

    <span
      className="status-badge"
      style={{
        background,
        color,
      }}
    >

      <span />

      {label}

    </span>
  )
}


/* ==========================================================
   STYLES
========================================================== */

const alertsStyles = `

* {
  box-sizing: border-box;
}

.alerts-page {

  --text-on-accent: #FFFFFF;

  min-height: 100vh;

  padding:
    28px 30px 35px;

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


/* ==========================================================
   HEADER
========================================================== */

.alerts-header {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

  gap: 25px;

  margin-bottom: 24px;

}

.alerts-eyebrow {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 8px;

  color: var(--indigo);

  font-size: 10px;

  font-weight: 750;

  letter-spacing: .12em;

}

.eyebrow-dot {

  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: var(--indigo);

}

.alerts-header h1 {

  margin: 0;

  color: var(--text-1);

  font-size: 27px;

  line-height: 1.15;

  font-weight: 750;

  letter-spacing: -.045em;

}

.alerts-header p {

  margin:
    7px 0 0;

  color: var(--text-2);

  font-size: 12px;

  line-height: 1.5;

}


/* ==========================================================
   ENGINE STATUS
========================================================== */

.engine-status {

  display: flex;

  align-items: center;

  gap: 10px;

  padding:
    10px 13px;

  background: var(--bg-card);

  border:
    1px solid var(--border);

  border-radius: 10px;

  box-shadow:
    0 1px 2px
    rgba(15,23,42,.03);

}

.engine-icon {

  width: 28px;
  height: 28px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  background: var(--emerald-dim);

}

.engine-icon span {

  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: var(--emerald);

  box-shadow:
    0 0 0 4px
    rgba(16,185,129,.10);

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


/* ==========================================================
   STAT CARDS
========================================================== */

.stats-grid {

  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 16px;

}

.stat-card {

  position: relative;

  min-height: 112px;

  padding: 16px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

  box-shadow:
    0 1px 2px
    rgba(15,23,42,.025);

  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease;

}

.stat-card:hover {

  transform:
    translateY(-2px);

  border-color:
    var(--border);

  box-shadow:
    0 8px 22px
    rgba(15,23,42,.06);

}

.stat-card-top {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

}

.stat-label {

  color: var(--text-2);

  font-size: 9px;

  font-weight: 700;

  letter-spacing: .075em;

  text-transform:
    uppercase;

}

.stat-icon {

  width: 28px;
  height: 28px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  font-size: 13px;

  font-weight: 750;

}

.stat-value {

  margin-top: 15px;

  color: var(--text-1);

  font-size: 25px;

  line-height: 1;

  font-weight: 750;

  letter-spacing: -.045em;

}

.stat-meta {

  margin-top: 8px;

  color: var(--text-3);

  font-size: 9px;

}


/* ==========================================================
   MAIN LAYOUT
========================================================== */

.alerts-layout {

  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    390px;

  gap: 15px;

  align-items: start;

}

.alerts-layout.no-detail {

  grid-template-columns: 1fr;

}


/* ==========================================================
   TOOLBAR
========================================================== */

.toolbar {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 12px;

  margin-bottom: 9px;

}

.search-wrapper {

  position: relative;

  width: 100%;

  max-width: 380px;

}

.search-wrapper input {

  width: 100%;

  height: 38px;

  padding:
    0 35px 0 37px;

  color: var(--text-1);

  background: var(--bg-card);

  border:
    1px solid var(--border);

  border-radius: 9px;

  outline: none;

  font-size: 11px;

  transition:
    border-color .15s,
    box-shadow .15s;

}

.search-wrapper input::placeholder {

  color: var(--text-3);

}

.search-wrapper input:focus {

  border-color:
    var(--border-acc);

  box-shadow:
    0 0 0 3px
    rgba(79,70,229,.08);

}

.search-icon {

  position: absolute;

  left: 13px;

  top: 50%;

  transform:
    translateY(-50%);

  color: var(--text-3);

  font-size: 15px;

  pointer-events: none;

}

.clear-search {

  position: absolute;

  right: 9px;

  top: 50%;

  transform:
    translateY(-50%);

  width: 22px;
  height: 22px;

  border: none;

  background:
    var(--bg-hover);

  color: var(--text-2);

  border-radius: 6px;

  cursor: pointer;

  font-size: 14px;

}

.result-count {

  display: flex;

  align-items: center;

  gap: 4px;

  color: var(--text-3);

  font-size: 9px;

  white-space: nowrap;

}

.result-count strong {

  color: var(--text-2);

  font-size: 10px;

}


/* ==========================================================
   FILTERS
========================================================== */

.filter-bar {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 10px;

  margin-bottom: 11px;

}

.filter-tabs {

  display: flex;

  align-items: center;

  gap: 3px;

  padding: 3px;

  background: var(--bg-card);

  border:
    1px solid var(--border);

  border-radius: 9px;

}

.filter-button {

  display: inline-flex;

  align-items: center;

  gap: 5px;

  border: none;

  background:
    transparent;

  color: var(--text-2);

  padding:
    7px 11px;

  border-radius: 6px;

  font-size: 9px;

  font-weight: 650;

  cursor: pointer;

  transition: .15s;

}

.filter-button:hover {

  color: var(--text-2);

  background:
    var(--bg-card2);

}

.filter-button.active {

  color: var(--text-on-accent);

  background: var(--indigo);

  box-shadow:
    0 2px 8px
    rgba(79,70,229,.20);

}

.filter-active-dot {

  width: 4px;
  height: 4px;

  border-radius: 50%;

  background: var(--bg-card);

}

.refresh-indicator {

  display: flex;

  align-items: center;

  gap: 5px;

  color: var(--text-3);

  font-size: 8px;

}

.refresh-indicator span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--emerald);

}


/* ==========================================================
   ALERT LIST
========================================================== */

.alert-list {

  display: flex;

  flex-direction:
    column;

  gap: 7px;

}

.alert-row {

  display: flex;

  align-items: center;

  gap: 13px;

  min-height: 70px;

  padding:
    11px 13px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 11px;

  cursor: pointer;

  transition:
    border-color .15s,
    box-shadow .15s,
    transform .15s,
    background .15s;

}

.alert-row:hover {

  transform:
    translateX(2px);

  border-color:
    var(--border);

  background: var(--bg-card);

  box-shadow:
    0 5px 16px
    rgba(15,23,42,.045);

}

.alert-row.selected {

  background:
    linear-gradient(
      90deg,
      var(--indigo-dim),
      var(--text-on-accent)
    );

  border-color:
    var(--border-acc);

  box-shadow:
    0 4px 16px
    rgba(79,70,229,.08);

}


/* ==========================================================
   RISK ICON
========================================================== */

.risk-icon {

  width: 39px;
  height: 39px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 10px;

  font-size: 13px;

  font-weight: 800;

}


/* ==========================================================
   MERCHANT
========================================================== */

.alert-main {

  flex: 1;

  min-width: 0;

}

.merchant-line {

  display: flex;

  align-items: center;

  gap: 9px;

  min-width: 0;

}

.merchant-avatar {

  width: 30px;
  height: 30px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  color: var(--indigo);

  background: var(--indigo-dim);

  border-radius: 8px;

  font-size: 10px;

  font-weight: 750;

}

.merchant-name {

  overflow: hidden;

  color: var(--text-1);

  font-size: 11px;

  font-weight: 650;

  text-overflow: ellipsis;

  white-space: nowrap;

}

.transaction-meta {

  display: flex;

  align-items: center;

  gap: 5px;

  margin-top: 4px;

  overflow: hidden;

  color: var(--text-3);

  font-size: 8px;

  text-overflow: ellipsis;

  white-space: nowrap;

}


/* ==========================================================
   AMOUNT
========================================================== */

.amount-block {

  min-width: 100px;

  text-align: right;

}

.amount {

  color: var(--text-1);

  font-size: 11px;

  font-weight: 700;

}

.risk-pill {

  display: inline-flex;

  margin-top: 4px;

  padding:
    3px 7px;

  border-radius: 999px;

  font-size: 8px;

  font-weight: 700;

}


/* ==========================================================
   STATUS
========================================================== */

.status-container {

  min-width: 76px;

}

.status-badge {

  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 999px;

  font-size: 8px;

  font-weight: 650;

}

.status-badge span {

  width: 4px;
  height: 4px;

  border-radius: 50%;

  background:
    currentColor;

}


/* ==========================================================
   CHEVRON
========================================================== */

.row-chevron {

  color: var(--text-3);

  font-size: 19px;

  transition:
    transform .15s,
    color .15s;

}

.row-chevron.open {

  color: var(--indigo);

  transform:
    rotate(180deg);

}


/* ==========================================================
   DETAIL PANEL
========================================================== */

.detail-panel {

  position: sticky;

  top: 18px;

  overflow: hidden;

  background: var(--bg-card);

  border:
    1px solid var(--border);

  border-radius: 13px;

  box-shadow:
    0 12px 35px
    rgba(15,23,42,.07);

}

.detail-header {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  padding:
    15px 17px;

  background:
    linear-gradient(
      135deg,
      var(--indigo-dim),
      var(--text-on-accent)
    );

  border-bottom:
    1px solid var(--border-soft);

}

.detail-eyebrow {

  display: flex;

  align-items: center;

  gap: 6px;

  color: var(--indigo);

  font-size: 8px;

  font-weight: 750;

  letter-spacing: .1em;

}

.detail-eyebrow span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--indigo);

}

.detail-title {

  margin-top: 3px;

  color: var(--text-1);

  font-size: 13px;

  font-weight: 700;

}

.close-button {

  width: 28px;
  height: 28px;

  display: flex;

  align-items: center;

  justify-content: center;

  border:
    1px solid var(--border);

  background: var(--bg-card);

  color: var(--text-2);

  border-radius: 7px;

  cursor: pointer;

  font-size: 17px;

  line-height: 1;

  transition: .15s;

}

.close-button:hover {

  color: var(--text-1);

  background: var(--bg-card2);

  border-color:
    var(--border);

}

.detail-content {

  padding: 17px;

}


/* ==========================================================
   TRANSACTION SUMMARY
========================================================== */

.transaction-summary {

  padding: 14px;

  margin-bottom: 18px;

  background: var(--bg-card2);

  border:
    1px solid var(--border-soft);

  border-radius: 10px;

}

.summary-top {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

}

.summary-risk-icon {

  width: 31px;
  height: 31px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  font-size: 12px;

  font-weight: 800;

}

.detail-label {

  color: var(--text-3);

  font-size: 8px;

  font-weight: 700;

  letter-spacing: .09em;

}

.detail-merchant {

  margin-top: 5px;

  color: var(--text-1);

  font-size: 13px;

  font-weight: 650;

}

.summary-divider {

  height: 1px;

  margin:
    13px 0;

  background: var(--border-soft);

}

.detail-amount {

  margin-top: 4px;

  color: var(--text-1);

  font-size: 25px;

  font-weight: 800;

  letter-spacing: -.05em;

}

.transaction-id {

  margin-top: 6px;

  overflow: hidden;

  color: var(--text-3);

  font-size: 8px;

  text-overflow: ellipsis;

  white-space: nowrap;

}


/* ==========================================================
   RISK SECTION
========================================================== */

.risk-section {

  margin-bottom: 19px;

}

.risk-top {

  display: flex;

  align-items: flex-end;

  justify-content:
    space-between;

  margin-bottom: 9px;

}

.risk-score {

  margin-top: 6px;

  font-size: 34px;

  line-height: 1;

  font-weight: 800;

  letter-spacing: -.05em;

}

.risk-label {

  padding:
    5px 8px;

  border-radius: 999px;

  font-size: 8px;

  font-weight: 700;

}

.score-track {

  height: 7px;

  overflow: hidden;

  background: var(--border);

  border-radius: 10px;

}

.score-fill {

  height: 100%;

  border-radius: 10px;

  transition:
    width .5s ease;

}

.score-scale {

  display: flex;

  justify-content:
    space-between;

  margin-top: 5px;

  color: var(--text-3);

  font-size: 7px;

}


/* ==========================================================
   XAI
========================================================== */

.explain-section {

  margin-bottom: 18px;

}

.explain-title {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 10px;

  margin-bottom: 9px;

}

.explain-title strong {

  display: block;

  color: var(--text-2);

  font-size: 10px;

  font-weight: 700;

}

.explain-title span {

  display: block;

  margin-top: 3px;

  color: var(--text-3);

  font-size: 8px;

}

.xai-badge {

  padding:
    4px 7px !important;

  color: var(--indigo) !important;

  background: var(--indigo-dim);

  border:
    1px solid var(--indigo-soft);

  border-radius: 5px;

  font-size: 7px !important;

  font-weight: 750 !important;

  white-space: nowrap;

}


/* ==========================================================
   REASONS
========================================================== */

.reason-list {

  display: flex;

  flex-direction:
    column;

  gap: 6px;

}

.reason-card {

  padding: 9px;

  background: var(--bg-card2);

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

}

.reason-card.rule {

  background: var(--amber-dim);

  border-color: var(--amber);

}

.reason-row {

  display: flex;

  align-items: flex-start;

  gap: 8px;

}

.reason-symbol {

  width: 21px;
  height: 21px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 6px;

  font-size: 10px;

  font-weight: 800;

}

.reason-title {

  color: var(--text-2);

  font-size: 9px;

  font-weight: 650;

}

.reason-description {

  margin-top: 3px;

  color: var(--text-2);

  font-size: 8px;

  line-height: 1.45;

}


/* ==========================================================
   TRANSACTION INFO
========================================================== */

.info-section {

  margin-bottom: 17px;

  padding-top: 15px;

  border-top:
    1px solid var(--border-soft);

}

.info-title {

  margin-bottom: 9px;

  color: var(--text-2);

  font-size: 9px;

  font-weight: 700;

}

.info-grid {

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 8px;

}

.info-grid > div {

  padding: 8px;

  background: var(--bg-card2);

  border-radius: 7px;

}

.info-grid span {

  display: block;

  color: var(--text-3);

  font-size: 7px;

  text-transform: uppercase;

  letter-spacing: .06em;

}

.info-grid strong {

  display: block;

  margin-top: 4px;

  overflow: hidden;

  color: var(--text-2);

  font-size: 8px;

  text-overflow: ellipsis;

  white-space: nowrap;

}


/* ==========================================================
   ACTIONS
========================================================== */

.action-section {

  padding-top: 14px;

  border-top:
    1px solid var(--border-soft);

}

.action-title {

  margin-bottom: 8px;

  color: var(--text-2);

  font-size: 9px;

  font-weight: 700;

}

.action-grid {

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 7px;

}

.action-button {

  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 6px;

  border-radius: 8px;

  cursor: pointer;

  font-size: 9px;

  font-weight: 650;

  transition:
    background .15s,
    border-color .15s,
    transform .15s;

}

.action-button:hover:not(:disabled) {

  transform:
    translateY(-1px);

}

.action-button:disabled {

  opacity: .55;

  cursor: wait;

}

.confirm-button {

  color: var(--red);

  background: var(--red-dim);

  border:
    1px solid var(--border);

}

.confirm-button:hover:not(:disabled) {

  background: var(--red-dim);

  border-color:
    var(--red);

}

.dismiss-button {

  color: var(--indigo);

  background: var(--indigo-dim);

  border:
    1px solid var(--border-acc);

}

.dismiss-button:hover:not(:disabled) {

  background: var(--indigo-soft);

  border-color:
    var(--border-acc);

}


/* ==========================================================
   RESOLVED
========================================================== */

.resolved-box {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 6px;

  padding:
    10px;

  border-radius: 8px;

  font-size: 9px;

  font-weight: 650;

}


/* ==========================================================
   EMPTY
========================================================== */

.empty-state {

  min-height: 320px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-direction: column;

  padding: 40px 20px;

  text-align: center;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

}

.empty-icon {

  width: 45px;
  height: 45px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 13px;

  color: var(--emerald);

  background: var(--emerald-dim);

  border:
    1px solid var(--emerald-dim);

  border-radius: 12px;

  font-size: 18px;

  font-weight: 750;

}

.empty-title {

  color: var(--text-2);

  font-size: 12px;

  font-weight: 650;

}

.empty-description {

  max-width: 280px;

  margin-top: 5px;

  color: var(--text-3);

  font-size: 9px;

  line-height: 1.5;

}

.reset-button {

  margin-top: 12px;

  padding:
    7px 11px;

  color: var(--indigo);

  background: var(--indigo-dim);

  border:
    1px solid var(--border-acc);

  border-radius: 7px;

  cursor: pointer;

  font-size: 9px;

  font-weight: 650;

}


/* ==========================================================
   LOADING
========================================================== */

.loading-card {

  min-height: 320px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-direction: column;

  gap: 5px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

}

.loading-card strong {

  margin-top: 6px;

  color: var(--text-2);

  font-size: 11px;

}

.loading-card span {

  color: var(--text-3);

  font-size: 8px;

}

.spinner {

  width: 28px;
  height: 28px;

  border:
    2px solid var(--border);

  border-top-color:
    var(--indigo);

  border-radius: 50%;

  animation:
    alert-spin .7s linear infinite;

}

@keyframes alert-spin {

  to {
    transform:
      rotate(360deg);
  }

}


/* ==========================================================
   FOOTER
========================================================== */

.alerts-footer {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 10px;

  margin-top: 12px;

  padding:
    0 3px;

  color: var(--text-3);

  font-size: 8px;

}

.alerts-footer > div {

  display: flex;

  align-items: center;

  gap: 6px;

}

.footer-dot {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--emerald);

}


/* ==========================================================
   TABLET
========================================================== */

@media (max-width: 1100px) {

  .alerts-layout {

    grid-template-columns:
      1fr;

  }

  .detail-panel {

    position: relative;

    top: 0;

  }

}


/* ==========================================================
   SMALL TABLET
========================================================== */

@media (max-width: 760px) {

  .alerts-page {

    padding:
      22px 20px 30px;

  }

  .alerts-header {

    flex-direction:
      column;

  }

  .stats-grid {

    grid-template-columns:
      repeat(2, 1fr);

  }

  .toolbar {

    align-items:
      stretch;

    flex-direction:
      column;

  }

  .search-wrapper {

    max-width:
      none;

  }

  .filter-bar {

    align-items:
      flex-start;

    flex-direction:
      column;

  }

  .filter-tabs {

    width: 100%;

    overflow-x: auto;

  }

  .refresh-indicator {

    display: none;

  }

  .status-container {

    display: none;

  }

}


/* ==========================================================
   MOBILE
========================================================== */

@media (max-width: 520px) {

  .alerts-page {

    padding:
      18px 14px 25px;

  }

  .alerts-header h1 {

    font-size: 23px;

  }

  .alerts-header p {

    font-size: 10px;

  }

  .stats-grid {

    grid-template-columns:
      1fr;

  }

  .alert-row {

    gap: 9px;

    padding:
      10px;

  }

  .risk-icon {

    width: 34px;
    height: 34px;

    border-radius: 8px;

  }

  .merchant-avatar {

    display: none;

  }

  .amount-block {

    min-width: 75px;

  }

  .row-chevron {

    display: none;

  }

  .detail-panel {

    border-radius: 11px;

  }

  .info-grid {

    grid-template-columns:
      1fr;

  }

  .action-grid {

    grid-template-columns:
      1fr;

  }

  .alerts-footer {

    align-items:
      flex-start;

    flex-direction:
      column;

  }

}

`
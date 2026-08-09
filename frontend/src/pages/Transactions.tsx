import { useEffect, useState } from 'react'
import { transactionsApi } from '../services/api'

const statusConfig: any = {
  approved: {
    color: 'var(--emerald)',
    bg: 'var(--emerald-dim)',
    border: 'var(--emerald-border)',
    label: 'Approved',
  },
  flagged: {
    color: 'var(--amber)',
    bg: 'var(--amber-dim)',
    border: 'var(--amber-border)',
    label: 'Flagged',
  },
  blocked: {
    color: 'var(--red)',
    bg: 'var(--red-dim)',
    border: 'var(--red-border)',
    label: 'Blocked',
  },
  pending: {
    color: 'var(--text-2)',
    bg: 'var(--bg-hover)',
    border: 'var(--border)',
    label: 'Pending',
  },
}

const getRiskColor = (score: number) => {
  if (score > 0.6) return 'var(--red)'
  if (score > 0.3) return 'var(--amber)'
  return 'var(--emerald)'
}

const getRiskBg = (score: number) => {
  if (score > 0.6) return 'var(--red-dim)'
  if (score > 0.3) return 'var(--amber-dim)'
  return 'var(--emerald-dim)'
}

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

export default function Transactions() {

  const [transactions, setTransactions] =
    useState<any[]>([])

  const [total, setTotal] =
    useState(0)

  const [status, setStatus] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [loading, setLoading] =
    useState(true)


  /* ======================================================
     LOAD TRANSACTIONS
  ====================================================== */

  const load = async () => {

    try {

      setLoading(true)

      const res =
        await transactionsApi.list({
          status:
            status || undefined,
          limit: 100,
        })

      setTransactions(
        res.data.transactions || []
      )

      setTotal(
        res.data.total || 0
      )

    } catch (error) {

      console.error(
        'Failed to load transactions:',
        error
      )

    } finally {

      setLoading(false)

    }
  }


  /* ======================================================
     LOAD WHEN STATUS CHANGES
  ====================================================== */

  useEffect(() => {

    load()

  }, [status])


  /* ======================================================
     SEARCH
  ====================================================== */

  const filteredTransactions =
    transactions.filter(txn => {

      const query =
        search
          .toLowerCase()
          .trim()

      if (!query) return true

      return (
        txn.user_id
          ?.toLowerCase()
          .includes(query) ||

        txn.merchant
          ?.toLowerCase()
          .includes(query) ||

        txn.id
          ?.toLowerCase()
          .includes(query)
      )
    })


  /* ======================================================
     STATUS COUNTS
  ====================================================== */

  const approvedCount =
    transactions.filter(
      t => t.status === 'approved'
    ).length

  const flaggedCount =
    transactions.filter(
      t => t.status === 'flagged'
    ).length

  const blockedCount =
    transactions.filter(
      t => t.status === 'blocked'
    ).length


  return (

    <>
      <style>{transactionsStyles}</style>

      <div className="transactions-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="transactions-header">

          <div>

            <div className="transactions-eyebrow">

              <span />

              TRANSACTION MONITORING

            </div>

            <h1>
              Transactions
            </h1>

            <p>
              Monitor payment activity and review
              transaction risk in real time.
            </p>

          </div>


          <div className="header-count">

            <div className="count-icon">
              ⇄
            </div>

            <div>

              <strong>
                {total.toLocaleString()}
              </strong>

              <span>
                Total transactions
              </span>

            </div>

          </div>

        </header>


        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <section className="summary-grid">

          <SummaryCard
            label="Total Transactions"
            value={total}
            description="All processed transactions"
            color="var(--indigo)"
            icon="⇄"
          />

          <SummaryCard
            label="Approved"
            value={approvedCount}
            description="Successfully processed"
            color="var(--emerald)"
            icon="✓"
          />

          <SummaryCard
            label="Flagged"
            value={flaggedCount}
            description="Requires investigation"
            color="var(--amber)"
            icon="⚑"
          />

          <SummaryCard
            label="Blocked"
            value={blockedCount}
            description="Prevented by detection engine"
            color="var(--red)"
            icon="⊘"
          />

        </section>


        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <div className="transactions-toolbar">

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
              placeholder="Search user, merchant or transaction ID..."
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


          <div className="toolbar-right">

            <span className="showing-count">

              Showing{' '}

              <strong>
                {filteredTransactions.length}
              </strong>

              {' '}transactions

            </span>


            <div className="select-wrapper">

              <span>
                Status
              </span>

              <select
                value={status}
                onChange={e =>
                  setStatus(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All statuses
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="flagged">
                  Flagged
                </option>

                <option value="blocked">
                  Blocked
                </option>

                <option value="pending">
                  Pending
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* ==================================================
            TRANSACTION TABLE
        ================================================== */}

        <div className="table-card">

          <div className="table-header">

            <div>

              <h2>
                Transaction Activity
              </h2>

              <p>
                Latest payment transactions processed
                by FraudShield.
              </p>

            </div>

            <div className="live-badge">

              <span />

              Live data

            </div>

          </div>


          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Transaction
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Merchant
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Risk Score
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Time
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="loading-cell"
                    >

                      <div className="loading-spinner" />

                      <strong>
                        Loading transactions
                      </strong>

                      <span>
                        Fetching latest payment activity...
                      </span>

                    </td>

                  </tr>

                ) : filteredTransactions.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="empty-cell"
                    >

                      <div className="empty-table-icon">
                        ◇
                      </div>

                      <strong>
                        No transactions found
                      </strong>

                      <span>
                        No transactions match
                        your current filters.
                      </span>

                      {(search ||
                        status) && (

                        <button
                          onClick={() => {
                            setSearch('')
                            setStatus('')
                          }}
                        >
                          Clear filters
                        </button>

                      )}

                    </td>

                  </tr>

                ) : (

                  filteredTransactions.map(
                    txn => {

                      const score =
                        txn.fraud_score || 0

                      const config =
                        statusConfig[
                          txn.status
                        ] ||
                        statusConfig.pending

                      return (

                        <tr
                          key={txn.id}
                          className="transaction-row"
                        >

                          {/* TRANSACTION ID */}

                          <td>

                            <div className="transaction-cell">

                              <div className="transaction-icon">

                                #
                                
                              </div>

                              <div>

                                <strong>
                                  {txn.id
                                    ?.slice(0, 12) ||
                                    '—'}
                                </strong>

                                <span>
                                  Payment transaction
                                </span>

                              </div>

                            </div>

                          </td>


                          {/* USER */}

                          <td>

                            <div className="user-cell">

                              <div className="user-avatar">

                                {txn.user_id
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  'U'}

                              </div>

                              <span>
                                {txn.user_id ||
                                  'Unknown user'}
                              </span>

                            </div>

                          </td>


                          {/* MERCHANT */}

                          <td>

                            <div className="merchant-cell">

                              <div className="merchant-icon">

                                {txn.merchant
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  'M'}

                              </div>

                              <span>
                                {txn.merchant ||
                                  'Unknown merchant'}
                              </span>

                            </div>

                          </td>


                          {/* AMOUNT */}

                          <td>

                            <div className="amount-cell">

                              {formatAmount(
                                txn.amount
                              )}

                            </div>

                          </td>


                          {/* FRAUD SCORE */}

                          <td>

                            {txn.fraud_score !==
                            null &&
                            txn.fraud_score !==
                            undefined ? (

                              <div className="risk-cell">

                                <div className="risk-number">

                                  <strong
                                    style={{
                                      color:
                                        getRiskColor(
                                          score
                                        ),
                                    }}
                                  >

                                    {(
                                      score * 100
                                    ).toFixed(1)}
                                    %

                                  </strong>

                                </div>

                                <div className="mini-track">

                                  <div
                                    style={{
                                      width:
                                        `${Math.min(
                                          score *
                                            100,
                                          100
                                        )}%`,

                                      background:
                                        getRiskColor(
                                          score
                                        ),
                                    }}
                                  />

                                </div>

                              </div>

                            ) : (

                              <span className="no-score">
                                —
                              </span>

                            )}

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className="status-badge"
                              style={{
                                color:
                                  config.color,

                                background:
                                  config.bg,

                                border:
                                  `1px solid ${config.border}`,
                              }}
                            >

                              <span />

                              {config.label}

                            </span>

                          </td>


                          {/* TIME */}

                          <td>

                            <div className="time-cell">

                              <strong>
                                {formatTime(
                                  txn.created_at
                                )}
                              </strong>

                              <span>
                                {formatDate(
                                  txn.created_at
                                )}
                              </span>

                            </div>

                          </td>

                        </tr>

                      )
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="transactions-footer">

          <div>

            <span />

            Transaction monitoring operational

          </div>

          <span>
            FraudShield Pro · Real-time payment intelligence
          </span>

        </footer>

      </div>

    </>

  )
}


/* ==========================================================
   SUMMARY CARD
========================================================== */

function SummaryCard({
  label,
  value,
  description,
  color,
  icon,
}: {
  label: string
  value: number
  description: string
  color: string
  icon: string
}) {

  return (

    <div className="summary-card">

      <div className="summary-card-top">

        <div className="summary-label">
          {label}
        </div>

        <div
          className="summary-icon"
          style={{
            color,
            background:
              color === 'var(--red)' ? 'var(--red-dim)' :
              color === 'var(--emerald)' ? 'var(--emerald-dim)' :
              color === 'var(--amber)' ? 'var(--amber-dim)' :
              'var(--indigo-dim)',
          }}
        >
          {icon}
        </div>

      </div>

      <div
        className="summary-value"
        style={{
          color:
            color === 'var(--indigo)'
              ? 'var(--text-1)'
              : color,
        }}
      >

        {value.toLocaleString()}

      </div>

      <div className="summary-description">
        {description}
      </div>

    </div>

  )
}


/* ==========================================================
   STYLES
========================================================== */

const transactionsStyles = `
.transactions-page {
  --amber-border: #FDE68A;
  --red-border: #FECACA;
}

* {
  box-sizing: border-box;
}

.transactions-page {

  min-height: 100vh;

  padding:
    28px 30px 35px;
  max-width: 1500px;
  margin: 0 auto;

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

.transactions-header {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

  gap: 25px;

  margin-bottom: 24px;

}

.transactions-eyebrow {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 8px;

  color: var(--indigo);

  font-size: 10px;

  font-weight: 750;

  letter-spacing: .12em;

}

.transactions-eyebrow span {

  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: var(--indigo);

}

.transactions-header h1 {

  margin: 0;

  color: var(--text-1);

  font-size: 27px;

  line-height: 1.15;

  font-weight: 750;

  letter-spacing: -.045em;

}

.transactions-header p {

  margin:
    7px 0 0;

  color: var(--text-2);

  font-size: 12px;

  line-height: 1.5;

}


/* ==========================================================
   HEADER COUNT
========================================================== */

.header-count {

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
    color-mix(in srgb, var(--text-1) 3%, transparent);

}

.count-icon {

  width: 29px;
  height: 29px;

  display: flex;

  align-items: center;

  justify-content: center;

  color: var(--indigo);

  background: var(--indigo-dim);

  border-radius: 8px;

  font-size: 15px;

}

.header-count strong {

  display: block;

  color: var(--text-1);

  font-size: 13px;

  font-weight: 750;

}

.header-count span {

  display: block;

  margin-top: 2px;

  color: var(--text-3);

  font-size: 8px;

}


/* ==========================================================
   SUMMARY
========================================================== */

.summary-grid {

  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 12px;

  margin-bottom: 18px;

}

.summary-card {

  min-height: 112px;

  padding: 16px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

  box-shadow:
    0 1px 2px
    color-mix(in srgb, var(--text-1) 3%, transparent);

  transition:
    transform .18s ease,
    box-shadow .18s ease;

}

.summary-card:hover {

  transform:
    translateY(-2px);

  box-shadow:
    0 8px 22px
    color-mix(in srgb, var(--text-1) 6%, transparent);

}

.summary-card-top {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

}

.summary-label {

  color: var(--text-2);

  font-size: 9px;

  font-weight: 700;

  letter-spacing: .075em;

  text-transform:
    uppercase;

}

.summary-icon {

  width: 28px;
  height: 28px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  font-size: 13px;

  font-weight: 750;

}

.summary-value {

  margin-top: 15px;

  font-size: 25px;

  line-height: 1;

  font-weight: 750;

  letter-spacing: -.045em;

}

.summary-description {

  margin-top: 8px;

  color: var(--text-3);

  font-size: 9px;

}


/* ==========================================================
   TOOLBAR
========================================================== */

.transactions-toolbar {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 15px;

  margin-bottom: 12px;

}

.search-wrapper {

  position: relative;

  flex: 1;

  max-width: 390px;

}

.search-wrapper input {

  width: 100%;

  height: 39px;

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
    var(--indigo-border);

  box-shadow:
    0 0 0 3px
    color-mix(in srgb, var(--indigo) 8%, transparent);

}

.search-icon {

  position: absolute;

  left: 13px;

  top: 50%;

  transform:
    translateY(-50%);

  color: var(--text-3);

  font-size: 15px;

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

  background: var(--bg-hover);

  color: var(--text-2);

  border-radius: 6px;

  cursor: pointer;

  font-size: 14px;

}

.toolbar-right {

  display: flex;

  align-items: center;

  gap: 12px;

}

.showing-count {

  color: var(--text-3);

  font-size: 9px;

  white-space: nowrap;

}

.showing-count strong {

  color: var(--text-2);

}

.select-wrapper {

  display: flex;

  align-items: center;

  gap: 7px;

  padding:
    0 5px 0 10px;

  height: 39px;

  background: var(--bg-card);

  border:
    1px solid var(--border);

  border-radius: 9px;

}

.select-wrapper > span {

  color: var(--text-3);

  font-size: 9px;

  font-weight: 600;

}

.select-wrapper select {

  height: 31px;

  padding:
    0 25px 0 5px;

  color: var(--text-1);

  background: var(--bg-card);

  border: none;

  outline: none;

  cursor: pointer;

  font-size: 10px;

}


/* ==========================================================
   TABLE CARD
========================================================== */

.table-card {

  overflow: hidden;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

  box-shadow:
    0 1px 2px
    color-mix(in srgb, var(--text-1) 3%, transparent);

}

.table-header {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  padding:
    15px 17px;

  border-bottom:
    1px solid var(--border-soft);

}

.table-header h2 {

  margin: 0;

  color: var(--text-1);

  font-size: 12px;

  font-weight: 700;

}

.table-header p {

  margin:
    4px 0 0;

  color: var(--text-3);

  font-size: 8px;

}

.live-badge {

  display: flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  color: var(--emerald);

  background: var(--emerald-dim);

  border:
    1px solid var(--emerald-border);

  border-radius: 999px;

  font-size: 8px;

  font-weight: 650;

}

.live-badge span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--emerald);

}


/* ==========================================================
   TABLE
========================================================== */

.table-wrapper {

  width: 100%;

  overflow-x: auto;

}

table {

  width: 100%;

  border-collapse:
    collapse;

  min-width: 900px;

}

thead tr {

  background: var(--bg-hover);

  border-bottom:
    1px solid var(--border-soft);

}

th {

  padding:
    10px 14px;

  text-align: left;

  color: var(--text-3);

  font-size: 8px;

  font-weight: 700;

  letter-spacing: .06em;

  text-transform:
    uppercase;

  white-space: nowrap;

}

td {

  padding:
    12px 14px;

  border-bottom:
    1px solid var(--bg-hover);

  vertical-align: middle;

}

.transaction-row {

  transition:
    background .12s ease;

}

.transaction-row:hover {

  background: var(--bg-hover);

}

.transaction-row:last-child td {

  border-bottom: none;

}


/* ==========================================================
   TRANSACTION CELL
========================================================== */

.transaction-cell {

  display: flex;

  align-items: center;

  gap: 9px;

}

.transaction-icon {

  width: 29px;
  height: 29px;

  display: flex;

  align-items: center;

  justify-content: center;

  color: var(--indigo);

  background: var(--indigo-dim);

  border-radius: 7px;

  font-size: 9px;

  font-weight: 750;

}

.transaction-cell strong {

  display: block;

  color: var(--text-2);

  font-size: 9px;

  font-weight: 650;

}

.transaction-cell span {

  display: block;

  margin-top: 3px;

  color: var(--text-3);

  font-size: 7px;

}


/* ==========================================================
   USER
========================================================== */

.user-cell {

  display: flex;

  align-items: center;

  gap: 7px;

}

.user-avatar {

  width: 25px;
  height: 25px;

  display: flex;

  align-items: center;

  justify-content: center;

  color: var(--text-2);

  background: var(--bg-hover);

  border-radius: 7px;

  font-size: 8px;

  font-weight: 700;

}

.user-cell span {

  color: var(--text-2);

  font-size: 9px;

}


/* ==========================================================
   MERCHANT
========================================================== */

.merchant-cell {

  display: flex;

  align-items: center;

  gap: 7px;

}

.merchant-icon {

  width: 25px;
  height: 25px;

  display: flex;

  align-items: center;

  justify-content: center;

  color: var(--indigo);

  background: var(--indigo-dim);

  border-radius: 7px;

  font-size: 8px;

  font-weight: 750;

}

.merchant-cell span {

  color: var(--text-2);

  font-size: 9px;

  font-weight: 550;

}


/* ==========================================================
   AMOUNT
========================================================== */

.amount-cell {

  color: var(--text-1);

  font-size: 10px;

  font-weight: 700;

  white-space: nowrap;

}


/* ==========================================================
   RISK
========================================================== */

.risk-cell {

  min-width: 80px;

}

.risk-number strong {

  font-size: 9px;

  font-weight: 700;

}

.mini-track {

  width: 55px;

  height: 3px;

  margin-top: 5px;

  overflow: hidden;

  background: var(--border);

  border-radius: 4px;

}

.mini-track div {

  height: 100%;

  border-radius: 4px;

}

.no-score {

  color: var(--text-3);

  font-size: 10px;

}


/* ==========================================================
   STATUS
========================================================== */

.status-badge {

  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 999px;

  font-size: 8px;

  font-weight: 650;

  white-space: nowrap;

}

.status-badge span {

  width: 4px;
  height: 4px;

  border-radius: 50%;

  background:
    currentColor;

}


/* ==========================================================
   TIME
========================================================== */

.time-cell strong {

  display: block;

  color: var(--text-2);

  font-size: 9px;

  font-weight: 650;

}

.time-cell span {

  display: block;

  margin-top: 3px;

  color: var(--text-3);

  font-size: 7px;

}


/* ==========================================================
   LOADING
========================================================== */

.loading-cell {

  height: 260px;

  text-align: center;

}

.loading-cell > * {

  display: block;

  margin-left: auto;
  margin-right: auto;

}

.loading-cell strong {

  margin-top: 9px;

  color: var(--text-2);

  font-size: 10px;

}

.loading-cell span {

  margin-top: 4px;

  color: var(--text-3);

  font-size: 8px;

}

.loading-spinner {

  width: 25px;
  height: 25px;

  border:
    2px solid var(--border);

  border-top-color:
    var(--indigo);

  border-radius: 50%;

  animation:
    transaction-spin .7s linear infinite;

}

@keyframes transaction-spin {

  to {
    transform:
      rotate(360deg);
  }

}


/* ==========================================================
   EMPTY
========================================================== */

.empty-cell {

  height: 260px;

  text-align: center;

}

.empty-cell > * {

  display: block;

  margin-left: auto;
  margin-right: auto;

}

.empty-table-icon {

  width: 42px;
  height: 42px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 10px !important;

  color: var(--indigo);

  background: var(--indigo-dim);

  border-radius: 11px;

  font-size: 18px;

}

.empty-cell strong {

  color: var(--text-2);

  font-size: 10px;

}

.empty-cell span {

  margin-top: 4px !important;

  color: var(--text-3);

  font-size: 8px;

}

.empty-cell button {

  margin-top: 11px !important;

  padding:
    7px 11px;

  color: var(--indigo);

  background: var(--indigo-dim);

  border:
    1px solid var(--indigo-border);

  border-radius: 7px;

  cursor: pointer;

  font-size: 8px;

  font-weight: 650;

}


/* ==========================================================
   FOOTER
========================================================== */

.transactions-footer {

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

.transactions-footer > div {

  display: flex;

  align-items: center;

  gap: 6px;

}

.transactions-footer > div span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--emerald);

}


/* ==========================================================
   TABLET
========================================================== */

@media (max-width: 900px) {

  .summary-grid {

    grid-template-columns:
      repeat(2, 1fr);

  }

  .transactions-toolbar {

    align-items:
      stretch;

    flex-direction:
      column;

  }

  .search-wrapper {

    max-width: none;

  }

  .toolbar-right {

    justify-content:
      space-between;

  }

}


/* ==========================================================
   MOBILE
========================================================== */

@media (max-width: 600px) {

  .transactions-page {

    padding:
      20px 14px 28px;

  }

  .transactions-header {

    flex-direction:
      column;

  }

  .transactions-header h1 {

    font-size: 23px;

  }

  .header-count {

    width: 100%;

  }

  .summary-grid {

    grid-template-columns:
      1fr;

  }

  .toolbar-right {

    align-items:
      stretch;

    flex-direction:
      column;

  }

  .select-wrapper {

    justify-content:
      space-between;

  }

  .showing-count {

    display: none;

  }

  .table-header {

    align-items:
      flex-start;

    flex-direction:
      column;

    gap: 9px;

  }

  .transactions-footer {

    align-items:
      flex-start;

    flex-direction:
      column;

  }

}

`
import { getToken } from '../services/api'
import { useState } from 'react'
import axios from 'axios'

const MERCHANTS_NORMAL = [
  'Amazon India',
  'Flipkart',
  'Swiggy',
  'Zomato',
  'BigBasket',
]

const MERCHANTS_FRAUD = [
  'Unknown Offshore Merchant',
  'Crypto Exchange XYZ',
  'Anonymous Gift Cards',
]

const USERS = Array.from(
  { length: 10 },
  (_, i) => `user_${String(i + 1).padStart(3, '0')}`
)

export default function Simulator() {

  const [running, setRunning] =
    useState(false)

  const [count, setCount] =
    useState(0)

  const [total, setTotal] =
    useState(20)

  const [fraudRate, setFraudRate] =
    useState(30)

  const [logs, setLogs] =
    useState<string[]>([])

  const [fraudCount, setFraudCount] =
    useState(0)

  const [normalCount, setNormalCount] =
    useState(0)

  const [failedCount, setFailedCount] =
    useState(0)


  /* ======================================================
     ADD LOG
  ====================================================== */

  const addLog = (msg: string) => {

    setLogs(prev =>
      [msg, ...prev].slice(0, 50)
    )

  }


  /* ======================================================
     RUN SIMULATOR
  ====================================================== */

  const run = async () => {

    setRunning(true)

    setCount(0)

    setFraudCount(0)

    setNormalCount(0)

    setFailedCount(0)

    setLogs([])

    addLog(
      `Starting simulation — ${total} transactions, ${fraudRate}% fraud rate`
    )


    for (
      let i = 0;
      i < total;
      i++
    ) {

      const isFraud =
        Math.random() * 100 <
        fraudRate


      const txn = isFraud
        ? {
            user_id:
              USERS[
                Math.floor(
                  Math.random() *
                  USERS.length
                )
              ],

            amount:
              Math.round(
                Math.random() *
                  100000 +
                  55000
              ),

            currency:
              'INR',

            merchant:
              MERCHANTS_FRAUD[
                Math.floor(
                  Math.random() *
                  MERCHANTS_FRAUD.length
                )
              ],

            merchant_category:
              'unknown',

            device_id:
              `new_device_${Math.random()
                .toString(36)
                .slice(2, 8)}`,
          }

        : {
            user_id:
              USERS[
                Math.floor(
                  Math.random() *
                  USERS.length
                )
              ],

            amount:
              Math.round(
                Math.random() *
                  4900 +
                  100
              ),

            currency:
              'INR',

            merchant:
              MERCHANTS_NORMAL[
                Math.floor(
                  Math.random() *
                  MERCHANTS_NORMAL.length
                )
              ],

            merchant_category:
              'retail',

            device_id:
              `device_${
                Math.floor(
                  Math.random() * 5
                ) + 1
              }`,
          }


      try {

        await axios.post(`${import.meta.env.VITE_API_URL || 'https://fraudshield-backend-az3h.onrender.com'}/transactions`, txn, {
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
})


        if (isFraud) {

          setFraudCount(
            prev => prev + 1
          )

        } else {

          setNormalCount(
            prev => prev + 1
          )

        }


        addLog(
          `[${i + 1}/${total}] ${
            isFraud
              ? '🚨 FRAUD'
              : '✓ NORMAL'
          }  |  ₹${txn.amount.toLocaleString(
            'en-IN'
          )}  |  ${txn.merchant}`
        )


        setCount(
          i + 1
        )

      } catch {

        setFailedCount(
          prev => prev + 1
        )

        addLog(
          `[${i + 1}/${total}] ❌ FAILED  |  Unable to submit transaction`
        )

      }


      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            600
          )
      )

    }


    addLog(
      '✓ Simulation complete — Check Alerts and Transactions for results.'
    )

    setRunning(false)

  }


  const progress =
    total > 0
      ? (count / total) * 100
      : 0


  const estimatedFraud =
    Math.round(
      total *
      (fraudRate / 100)
    )


  return (

    <>
      <style>{simulatorStyles}</style>

      <div className="simulator-page">


        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="simulator-header">

          <div>

            <div className="simulator-eyebrow">

              <span />

              FRAUD TESTING ENVIRONMENT

            </div>

            <h1>
              Transaction Simulator
            </h1>

            <p>
              Generate controlled payment traffic to
              test FraudShield's detection and
              rule-engine pipeline.
            </p>

          </div>


          <div
            className={
              `simulator-status ${
                running
                  ? 'running'
                  : 'ready'
              }`
            }
          >

            <span />

            {running
              ? 'Simulation running'
              : 'Simulator ready'}

          </div>

        </header>


        {/* ==================================================
            CONFIGURATION
        ================================================== */}

        <section className="configuration-grid">


          {/* TRANSACTION COUNT */}

          <div className="config-card">

            <div className="config-card-header">

              <div>

                <span className="config-label">
                  TRANSACTION VOLUME
                </span>

                <h2>
                  Test volume
                </h2>

              </div>

              <div className="config-icon">
                ⇄
              </div>

            </div>


            <div className="input-row">

              <input
                type="number"
                value={total}
                min={5}
                max={100}
                disabled={running}
                onChange={e =>
                  setTotal(
                    Math.max(
                      5,
                      Math.min(
                        100,
                        Number(
                          e.target.value
                        )
                      )
                    )
                  )
                }
              />

              <span>
                transactions
              </span>

            </div>


            <p>
              Number of synthetic payment transactions
              generated during the test.
            </p>

          </div>


          {/* FRAUD RATE */}

          <div className="config-card">

            <div className="config-card-header">

              <div>

                <span className="config-label">
                  FRAUD DISTRIBUTION
                </span>

                <h2>
                  Fraud rate
                </h2>

              </div>

              <div className="fraud-config-icon">
                ⚑
              </div>

            </div>


            <div className="fraud-rate-row">

              <input
                type="number"
                value={fraudRate}
                min={0}
                max={100}
                disabled={running}
                onChange={e =>
                  setFraudRate(
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Number(
                          e.target.value
                        )
                      )
                    )
                  )
                }
              />

              <span>%</span>

              <strong>
                ~{estimatedFraud} suspicious
              </strong>

            </div>


            <div className="rate-track">

              <div
                style={{
                  width:
                    `${fraudRate}%`,
                }}
              />

            </div>


            <p>
              Percentage of generated transactions
              designed to simulate suspicious activity.
            </p>

          </div>


        </section>


        {/* ==================================================
            CONTROL PANEL
        ================================================== */}

        <section className="control-card">

          <div className="control-left">

            <div className="control-icon">
              ▶
            </div>

            <div>

              <strong>
                Simulation Control
              </strong>

              <span>
                {running
                  ? `Processing transaction ${count} of ${total}`
                  : 'Configure your test and start the simulation'}
              </span>

            </div>

          </div>


          <button
            className={
              `run-button ${
                running
                  ? 'disabled'
                  : ''
              }`
            }
            onClick={run}
            disabled={running}
          >

            <span>
              {running
                ? '◌'
                : '▶'}
            </span>

            {running
              ? `Running ${count}/${total}`
              : 'Run Simulation'}

          </button>

        </section>


        {/* ==================================================
            PROGRESS
        ================================================== */}

        {(running ||
          count > 0) && (

          <section className="progress-card">

            <div className="progress-header">

              <div>

                <span className="section-label">
                  SIMULATION PROGRESS
                </span>

                <strong>
                  {count} / {total}
                </strong>

              </div>

              <span className="progress-percent">
                {progress.toFixed(0)}%
              </span>

            </div>


            <div className="progress-track">

              <div
                className="progress-bar"
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>


            <div className="progress-footer">

              <span>
                {running
                  ? 'Sending transactions to detection engine...'
                  : 'Simulation finished'}
              </span>

              <span>
                {Math.round(
                  progress
                )}% complete
              </span>

            </div>

          </section>

        )}


        {/* ==================================================
            LIVE METRICS
        ================================================== */}

        <section className="metrics-grid">

          <MetricCard
            label="Transactions Sent"
            value={count}
            icon="⇄"
            color="var(--indigo)"
          />

          <MetricCard
            label="Normal Events"
            value={normalCount}
            icon="✓"
            color="var(--emerald)"
          />

          <MetricCard
            label="Fraud Events"
            value={fraudCount}
            icon="⚑"
            color="var(--red)"
          />

          <MetricCard
            label="Failed Requests"
            value={failedCount}
            icon="×"
            color="var(--text-2)"
          />

        </section>


        {/* ==================================================
            LOG PANEL
        ================================================== */}

        <section className="logs-card">

          <div className="logs-header">

            <div>

              <span className="section-label">
                LIVE EVENT STREAM
              </span>

              <h2>
                Simulation Activity
              </h2>

              <p>
                Real-time events generated by the
                transaction simulator.
              </p>

            </div>


            <div className="terminal-badge">

              <span />

              LIVE

            </div>

          </div>


          <div className="terminal">

            {logs.length === 0 ? (

              <div className="terminal-empty">

                <div className="terminal-empty-icon">
                  $
                </div>

                <strong>
                  Waiting for simulation
                </strong>

                <span>
                  Run the simulator to begin
                  generating transaction events.
                </span>

              </div>

            ) : (

              <div className="log-list">

                {logs.map(
                  (log, i) => (

                    <div
                      key={i}
                      className={
                        `log-entry ${
                          log.includes(
                            'FRAUD'
                          )
                            ? 'fraud'
                            : log.includes(
                                'NORMAL'
                              )
                            ? 'normal'
                            : log.includes(
                                'FAILED'
                              )
                            ? 'failed'
                            : 'system'
                        }`
                      }
                    >

                      <span className="log-index">
                        {String(
                          logs.length - i
                        ).padStart(
                          2,
                          '0'
                        )}
                      </span>

                      <span className="log-message">
                        {log}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* ==================================================
            INFO
        ================================================== */}

        <section className="info-grid">

          <InfoItem
            icon="✓"
            title="Normal traffic"
            text="Low-value retail transactions using known merchants and trusted devices."
          />

          <InfoItem
            icon="⚑"
            title="Fraud traffic"
            text="High-value transactions from unknown merchants and new devices."
          />

          <InfoItem
            icon="⚙"
            title="Detection pipeline"
            text="Every generated transaction is submitted to the FraudShield backend for scoring."
          />

        </section>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="simulator-footer">

          <div>

            <span />

            FraudShield simulation environment operational

          </div>

          <span>
            Synthetic data only · No real payments processed
          </span>

        </footer>


      </div>
    </>

  )
}


/* ==========================================================
   METRIC CARD
========================================================== */

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: string
  color: string
}) {

  return (

    <div className="metric-card">

      <div
        className="metric-icon"
        style={{
          color,
          background:
            color === 'var(--red)' ? 'var(--red-dim)' :
            color === 'var(--emerald)' ? 'var(--emerald-dim)' :
            color === 'var(--text-2)' ? 'var(--bg-hover)' :
            'var(--indigo-dim)',
        }}
      >
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>

  )
}


/* ==========================================================
   INFO ITEM
========================================================== */

function InfoItem({
  icon,
  title,
  text,
}: {
  icon: string
  title: string
  text: string
}) {

  return (

    <div className="info-item">

      <div className="info-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>

      </div>

    </div>

  )
}


/* ==========================================================
   STYLES
========================================================== */

const simulatorStyles = `
.simulator-page {
  --terminal-bg: var(--bg-card2);
  --terminal-card: var(--bg-hover);
  --terminal-text: var(--text-1);
  --terminal-muted: var(--text-3);
  --red-light: var(--red);
  --emerald-light: var(--emerald);
}

* {
  box-sizing: border-box;
}

.simulator-page {

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

.simulator-header {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

  gap: 25px;

  margin-bottom: 22px;

}

.simulator-eyebrow {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 8px;

  color: var(--indigo);

  font-size: 10px;

  font-weight: 750;

  letter-spacing: .12em;

}

.simulator-eyebrow span {

  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: var(--indigo);

}

.simulator-header h1 {

  margin: 0;

  color: var(--text-1);

  font-size: 27px;

  line-height: 1.15;

  font-weight: 750;

  letter-spacing: -.045em;

}

.simulator-header p {

  max-width: 620px;

  margin:
    7px 0 0;

  color: var(--text-2);

  font-size: 12px;

  line-height: 1.5;

}


/* ==========================================================
   STATUS
========================================================== */

.simulator-status {

  display: flex;

  align-items: center;

  gap: 7px;

  padding:
    8px 11px;

  background: var(--bg-card);

  border:
    1px solid var(--border);

  border-radius: 999px;

  font-size: 8px;

  font-weight: 650;

  white-space: nowrap;

}

.simulator-status span {

  width: 6px;
  height: 6px;

  border-radius: 50%;

}

.simulator-status.ready {

  color: var(--text-2);

}

.simulator-status.ready span {

  background: var(--text-3);

}

.simulator-status.running {

  color: var(--indigo);

  border-color: var(--indigo-border);

  background: var(--indigo-dim);

}

.simulator-status.running span {

  background: var(--indigo);

  animation:
    simulator-pulse 1.2s infinite;

}

@keyframes simulator-pulse {

  0% {
    box-shadow:
      0 0 0 0
      color-mix(in srgb, var(--indigo) 35%, transparent);
  }

  70% {
    box-shadow:
      0 0 0 6px
      transparent;
  }

  100% {
    box-shadow:
      0 0 0 0
      transparent;
  }

}


/* ==========================================================
   CONFIGURATION
========================================================== */

.configuration-grid {

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 12px;

  margin-bottom: 12px;

}

.config-card {

  min-height: 150px;

  padding: 17px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

  box-shadow:
    0 1px 2px
    color-mix(in srgb, var(--text-1) 3%, transparent);

}

.config-card-header {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

}

.config-label {

  color: var(--text-3);

  font-size: 8px;

  font-weight: 750;

  letter-spacing: .09em;

}

.config-card h2 {

  margin:
    4px 0 0;

  color: var(--text-2);

  font-size: 12px;

  font-weight: 700;

}

.config-icon,
.fraud-config-icon {

  width: 29px;
  height: 29px;

  display: flex;

  align-items: center;

  justify-content: center;

  color: var(--indigo);

  background: var(--indigo-dim);

  border-radius: 8px;

  font-size: 13px;

}

.fraud-config-icon {

  color: var(--amber);

  background: var(--amber-dim);

}


/* ==========================================================
   INPUTS
========================================================== */

.input-row,
.fraud-rate-row {

  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 18px;

}

.input-row input,
.fraud-rate-row input {

  width: 100px;

  height: 37px;

  padding:
    0 10px;

  color: var(--text-1);

  background: var(--bg-hover);

  border:
    1px solid var(--border);

  border-radius: 8px;

  outline: none;

  font-size: 13px;

  font-weight: 650;

}

.input-row input:focus,
.fraud-rate-row input:focus {

  border-color:
    var(--indigo-2);

  box-shadow:
    0 0 0 3px
    color-mix(in srgb, var(--indigo) 7%, transparent);

}

.input-row span,
.fraud-rate-row span {

  color: var(--text-2);

  font-size: 9px;

}

.fraud-rate-row strong {

  margin-left: auto;

  color: var(--amber);

  font-size: 9px;

  font-weight: 650;

}

.config-card p {

  max-width: 430px;

  margin:
    11px 0 0;

  color: var(--text-3);

  font-size: 8px;

  line-height: 1.5;

}


/* ==========================================================
   FRAUD RATE
========================================================== */

.rate-track {

  width: 100%;

  height: 4px;

  margin-top: 11px;

  overflow: hidden;

  background: var(--bg-hover);

  border-radius: 5px;

}

.rate-track div {

  height: 100%;

  background:
    linear-gradient(
      90deg,
      var(--amber),
      var(--red)
    );

  border-radius: 5px;

  transition:
    width .2s ease;

}


/* ==========================================================
   CONTROL CARD
========================================================== */

.control-card {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 15px;

  padding:
    14px 17px;

  margin-bottom: 12px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

  box-shadow:
    0 1px 2px
    color-mix(in srgb, var(--text-1) 3%, transparent);

}

.control-left {

  display: flex;

  align-items: center;

  gap: 10px;

}

.control-icon {

  width: 34px;
  height: 34px;

  display: flex;

  align-items: center;

  justify-content: center;

  color: var(--indigo);

  background: var(--indigo-dim);

  border-radius: 9px;

  font-size: 11px;

}

.control-left strong {

  display: block;

  color: var(--text-2);

  font-size: 10px;

  font-weight: 700;

}

.control-left span {

  display: block;

  margin-top: 3px;

  color: var(--text-3);

  font-size: 8px;

}

.run-button {

  display: flex;

  align-items: center;

  gap: 7px;

  height: 37px;

  padding:
    0 16px;

  color: var(--text-on-accent, #FFFFFF);

  background: var(--indigo);

  border: none;

  border-radius: 8px;

  cursor: pointer;

  font-size: 9px;

  font-weight: 700;

  box-shadow:
    0 4px 10px
    color-mix(in srgb, var(--indigo) 16%, transparent);

  transition:
    background .15s,
    transform .15s,
    box-shadow .15s;

}

.run-button:hover:not(:disabled) {

  background: var(--indigo-2);

  transform:
    translateY(-1px);

  box-shadow:
    0 6px 14px
    color-mix(in srgb, var(--indigo) 20%, transparent);

}

.run-button.disabled {

  color: var(--text-3);

  background: var(--bg-hover);

  box-shadow: none;

  cursor: not-allowed;

}


/* ==========================================================
   PROGRESS
========================================================== */

.progress-card {

  padding:
    14px 17px;

  margin-bottom: 12px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

}

.progress-header {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  margin-bottom: 9px;

}

.section-label {

  display: block;

  color: var(--text-3);

  font-size: 7px;

  font-weight: 750;

  letter-spacing: .1em;

}

.progress-header strong {

  display: block;

  margin-top: 3px;

  color: var(--text-2);

  font-size: 10px;

}

.progress-percent {

  color: var(--indigo);

  font-size: 12px;

  font-weight: 750;

}

.progress-track {

  width: 100%;

  height: 6px;

  overflow: hidden;

  background: var(--bg-hover);

  border-radius: 6px;

}

.progress-bar {

  height: 100%;

  background:
    linear-gradient(
      90deg,
      var(--indigo),
      var(--indigo-2)
    );

  border-radius: 6px;

  transition:
    width .3s ease;

}

.progress-footer {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  margin-top: 7px;

  color: var(--text-3);

  font-size: 7px;

}


/* ==========================================================
   METRICS
========================================================== */

.metrics-grid {

  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 10px;

  margin-bottom: 12px;

}

.metric-card {

  display: flex;

  align-items: center;

  gap: 9px;

  min-height: 72px;

  padding:
    12px 14px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 10px;

}

.metric-icon {

  width: 29px;
  height: 29px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 8px;

  font-size: 12px;

  font-weight: 750;

}

.metric-card span {

  display: block;

  color: var(--text-3);

  font-size: 7px;

  font-weight: 650;

}

.metric-card strong {

  display: block;

  margin-top: 4px;

  color: var(--text-2);

  font-size: 17px;

  line-height: 1;

  font-weight: 750;

}


/* ==========================================================
   LOG CARD
========================================================== */

.logs-card {

  overflow: hidden;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

  box-shadow:
    0 1px 2px
    color-mix(in srgb, var(--text-1) 3%, transparent);

}

.logs-header {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  padding:
    15px 17px;

  border-bottom:
    1px solid var(--border-soft);

}

.logs-header h2 {

  margin:
    4px 0 0;

  color: var(--text-2);

  font-size: 12px;

  font-weight: 700;

}

.logs-header p {

  margin:
    4px 0 0;

  color: var(--text-3);

  font-size: 8px;

}

.terminal-badge {

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

  font-size: 7px;

  font-weight: 750;

}

.terminal-badge span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--emerald);

}


/* ==========================================================
   TERMINAL
========================================================== */

.terminal {

  min-height: 270px;

  max-height: 420px;

  overflow-y: auto;

  padding:
    9px 12px;

  background: var(--terminal-bg);

  font-family:
    "JetBrains Mono",
    "Cascadia Code",
    Consolas,
    monospace;

}

.terminal::-webkit-scrollbar {

  width: 6px;

}

.terminal::-webkit-scrollbar-track {

  background: var(--terminal-bg);

}

.terminal::-webkit-scrollbar-thumb {

  background: var(--text-2);

  border-radius: 5px;

}

.terminal-empty {

  min-height: 250px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-direction:
    column;

  text-align: center;

}

.terminal-empty-icon {

  width: 37px;
  height: 37px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 9px;

  color: var(--indigo-2);

  background: var(--terminal-card);

  border:
    1px solid var(--text-2);

  border-radius: 9px;

  font-size: 15px;

}

.terminal-empty strong {

  color: var(--terminal-text);

  font-size: 9px;

}

.terminal-empty span {

  max-width: 300px;

  margin-top: 5px;

  color: var(--text-2);

  font-size: 7px;

}

.log-list {

  display: flex;

  flex-direction:
    column;

}

.log-entry {

  display: grid;

  grid-template-columns:
    27px 1fr;

  gap: 7px;

  padding:
    5px 5px;

  border-bottom:
    1px solid
    color-mix(in srgb, var(--terminal-text) 6%, transparent);

  font-size: 8px;

  line-height: 1.4;

}

.log-entry:last-child {

  border-bottom: none;

}

.log-index {

  color: var(--terminal-muted);

  user-select: none;

}

.log-message {

  color: var(--text-3);

  word-break: break-word;

}

.log-entry.fraud {

  background:
    color-mix(in srgb, var(--red) 6%, transparent);

}

.log-entry.fraud
.log-message {

  color: var(--red-light);

}

.log-entry.normal
.log-message {

  color: var(--emerald-light);

}

.log-entry.failed
.log-message {

  color: var(--red-light);

}

.log-entry.system
.log-message {

  color: var(--indigo-2);

}


/* ==========================================================
   INFO
========================================================== */

.info-grid {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 10px;

  margin-top: 12px;

}

.info-item {

  display: flex;

  align-items: flex-start;

  gap: 9px;

  padding:
    12px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 10px;

}

.info-icon {

  width: 27px;
  height: 27px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  color: var(--indigo);

  background: var(--indigo-dim);

  border-radius: 7px;

  font-size: 10px;

}

.info-item strong {

  display: block;

  color: var(--terminal-muted);

  font-size: 9px;

  font-weight: 700;

}

.info-item p {

  margin:
    4px 0 0;

  color: var(--text-3);

  font-size: 7px;

  line-height: 1.45;

}


/* ==========================================================
   FOOTER
========================================================== */

.simulator-footer {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 10px;

  margin-top: 12px;

  padding:
    0 3px;

  color: var(--text-3);

  font-size: 7px;

}

.simulator-footer > div {

  display: flex;

  align-items: center;

  gap: 6px;

}

.simulator-footer > div span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--emerald);

}


/* ==========================================================
   TABLET
========================================================== */

@media (max-width: 850px) {

  .configuration-grid {

    grid-template-columns:
      1fr;

  }

  .metrics-grid {

    grid-template-columns:
      repeat(2, 1fr);

  }

  .info-grid {

    grid-template-columns:
      1fr;

  }

}


/* ==========================================================
   MOBILE
========================================================== */

@media (max-width: 600px) {

  .simulator-page {

    padding:
      20px 14px 28px;

  }

  .simulator-header {

    flex-direction:
      column;

  }

  .simulator-header h1 {

    font-size: 23px;

  }

  .simulator-status {

    align-self:
      flex-start;

  }

  .control-card {

    align-items:
      stretch;

    flex-direction:
      column;

  }

  .run-button {

    justify-content:
      center;

    width: 100%;

  }

  .metrics-grid {

    grid-template-columns:
      1fr 1fr;

  }

  .progress-footer {

    align-items:
      flex-start;

    flex-direction:
      column;

    gap: 3px;

  }

  .logs-header {

    align-items:
      flex-start;

    gap: 10px;

  }

  .simulator-footer {

    align-items:
      flex-start;

    flex-direction:
      column;

  }

}

`
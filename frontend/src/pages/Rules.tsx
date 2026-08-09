import { useEffect, useMemo, useState } from 'react'
import { rulesApi } from '../services/api'

const actionConfig: any = {
  block: {
    label: 'Block',
    color: 'var(--red)',
    bg: 'var(--red-dim)',
    border: 'var(--red-border)',
    icon: '⊘',
  },
  flag: {
    label: 'Flag',
    color: 'var(--amber)',
    bg: 'var(--amber-dim)',
    border: 'var(--amber-border)',
    icon: '⚑',
  },
  review: {
    label: 'Review',
    color: 'var(--indigo)',
    bg: 'var(--indigo-dim)',
    border: 'var(--indigo-border)',
    icon: '◷',
  },
}

const formatOperator = (operator: string) => {
  if (!operator) return ''

  return operator
    .replace(/_/g, ' ')
    .replace('greater than or equal', '≥')
    .replace('less than or equal', '≤')
    .replace('greater than', '>')
    .replace('less than', '<')
    .replace('equal', '=')
    .replace('not equal', '≠')
}

export default function Rules() {

  const [rules, setRules] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [updatingId, setUpdatingId] =
    useState<string | null>(null)

  const [filter, setFilter] =
    useState('all')

  const [search, setSearch] =
    useState('')


  /* ======================================================
     LOAD RULES
  ====================================================== */

  const load = async () => {

    try {

      setLoading(true)

      const res =
        await rulesApi.list()

      setRules(
        res.data || []
      )

    } catch (error) {

      console.error(
        'Failed to load rules:',
        error
      )

    } finally {

      setLoading(false)

    }
  }


  useEffect(() => {

    load()

  }, [])


  /* ======================================================
     TOGGLE RULE
  ====================================================== */

  const toggleRule = async (
    id: string,
    is_active: boolean
  ) => {

    try {

      setUpdatingId(id)

      await rulesApi.update(
        id,
        {
          is_active:
            !is_active,
        }
      )

      await load()

    } catch (error) {

      console.error(
        'Failed to update rule:',
        error
      )

    } finally {

      setUpdatingId(null)

    }
  }


  /* ======================================================
     STATISTICS
  ====================================================== */

  const stats = useMemo(() => {

    const active =
      rules.filter(
        rule => rule.is_active
      ).length

    const inactive =
      rules.length - active

    const blockRules =
      rules.filter(
        rule =>
          rule.action === 'block'
      ).length

    const flagRules =
      rules.filter(
        rule =>
          rule.action === 'flag'
      ).length

    return {
      total: rules.length,
      active,
      inactive,
      blockRules,
      flagRules,
    }

  }, [rules])


  /* ======================================================
     FILTER
  ====================================================== */

  const filteredRules =
    rules.filter(rule => {

      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' &&
          rule.is_active) ||
        (filter === 'inactive' &&
          !rule.is_active) ||
        (filter === 'block' &&
          rule.action === 'block') ||
        (filter === 'flag' &&
          rule.action === 'flag')

      const query =
        search
          .toLowerCase()
          .trim()

      const matchesSearch =
        !query ||
        rule.name
          ?.toLowerCase()
          .includes(query) ||
        rule.description
          ?.toLowerCase()
          .includes(query) ||
        rule.field
          ?.toLowerCase()
          .includes(query)

      return (
        matchesFilter &&
        matchesSearch
      )

    })


  return (

    <>
      <style>{rulesStyles}</style>

      <div className="rules-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="rules-header">

          <div>

            <div className="rules-eyebrow">

              <span />

              FRAUD CONTROL ENGINE

            </div>

            <h1>
              Fraud Rules
            </h1>

            <p>
              Configure automated rules that detect,
              flag and block suspicious transactions.
            </p>

          </div>


          <div className="engine-status">

            <div className="engine-icon">
              ⚙
            </div>

            <div>

              <strong>
                Rule Engine
              </strong>

              <span>
                {stats.active} active rules
              </span>

            </div>

          </div>

        </header>


        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <section className="rule-stats">

          <StatCard
            label="Total Rules"
            value={stats.total}
            description="Configured fraud controls"
            color="var(--indigo)"
            icon="◇"
          />

          <StatCard
            label="Active Rules"
            value={stats.active}
            description="Currently enforcing"
            color="var(--emerald)"
            icon="✓"
          />

          <StatCard
            label="Block Rules"
            value={stats.blockRules}
            description="Automatically prevent payments"
            color="var(--red)"
            icon="⊘"
          />

          <StatCard
            label="Flag Rules"
            value={stats.flagRules}
            description="Send transactions for review"
            color="var(--amber)"
            icon="⚑"
          />

        </section>


        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <div className="rules-toolbar">

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
              placeholder="Search rules, descriptions or fields..."
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


          <div className="filter-tabs">

            {[
              ['all', 'All'],
              ['active', 'Active'],
              ['inactive', 'Disabled'],
              ['block', 'Block'],
              ['flag', 'Flag'],
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
                </button>

              )
            )}

          </div>

        </div>


        {/* ==================================================
            RULE LIST
        ================================================== */}

        {loading ? (

          <div className="loading-card">

            <div className="spinner" />

            <strong>
              Loading fraud rules
            </strong>

            <span>
              Fetching rule configuration...
            </span>

          </div>

        ) : filteredRules.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              ◇
            </div>

            <strong>
              No rules found
            </strong>

            <span>
              No fraud rules match your
              current search or filters.
            </span>

            {(search ||
              filter !== 'all') && (

              <button
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

          <div className="rules-list">

            {filteredRules.map(
              rule => {

                const action =
                  actionConfig[
                    rule.action
                  ] ||
                  actionConfig.flag

                const isUpdating =
                  updatingId === rule.id

                return (

                  <article
                    key={rule.id}
                    className={
                      `rule-card ${
                        rule.is_active
                          ? 'active'
                          : 'inactive'
                      }`
                    }
                  >

                    {/* =================================================
                        RULE ICON
                    ================================================= */}

                    <div
                      className="rule-icon"
                      style={{
                        color:
                          action.color,

                        background:
                          action.bg,
                      }}
                    >

                      {action.icon}

                    </div>


                    {/* =================================================
                        MAIN CONTENT
                    ================================================= */}

                    <div className="rule-content">

                      <div className="rule-heading">

                        <div>

                          <h2>
                            {rule.name}
                          </h2>

                          <p>
                            {rule.description ||
                              'Automated fraud detection rule'}
                          </p>

                        </div>


                        <span
                          className="rule-status"
                          style={{
                            color:
                              rule.is_active
                                ? 'var(--emerald)'
                                : 'var(--text-3)',

                            background:
                              rule.is_active
                                ? 'var(--emerald-dim)'
                                : 'var(--bg-hover)',

                            borderColor:
                              rule.is_active
                                ? 'var(--emerald-border)'
                                : 'var(--border)',
                          }}
                        >

                          <span />

                          {rule.is_active
                            ? 'Active'
                            : 'Disabled'}

                        </span>

                      </div>


                      {/* =================================================
                          CONDITION
                      ================================================= */}

                      <div className="rule-condition">

                        <div className="condition-label">
                          WHEN
                        </div>

                        <div className="condition-value">

                          <span className="field-chip">
                            {rule.field}
                          </span>

                          <span className="operator">
                            {formatOperator(
                              rule.operator
                            )}
                          </span>

                          <span className="value-chip">
                            {String(
                              rule.value
                            )}
                          </span>

                        </div>

                      </div>


                      {/* =================================================
                          METADATA
                      ================================================= */}

                      <div className="rule-meta">

                        <div className="meta-item">

                          <span>
                            ACTION
                          </span>

                          <strong
                            style={{
                              color:
                                action.color,
                            }}
                          >

                            {action.label}

                          </strong>

                        </div>


                        <div className="meta-divider" />


                        <div className="meta-item">

                          <span>
                            PRIORITY
                          </span>

                          <strong>
                            {rule.priority}
                          </strong>

                        </div>


                        <div className="meta-divider" />


                        <div className="meta-item">

                          <span>
                            RULE ID
                          </span>

                          <strong>
                            {rule.id
                              ?.slice(0, 10)}
                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* =================================================
                        TOGGLE
                    ================================================= */}

                    <button
                      className={
                        `toggle-button ${
                          rule.is_active
                            ? 'enabled'
                            : ''
                        }`
                      }
                      disabled={
                        isUpdating
                      }
                      onClick={() =>
                        toggleRule(
                          rule.id,
                          rule.is_active
                        )
                      }
                      title={
                        rule.is_active
                          ? 'Disable rule'
                          : 'Enable rule'
                      }
                    >

                      <div className="toggle-track">

                        <div className="toggle-thumb" />

                      </div>

                      <span>

                        {isUpdating
                          ? 'Updating...'
                          : rule.is_active
                          ? 'Enabled'
                          : 'Disabled'}

                      </span>

                    </button>

                  </article>

                )

              }
            )}

          </div>

        )}


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="rules-footer">

          <div>

            <span />

            Automated fraud controls operational

          </div>

          <span>
            Changes are applied to the detection engine
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

    <div className="stat-card">

      <div className="stat-top">

        <span className="stat-label">
          {label}
        </span>

        <div
          className="stat-icon"
          style={{
            color,
            background:
              color.includes('red') ? 'var(--red-dim)' :
              color.includes('amber') ? 'var(--amber-dim)' :
              color.includes('emerald') ? 'var(--emerald-dim)' :
              'var(--indigo-dim)',
          }}
        >
          {icon}
        </div>

      </div>

      <div
        className="stat-value"
        style={{
          color:
            color === 'var(--indigo)'
              ? 'var(--text-1)'
              : color,
        }}
      >

        {value}

      </div>

      <div className="stat-description">
        {description}
      </div>

    </div>

  )
}


/* ==========================================================
   STYLES
========================================================== */

const rulesStyles = `
.rules-page {
  --red-border: color-mix(in srgb, var(--red) 24%, var(--border));
  --amber-border: color-mix(in srgb, var(--amber) 24%, var(--border));
  --indigo-border: color-mix(in srgb, var(--indigo) 24%, var(--border));
  --emerald-border: color-mix(in srgb, var(--emerald) 24%, var(--border));
}

* {
  box-sizing: border-box;
}

.rules-page {

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

.rules-header {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

  gap: 25px;

  margin-bottom: 24px;

}

.rules-eyebrow {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 8px;

  color: var(--indigo);

  font-size: 10px;

  font-weight: 750;

  letter-spacing: .12em;

}

.rules-eyebrow span {

  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: var(--indigo);

}

.rules-header h1 {

  margin: 0;

  color: var(--text-1);

  font-size: 27px;

  line-height: 1.15;

  font-weight: 750;

  letter-spacing: -.045em;

}

.rules-header p {

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

.engine-status strong {

  display: block;

  color: var(--text-2);

  font-size: 10px;

  font-weight: 650;

}

.engine-status span {

  display: block;

  margin-top: 2px;

  color: var(--emerald);

  font-size: 8px;

}


/* ==========================================================
   STATS
========================================================== */

.rule-stats {

  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 12px;

  margin-bottom: 18px;

}

.stat-card {

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
    box-shadow .18s ease;

}

.stat-card:hover {

  transform:
    translateY(-2px);

  box-shadow:
    0 8px 22px
    rgba(15,23,42,.055);

}

.stat-top {

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

  font-size: 25px;

  line-height: 1;

  font-weight: 750;

  letter-spacing: -.045em;

}

.stat-description {

  margin-top: 8px;

  color: var(--text-3);

  font-size: 9px;

}


/* ==========================================================
   TOOLBAR
========================================================== */

.rules-toolbar {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 15px;

  margin-bottom: 12px;

}

.search-wrapper {

  position: relative;

  width: 100%;

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
    var(--indigo-2);

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

  padding:
    7px 11px;

  color: var(--text-2);

  background:
    transparent;

  border: none;

  border-radius: 6px;

  cursor: pointer;

  font-size: 9px;

  font-weight: 650;

  transition: .15s;

}

.filter-button:hover {

  color: var(--text-2);

  background: var(--bg-hover);

}

.filter-button.active {

  color: var(--text-on-accent, #FFFFFF);

  background: var(--indigo);

  box-shadow:
    0 2px 8px
    rgba(79,70,229,.20);

}


/* ==========================================================
   RULE LIST
========================================================== */

.rules-list {

  display: flex;

  flex-direction:
    column;

  gap: 9px;

}

.rule-card {

  display: flex;

  align-items: flex-start;

  gap: 14px;

  padding:
    15px 17px;

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

.rule-card:hover {

  transform:
    translateY(-1px);

  border-color:
    var(--border-strong);

  box-shadow:
    0 7px 20px
    rgba(15,23,42,.05);

}

.rule-card.inactive {

  background: var(--bg-card2);

}

.rule-icon {

  width: 39px;
  height: 39px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 10px;

  font-size: 15px;

  font-weight: 750;

}

.rule-content {

  flex: 1;

  min-width: 0;

}

.rule-heading {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

  gap: 15px;

}

.rule-heading h2 {

  margin: 0;

  color: var(--text-1);

  font-size: 12px;

  font-weight: 700;

}

.rule-heading p {

  margin:
    4px 0 0;

  color: var(--text-3);

  font-size: 9px;

  line-height: 1.45;

}

.rule-status {

  display: inline-flex;

  align-items: center;

  gap: 5px;

  flex-shrink: 0;

  padding:
    5px 8px;

  border:
    1px solid;

  border-radius: 999px;

  font-size: 8px;

  font-weight: 650;

}

.rule-status span {

  width: 4px;
  height: 4px;

  border-radius: 50%;

  background:
    currentColor;

}


/* ==========================================================
   CONDITION
========================================================== */

.rule-condition {

  display: flex;

  align-items: center;

  gap: 9px;

  margin-top: 13px;

  padding:
    9px 10px;

  background: var(--bg-hover);

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

}

.condition-label {

  color: var(--text-3);

  font-size: 7px;

  font-weight: 750;

  letter-spacing: .09em;

}

.condition-value {

  display: flex;

  align-items: center;

  flex-wrap: wrap;

  gap: 6px;

}

.field-chip {

  padding:
    4px 7px;

  color: var(--indigo);

  background: var(--indigo-dim);

  border:
    1px solid var(--indigo-border);

  border-radius: 5px;

  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;

  font-size: 8px;

  font-weight: 650;

}

.operator {

  color: var(--text-2);

  font-size: 10px;

  font-weight: 700;

}

.value-chip {

  padding:
    4px 7px;

  color: var(--text-2);

  background: var(--bg-card);

  border:
    1px solid var(--border);

  border-radius: 5px;

  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;

  font-size: 8px;

  font-weight: 600;

}


/* ==========================================================
   META
========================================================== */

.rule-meta {

  display: flex;

  align-items: center;

  gap: 12px;

  margin-top: 11px;

}

.meta-item span {

  display: block;

  color: var(--text-3);

  font-size: 7px;

  font-weight: 700;

  letter-spacing: .07em;

}

.meta-item strong {

  display: block;

  margin-top: 3px;

  color: var(--text-2);

  font-size: 8px;

  font-weight: 650;

}

.meta-divider {

  width: 1px;
  height: 20px;

  background: var(--border-soft);

}


/* ==========================================================
   TOGGLE
========================================================== */

.toggle-button {

  width: 84px;

  display: flex;

  align-items: center;

  justify-content:
    center;

  flex-direction:
    column;

  gap: 5px;

  flex-shrink: 0;

  padding: 0;

  background:
    transparent;

  border: none;

  cursor: pointer;

}

.toggle-button:disabled {

  opacity: .55;

  cursor: wait;

}

.toggle-track {

  position: relative;

  width: 40px;
  height: 22px;

  padding: 3px;

  background: var(--text-3);

  border-radius: 20px;

  transition:
    background .2s ease;

}

.toggle-button.enabled
.toggle-track {

  background: var(--indigo);

}

.toggle-thumb {

  width: 16px;
  height: 16px;

  background: var(--bg-card);

  border-radius: 50%;

  box-shadow:
    0 1px 3px
    rgba(15,23,42,.20);

  transition:
    transform .2s ease;

}

.toggle-button.enabled
.toggle-thumb {

  transform:
    translateX(18px);

}

.toggle-button > span {

  color: var(--text-3);

  font-size: 7px;

  font-weight: 650;

}


/* ==========================================================
   LOADING
========================================================== */

.loading-card {

  min-height: 300px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-direction:
    column;

  gap: 5px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

}

.loading-card strong {

  margin-top: 7px;

  color: var(--text-2);

  font-size: 10px;

}

.loading-card span {

  color: var(--text-3);

  font-size: 8px;

}

.spinner {

  width: 26px;
  height: 26px;

  border:
    2px solid var(--border);

  border-top-color:
    var(--indigo);

  border-radius: 50%;

  animation:
    rules-spin .7s linear infinite;

}

@keyframes rules-spin {

  to {
    transform:
      rotate(360deg);
  }

}


/* ==========================================================
   EMPTY
========================================================== */

.empty-state {

  min-height: 300px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-direction:
    column;

  text-align: center;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 12px;

}

.empty-icon {

  width: 43px;
  height: 43px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 11px;

  color: var(--indigo);

  background: var(--indigo-dim);

  border-radius: 11px;

  font-size: 17px;

}

.empty-state strong {

  color: var(--text-2);

  font-size: 10px;

}

.empty-state span {

  max-width: 280px;

  margin-top: 5px;

  color: var(--text-3);

  font-size: 8px;

}

.empty-state button {

  margin-top: 11px;

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

.rules-footer {

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

.rules-footer > div {

  display: flex;

  align-items: center;

  gap: 6px;

}

.rules-footer > div span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #10B981;

}


/* ==========================================================
   TABLET
========================================================== */

@media (max-width: 850px) {

  .rule-stats {

    grid-template-columns:
      repeat(2, 1fr);

  }

  .rules-toolbar {

    align-items:
      stretch;

    flex-direction:
      column;

  }

  .search-wrapper {

    max-width: none;

  }

  .filter-tabs {

    width: 100%;

    overflow-x: auto;

  }

}


/* ==========================================================
   MOBILE
========================================================== */

@media (max-width: 600px) {

  .rules-page {

    padding:
      20px 14px 28px;

  }

  .rules-header {

    flex-direction:
      column;

  }

  .rules-header h1 {

    font-size: 23px;

  }

  .engine-status {

    width: 100%;

  }

  .rule-stats {

    grid-template-columns:
      1fr;

  }

  .rule-card {

    flex-direction:
      column;

  }

  .rule-heading {

    flex-direction:
      column;

  }

  .rule-status {

    align-self:
      flex-start;

  }

  .rule-condition {

    align-items:
      flex-start;

    flex-direction:
      column;

  }

  .rule-meta {

    flex-wrap: wrap;

  }

  .toggle-button {

    width: 100%;

    flex-direction:
      row;

    justify-content:
      flex-start;

    gap: 8px;

  }

  .rules-footer {

    align-items:
      flex-start;

    flex-direction:
      column;

  }

}

`
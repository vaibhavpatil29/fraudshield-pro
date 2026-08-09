import { useEffect, useState } from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'


const nav = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    description: 'Overview',
    icon: '▦',
  },
  {
    path: '/alerts',
    label: 'Live Alerts',
    description: 'Fraud detection',
    icon: '◉',
    live: true,
  },
  {
    path: '/transactions',
    label: 'Transactions',
    description: 'Payment activity',
    icon: '⇄',
  },
  {
    path: '/rules',
    label: 'Fraud Rules',
    description: 'Detection controls',
    icon: '◈',
  },
  {
    path: '/simulator',
    label: 'Simulator',
    description: 'Test environment',
    icon: '▷',
  },
]


const pageInfo: Record<
  string,
  {
    title: string
    description: string
  }
> = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Real-time fraud monitoring overview',
  },

  '/alerts': {
    title: 'Live Alerts',
    description: 'Review suspicious transaction activity',
  },

  '/transactions': {
    title: 'Transactions',
    description: 'Monitor payment activity',
  },

  '/rules': {
    title: 'Fraud Rules',
    description: 'Manage automated detection controls',
  },

  '/simulator': {
    title: 'Transaction Simulator',
    description: 'Generate controlled test transactions',
  },
}


export default function Layout() {

  const { theme, toggle } = useThemeStore()

  const { user, logout } = useAuthStore()

  const navigate = useNavigate()

  const location = useLocation()

  const [mobileOpen, setMobileOpen] =
    useState(false)


  /*
   * IMPORTANT:
   * Apply the current theme to the HTML element.
   *
   * This allows our CSS variables below to automatically
   * change whenever the Zustand theme changes.
   */
  useEffect(() => {

    document.documentElement.setAttribute(
      'data-theme',
      theme
    )

  }, [theme])


  const currentPage =
    pageInfo[location.pathname] ||
    pageInfo['/dashboard']


  const handleLogout = () => {

    logout()

    navigate('/login')

  }


  return (

    <>
      <style>{layoutStyles}</style>


      <div className="app-layout">


        {/* ==================================================
            MOBILE OVERLAY
        ================================================== */}

        {mobileOpen && (

          <div
            className="sidebar-overlay"
            onClick={() =>
              setMobileOpen(false)
            }
          />

        )}


        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside
          className={
            `app-sidebar ${
              mobileOpen
                ? 'mobile-open'
                : ''
            }`
          }
        >


          {/* ==================================================
              BRAND
          ================================================== */}

          <div className="sidebar-brand">

            <div className="brand-mark">

              <span>
                ✓
              </span>

            </div>


            <div className="brand-text">

              <div>

                <strong>
                  FraudShield
                </strong>

                <span>
                  PRO
                </span>

              </div>

              <small>
                Fraud intelligence platform
              </small>

            </div>


            <button
              className="mobile-close"
              onClick={() =>
                setMobileOpen(false)
              }
              aria-label="Close menu"
            >
              ×
            </button>

          </div>


          {/* ==================================================
              NAVIGATION
          ================================================== */}

          <nav className="sidebar-nav">

            <div className="nav-section-label">
              WORKSPACE
            </div>


            {nav.map(item => (

              <NavLink
                key={item.path}
                to={item.path}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={({ isActive }) =>
                  `nav-item ${
                    isActive
                      ? 'active'
                      : ''
                  }`
                }
              >

                {({ isActive }) => (

                  <>

                    <div className="nav-icon">
                      {item.icon}
                    </div>


                    <div className="nav-content">

                      <span className="nav-label">
                        {item.label}
                      </span>

                      <span className="nav-description">
                        {item.description}
                      </span>

                    </div>


                    {item.live && (

                      <div className="live-indicator">

                        <span />

                      </div>

                    )}


                    {isActive && (

                      <div className="active-indicator" />

                    )}

                  </>

                )}

              </NavLink>

            ))}

          </nav>


          {/* ==================================================
              SYSTEM STATUS
          ================================================== */}

          <div className="system-wrapper">

            <div className="system-card">

              <div className="system-header">

                <div>

                  <span className="system-label">
                    SYSTEM HEALTH
                  </span>

                  <strong>
                    All systems operational
                  </strong>

                </div>

                <div className="health-icon">
                  ✓
                </div>

              </div>


              <div className="health-list">

                <HealthItem
                  label="ML Engine"
                />

                <HealthItem
                  label="Kafka Stream"
                />

                <HealthItem
                  label="Rule Engine"
                />

                <HealthItem
                  label="PostgreSQL"
                />

              </div>

            </div>

          </div>

          {/* ==================================================
              USER
          ================================================== */}

          <div className="sidebar-user">

            <div className="user-profile">

              <div className="user-avatar">

                {user?.email?.[0]?.toUpperCase() ||
                  'V'}

              </div>


              <div className="user-info">

                <strong>
                  Vaibhav
                </strong>

                <span>
                  Security Analyst
                </span>

              </div>


              <div className="online-status" />

            </div>


            <button
              className="signout-button"
              onClick={handleLogout}
            >

              <span>
                ↪
              </span>

              Sign out

            </button>

          </div>

        </aside>


        {/* ==================================================
            MAIN AREA
        ================================================== */}

        <div className="main-area">


          {/* ==================================================
              TOP BAR
          ================================================== */}

          <header className="topbar">

            <div className="topbar-left">

              <button
                className="mobile-menu"
                onClick={() =>
                  setMobileOpen(true)
                }
                aria-label="Open menu"
              >
                ☰
              </button>


              <div>

                <div className="breadcrumb">

                  <span>
                    FraudShield
                  </span>

                  <span className="breadcrumb-arrow">
                    /
                  </span>

                  <strong>
                    {currentPage.title}
                  </strong>

                </div>


                <p>
                  {currentPage.description}
                </p>

              </div>

            </div>


            <div className="topbar-right">


              {/* ==================================================
                  ENVIRONMENT
              ================================================== */}

              <div className="environment">

                <span />

                <div>

                  <strong>
                    Production
                  </strong>

                  <small>
                    Monitoring active
                  </small>

                </div>

              </div>


              {/* ==================================================
                  THEME BUTTON
              ================================================== */}

              <button
                className="top-theme-button"
                onClick={toggle}
                title={
                  `Switch to ${
                    theme === 'light'
                      ? 'dark'
                      : 'light'
                  } mode`
                }
                aria-label="Toggle theme"
              >

                {theme === 'light'
                  ? '☾'
                  : '☀'}

              </button>


              {/* ==================================================
                  NOTIFICATIONS
              ================================================== */}

              <button
                className="notification-button"
                title="Notifications"
              >

                ◌

                <span />

              </button>


              {/* ==================================================
                  USER
              ================================================== */}

              <div className="topbar-avatar">

                {user?.email?.[0]?.toUpperCase() ||
                  'V'}

              </div>

            </div>

          </header>


          {/* ==================================================
              PAGE CONTENT
          ================================================== */}

          <main className="page-content">

            <Outlet />

          </main>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer className="app-footer">

            <div>

              <span />

              FraudShield Pro

            </div>

            <span>
              Real-time fraud intelligence
            </span>

          </footer>

        </div>

      </div>

    </>

  )
}


/* ==========================================================
   HEALTH ITEM
========================================================== */

function HealthItem({
  label,
}: {
  label: string
}) {

  return (

    <div className="health-item">

      <span className="health-dot" />

      <span>
        {label}
      </span>

      <strong>
        Operational
      </strong>

    </div>

  )

}


/* ==========================================================
   THEME VARIABLES + STYLES
========================================================== */

const layoutStyles = `

/* ==========================================================
   GLOBAL THEME VARIABLES
========================================================== */

:root {

  --bg-base: #F6F8FC;

  --bg-card: #FFFFFF;

  --bg-card2: #F8FAFC;

  --bg-hover: #F1F5F9;

  --bg-input: #FFFFFF;

  --border: #E2E8F0;

  --border-soft: #E8EDF3;

  --border-acc: #C7D2FE;

  --text-1: #172033;

  --text-2: #64748B;

  --text-3: #94A3B8;

  --text-muted: #A1ACBB;

  --indigo: #4F46E5;

  --indigo-hover: #4338CA;

  --indigo-dim: #EEF2FF;

  --indigo-soft: #E0E7FF;

  --emerald: #10B981;

  --emerald-dim: #ECFDF5;

  --red: #EF4444;

  --red-dim: #FEF2F2;

  --amber: #F59E0B;

  --amber-dim: #FFFBEB;

  --shadow-sm:
    0 2px 8px rgba(15,23,42,.04);

  --shadow-md:
    0 8px 24px rgba(15,23,42,.06);

  --sidebar-shadow:
    2px 0 12px rgba(15,23,42,.025);

}


html[data-theme="dark"] {

  --bg-base: #0B1120;

  --bg-card: #111827;

  --bg-card2: #172033;

  --bg-hover: #1E293B;

  --bg-input: #0F172A;

  --border: #263449;

  --border-soft: #1F2D42;

  --border-acc: #4F46E5;

  --text-1: #F1F5F9;

  --text-2: #CBD5E1;

  --text-3: #94A3B8;

  --text-muted: #64748B;

  --indigo: #6366F1;

  --indigo-hover: #818CF8;

  --indigo-dim: rgba(99,102,241,.13);

  --indigo-soft: rgba(99,102,241,.20);

  --emerald: #34D399;

  --emerald-dim: rgba(16,185,129,.12);

  --red: #F87171;

  --red-dim: rgba(239,68,68,.12);

  --amber: #FBBF24;

  --amber-dim: rgba(245,158,11,.12);

  --shadow-sm:
    0 2px 8px rgba(0,0,0,.18);

  --shadow-md:
    0 8px 24px rgba(0,0,0,.22);

  --sidebar-shadow:
    2px 0 14px rgba(0,0,0,.18);

}


/* ==========================================================
   GLOBAL
========================================================== */

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {

  background:
    var(--bg-base);

  color:
    var(--text-1);

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  transition:
    background .2s ease,
    color .2s ease;

}


/* ==========================================================
   APP
========================================================== */

.app-layout {

  min-height: 100vh;

  background:
    var(--bg-base);

  color:
    var(--text-1);

  transition:
    background .2s ease,
    color .2s ease;

}


/* ==========================================================
   SIDEBAR
========================================================== */

.app-sidebar {

  position: fixed;

  top: 0;
  bottom: 0;
  left: 0;

  z-index: 100;

  width: 245px;

  display: flex;

  flex-direction: column;

  background:
    var(--bg-card);

  border-right:
    1px solid var(--border-soft);

  box-shadow:
    var(--sidebar-shadow);

  transition:
    background .2s ease,
    border-color .2s ease,
    transform .22s ease;

}


/* ==========================================================
   BRAND
========================================================== */

.sidebar-brand {

  display: flex;

  align-items: center;

  gap: 10px;

  padding:
    21px 19px 19px;

  border-bottom:
    1px solid var(--border-soft);

}

.brand-mark {

  width: 34px;
  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  background:
    linear-gradient(
      145deg,
      #4F46E5,
      #6366F1
    );

  clip-path:
    polygon(
      50% 0%,
      91% 15%,
      91% 57%,
      82% 75%,
      66% 90%,
      50% 100%,
      34% 90%,
      18% 75%,
      9% 57%,
      9% 15%
    );

  box-shadow:
    0 5px 12px
    rgba(79,70,229,.18);

}

.brand-mark span {

  color: #FFFFFF;

  font-size: 13px;

  font-weight: 800;

}

.brand-text {

  min-width: 0;

  flex: 1;

}

.brand-text > div {

  display: flex;

  align-items: baseline;

  gap: 5px;

}

.brand-text strong {

  color:
    var(--text-1);

  font-size: 14px;

  font-weight: 750;

  letter-spacing: -.025em;

}

.brand-text > div span {

  color:
    var(--indigo);

  font-size: 7px;

  font-weight: 800;

  letter-spacing: .11em;

}

.brand-text small {

  display: block;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;

  white-space: nowrap;

}

.mobile-close {
  display: none;
}


/* ==========================================================
   NAVIGATION
========================================================== */

.sidebar-nav {

  flex: 1;

  padding:
    20px 10px;

  overflow-y: auto;

}

.nav-section-label {

  padding:
    0 10px 8px;

  color:
    var(--text-muted);

  font-size: 7px;

  font-weight: 750;

  letter-spacing: .12em;

}

.nav-item {

  position: relative;

  display: flex;

  align-items: center;

  gap: 9px;

  min-height: 48px;

  padding:
    7px 10px;

  margin-bottom: 3px;

  color:
    var(--text-2);

  background:
    transparent;

  border-radius: 9px;

  text-decoration: none;

  transition:
    background .15s ease,
    color .15s ease;

}

.nav-item:hover {

  color:
    var(--text-1);

  background:
    var(--bg-hover);

}

.nav-item.active {

  color:
    var(--indigo);

  background:
    var(--indigo-dim);

}

.nav-item.active:hover {

  background:
    var(--indigo-dim);

}

.nav-icon {

  width: 28px;
  height: 28px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  color:
    var(--text-3);

  background:
    var(--bg-card2);

  border:
    1px solid var(--border);

  border-radius: 7px;

  font-size: 12px;

  transition:
    all .15s ease;

}

.nav-item:hover .nav-icon {

  color:
    var(--text-2);

}

.nav-item.active .nav-icon {

  color:
    var(--indigo);

  background:
    var(--bg-card);

  border-color:
    var(--indigo-soft);

  box-shadow:
    var(--shadow-sm);

}

.nav-content {

  min-width: 0;

  flex: 1;

}

.nav-label {

  display: block;

  font-size: 10px;

  font-weight: 650;

  line-height: 1.2;

}

.nav-description {

  display: block;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;

  line-height: 1.2;

}

.nav-item.active .nav-description {

  color:
    var(--indigo);

  opacity: .72;

}

.live-indicator {

  display: flex;

  align-items: center;

  justify-content: center;

  width: 17px;
  height: 17px;

}

.live-indicator span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    var(--emerald);

  box-shadow:
    0 0 0 3px
    rgba(16,185,129,.09);

  animation:
    layout-pulse 2s infinite;

}

@keyframes layout-pulse {

  0%,
  100% {

    box-shadow:
      0 0 0 3px
      rgba(16,185,129,.08);

  }

  50% {

    box-shadow:
      0 0 0 6px
      rgba(16,185,129,0);

  }

}

.active-indicator {

  position: absolute;

  right: 0;

  top: 50%;

  width: 3px;
  height: 23px;

  transform:
    translateY(-50%);

  background:
    var(--indigo);

  border-radius:
    3px 0 0 3px;

}


/* ==========================================================
   SYSTEM STATUS
========================================================== */

.system-wrapper {

  padding:
    0 10px 12px;

}

.system-card {

  padding:
    12px;

  background:
    var(--bg-card2);

  border:
    1px solid var(--border);

  border-radius: 10px;

  transition:
    background .2s ease,
    border-color .2s ease;

}

.system-header {

  display: flex;

  align-items: flex-start;

  justify-content:
    space-between;

  margin-bottom: 9px;

}

.system-label {

  display: block;

  color:
    var(--text-muted);

  font-size: 7px;

  font-weight: 750;

  letter-spacing: .09em;

}

.system-header strong {

  display: block;

  margin-top: 3px;

  color:
    var(--text-2);

  font-size: 8px;

  font-weight: 650;

}

.health-icon {

  width: 22px;
  height: 22px;

  display: flex;

  align-items: center;

  justify-content: center;

  color:
    var(--emerald);

  background:
    var(--emerald-dim);

  border:
    1px solid rgba(16,185,129,.18);

  border-radius: 6px;

  font-size: 9px;

  font-weight: 800;

}

.health-list {

  display: flex;

  flex-direction:
    column;

  gap: 6px;

}

.health-item {

  display: grid;

  grid-template-columns:
    6px 1fr auto;

  align-items: center;

  gap: 6px;

}

.health-dot {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    var(--emerald);

}

.health-item > span:not(.health-dot) {

  color:
    var(--text-2);

  font-size: 7px;

}

.health-item strong {

  color:
    var(--emerald);

  font-size: 6px;

  font-weight: 650;

}


/* ==========================================================
   THEME SECTION
========================================================== */

.theme-section {

  margin:
    0 10px 10px;

  padding:
    9px 10px;

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  background:
    var(--bg-card2);

  border:
    1px solid var(--border);

  border-radius: 9px;

  transition:
    background .2s ease,
    border-color .2s ease;

}

.theme-info {

  display: flex;

  align-items: center;

  gap: 7px;

}

.theme-icon {

  width: 25px;
  height: 25px;

  display: flex;

  align-items: center;

  justify-content: center;

  color:
    var(--indigo);

  background:
    var(--indigo-dim);

  border-radius: 6px;

  font-size: 11px;

}

.theme-info strong {

  display: block;

  color:
    var(--text-2);

  font-size: 8px;

  font-weight: 650;

}

.theme-info small {

  display: block;

  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 6px;

}


/* ==========================================================
   THEME SWITCH
========================================================== */

.theme-switch {

  position: relative;

  width: 37px;
  height: 21px;

  padding: 0;

  flex-shrink: 0;

  border: none;

  border-radius: 20px;

  background:
    var(--border);

  cursor: pointer;

  transition:
    background .2s ease;

}

.theme-switch span {

  position: absolute;

  top: 3px;
  left: 3px;

  width: 15px;
  height: 15px;

  border-radius: 50%;

  background:
    var(--bg-card);

  box-shadow:
    0 1px 4px
    rgba(0,0,0,.18);

  transition:
    left .2s ease,
    background .2s ease;

}

.theme-switch.dark {

  background:
    var(--indigo);

}

.theme-switch.dark span {

  left: 19px;

  background:
    #FFFFFF;

}


/* ==========================================================
   USER
========================================================== */

.sidebar-user {

  padding:
    13px 13px 15px;

  border-top:
    1px solid var(--border-soft);

}

.user-profile {

  display: flex;

  align-items: center;

  gap: 9px;

  padding:
    3px 3px 11px;

}

.user-avatar {

  width: 30px;
  height: 30px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  color:
    #FFFFFF;

  background:
    linear-gradient(
      135deg,
      #4F46E5,
      #6366F1
    );

  border-radius: 50%;

  font-size: 10px;

  font-weight: 700;

  box-shadow:
    0 3px 8px
    rgba(79,70,229,.16);

}

.user-info {

  min-width: 0;

  flex: 1;

}

.user-info strong {

  display: block;

  color:
    var(--text-1);

  font-size: 9px;

  font-weight: 700;

}

.user-info span {

  display: block;

  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;

}

.online-status {

  width: 6px;
  height: 6px;

  margin-right: 3px;

  border:
    2px solid var(--bg-card);

  border-radius: 50%;

  background:
    var(--emerald);

}

.signout-button {

  width: 100%;

  height: 30px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 6px;

  color:
    var(--text-3);

  background:
    transparent;

  border:
    1px solid var(--border);

  border-radius: 7px;

  cursor: pointer;

  font-size: 8px;

  font-weight: 650;

  transition:
    all .15s ease;

}

.signout-button:hover {

  color:
    var(--red);

  background:
    var(--red-dim);

  border-color:
    var(--red);

}


/* ==========================================================
   MAIN AREA
========================================================== */

.main-area {

  min-height: 100vh;

  margin-left: 245px;

  display: flex;

  flex-direction: column;

  background:
    var(--bg-base);

  transition:
    background .2s ease;

}


/* ==========================================================
   TOP BAR
========================================================== */

.topbar {

  height: 66px;

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 20px;

  padding:
    0 30px;

  background:
    var(--bg-card);

  border-bottom:
    1px solid var(--border-soft);

  position: sticky;

  top: 0;

  z-index: 40;

  transition:
    background .2s ease,
    border-color .2s ease;

}

.topbar-left {

  display: flex;

  align-items: center;

  gap: 12px;

}

.breadcrumb {

  display: flex;

  align-items: center;

  gap: 7px;

  color:
    var(--text-muted);

  font-size: 8px;

}

.breadcrumb strong {

  color:
    var(--text-2);

  font-weight: 650;

}

.breadcrumb-arrow {

  color:
    var(--text-3);

}

.topbar-left p {

  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;

}

.topbar-right {

  display: flex;

  align-items: center;

  gap: 8px;

}


/* ==========================================================
   ENVIRONMENT
========================================================== */

.environment {

  display: flex;

  align-items: center;

  gap: 7px;

  padding:
    6px 9px;

  background:
    var(--bg-card2);

  border:
    1px solid var(--border);

  border-radius: 7px;

}

.environment > span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    var(--emerald);

  box-shadow:
    0 0 0 3px
    rgba(16,185,129,.08);

}

.environment strong {

  display: block;

  color:
    var(--text-2);

  font-size: 7px;

  font-weight: 700;

}

.environment small {

  display: block;

  margin-top: 1px;

  color:
    var(--text-muted);

  font-size: 6px;

}


/* ==========================================================
   TOP THEME BUTTON
========================================================== */

.top-theme-button {

  width: 31px;
  height: 31px;

  display: flex;

  align-items: center;

  justify-content: center;

  color:
    var(--text-2);

  background:
    var(--bg-card2);

  border:
    1px solid var(--border);

  border-radius: 8px;

  cursor: pointer;

  font-size: 13px;

  transition:
    all .15s ease;

}

.top-theme-button:hover {

  color:
    var(--indigo);

  border-color:
    var(--border-acc);

  background:
    var(--indigo-dim);

}


/* ==========================================================
   NOTIFICATION
========================================================== */

.notification-button {

  position: relative;

  width: 31px;
  height: 31px;

  display: flex;

  align-items: center;

  justify-content: center;

  color:
    var(--text-2);

  background:
    var(--bg-card2);

  border:
    1px solid var(--border);

  border-radius: 8px;

  cursor: pointer;

  font-size: 14px;

  transition:
    all .15s ease;

}

.notification-button:hover {

  color:
    var(--indigo);

  border-color:
    var(--border-acc);

}

.notification-button > span {

  position: absolute;

  top: 6px;
  right: 6px;

  width: 5px;
  height: 5px;

  border:
    1px solid var(--bg-card);

  border-radius: 50%;

  background:
    var(--red);

}


/* ==========================================================
   TOP AVATAR
========================================================== */

.topbar-avatar {

  width: 31px;
  height: 31px;

  display: flex;

  align-items: center;

  justify-content: center;

  color:
    #FFFFFF;

  background:
    linear-gradient(
      135deg,
      #4F46E5,
      #6366F1
    );

  border-radius: 50%;

  font-size: 9px;

  font-weight: 700;

}


/* ==========================================================
   PAGE CONTENT
========================================================== */

.page-content {

  flex: 1;

  width: 100%;

  padding:
    28px 30px 25px;

}


/* ==========================================================
   FOOTER
========================================================== */

.app-footer {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 10px;

  padding:
    0 30px 15px;

  color:
    var(--text-muted);

  font-size: 7px;

}

.app-footer > div {

  display: flex;

  align-items: center;

  gap: 6px;

}

.app-footer > div span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    var(--emerald);

}


/* ==========================================================
   MOBILE MENU
========================================================== */

.mobile-menu {

  display: none;

  width: 32px;
  height: 32px;

  align-items: center;

  justify-content: center;

  color:
    var(--text-2);

  background:
    var(--bg-card);

  border:
    1px solid var(--border);

  border-radius: 8px;

  cursor: pointer;

}


/* ==========================================================
   MOBILE CLOSE
========================================================== */

.mobile-close {

  display: none;

  width: 27px;
  height: 27px;

  align-items: center;

  justify-content: center;

  color:
    var(--text-2);

  background:
    var(--bg-card2);

  border:
    1px solid var(--border);

  border-radius: 7px;

  cursor: pointer;

}


/* ==========================================================
   OVERLAY
========================================================== */

.sidebar-overlay {

  display: none;

}


/* ==========================================================
   TABLET
========================================================== */

@media (max-width: 900px) {

  .app-sidebar {

    transform:
      translateX(-100%);

    transition:
      transform .22s ease;

  }

  .app-sidebar.mobile-open {

    transform:
      translateX(0);

  }

  .mobile-close {

    display: flex;

  }

  .main-area {

    margin-left: 0;

  }

  .mobile-menu {

    display: flex;

  }

  .sidebar-overlay {

    display: block;

    position: fixed;

    inset: 0;

    z-index: 90;

    background:
      rgba(15,23,42,.25);

    backdrop-filter:
      blur(2px);

  }

}


/* ==========================================================
   SMALL TABLET
========================================================== */

@media (max-width: 700px) {

  .environment {

    display: none;

  }

  .topbar {

    padding:
      0 18px;

  }

  .page-content {

    padding:
      22px 18px;

  }

  .app-footer {

    padding:
      0 18px 15px;

  }

}


/* ==========================================================
   MOBILE
========================================================== */

@media (max-width: 500px) {

  .topbar {

    height: 60px;

  }

  .breadcrumb {

    font-size: 7px;

  }

  .topbar-left p {

    display: none;

  }

  .topbar-right {

    gap: 5px;

  }

  .top-theme-button {

    display: none;

  }

  .topbar-avatar {

    width: 29px;
    height: 29px;

  }

  .notification-button {

    width: 29px;
    height: 29px;

  }

  .page-content {

    padding:
      18px 13px;

  }

  .app-footer {

    align-items:
      flex-start;

    flex-direction:
      column;

    padding:
      0 13px 13px;

  }

}

`
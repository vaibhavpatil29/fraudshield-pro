import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Login() {

  const [email, setEmail] =
    useState('vaibhav@fraudshield.com')

  const [password, setPassword] =
    useState('Test1234')

  const [error, setError] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [showPassword, setShowPassword] =
    useState(false)

  const navigate = useNavigate()

  const login =
    useAuthStore(s => s.login)


  /* ======================================================
     LOGIN
  ====================================================== */

  const handleLogin = async () => {

    if (!email.trim() || !password.trim()) {

      setError(
        'Please enter your email and password.'
      )

      return
    }

    setLoading(true)

    setError('')

    try {

      const res =
        await authApi.login(
          email,
          password
        )

      login(
        res.data.access_token,
        { email }
      )

      navigate('/dashboard')

    } catch {

      setError(
        'Invalid email or password. Please try again.'
      )

    } finally {

      setLoading(false)

    }

  }


  return (

    <>
      <style>{loginStyles}</style>

      <div className="login-page">


        {/* ==================================================
            BACKGROUND DECORATION
        ================================================== */}

        <div className="background-glow glow-one" />
        <div className="background-glow glow-two" />


        {/* ==================================================
            LEFT BRAND PANEL
        ================================================== */}

        <section className="brand-panel">

          <div className="brand-content">


            {/* LOGO */}

            <div className="brand-logo">

              <div className="shield-logo">

                <span>
                  ✓
                </span>

              </div>

              <div>

                <strong>
                  FraudShield
                </strong>

                <span>
                  PRO
                </span>

              </div>

            </div>


            {/* HERO */}

            <div className="brand-hero">

              <div className="security-badge">

                <span />

                REAL-TIME PAYMENT SECURITY

              </div>

              <h1>
                Protect every
                <br />

                <span>
                  transaction.
                </span>
              </h1>

              <p>
                Intelligent fraud detection powered by
                machine learning, real-time risk scoring,
                and automated security controls.
              </p>

            </div>


            {/* FEATURES */}

            <div className="security-features">

              <Feature
                icon="◈"
                title="Real-time detection"
                text="Analyze transactions as they happen."
              />

              <Feature
                icon="⚡"
                title="Automated protection"
                text="Block high-risk payments instantly."
              />

              <Feature
                icon="◎"
                title="Explainable intelligence"
                text="Understand why a transaction is risky."
              />

            </div>


            {/* BRAND FOOTER */}

            <div className="brand-footer">

              <span />

              FraudShield Pro Security Platform

            </div>

          </div>

        </section>


        {/* ==================================================
            LOGIN PANEL
        ================================================== */}

        <main className="login-panel">

          <div className="login-container">


            {/* MOBILE LOGO */}

            <div className="mobile-brand">

              <div className="mobile-shield">
                ✓
              </div>

              <strong>
                FraudShield
              </strong>

              <span>
                PRO
              </span>

            </div>


            {/* LOGIN CARD */}

            <div className="login-card">


              {/* HEADER */}

              <div className="login-header">

                <div className="welcome-icon">

                  <span>
                    →
                  </span>

                </div>

                <h2>
                  Welcome back
                </h2>

                <p>
                  Sign in to access your fraud
                  monitoring dashboard.
                </p>

              </div>


              {/* ERROR */}

              {error && (

                <div className="error-message">

                  <div className="error-icon">
                    !
                  </div>

                  <div>

                    <strong>
                      Sign in failed
                    </strong>

                    <span>
                      {error}
                    </span>

                  </div>

                </div>

              )}


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={e =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="form-group password-group">

                <div className="password-label-row">

                  <label>
                    Password
                  </label>

                </div>

                <div className="input-wrapper">

                  <span className="input-icon">
                    •••
                  </span>

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={e =>
                      setPassword(
                        e.target.value
                      )
                    }
                    onKeyDown={e =>
                      e.key === 'Enter' &&
                      !loading &&
                      handleLogin()
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        prev => !prev
                      )
                    }
                    disabled={loading}
                  >
                    {showPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>

                </div>

              </div>


              {/* LOGIN BUTTON */}

              <button
                className={
                  `login-button ${
                    loading
                      ? 'loading'
                      : ''
                  }`
                }
                onClick={handleLogin}
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="button-spinner" />

                    Signing in...

                  </>

                ) : (

                  <>
                    Sign in

                    <span className="button-arrow">
                      →
                    </span>
                  </>

                )}

              </button>


              {/* SECURITY MESSAGE */}

              <div className="secure-login">

                <span className="secure-icon">
                  ✓
                </span>

                <span>
                  Secure authentication ·
                  Protected session
                </span>

              </div>

            </div>


            {/* FOOTER */}

            <div className="login-footer">

              <span>
                © 2026 FraudShield Pro
              </span>

              <div>

                <span>
                  Privacy
                </span>

                <span className="footer-dot">
                  •
                </span>

                <span>
                  Security
                </span>

              </div>

            </div>


          </div>

        </main>

      </div>

    </>

  )
}


/* ==========================================================
   FEATURE
========================================================== */

function Feature({
  icon,
  title,
  text,
}: {
  icon: string
  title: string
  text: string
}) {

  return (

    <div className="feature">

      <div className="feature-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {text}
        </span>

      </div>

    </div>

  )
}


/* ==========================================================
   STYLES
========================================================== */

const loginStyles = `
/* Login page uses the global FraudShield theme variables from Layout.tsx. */
.login-page {
  --text-on-accent: #FFFFFF;
  --indigo-2: var(--indigo, #6366F1);
}

* {
  box-sizing: border-box;
}

.login-page {

  min-height: 100vh;

  display: grid;

  grid-template-columns:
    minmax(400px, 1fr)
    minmax(440px, 540px);

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

  position: relative;

  overflow: hidden;

}


/* ==========================================================
   BACKGROUND
========================================================== */

.background-glow {

  position: fixed;

  width: 500px;
  height: 500px;

  border-radius: 50%;

  pointer-events: none;

  filter: blur(80px);

  opacity: .35;

}

.glow-one {

  top: -250px;

  left: -150px;

  background:
    rgba(99,102,241,.12);

}

.glow-two {

  right: -220px;

  bottom: -250px;

  background:
    rgba(14,165,233,.09);

}


/* ==========================================================
   BRAND PANEL
========================================================== */

.brand-panel {

  position: relative;

  display: flex;

  align-items: center;

  padding:
    55px 8vw 45px;

  background:
    linear-gradient(
      145deg,
      var(--bg-card2) 0%,
      var(--bg-card) 48%,
      var(--bg-base) 100%
    );

  border-right:
    1px solid var(--border);

}

.brand-content {

  width: 100%;

  max-width: 570px;

  margin: 0 auto;

}


/* ==========================================================
   BRAND
========================================================== */

.brand-logo {

  display: flex;

  align-items: center;

  gap: 11px;

}

.shield-logo {

  width: 42px;
  height: 47px;

  display: flex;

  align-items: center;

  justify-content: center;

  background:
    linear-gradient(
      145deg,
      var(--indigo),
      var(--indigo-2)
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
    0 8px 20px
    rgba(79,70,229,.20);

}

.shield-logo span {

  color: white;

  font-size: 17px;

  font-weight: 800;

}

.brand-logo strong {

  color: var(--text-1);

  font-size: 19px;

  letter-spacing: -.035em;

}

.brand-logo > div:last-child {

  display: flex;

  align-items: baseline;

  gap: 5px;

}

.brand-logo > div:last-child span {

  color: var(--indigo);

  font-size: 8px;

  font-weight: 800;

  letter-spacing: .12em;

}


/* ==========================================================
   HERO
========================================================== */

.brand-hero {

  margin-top: 100px;

}

.security-badge {

  display: inline-flex;

  align-items: center;

  gap: 7px;

  padding:
    6px 9px;

  color: var(--indigo);

  background: var(--indigo-dim);

  border:
    1px solid var(--border-acc);

  border-radius: 999px;

  font-size: 8px;

  font-weight: 750;

  letter-spacing: .08em;

}

.security-badge span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--indigo-2);

}

.brand-hero h1 {

  margin:
    17px 0 0;

  color: var(--text-1);

  font-size:
    clamp(38px, 4vw, 58px);

  line-height: 1.03;

  font-weight: 800;

  letter-spacing: -.055em;

}

.brand-hero h1 span {

  color: var(--indigo);

}

.brand-hero p {

  max-width: 500px;

  margin:
    20px 0 0;

  color: var(--text-2);

  font-size: 13px;

  line-height: 1.7;

}


/* ==========================================================
   FEATURES
========================================================== */

.security-features {

  display: flex;

  flex-direction:
    column;

  gap: 14px;

  margin-top: 45px;

}

.feature {

  display: flex;

  align-items: center;

  gap: 11px;

}

.feature-icon {

  width: 32px;
  height: 32px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  color: var(--indigo);

  background: var(--bg-card);

  border:
    1px solid var(--border-acc);

  border-radius: 9px;

  box-shadow:
    0 2px 7px
    rgba(15,23,42,.035);

  font-size: 12px;

}

.feature strong {

  display: block;

  color: var(--text-2);

  font-size: 10px;

  font-weight: 700;

}

.feature span {

  display: block;

  margin-top: 3px;

  color: var(--text-3);

  font-size: 8px;

}


/* ==========================================================
   BRAND FOOTER
========================================================== */

.brand-footer {

  display: flex;

  align-items: center;

  gap: 7px;

  margin-top: 75px;

  color: var(--text-3);

  font-size: 8px;

}

.brand-footer span {

  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: var(--emerald);

}


/* ==========================================================
   LOGIN PANEL
========================================================== */

.login-panel {

  display: flex;

  align-items: center;

  justify-content: center;

  padding:
    40px 55px;

  background: var(--bg-card);

}

.login-container {

  width: 100%;

  max-width: 390px;

}


/* ==========================================================
   MOBILE BRAND
========================================================== */

.mobile-brand {

  display: none;

}


/* ==========================================================
   LOGIN CARD
========================================================== */

.login-card {

  padding:
    32px;

  background: var(--bg-card);

  border:
    1px solid var(--border-soft);

  border-radius: 15px;

  box-shadow:
    0 15px 45px
    rgba(15,23,42,.065);

}


/* ==========================================================
   LOGIN HEADER
========================================================== */

.login-header {

  margin-bottom: 25px;

}

.welcome-icon {

  width: 38px;
  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-bottom: 16px;

  color: var(--indigo);

  background: var(--indigo-dim);

  border:
    1px solid var(--border-acc);

  border-radius: 10px;

  font-size: 16px;

  font-weight: 700;

}

.login-header h2 {

  margin: 0;

  color: var(--text-1);

  font-size: 24px;

  line-height: 1.2;

  font-weight: 750;

  letter-spacing: -.04em;

}

.login-header p {

  margin:
    7px 0 0;

  color: var(--text-3);

  font-size: 10px;

  line-height: 1.55;

}


/* ==========================================================
   ERROR
========================================================== */

.error-message {

  display: flex;

  align-items: flex-start;

  gap: 9px;

  padding:
    10px 11px;

  margin-bottom: 17px;

  color: var(--red);

  background: var(--red-dim);

  border:
    1px solid var(--border);

  border-radius: 9px;

}

.error-icon {

  width: 19px;
  height: 19px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  color: var(--text-on-accent);

  background: var(--red);

  border-radius: 50%;

  font-size: 10px;

  font-weight: 800;

}

.error-message strong {

  display: block;

  font-size: 9px;

  font-weight: 700;

}

.error-message span {

  display: block;

  margin-top: 2px;

  font-size: 8px;

  line-height: 1.4;

}


/* ==========================================================
   FORM
========================================================== */

.form-group {

  margin-bottom: 17px;

}

.form-group label {

  display: block;

  margin-bottom: 7px;

  color: var(--text-2);

  font-size: 9px;

  font-weight: 700;

}

.input-wrapper {

  position: relative;

}

.input-wrapper input {

  width: 100%;

  height: 43px;

  padding:
    0 42px;

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

.input-wrapper input::placeholder {

  color: var(--text-3);

}

.input-wrapper input:focus {

  border-color:
    var(--indigo-2);

  box-shadow:
    0 0 0 3px
    rgba(79,70,229,.075);

}

.input-wrapper input:disabled {

  background: var(--bg-hover);

  cursor: not-allowed;

}

.input-icon {

  position: absolute;

  left: 13px;

  top: 50%;

  transform:
    translateY(-50%);

  color: var(--text-3);

  font-size: 10px;

  font-weight: 700;

  pointer-events: none;

}

.password-toggle {

  position: absolute;

  right: 9px;

  top: 50%;

  transform:
    translateY(-50%);

  padding:
    5px 6px;

  color: var(--text-2);

  background: transparent;

  border: none;

  border-radius: 5px;

  cursor: pointer;

  font-size: 8px;

  font-weight: 650;

}

.password-toggle:hover {

  color: var(--indigo);

  background: var(--bg-card2);

}

.password-toggle:disabled {

  cursor: not-allowed;

  opacity: .5;

}


/* ==========================================================
   LOGIN BUTTON
========================================================== */

.login-button {

  width: 100%;

  height: 43px;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  margin-top: 7px;

  color: var(--text-on-accent);

  background:
    linear-gradient(
      135deg,
      var(--indigo),
      var(--indigo-2)
    );

  border: none;

  border-radius: 9px;

  cursor: pointer;

  font-size: 10px;

  font-weight: 700;

  box-shadow:
    0 5px 13px
    rgba(79,70,229,.20);

  transition:
    transform .15s,
    box-shadow .15s,
    opacity .15s;

}

.login-button:hover:not(:disabled) {

  transform:
    translateY(-1px);

  box-shadow:
    0 8px 18px
    rgba(79,70,229,.24);

}

.login-button.loading {

  opacity: .75;

  cursor: wait;

}

.login-button:disabled {

  cursor: not-allowed;

}

.button-arrow {

  font-size: 14px;

  line-height: 1;

}

.button-spinner {

  width: 13px;
  height: 13px;

  border:
    2px solid
    rgba(255,255,255,.35);

  border-top-color:
    var(--text-on-accent);

  border-radius: 50%;

  animation:
    login-spin .7s linear infinite;

}

@keyframes login-spin {

  to {
    transform:
      rotate(360deg);
  }

}


/* ==========================================================
   SECURE LOGIN
========================================================== */

.secure-login {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 5px;

  margin-top: 17px;

  color: var(--text-3);

  font-size: 7px;

}

.secure-icon {

  width: 14px;
  height: 14px;

  display: flex;

  align-items: center;

  justify-content: center;

  color: var(--emerald);

  background: var(--emerald-dim);

  border-radius: 50%;

  font-size: 7px;

  font-weight: 800;

}


/* ==========================================================
   FOOTER
========================================================== */

.login-footer {

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  margin-top: 16px;

  color: var(--text-3);

  font-size: 7px;

}

.login-footer > div {

  display: flex;

  align-items: center;

  gap: 6px;

}

.footer-dot {

  color: var(--text-3);

}


/* ==========================================================
   TABLET
========================================================== */

@media (max-width: 900px) {

  .login-page {

    grid-template-columns:
      1fr;

  }

  .brand-panel {

    display: none;

  }

  .login-panel {

    min-height: 100vh;

    padding:
      35px 25px;

  }

  .mobile-brand {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 6px;

    margin-bottom: 25px;

  }

  .mobile-shield {

    width: 29px;
    height: 32px;

    display: flex;

    align-items: center;

    justify-content: center;

    color: var(--text-on-accent);

    background: var(--indigo);

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

    font-size: 10px;

    font-weight: 800;

  }

  .mobile-brand strong {

    color: var(--text-1);

    font-size: 15px;

    letter-spacing: -.03em;

  }

  .mobile-brand span {

    color: var(--indigo);

    font-size: 7px;

    font-weight: 800;

    letter-spacing: .1em;

  }

}


/* ==========================================================
   MOBILE
========================================================== */

@media (max-width: 500px) {

  .login-panel {

    padding:
      25px 15px;

  }

  .login-card {

    padding:
      24px 20px;

    border-radius: 13px;

  }

  .login-header h2 {

    font-size: 21px;

  }

  .login-footer {

    align-items:
      flex-start;

    flex-direction:
      column;

    gap: 7px;

  }

}

`
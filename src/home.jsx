import "./App.css";

function Home({ onGetStarted, onLogin }) {
  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">

        <div className="logo-section">
          <div className="logo">+</div>

          <div>
            <h2>Healthcare Platform</h2>
            <p>AI-Assisted Healthcare</p>
          </div>
        </div>

        <div className="nav-links">
          <a href="#">Features</a>
          <a href="#">Emergency</a>
          <a href="#">AI Assistant</a>
          <a href="#">Resources</a>
        </div>

        <button className="login-btn" onClick={onLogin}>
          Login
        </button>

      </nav>

      {/* Hero */}
      <section className="hero">

        <div className="hero-content">

          <div className="badge">
            AI-Powered Digital Healthcare Platform
          </div>

          <h1>
            Your Health.
            <br />
            <span>One Secure Passport.</span>
          </h1>

          <p className="description">
            Find suitable healthcare resources and securely share your
            essential medical information when every second counts.
          </p>

          <div className="buttons">

            <button
              className="primary-btn"
              onClick={onGetStarted}
            >
              Get Started →
            </button>

            <button className="secondary-btn">
              Explore Healthcare ✦
            </button>

          </div>

          <div className="trust">

            <div className="trust-item">
              <div className="trust-icon">🔒</div>

              <div>
                <strong>Secure</strong>
                <small>Controlled access</small>
              </div>
            </div>

            <div className="line"></div>

            <div className="trust-item">
              <div className="trust-icon">🤖</div>

              <div>
                <strong>AI Assisted</strong>
                <small>Smart healthcare search</small>
              </div>
            </div>

            <div className="line"></div>

            <div className="trust-item">
              <div className="trust-icon">⚡</div>

              <div>
                <strong>Emergency Ready</strong>
                <small>Critical information</small>
              </div>
            </div>

          </div>

        </div>

        {/* Right Card */}
        <div className="visual">

          <div className="circle"></div>

          <div className="passport-card">

            <div className="passport-header">

              <div className="passport-logo">+</div>

              <div>
                <strong>MEDICAL PASSPORT</strong>
                <small>Digital Health Record</small>
              </div>

              <span className="verified">Verified</span>

            </div>

            <div className="patient">

              <div className="avatar">P</div>

              <div>
                <label>PATIENT</label>
                <h3>Medical Information</h3>
                <p>Secure • Private • Accessible</p>
              </div>

            </div>

            <div className="medical-details">

              <div>
                <label>Blood Group</label>
                <strong>O+</strong>
              </div>

              <div>
                <label>Allergies</label>
                <strong>Protected</strong>
              </div>

              <div>
                <label>Medicines</label>
                <strong>Protected</strong>
              </div>

            </div>

            <div className="passport-bottom">

              <div>
                <label>STATUS</label>
                <span className="available">Available for emergency access</span>
              </div>

              <div className="qr">▦</div>

            </div>

          </div>

          <div className="search-card">

            <div className="search-icon">✦</div>

            <div>
              <label>AI SMART SEARCH</label>
              <strong>Find healthcare near you</strong>
            </div>

            <span className="arrow">→</span>

          </div>

          <div className="emergency-card">

            <div className="emergency-icon">!</div>

            <div>
              <label>EMERGENCY MODE</label>
              <strong>Quick medical access</strong>
            </div>

            <span className="status"></span>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="features">

        <div className="feature">
          <div className="feature-icon blue">✦</div>

          <div>
            <h3>Healthcare Discovery</h3>
            <p>Find suitable healthcare resources nearby.</p>
          </div>
        </div>

        <div className="feature">
          <div className="feature-icon green">▣</div>

          <div>
            <h3>Digital Medical Passport</h3>
            <p>Keep important medical information organized.</p>
          </div>
        </div>

        <div className="feature">
          <div className="feature-icon purple">✦</div>

          <div>
            <h3>AI Assistance</h3>
            <p>Get intelligent assistance with healthcare information.</p>
          </div>
        </div>

        <div className="feature">
          <div className="feature-icon orange">🔐</div>

          <div>
            <h3>Controlled Access</h3>
            <p>Share selected information securely.</p>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer>

        <strong>AI-Assisted Healthcare Platform</strong>

        <span>When every second counts.</span>

      </footer>

    </div>
  );
}

export default Home;
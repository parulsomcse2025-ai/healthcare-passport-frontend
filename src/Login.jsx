import "./Login.css";

function Login({ onLogin }) {
  return (
    <div className="login-page">

      {/* Left Section */}
      <div className="login-left">

        <div className="login-brand">
          <div className="login-logo">+</div>

          <div>
            <h2>Healthcare Platform</h2>
            <p>AI-Assisted Healthcare</p>
          </div>
        </div>

        <div className="login-message">
          <span>Welcome back</span>

          <h1>
            Your health information,
            <br />
            <strong>securely connected.</strong>
          </h1>

          <p>
            Access your medical information, healthcare resources,
            and personalized assistance from one secure platform.
          </p>
        </div>

        <div className="login-features">

          <div>
            <span>🔐</span>
            <div>
              <strong>Secure Access</strong>
              <small>Your information stays protected.</small>
            </div>
          </div>

          <div>
            <span>🤖</span>
            <div>
              <strong>AI Assistance</strong>
              <small>Get intelligent healthcare support.</small>
            </div>
          </div>

          <div>
            <span>⚡</span>
            <div>
              <strong>Emergency Ready</strong>
              <small>Important information when needed.</small>
            </div>
          </div>

        </div>

      </div>


      {/* Right Section */}
      <div className="login-right">

        <div className="login-card">

          <div className="card-icon">
            +
          </div>

          <h1>Sign in</h1>

          <p className="login-subtitle">
            Access your healthcare dashboard
          </p>


          {/* Email */}
          <div className="input-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
            />

          </div>


          {/* Password */}
          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
            />

          </div>


          {/* Remember + Forgot */}
          <div className="login-options">

            <label className="remember">
              <input type="checkbox" />
              Remember me
            </label>

            <button className="forgot">
              Forgot password?
            </button>

          </div>


          {/* Login Button */}
          <button className="sign-in-button" 
          onClick={onLogin}
          type = "button"
          >
             Sign In
             <span>→</span>
            </button>


          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>


          {/* Create Account */}
          <p className="create-account">
            Don't have an account?
            <button>Create Account</button>
          </p>

          <p className="privacy-note">
            🔒 Your information is protected with secure access controls.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;
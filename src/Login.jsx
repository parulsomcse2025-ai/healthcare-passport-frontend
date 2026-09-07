import { useState } from "react";
import "./Login.css";
import { supabase } from "./supabase";

function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    console.log("Login successful:", data.user);

    if (onLogin) {
      onLogin(data.user);
    }
  };

  // ================= SIGN UP =================
  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      alert("Please fill all the fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    console.log("Signup successful:", data);

    alert(
      "Account created successfully! You can now sign in."
    );

    // Go back to login
    setIsSignUp(false);

    // Clear password
    setPassword("");
  };

  return (
    <div className="login-page">

      {/* ================= LEFT SECTION ================= */}
      <div className="login-left">

        <div className="login-brand">
          <div className="login-logo">+</div>

          <div>
            <h2>Healthcare Platform</h2>
            <p>AI-Assisted Healthcare</p>
          </div>
        </div>

        <div className="login-message">
          <span>
            {isSignUp ? "Get started" : "Welcome back"}
          </span>

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


      {/* ================= RIGHT SECTION ================= */}
      <div className="login-right">

        <div className="login-card">

          <div className="card-icon">
            +
          </div>

          <h1>
            {isSignUp ? "Create account" : "Sign in"}
          </h1>

          <p className="login-subtitle">
            {isSignUp
              ? "Create your healthcare account"
              : "Access your healthcare dashboard"}
          </p>


          {/* ================= FULL NAME ================= */}
          {isSignUp && (
            <div className="input-group">

              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

            </div>
          )}


          {/* ================= EMAIL ================= */}
          <div className="input-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>


          {/* ================= PASSWORD ================= */}
          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>


          {/* ================= LOGIN OPTIONS ================= */}
          {!isSignUp && (
            <div className="login-options">

              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                className="forgot"
                type="button"
                onClick={() =>
                  alert("Password reset functionality will be added next.")
                }
              >
                Forgot password?
              </button>

            </div>
          )}


          {/* ================= MAIN BUTTON ================= */}
          <button
            className="sign-in-button"
            onClick={isSignUp ? handleSignUp : handleLogin}
            type="button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}

            {!loading && <span>→</span>}
          </button>


          {/* ================= DIVIDER ================= */}
          <div className="divider">
            <span>or</span>
          </div>


          {/* ================= SWITCH LOGIN / SIGNUP ================= */}
          <p className="create-account">

            {isSignUp
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword("");
              }}
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>

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
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // CHECK EXISTING LOGIN
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username: username.trim(),
        password: password,
      });

      console.log("Login response:", response.data);

      if (
        response.data &&
        response.data.authenticated === true &&
        response.data.token
      ) {
        localStorage.setItem("token", response.data.token);

        localStorage.setItem(
          "authenticated",
          "true"
        );

        localStorage.setItem(
          "username",
          response.data.username || username.trim()
        );

        // Remember login preference
        localStorage.setItem(
          "rememberMe",
          rememberMe ? "true" : "false"
        );

        navigate("/", {
          replace: true,
        });
      } else {
        setError(
          "Invalid login response from server."
        );
      }
    } catch (error) {
      console.error("Login error:", error);

      console.error(
        "Backend response:",
        error.response?.data
      );

      setError(
        error.response?.data?.detail ||
          "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* =================================================
            LEFT BRAND PANEL
        ================================================= */}

        <section className="auth-brand">

          <div className="auth-brand-content">

            {/* LOGO */}

            <div className="auth-brand-logo">

              <div className="auth-brand-logo-icon">
                AI
              </div>

              <div className="auth-brand-logo-text">
                <strong>ResumeAI</strong>
                <span>
                  Intelligent Resume Screening
                </span>
              </div>

            </div>

            {/* BADGE */}

            <div className="auth-brand-badge">
              AI-Powered Recruitment
            </div>

            {/* HEADING */}

            <h2>
              Find the right{" "}
              <span>talent faster.</span>
            </h2>

            <p className="auth-brand-description">
              Screen resumes, match candidates with
              jobs, analyze skills, and make smarter
              recruitment decisions using AI.
            </p>

            {/* FEATURES */}

            <div className="auth-features">

              <div className="auth-feature">

                <div className="auth-feature-icon">
                  ✓
                </div>

                <div className="auth-feature-content">
                  <strong>
                    Intelligent Resume Screening
                  </strong>

                  <span>
                    Automatically analyze resumes
                    using Machine Learning.
                  </span>
                </div>

              </div>


              <div className="auth-feature">

                <div className="auth-feature-icon">
                  ✓
                </div>

                <div className="auth-feature-content">
                  <strong>
                    Smart Job Matching
                  </strong>

                  <span>
                    Match candidates with the most
                    suitable job opportunities.
                  </span>
                </div>

              </div>


              <div className="auth-feature">

                <div className="auth-feature-icon">
                  ✓
                </div>

                <div className="auth-feature-content">
                  <strong>
                    Skill Gap Analysis
                  </strong>

                  <span>
                    Identify matched and missing
                    skills instantly.
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="auth-brand-footer">
            AI Resume Screening Platform © 2026
          </div>

        </section>


        {/* =================================================
            RIGHT LOGIN PANEL
        ================================================= */}

        <section className="auth-form-section">

          <div className="auth-card">

            {/* HEADER */}

            <div className="auth-header">

              <p className="auth-eyebrow">
                Recruiter Portal
              </p>

              <h1>
                Welcome back
              </h1>

              <p>
                Sign in to continue to your
                recruitment dashboard.
              </p>

            </div>


            {/* FORM */}

            <form
              className="auth-form"
              onSubmit={handleLogin}
            >

              {/* USERNAME */}

              <div className="auth-field">

                <label htmlFor="username">
                  Username
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    👤
                  </span>

                  <input
                    id="username"
                    className="auth-input"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(event) => {
                      setUsername(
                        event.target.value
                      );
                      setError("");
                    }}
                    autoComplete="username"
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="auth-field">

                <div className="auth-password-row">

                  <label htmlFor="password">
                    Password
                  </label>

                </div>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    className="auth-input auth-password-input"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value
                      );
                      setError("");
                    }}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="auth-show-password"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* REMEMBER ME */}

              <div className="auth-options">

                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                />

                <label htmlFor="rememberMe">
                  Remember me
                </label>

              </div>


              {/* ERROR */}

              {error && (
                <div className="auth-error">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}


              {/* LOGIN BUTTON */}

              <button
                className="auth-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="auth-button-arrow">
                      →
                    </span>
                  </>
                )}
              </button>

            </form>


            {/* DIVIDER */}

            <div className="auth-divider">
              <span>OR</span>
            </div>


            {/* SIGNUP */}

            <p className="auth-switch">

              Don't have an account?{" "}

              <Link to="/signup">
                Create account
              </Link>

            </p>


            {/* SECURITY */}

            <div className="auth-security">

              <span>🔒</span>

              <span>
                Your credentials are securely
                processed by the platform.
              </span>

            </div>


            <div className="auth-footer">
              AI Resume Screening Platform
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Login;
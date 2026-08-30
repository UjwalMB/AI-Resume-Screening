import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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
  // SIGNUP
  // =====================================================

  const handleSignup = async (event) => {
    event.preventDefault();

    setError("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (username.trim().length < 3) {
      setError(
        "Username must be at least 3 characters."
      );
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 4) {
      setError(
        "Password must be at least 4 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    // ---------------------------------------------------
    // SIGNUP REQUEST
    // ---------------------------------------------------

    try {
      const response = await api.post(
        "/auth/signup",
        {
          username: username.trim(),
          password: password,
        }
      );

      console.log(
        "Signup response:",
        response.data
      );

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      if (
        response.data &&
        response.data.authenticated === true &&
        response.data.token
      ) {
        localStorage.setItem(
          "token",
          response.data.token
        );

        localStorage.setItem(
          "authenticated",
          "true"
        );

        localStorage.setItem(
          "username",
          response.data.username ||
            username.trim()
        );

        navigate("/", {
          replace: true,
        });
      } else {
        setError(
          "Invalid signup response from server."
        );
      }
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      setError(
        error.response?.data?.detail ||
          "Unable to create account. Please try again."
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

                <strong>
                  ResumeAI
                </strong>

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
              Build your{" "}
              <span>smart hiring team.</span>
            </h2>


            <p className="auth-brand-description">
              Create your recruiter account and
              start screening resumes, matching
              candidates, and making better hiring
              decisions with AI.
            </p>


            {/* FEATURES */}

            <div className="auth-features">

              <div className="auth-feature">

                <div className="auth-feature-icon">
                  ✓
                </div>

                <div className="auth-feature-content">

                  <strong>
                    AI Resume Screening
                  </strong>

                  <span>
                    Automatically analyze and
                    evaluate candidate resumes.
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
                    Find candidates that match
                    your job requirements.
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
                    Quickly identify candidate
                    strengths and missing skills.
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
            RIGHT SIGNUP PANEL
        ================================================= */}

        <section className="auth-form-section">

          <div className="auth-card">

            {/* HEADER */}

            <div className="auth-header">

              <p className="auth-eyebrow">
                Recruiter Portal
              </p>

              <h1>
                Create account
              </h1>

              <p>
                Set up your recruiter account
                to get started.
              </p>

            </div>


            {/* FORM */}

            <form
              className="auth-form"
              onSubmit={handleSignup}
            >

              {/* USERNAME */}

              <div className="auth-field">

                <label htmlFor="signup-username">
                  Username
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    👤
                  </span>

                  <input
                    id="signup-username"
                    className="auth-input"
                    type="text"
                    placeholder="Choose a username"
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

                <label htmlFor="signup-password">
                  Password
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    🔒
                  </span>

                  <input
                    id="signup-password"
                    className="auth-input auth-password-input"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value
                      );
                      setError("");
                    }}
                    autoComplete="new-password"
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


                <p className="auth-password-strength">
                  Use at least 4 characters.
                </p>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="auth-field">

                <label htmlFor="confirm-password">
                  Confirm Password
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    🔐
                  </span>

                  <input
                    id="confirm-password"
                    className="auth-input auth-password-input"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value
                      );
                      setError("");
                    }}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="auth-show-password"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="auth-error">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}


              {/* SIGNUP BUTTON */}

              <button
                className="auth-button"
                type="submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="auth-spinner"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
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


            {/* LOGIN */}

            <p className="auth-switch">

              Already have an account?{" "}

              <Link to="/login">
                Sign in
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

export default Signup;
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";


function Signup() {

  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =====================================================
  // CHECK EXISTING LOGIN
  // =====================================================

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {

      navigate("/", {
        replace: true
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

      setError(
        "Please enter a username."
      );

      return;
    }

    if (!password) {

      setError(
        "Please enter a password."
      );

      return;
    }

    if (password.length < 4) {

      setError(
        "Password must be at least 4 characters."
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
          password: password
        }
      );

      console.log(
        "Signup response:",
        response.data
      );


      // -------------------------------------------------
      // CHECK RESPONSE
      // -------------------------------------------------

      if (
        response.data &&
        response.data.authenticated === true &&
        response.data.token
      ) {

        // -----------------------------------------------
        // SAVE TOKEN
        // -----------------------------------------------

        localStorage.setItem(
          "token",
          response.data.token
        );

        // -----------------------------------------------
        // SAVE AUTH STATUS
        // -----------------------------------------------

        localStorage.setItem(
          "authenticated",
          "true"
        );

        // -----------------------------------------------
        // SAVE USERNAME
        // -----------------------------------------------

        localStorage.setItem(
          "username",
          response.data.username
        );

        console.log(
          "Signup successful"
        );

        // -----------------------------------------------
        // GO TO DASHBOARD
        // -----------------------------------------------

        navigate("/", {
          replace: true
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

      setError(
        error.response?.data?.detail ||
        "Unable to sign up. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="login-page">

      <div className="login-card">

        {/* TITLE */}

        <h1>
          AI Resume Screening
        </h1>

        <p>
          Create Account
        </p>


        {/* SIGNUP FORM */}

        <form onSubmit={handleSignup}>

          {/* USERNAME */}

          <label>
            Username
          </label>

          <input
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


          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            type="password"
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


          {/* CONFIRM PASSWORD */}

          <label>
            Confirm Password
          </label>

          <input
            type="password"
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


          {/* ERROR */}

          {error && (

            <p className="error">
              {error}
            </p>

          )}


          {/* SIGNUP BUTTON */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Creating account..."
              : "Sign Up"}

          </button>

        </form>


        {/* LOGIN LINK */}

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>

  );

}


export default Signup;

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";


function Login() {

  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =====================================================
  // CHECK EXISTING LOGIN
  // =====================================================

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token === "admin-token") {

      navigate("/", {
        replace: true
      });

    }

  }, [navigate]);


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!username.trim()) {

      setError(
        "Please enter your username."
      );

      return;
    }

    if (!password) {

      setError(
        "Please enter your password."
      );

      return;
    }

    setLoading(true);

    // ---------------------------------------------------
    // LOGIN REQUEST
    // ---------------------------------------------------

    try {

      const response = await api.post(
        "/auth/login",
        {
          username: username.trim(),
          password: password
        }
      );

      console.log(
        "Login response:",
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
          "Login successful"
        );

        console.log(
          "Token:",
          response.data.token
        );

        // -----------------------------------------------
        // GO TO DASHBOARD
        // -----------------------------------------------

        navigate("/", {
          replace: true
        });

      } else {

        setError(
          "Invalid login response from server."
        );

      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      setError(
        error.response?.data?.detail ||
        "Unable to login. Please try again."
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
          Recruiter Login
        </p>


        {/* LOGIN FORM */}

        <form onSubmit={handleLogin}>

          {/* USERNAME */}

          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Enter username"
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
            placeholder="Enter password"
            value={password}
            onChange={(event) => {

              setPassword(
                event.target.value
              );

              setError("");

            }}
            autoComplete="current-password"
          />


          {/* ERROR */}

          {error && (

            <p className="error">
              {error}
            </p>

          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

        {/* SIGNUP LINK */}

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">
            Sign Up
          </Link>
        </p>

      </div>

    </div>

  );

}


export default Login;
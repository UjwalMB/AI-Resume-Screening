import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // =====================================================
  // CHECK IF ALREADY LOGGED IN
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
  // LOGIN
  // =====================================================

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");


    // ===================================================
    // VALIDATION
    // ===================================================

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


    // ===================================================
    // API LOGIN
    // ===================================================

    try {

      const response = await axios.post(

        "http://127.0.0.1:8000/auth/login",

        {
          username:
            username.trim(),

          password:
            password
        }

      );


      console.log(
        "Login response:",
        response.data
      );


      // =================================================
      // LOGIN SUCCESS
      // =================================================

      if (response.data.authenticated) {


        // -----------------------------------------------
        // SAVE AUTHENTICATION STATUS
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


        // -----------------------------------------------
        // SAVE TOKEN
        // -----------------------------------------------

        localStorage.setItem(
          "token",
          response.data.token
        );


        console.log(
          "Token saved:",
          response.data.token
        );


        // -----------------------------------------------
        // GO TO DASHBOARD
        // -----------------------------------------------

        navigate("/", {
          replace: true
        });

      }


    } catch (error) {

      console.error(
        "Login failed:",
        error
      );


      console.error(
        "Backend response:",
        error.response?.data
      );


      // -----------------------------------------------
      // DISPLAY BACKEND ERROR
      // -----------------------------------------------

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

    <div className="login-page">

      <div className="login-card">


        {/* =================================================
            TITLE
        ================================================= */}

        <h1>
          AI Resume Screening
        </h1>


        <p>
          Recruiter Login
        </p>


        {/* =================================================
            LOGIN FORM
        ================================================= */}

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


      </div>

    </div>

  );

}


export default Login;
import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("authenticated");
    localStorage.removeItem("username");

    navigate("/login");
  };


  return (
    <nav className="navbar">

      <div className="navbar-brand">

        <Link to="/">
          AI Resume Screening
        </Link>

      </div>


      <div className="navbar-links">

        <Link to="/">
          Dashboard
        </Link>

        <Link to="/jobs">
          Jobs
        </Link>

        <Link to="/upload">
          Upload Resume
        </Link>

        <Link to="/candidates">
          Candidates
        </Link>

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;
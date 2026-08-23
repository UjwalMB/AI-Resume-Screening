import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    total_candidates: 0,
    shortlisted: 0,
    rejected: 0,
    review: 0,
    average_match_percentage: 0,
  });

  const [candidates, setCandidates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");


      // -------------------------------------------------
      // GET DASHBOARD STATISTICS
      // -------------------------------------------------

      const statsResponse = await api.get(
        "/dashboard/stats"
      );


      setStats({
        total_candidates:
          statsResponse.data.total_candidates ?? 0,

        shortlisted:
          statsResponse.data.shortlisted ?? 0,

        rejected:
          statsResponse.data.rejected ?? 0,

        review:
          statsResponse.data.review ?? 0,

        average_match_percentage:
          Number(
            statsResponse.data.average_match_percentage ?? 0
          ),
      });


      // -------------------------------------------------
      // GET CANDIDATES
      // -------------------------------------------------

      const candidatesResponse = await api.get(
        "/candidates"
      );


      setCandidates(
        Array.isArray(candidatesResponse.data)
          ? candidatesResponse.data
          : []
      );

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load dashboard data."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // RECENT CANDIDATES
  // =====================================================

  const recentCandidates = [...candidates]
    .sort(
      (a, b) =>
        Number(b.candidate_id || 0) -
        Number(a.candidate_id || 0)
    )
    .slice(0, 5);


  // =====================================================
  // MATCH PERCENTAGE
  // =====================================================

  const matchPercentage = Math.min(
    Math.max(
      Number(
        stats.average_match_percentage || 0
      ),
      0
    ),
    100
  );


  // =====================================================
  // DECISION TOTAL
  // =====================================================

  const decisionTotal =
    Number(stats.shortlisted || 0) +
    Number(stats.review || 0) +
    Number(stats.rejected || 0);


  // =====================================================
  // PERCENTAGES
  // =====================================================

  const shortlistedPercentage =
    decisionTotal > 0
      ? (stats.shortlisted / decisionTotal) * 100
      : 0;

  const reviewPercentage =
    decisionTotal > 0
      ? (stats.review / decisionTotal) * 100
      : 0;

  const rejectedPercentage =
    decisionTotal > 0
      ? (stats.rejected / decisionTotal) * 100
      : 0;


  // =====================================================
  // DECISION CLASS
  // =====================================================

  const getDecisionClass = (decision) => {
    return (
      decision
        ?.toLowerCase()
        .replace(/\s+/g, "-") ||
      "review"
    );
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-container">

          <div className="dashboard-loading">

            <div className="dashboard-spinner"></div>

            <p>
              Loading dashboard...
            </p>

          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="dashboard-header">

          <div>

            <h1>
              Recruitment Dashboard
            </h1>

            <p>
              Monitor AI-powered resume screening
              and candidate performance.
            </p>

          </div>


          <Link
            to="/upload"
            className="dashboard-upload-button"
          >
            + Screen Resume
          </Link>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="dashboard-stats">


          {/* TOTAL */}

          <div className="dashboard-stat-card">

            <div className="stat-icon total">
              👥
            </div>

            <div className="stat-content">

              <span>
                Total Candidates
              </span>

              <strong>
                {stats.total_candidates}
              </strong>

            </div>

          </div>


          {/* SHORTLISTED */}

          <div className="dashboard-stat-card">

            <div className="stat-icon shortlisted">
              ✓
            </div>

            <div className="stat-content">

              <span>
                Shortlisted
              </span>

              <strong>
                {stats.shortlisted}
              </strong>

            </div>

          </div>


          {/* REVIEW */}

          <div className="dashboard-stat-card">

            <div className="stat-icon review">
              !
            </div>

            <div className="stat-content">

              <span>
                Under Review
              </span>

              <strong>
                {stats.review}
              </strong>

            </div>

          </div>


          {/* REJECTED */}

          <div className="dashboard-stat-card">

            <div className="stat-icon rejected">
              ×
            </div>

            <div className="stat-content">

              <span>
                Rejected
              </span>

              <strong>
                {stats.rejected}
              </strong>

            </div>

          </div>

        </div>


        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="dashboard-main-grid">


          {/* =================================================
              AVERAGE MATCH
          ================================================= */}

          <div className="dashboard-card match-card">

            <div className="card-header">

              <div>

                <h2>
                  Average Job Match
                </h2>

                <p>
                  Overall candidate compatibility
                </p>

              </div>

            </div>


            <div className="match-content">

              <div
                className="match-circle"
                style={{
                  "--match-value":
                    `${matchPercentage}%`,
                }}
              >

                <div className="match-circle-inner">

                  <strong>
                    {matchPercentage.toFixed(2)}%
                  </strong>

                  <span>
                    Match
                  </span>

                </div>

              </div>


              <div className="match-info">

                <p>
                  Average match score across all
                  screened candidates.
                </p>

                <Link to="/candidates">
                  View all candidates →
                </Link>

              </div>

            </div>

          </div>


          {/* =================================================
              DECISION DISTRIBUTION
          ================================================= */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Candidate Decisions
                </h2>

                <p>
                  Current screening distribution
                </p>

              </div>

            </div>


            <div className="decision-chart">


              {/* SHORTLISTED */}

              <div className="decision-row">

                <div className="decision-label">

                  <span className="decision-dot shortlisted"></span>

                  <span>
                    Shortlisted
                  </span>

                  <strong>
                    {stats.shortlisted}
                  </strong>

                </div>

                <div className="decision-bar">

                  <div
                    className="decision-bar-fill shortlisted"
                    style={{
                      width:
                        `${shortlistedPercentage}%`,
                    }}
                  ></div>

                </div>

              </div>


              {/* REVIEW */}

              <div className="decision-row">

                <div className="decision-label">

                  <span className="decision-dot review"></span>

                  <span>
                    Review
                  </span>

                  <strong>
                    {stats.review}
                  </strong>

                </div>

                <div className="decision-bar">

                  <div
                    className="decision-bar-fill review"
                    style={{
                      width:
                        `${reviewPercentage}%`,
                    }}
                  ></div>

                </div>

              </div>


              {/* REJECTED */}

              <div className="decision-row">

                <div className="decision-label">

                  <span className="decision-dot rejected"></span>

                  <span>
                    Rejected
                  </span>

                  <strong>
                    {stats.rejected}
                  </strong>

                </div>

                <div className="decision-bar">

                  <div
                    className="decision-bar-fill rejected"
                    style={{
                      width:
                        `${rejectedPercentage}%`,
                    }}
                  ></div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            RECENT CANDIDATES
        ================================================= */}

        <div className="dashboard-card recent-card">

          <div className="card-header">

            <div>

              <h2>
                Recent Candidates
              </h2>

              <p>
                Latest resumes processed by the
                screening system.
              </p>

            </div>


            <Link
              to="/candidates"
              className="view-all-link"
            >
              View All
            </Link>

          </div>


          {recentCandidates.length === 0 ? (

            <div className="dashboard-empty">

              <p>
                No candidates have been screened yet.
              </p>

              <Link to="/upload">
                Screen your first resume
              </Link>

            </div>

          ) : (

            <div className="recent-table-wrapper">

              <table className="recent-table">

                <thead>

                  <tr>

                    <th>
                      Candidate
                    </th>

                    <th>
                      Resume
                    </th>

                    <th>
                      Job
                    </th>

                    <th>
                      Score
                    </th>

                    <th>
                      Match
                    </th>

                    <th>
                      Decision
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentCandidates.map(
                    (candidate) => (

                      <tr
                        key={
                          candidate.candidate_id
                        }
                      >

                        {/* CANDIDATE */}

                        <td>

                          <Link
                            to={`/candidates/${candidate.candidate_id}`}
                            className="candidate-link"
                          >
                            #
                            {
                              candidate.candidate_id
                            }
                          </Link>

                        </td>


                        {/* RESUME */}

                        <td>

                          <span
                            className="dashboard-resume-name"
                            title={
                              candidate.filename
                            }
                          >
                            {
                              candidate.filename ||
                              "N/A"
                            }
                          </span>

                        </td>


                        {/* JOB */}

                        <td>

                          {candidate.job_id
                            ? `#${candidate.job_id}`
                            : "N/A"}

                        </td>


                        {/* SCORE */}

                        <td>

                          <strong>
                            {
                              candidate.score ??
                              0
                            }
                            /100
                          </strong>

                        </td>


                        {/* MATCH */}

                        <td>

                          <strong className="dashboard-match">

                            {
                              candidate.match_percentage ??
                              0
                            }%

                          </strong>

                        </td>


                        {/* DECISION */}

                        <td>

                          <span
                            className={`dashboard-decision ${getDecisionClass(
                              candidate.decision
                            )}`}
                          >
                            {
                              candidate.decision ||
                              "REVIEW"
                            }
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <div className="quick-actions">

          <Link
            to="/upload"
            className="quick-action"
          >

            <span className="quick-action-icon">
              ↑
            </span>

            <div>

              <strong>
                Screen Resume
              </strong>

              <span>
                Upload and analyze a resume
              </span>

            </div>

          </Link>


          <Link
            to="/candidates"
            className="quick-action"
          >

            <span className="quick-action-icon">
              👥
            </span>

            <div>

              <strong>
                View Candidates
              </strong>

              <span>
                Browse all screened candidates
              </span>

            </div>

          </Link>


          <Link
            to="/jobs"
            className="quick-action"
          >

            <span className="quick-action-icon">
              💼
            </span>

            <div>

              <strong>
                Manage Jobs
              </strong>

              <span>
                Create and manage job openings
              </span>

            </div>

          </Link>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
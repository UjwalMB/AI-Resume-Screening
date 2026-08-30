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

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const statsResponse = await api.get("/dashboard/stats");

      setStats({
        total_candidates:
          Number(statsResponse.data.total_candidates) || 0,

        shortlisted:
          Number(statsResponse.data.shortlisted) || 0,

        rejected:
          Number(statsResponse.data.rejected) || 0,

        review:
          Number(statsResponse.data.review) || 0,

        average_match_percentage:
          Number(
            statsResponse.data.average_match_percentage
          ) || 0,
      });

      const candidatesResponse =
        await api.get("/candidates");

      const candidateData =
        Array.isArray(candidatesResponse.data)
          ? candidatesResponse.data
          : [];

      setCandidates(candidateData);
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RECENT CANDIDATES
  // =========================================================

  const recentCandidates = [...candidates]
    .sort(
      (a, b) =>
        Number(b.candidate_id || 0) -
        Number(a.candidate_id || 0)
    )
    .slice(0, 5);

  // =========================================================
  // DECISION TOTAL
  // =========================================================

  const decisionTotal =
    stats.shortlisted +
    stats.review +
    stats.rejected;

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

  // =========================================================
  // MATCH
  // =========================================================

  const matchPercentage = Math.min(
    Math.max(
      Number(stats.average_match_percentage) || 0,
      0
    ),
    100
  );

  // =========================================================
  // HELPERS
  // =========================================================

  const getDecisionClass = (decision) => {
    const value =
      decision?.toLowerCase() || "review";

    if (value.includes("shortlist")) {
      return "shortlisted";
    }

    if (value.includes("reject")) {
      return "rejected";
    }

    return "review";
  };

  const getScoreClass = (score) => {
    const value = Number(score) || 0;

    if (value >= 80) return "excellent";
    if (value >= 60) return "good";
    return "low";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>

          <h2>Loading AI Dashboard</h2>

          <p>
            Fetching screening analytics...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* =================================================
            HERO HEADER
        ================================================= */}

        <section className="dashboard-hero">

          <div className="hero-content">

            <div className="hero-badge">
              <span className="live-dot"></span>
              AI SCREENING SYSTEM
            </div>

            <h1>
              Recruitment
              <span> Intelligence Dashboard</span>
            </h1>

            <p>
              Monitor AI-powered resume screening,
              candidate matching and recruitment
              decisions from one place.
            </p>

            <div className="hero-actions">

              <Link
                to="/upload"
                className="primary-action"
              >
                <span>＋</span>
                Screen New Resume
              </Link>

              <Link
                to="/candidates"
                className="secondary-action"
              >
                View Candidates
                <span>→</span>
              </Link>

            </div>

          </div>

          <div className="hero-visual">

            <div className="ai-orb">
              <div className="ai-orb-inner">
                <span>AI</span>
                <small>POWERED</small>
              </div>
            </div>

            <div className="floating-card card-one">
              <span>🎯</span>
              <div>
                <strong>SBERT</strong>
                <small>Semantic Matching</small>
              </div>
            </div>

            <div className="floating-card card-two">
              <span>🧠</span>
              <div>
                <strong>ML</strong>
                <small>Prediction Engine</small>
              </div>
            </div>

          </div>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="dashboard-error">
            <span>⚠</span>
            {error}
          </div>
        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="dashboard-stats">

          <div className="dashboard-stat-card total-card">
            <div className="stat-icon">
              👥
            </div>

            <div className="stat-content">
              <span>Total Candidates</span>
              <strong>
                {stats.total_candidates}
              </strong>
              <small>
                Resumes screened
              </small>
            </div>
          </div>


          <div className="dashboard-stat-card shortlisted-card">
            <div className="stat-icon">
              ✓
            </div>

            <div className="stat-content">
              <span>Shortlisted</span>
              <strong>
                {stats.shortlisted}
              </strong>
              <small>
                Strong candidates
              </small>
            </div>
          </div>


          <div className="dashboard-stat-card review-card">
            <div className="stat-icon">
              !
            </div>

            <div className="stat-content">
              <span>Under Review</span>
              <strong>
                {stats.review}
              </strong>
              <small>
                Need recruiter review
              </small>
            </div>
          </div>


          <div className="dashboard-stat-card rejected-card">
            <div className="stat-icon">
              ×
            </div>

            <div className="stat-content">
              <span>Rejected</span>
              <strong>
                {stats.rejected}
              </strong>
              <small>
                Below threshold
              </small>
            </div>
          </div>

        </section>


        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="analytics-grid">

          {/* MATCH */}

          <div className="dashboard-card match-card">

            <div className="card-header">
              <div>
                <div className="section-label">
                  AI ANALYTICS
                </div>

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
                    {matchPercentage.toFixed(1)}%
                  </strong>

                  <span>
                    MATCH
                  </span>
                </div>
              </div>

              <div className="match-info">

                <div className="metric-highlight">
                  <span>Overall compatibility</span>

                  <strong>
                    {matchPercentage >= 80
                      ? "Excellent"
                      : matchPercentage >= 60
                      ? "Good"
                      : "Needs Improvement"}
                  </strong>
                </div>

                <p>
                  Average skill and job compatibility
                  across screened candidates.
                </p>

                <Link to="/candidates">
                  Explore candidate matches →
                </Link>

              </div>

            </div>

          </div>


          {/* DECISIONS */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <div className="section-label">
                  SCREENING ANALYTICS
                </div>

                <h2>
                  Candidate Decisions
                </h2>

                <p>
                  AI screening distribution
                </p>
              </div>

              <div className="decision-total">
                {decisionTotal}
                <span>Total</span>
              </div>

            </div>

            <div className="decision-chart">

              <div className="decision-row">

                <div className="decision-label">
                  <span className="decision-dot shortlisted"></span>

                  <span>
                    Shortlisted
                  </span>

                  <strong>
                    {stats.shortlisted}
                  </strong>

                  <small>
                    {shortlistedPercentage.toFixed(0)}%
                  </small>
                </div>

                <div className="decision-bar">
                  <div
                    className="decision-bar-fill shortlisted"
                    style={{
                      width:
                        `${shortlistedPercentage}%`,
                    }}
                  />
                </div>

              </div>


              <div className="decision-row">

                <div className="decision-label">
                  <span className="decision-dot review"></span>

                  <span>
                    Review
                  </span>

                  <strong>
                    {stats.review}
                  </strong>

                  <small>
                    {reviewPercentage.toFixed(0)}%
                  </small>
                </div>

                <div className="decision-bar">
                  <div
                    className="decision-bar-fill review"
                    style={{
                      width:
                        `${reviewPercentage}%`,
                    }}
                  />
                </div>

              </div>


              <div className="decision-row">

                <div className="decision-label">
                  <span className="decision-dot rejected"></span>

                  <span>
                    Rejected
                  </span>

                  <strong>
                    {stats.rejected}
                  </strong>

                  <small>
                    {rejectedPercentage.toFixed(0)}%
                  </small>
                </div>

                <div className="decision-bar">
                  <div
                    className="decision-bar-fill rejected"
                    style={{
                      width:
                        `${rejectedPercentage}%`,
                    }}
                  />
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            AI FEATURES
        ================================================= */}

        <section className="ai-features">

          <div className="feature-card">
            <div className="feature-icon">
              🧠
            </div>

            <div>
              <strong>Machine Learning</strong>
              <span>
                Resume classification
                and prediction
              </span>
            </div>
          </div>


          <div className="feature-card">
            <div className="feature-icon">
              🔎
            </div>

            <div>
              <strong>SBERT Matching</strong>
              <span>
                Semantic resume-job
                similarity
              </span>
            </div>
          </div>


          <div className="feature-card">
            <div className="feature-icon">
              🛠
            </div>

            <div>
              <strong>Skill Analysis</strong>
              <span>
                Matched and missing
                skills
              </span>
            </div>
          </div>


          <div className="feature-card">
            <div className="feature-icon">
              💼
            </div>

            <div>
              <strong>Job Recommendations</strong>
              <span>
                Find suitable roles
                automatically
              </span>
            </div>
          </div>

        </section>


        {/* =================================================
            RECENT CANDIDATES
        ================================================= */}

        <section className="dashboard-card recent-card">

          <div className="card-header">

            <div>
              <div className="section-label">
                CANDIDATE ACTIVITY
              </div>

              <h2>
                Recent Candidates
              </h2>

              <p>
                Latest resumes processed by
                the AI screening system.
              </p>
            </div>

            <Link
              to="/candidates"
              className="view-all-link"
            >
              View All →
            </Link>

          </div>


          {recentCandidates.length === 0 ? (

            <div className="dashboard-empty">

              <div className="empty-icon">
                📄
              </div>

              <h3>
                No Candidates Yet
              </h3>

              <p>
                Upload your first resume to
                start AI screening.
              </p>

              <Link to="/upload">
                Screen First Resume
              </Link>

            </div>

          ) : (

            <div className="recent-table-wrapper">

              <table className="recent-table">

                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Resume</th>
                    <th>Job</th>
                    <th>Score</th>
                    <th>Match</th>
                    <th>Decision</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {recentCandidates.map(
                    (candidate) => {

                      const score =
                        Number(candidate.score) || 0;

                      const match =
                        Number(
                          candidate.match_percentage
                        ) || 0;

                      return (
                        <tr
                          key={
                            candidate.candidate_id
                          }
                        >

                          <td>
                            <Link
                              to={`/candidates/${candidate.candidate_id}`}
                              className="candidate-link"
                            >
                              <span className="candidate-mini-avatar">
                                C
                              </span>

                              <span>
                                #
                                {
                                  candidate.candidate_id
                                }
                              </span>
                            </Link>
                          </td>


                          <td>
                            <span
                              className="dashboard-resume-name"
                              title={
                                candidate.filename
                              }
                            >
                              📄{" "}
                              {
                                candidate.filename ||
                                "Resume"
                              }
                            </span>
                          </td>


                          <td>
                            <span className="job-badge">
                              {candidate.job_id
                                ? `Job #${candidate.job_id}`
                                : "N/A"}
                            </span>
                          </td>


                          <td>
                            <div className="table-score">
                              <strong
                                className={getScoreClass(
                                  score
                                )}
                              >
                                {score.toFixed(1)}
                              </strong>

                              <span>/100</span>
                            </div>
                          </td>


                          <td>
                            <div className="table-match">
                              <div className="mini-progress">
                                <div
                                  style={{
                                    width:
                                      `${Math.min(
                                        Math.max(
                                          match,
                                          0
                                        ),
                                        100
                                      )}%`,
                                  }}
                                />
                              </div>

                              <strong>
                                {match.toFixed(0)}%
                              </strong>
                            </div>
                          </td>


                          <td>
                            <span
                              className={`dashboard-decision ${getDecisionClass(
                                candidate.decision
                              )}`}
                            >
                              {candidate.decision ||
                                "REVIEW"}
                            </span>
                          </td>


                          <td>
                            <Link
                              to={`/candidates/${candidate.candidate_id}`}
                              className="table-view-button"
                            >
                              View
                            </Link>
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="quick-section">

          <div className="quick-section-header">
            <div>
              <div className="section-label">
                WORKSPACE
              </div>

              <h2>
                Quick Actions
              </h2>
            </div>
          </div>


          <div className="quick-actions">

            <Link
              to="/upload"
              className="quick-action primary-quick"
            >
              <span className="quick-action-icon">
                ↑
              </span>

              <div>
                <strong>
                  Screen Resume
                </strong>

                <span>
                  Upload and analyze a new resume
                </span>
              </div>

              <span className="quick-arrow">
                →
              </span>
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

              <span className="quick-arrow">
                →
              </span>
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

              <span className="quick-arrow">
                →
              </span>
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}

export default Dashboard;
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Candidates.css";

function Candidates() {
  // =====================================================
  // STATE
  // =====================================================

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD CANDIDATES
  // =====================================================

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/candidates");

      console.log("Candidates API:", response.data);

      setCandidates(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Failed to load candidates:", error);

      setError(
        error.response?.data?.detail ||
          "Unable to load candidates. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD JOBS
  // =====================================================

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs");

      console.log("Jobs API:", response.data);

      setJobs(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
  };

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredCandidates = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const filtered = candidates.filter((candidate) => {
      const candidateId = String(
        candidate.candidate_id ?? ""
      ).toLowerCase();

      const filename = String(
        candidate.filename ?? ""
      ).toLowerCase();

      const decision = String(
        candidate.decision ?? "REVIEW"
      ).toLowerCase();

      const jobTitle = String(
        candidate.job_title ?? ""
      ).toLowerCase();

      // Search
      const matchesSearch =
        !searchText ||
        candidateId.includes(searchText) ||
        filename.includes(searchText) ||
        decision.includes(searchText) ||
        jobTitle.includes(searchText);

      // Job
      const matchesJob =
        jobFilter === "all" ||
        String(candidate.job_id ?? "") ===
          String(jobFilter);

      // Decision
      const candidateDecision = String(
        candidate.decision ?? "REVIEW"
      )
        .toLowerCase()
        .trim();

      const matchesDecision =
        decisionFilter === "all" ||
        candidateDecision ===
          decisionFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesJob &&
        matchesDecision
      );
    });

    // High score first
    if (sortOrder === "high") {
      filtered.sort(
        (a, b) =>
          Number(b.score ?? 0) -
          Number(a.score ?? 0)
      );
    }

    // Low score first
    if (sortOrder === "low") {
      filtered.sort(
        (a, b) =>
          Number(a.score ?? 0) -
          Number(b.score ?? 0)
      );
    }

    // Highest match first
    if (sortOrder === "match") {
      filtered.sort(
        (a, b) =>
          Number(b.match_percentage ?? 0) -
          Number(a.match_percentage ?? 0)
      );
    }

    return filtered;
  }, [
    candidates,
    search,
    jobFilter,
    decisionFilter,
    sortOrder,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalCandidates = candidates.length;

  const shortlisted = candidates.filter(
    (candidate) => {
      const decision = String(
        candidate.decision ?? ""
      ).toLowerCase();

      return (
        decision === "shortlist" ||
        decision === "shortlisted"
      );
    }
  ).length;

  const rejected = candidates.filter(
    (candidate) => {
      const decision = String(
        candidate.decision ?? ""
      ).toLowerCase();

      return (
        decision === "reject" ||
        decision === "rejected"
      );
    }
  ).length;

  const review = candidates.filter(
    (candidate) =>
      String(candidate.decision ?? "REVIEW")
        .toLowerCase() === "review"
  ).length;

  // =====================================================
  // AVERAGE SCORE
  // =====================================================

  const averageScore =
    totalCandidates > 0
      ? candidates.reduce(
          (total, candidate) =>
            total +
            Number(candidate.score ?? 0),
          0
        ) / totalCandidates
      : 0;

  const averageMatch =
    totalCandidates > 0
      ? candidates.reduce(
          (total, candidate) =>
            total +
            Number(
              candidate.match_percentage ?? 0
            ),
          0
        ) / totalCandidates
      : 0;

  // =====================================================
  // DECISION CLASS
  // =====================================================

  const getDecisionClass = (decision) => {
    const value = String(
      decision || "REVIEW"
    )
      .toLowerCase()
      .trim();

    if (
      value === "shortlist" ||
      value === "shortlisted"
    ) {
      return "shortlisted";
    }

    if (
      value === "reject" ||
      value === "rejected"
    ) {
      return "rejected";
    }

    return "review";
  };

  // =====================================================
  // SCORE CLASS
  // =====================================================

  const getScoreClass = (score) => {
    const value = Number(score ?? 0);

    if (value >= 80) return "score-high";
    if (value >= 60) return "score-medium";

    return "score-low";
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetFilters = () => {
    setSearch("");
    setJobFilter("all");
    setDecisionFilter("all");
    setSortOrder("none");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="candidates-page">
        <div className="candidates-loading">
          <div className="candidates-spinner"></div>

          <h2>Loading Candidates</h2>

          <p>
            Fetching AI screening results...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="candidates-page">

      <div className="candidates-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="candidates-header">

          <div>
            <div className="page-eyebrow">
              AI RECRUITMENT
            </div>

            <h1>
              Candidate Intelligence
            </h1>

            <p>
              Review, compare and rank candidates
              using AI-powered resume screening.
            </p>
          </div>

          <Link
            to="/upload"
            className="screen-resume-button"
          >
            <span>+</span>
            Screen Resume
          </Link>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="candidates-error">
            <div className="error-icon">
              !
            </div>

            <div>
              <strong>
                Unable to load candidates
              </strong>

              <p>{error}</p>
            </div>

            <button
              onClick={fetchCandidates}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        {!error && (
          <div className="candidate-stats">

            <div className="stat-card total-card">
              <div className="stat-top">
                <span className="stat-icon">
                  👥
                </span>

                <span className="stat-label">
                  TOTAL
                </span>
              </div>

              <strong>
                {totalCandidates}
              </strong>

              <p>
                Screened candidates
              </p>
            </div>

            <div className="stat-card shortlisted-card">
              <div className="stat-top">
                <span className="stat-icon">
                  ✓
                </span>

                <span className="stat-label">
                  SHORTLISTED
                </span>
              </div>

              <strong>
                {shortlisted}
              </strong>

              <p>
                Strong candidates
              </p>
            </div>

            <div className="stat-card review-card">
              <div className="stat-top">
                <span className="stat-icon">
                  !
                </span>

                <span className="stat-label">
                  REVIEW
                </span>
              </div>

              <strong>
                {review}
              </strong>

              <p>
                Need recruiter review
              </p>
            </div>

            <div className="stat-card rejected-card">
              <div className="stat-top">
                <span className="stat-icon">
                  ×
                </span>

                <span className="stat-label">
                  REJECTED
                </span>
              </div>

              <strong>
                {rejected}
              </strong>

              <p>
                Low compatibility
              </p>
            </div>

          </div>
        )}

        {/* =================================================
            PERFORMANCE SUMMARY
        ================================================= */}

        {!error && totalCandidates > 0 && (
          <div className="performance-strip">

            <div>
              <span>
                Average Screening Score
              </span>

              <strong>
                {averageScore.toFixed(1)}
                <small>/100</small>
              </strong>
            </div>

            <div className="performance-divider"></div>

            <div>
              <span>
                Average Job Match
              </span>

              <strong>
                {averageMatch.toFixed(1)}
                <small>%</small>
              </strong>
            </div>

            <div className="performance-divider"></div>

            <div>
              <span>
                Showing
              </span>

              <strong>
                {filteredCandidates.length}
                <small>
                  {" "}of {totalCandidates}
                </small>
              </strong>
            </div>

          </div>
        )}

        {/* =================================================
            FILTER CARD
        ================================================= */}

        {!error && (
          <div className="candidate-filters-card">

            <div className="filters-heading">
              <div>
                <h2>
                  Find Candidates
                </h2>

                <p>
                  Search and filter your candidate pool.
                </p>
              </div>

              <button
                onClick={resetFilters}
                className="reset-button"
              >
                Reset Filters
              </button>
            </div>

            <div className="candidate-filters">

              {/* SEARCH */}

              <div className="filter-group search-group">

                <label>
                  Search
                </label>

                <div className="search-wrapper">

                  <span className="search-icon">
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Candidate ID, resume or job..."
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                  />

                  {search && (
                    <button
                      className="clear-search"
                      onClick={() =>
                        setSearch("")
                      }
                    >
                      ×
                    </button>
                  )}

                </div>

              </div>

              {/* JOB */}

              <div className="filter-group">

                <label>
                  Job
                </label>

                <select
                  value={jobFilter}
                  onChange={(event) =>
                    setJobFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All Jobs
                  </option>

                  {jobs.map((job) => (
                    <option
                      key={job.id}
                      value={job.id}
                    >
                      {job.title}
                    </option>
                  ))}
                </select>

              </div>

              {/* DECISION */}

              <div className="filter-group">

                <label>
                  Decision
                </label>

                <select
                  value={decisionFilter}
                  onChange={(event) =>
                    setDecisionFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All Decisions
                  </option>

                  <option value="shortlist">
                    Shortlisted
                  </option>

                  <option value="review">
                    Review
                  </option>

                  <option value="reject">
                    Rejected
                  </option>
                </select>

              </div>

              {/* SORT */}

              <div className="filter-group">

                <label>
                  Sort By
                </label>

                <select
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(
                      event.target.value
                    )
                  }
                >
                  <option value="none">
                    Default
                  </option>

                  <option value="high">
                    Highest Score
                  </option>

                  <option value="low">
                    Lowest Score
                  </option>

                  <option value="match">
                    Highest Job Match
                  </option>
                </select>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            RESULTS HEADER
        ================================================= */}

        {!error && (
          <div className="results-header">

            <div>
              <h2>
                Candidates
              </h2>

              <span>
                {filteredCandidates.length}{" "}
                candidate
                {filteredCandidates.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </span>
            </div>

            {sortOrder !== "none" && (
              <div className="active-sort">
                Sorted by{" "}
                {sortOrder === "high"
                  ? "highest score"
                  : sortOrder === "low"
                  ? "lowest score"
                  : "highest job match"}
              </div>
            )}

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error &&
          filteredCandidates.length === 0 && (
            <div className="candidates-empty">

              <div className="empty-icon">
                🔍
              </div>

              <h2>
                No candidates found
              </h2>

              <p>
                Try changing your search or
                filter settings.
              </p>

              <button
                onClick={resetFilters}
                className="empty-reset-button"
              >
                Clear Filters
              </button>

            </div>
          )}

        {/* =================================================
            TABLE
        ================================================= */}

        {!error &&
          filteredCandidates.length > 0 && (

            <div className="candidates-table-card">

              <div className="table-title-bar">

                <div>
                  <span className="live-dot"></span>
                  AI Screening Results
                </div>

                <span>
                  Updated automatically
                </span>

              </div>

              <div className="candidates-table-wrapper">

                <table className="candidates-table">

                  <thead>
                    <tr>

                      <th>
                        Candidate
                      </th>

                      <th>
                        Resume
                      </th>

                      <th>
                        Applied Job
                      </th>

                      <th>
                        Screening Score
                      </th>

                      <th>
                        Job Match
                      </th>

                      <th>
                        Decision
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredCandidates.map(
                      (candidate) => {

                        const score =
                          Number(
                            candidate.score ?? 0
                          );

                        const match =
                          Number(
                            candidate.match_percentage ??
                              0
                          );

                        const decision =
                          candidate.decision ||
                          "REVIEW";

                        const decisionClass =
                          getDecisionClass(
                            decision
                          );

                        return (
                          <tr
                            key={
                              candidate.candidate_id
                            }
                          >

                            {/* CANDIDATE */}

                            <td>

                              <Link
                                to={`/candidates/${candidate.candidate_id}`}
                                className="candidate-profile"
                              >

                                <div className="candidate-avatar">
                                  C
                                </div>

                                <div>
                                  <strong>
                                    Candidate #
                                    {
                                      candidate.candidate_id
                                    }
                                  </strong>

                                  <span>
                                    ID: #
                                    {
                                      candidate.candidate_id
                                    }
                                  </span>
                                </div>

                              </Link>

                            </td>

                            {/* RESUME */}

                            <td>

                              <div
                                className="resume-cell"
                                title={
                                  candidate.filename ||
                                  "Resume"
                                }
                              >

                                <span className="resume-icon">
                                  PDF
                                </span>

                                <span>
                                  {
                                    candidate.filename ||
                                    "Resume"
                                  }
                                </span>

                              </div>

                            </td>

                            {/* JOB */}

                            <td>

                              <div className="job-cell">

                                <strong>
                                  {
                                    candidate.job_title ||
                                    "Job #" +
                                      (
                                        candidate.job_id ||
                                        "N/A"
                                      )
                                  }
                                </strong>

                                <span>
                                  Job #
                                  {
                                    candidate.job_id ||
                                    "N/A"
                                  }
                                </span>

                              </div>

                            </td>

                            {/* SCORE */}

                            <td>

                              <div className="score-cell">

                                <div className="score-number">

                                  <strong
                                    className={getScoreClass(
                                      score
                                    )}
                                  >
                                    {score.toFixed(1)}
                                  </strong>

                                  <span>
                                    /100
                                  </span>

                                </div>

                                <div className="mini-progress">

                                  <div
                                    className={`mini-progress-fill ${getScoreClass(
                                      score
                                    )}`}
                                    style={{
                                      width: `${Math.min(
                                        Math.max(
                                          score,
                                          0
                                        ),
                                        100
                                      )}%`,
                                    }}
                                  ></div>

                                </div>

                              </div>

                            </td>

                            {/* MATCH */}

                            <td>

                              <div className="match-cell">

                                <strong>
                                  {match.toFixed(1)}%
                                </strong>

                                <div className="match-bar">

                                  <div
                                    style={{
                                      width: `${Math.min(
                                        Math.max(
                                          match,
                                          0
                                        ),
                                        100
                                      )}%`,
                                    }}
                                  ></div>

                                </div>

                              </div>

                            </td>

                            {/* DECISION */}

                            <td>

                              <span
                                className={`decision-badge ${decisionClass}`}
                              >
                                <span></span>

                                {decision}
                              </span>

                            </td>

                            {/* ACTION */}

                            <td>

                              <Link
                                to={`/candidates/${candidate.candidate_id}`}
                                className="view-button"
                              >
                                View Details
                                <span>→</span>
                              </Link>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

      </div>
    </div>
  );
}

export default Candidates;
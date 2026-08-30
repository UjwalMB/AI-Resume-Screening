import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import "./CandidateDetails.css";

function CandidateDetails() {
  const { candidateId } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchCandidate = async () => {
      try {
        console.log("=================================");
        console.log("Fetching candidate:", candidateId);
        console.log("Token:", localStorage.getItem("token"));
        console.log("=================================");

        setLoading(true);
        setError("");

        const response = await api.get(
          `/candidates/${candidateId}`
        );

        console.log("Candidate API response:", response.data);

        if (mounted) {
          setCandidate(response.data);
        }
      } catch (err) {
        console.error("Candidate API error:", err);

        if (!mounted) return;

        if (err.response?.status === 401) {
          setError(
            "Authentication required. Please login again."
          );
        } else if (err.response?.status === 404) {
          setError("Candidate not found.");
        } else {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Unable to load candidate."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (!candidateId) {
      setError("Candidate ID is missing.");
      setLoading(false);
      return;
    }

    fetchCandidate();

    return () => {
      mounted = false;
    };
  }, [candidateId]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="candidate-details-page loading-page">
        <div className="loading-card">
          <div className="spinner"></div>

          <h2>Loading Candidate</h2>

          <p>
            Fetching AI screening results...
          </p>

          <small>
            Candidate ID: {candidateId}
          </small>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="candidate-details-page error-page">
        <div className="error-card">
          <div className="error-icon">⚠️</div>

          <h2>Unable to Load Candidate</h2>

          <p>{error}</p>

          <div className="error-actions">
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Try Again
            </button>

            <Link
              to="/candidates"
              className="back-button"
            >
              ← Back to Candidates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!candidate) {
    return (
      <div className="candidate-details-page error-page">
        <div className="error-card">
          <div className="error-icon">🔍</div>

          <h2>Candidate Not Found</h2>

          <p>
            No candidate information is available.
          </p>

          <Link
            to="/candidates"
            className="back-button"
          >
            ← Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // DATA
  // =========================================================

  const matchedSkills =
    candidate.skill_gap?.matched_skills || [];

  const missingSkills =
    candidate.skill_gap?.missing_skills || [];

  const recommendations =
    candidate.skill_gap?.recommendations || [];

  const sentences =
    candidate.sentences || [];

  const recommendedJobs =
    candidate.recommended_jobs || [];

  const requiredSkills =
    candidate.required_skills || [];

  const decision =
    candidate.decision || "REVIEW";

  const decisionClass =
    decision.toLowerCase();

  const systemsAgree =
    candidate.systems_agree === true;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="candidate-details-page">

      {/* TOP BAR */}
      <div className="details-topbar">

        <Link
          to="/candidates"
          className="back-link"
        >
          ← Back to Candidates
        </Link>

        <div className="candidate-code">
          {candidate.candidate_code ||
            `Candidate #${candidate.candidate_id}`}
        </div>

      </div>


      {/* HEADER */}
      <div className="candidate-main-header">

        <div className="candidate-title">

          <div className="candidate-avatar">
            C{candidate.candidate_id}
          </div>

          <div>
            <h1>
              Candidate #{candidate.candidate_id}
            </h1>

            <p>
              {candidate.filename || "Resume"}
            </p>
          </div>

        </div>

        <div
          className={`decision-badge ${decisionClass}`}
        >
          {decision}
        </div>

      </div>


      {/* SCORE CARDS */}
      <div className="score-grid">

        <div className="score-card">
          <div className="score-icon">🎯</div>

          <div>
            <p>Screening Score</p>

            <h2>
              {candidate.score ?? 0}
              <span>/100</span>
            </h2>
          </div>
        </div>


        <div className="score-card">
          <div className="score-icon">📊</div>

          <div>
            <p>Job Match</p>

            <h2>
              {candidate.match_percentage ?? 0}
              <span>%</span>
            </h2>
          </div>
        </div>


        <div className="score-card">
          <div className="score-icon">🤖</div>

          <div>
            <p>ML Confidence</p>

            <h2>
              {candidate.ml_confidence ?? 0}
              <span>%</span>
            </h2>
          </div>
        </div>


        <div className="score-card">
          <div className="score-icon">🧠</div>

          <div>
            <p>SBERT Similarity</p>

            <h2>
              {candidate.sbert_similarity ?? 0}
              <span>%</span>
            </h2>
          </div>
        </div>

      </div>


      {/* MAIN GRID */}
      <div className="details-grid">

        {/* SCREENING RESULT */}
        <div className="candidate-card">

          <div className="card-header">
            <div>
              <h2>Screening Result</h2>
              <p>AI evaluation summary</p>
            </div>
          </div>

          <div className="screening-result">

            <div className="result-item">
              <span>Final Score</span>
              <strong>
                {candidate.score ?? 0}%
              </strong>
            </div>

            <div className="result-item">
              <span>ML Prediction</span>
              <strong className="result-shortlist">
                {candidate.ml_prediction || "N/A"}
              </strong>
            </div>

            <div className="result-item">
              <span>Decision</span>
              <strong className={`result-${decisionClass}`}>
                {decision}
              </strong>
            </div>

            <div className="result-item">
              <span>Systems</span>

              <strong
                className={
                  systemsAgree
                    ? "agree"
                    : "disagree"
                }
              >
                {systemsAgree
                  ? "✓ Agree"
                  : "⚠ Disagree"}
              </strong>
            </div>

          </div>

        </div>


        {/* JOB INFORMATION */}
        <div className="candidate-card">

          <div className="card-header">
            <div>
              <h2>Job Information</h2>
              <p>Selected job position</p>
            </div>
          </div>

          <div className="job-info">

            <h3>
              {candidate.job_title || "N/A"}
            </h3>

            <p>
              {candidate.job_description ||
                "No job description available."}
            </p>

            <h4>
              Required Skills
            </h4>

            <div className="skill-list">

              {requiredSkills.length > 0 ? (
                requiredSkills.map(
                  (skill, index) => (
                    <span
                      className="skill-tag"
                      key={index}
                    >
                      {skill}
                    </span>
                  )
                )
              ) : (
                <span className="empty-text">
                  No required skills.
                </span>
              )}

            </div>

          </div>

        </div>


        {/* MATCHED SKILLS */}
        <div className="candidate-card">

          <div className="card-header">
            <div>
              <h2>Matched Skills</h2>
              <p>Skills found in the resume</p>
            </div>

            <span className="count-badge success">
              {matchedSkills.length}
            </span>
          </div>

          <div className="skill-list">

            {matchedSkills.length > 0 ? (
              matchedSkills.map(
                (skill, index) => (
                  <span
                    key={index}
                    className="skill-tag matched"
                  >
                    ✓ {skill}
                  </span>
                )
              )
            ) : (
              <p className="empty-text">
                No matched skills.
              </p>
            )}

          </div>

        </div>


        {/* MISSING SKILLS */}
        <div className="candidate-card">

          <div className="card-header">
            <div>
              <h2>Missing Skills</h2>
              <p>Skills candidate should improve</p>
            </div>

            <span className="count-badge danger">
              {missingSkills.length}
            </span>
          </div>

          <div className="skill-list">

            {missingSkills.length > 0 ? (
              missingSkills.map(
                (skill, index) => (
                  <span
                    key={index}
                    className="skill-tag missing"
                  >
                    ✕ {skill}
                  </span>
                )
              )
            ) : (
              <p className="empty-text">
                No missing skills.
              </p>
            )}

          </div>

        </div>


        {/* RECOMMENDATIONS */}
        <div className="candidate-card full-width">

          <div className="card-header">
            <div>
              <h2>Skill Recommendations</h2>
              <p>
                Suggestions based on skill gaps
              </p>
            </div>
          </div>

          {recommendations.length > 0 ? (

            <div className="recommendation-list">

              {recommendations.map(
                (item, index) => (

                  <div
                    className="recommendation"
                    key={index}
                  >

                    <div className="recommendation-icon">
                      💡
                    </div>

                    <div>
                      <h3>
                        {item.skill || "Recommended Skill"}
                      </h3>

                      <p>
                        {item.recommendation ||
                          "Improve this skill."}
                      </p>
                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="success-message">
              🎉 No skill gaps found. Great match!
            </div>

          )}

        </div>


        {/* RESUME SUMMARY */}
        <div className="candidate-card full-width">

          <div className="card-header">
            <div>
              <h2>Resume Summary</h2>
              <p>Extracted resume information</p>
            </div>
          </div>

          <p className="resume-summary">
            {candidate.summary ||
              "No summary available."}
          </p>

        </div>


        {/* RECOMMENDED JOBS */}
        <div className="candidate-card full-width">

          <div className="card-header">
            <div>
              <h2>Recommended Jobs</h2>
              <p>
                Jobs matching this candidate's skills
              </p>
            </div>

            <span className="count-badge">
              {recommendedJobs.length}
            </span>
          </div>

          {recommendedJobs.length > 0 ? (

            <div className="recommended-jobs">

              {recommendedJobs.map(
                (job, index) => (

                  <div
                    className="recommended-job"
                    key={job.job_id || index}
                  >

                    <div className="job-rank">
                      #{index + 1}
                    </div>

                    <div className="job-content">

                      <h3>
                        {job.title}
                      </h3>

                      <p>
                        {job.description ||
                          "No job description available."}
                      </p>

                      <div className="job-metrics">

                        <span>
                          Skill Match:
                          <strong>
                            {" "}
                            {job.skill_match ?? 0}%
                          </strong>
                        </span>

                        <span>
                          SBERT:
                          <strong>
                            {" "}
                            {job.sbert_similarity ?? 0}%
                          </strong>
                        </span>

                        <span>
                          Final Score:
                          <strong>
                            {" "}
                            {job.final_score ?? 0}%
                          </strong>
                        </span>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="empty-text">
              No recommended jobs available.
            </p>

          )}

        </div>


        {/* SENTENCE ANALYSIS */}
        <div className="candidate-card full-width">

          <div className="card-header">
            <div>
              <h2>Resume Sentence Analysis</h2>
              <p>
                AI classification of resume sections
              </p>
            </div>

            <span className="count-badge">
              {sentences.length}
            </span>
          </div>

          {sentences.length > 0 ? (

            <div className="sentence-table">

              {sentences.map(
                (item, index) => (

                  <div
                    className="sentence-row"
                    key={index}
                  >

                    <div className="sentence-number">
                      {index + 1}
                    </div>

                    <div className="sentence-text">
                      {item.sentence}
                    </div>

                    <div className="category-badge">
                      {item.category || "unknown"}
                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="empty-text">
              No sentence analysis available.
            </p>

          )}

        </div>

      </div>

    </div>
  );
}

export default CandidateDetails;
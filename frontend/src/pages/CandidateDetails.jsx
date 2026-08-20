import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function CandidateDetails() {
  const { candidateId } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://127.0.0.1:8000/candidates/${candidateId}`
      );

      if (response.data.message === "Candidate not found") {
        setError("Candidate not found.");
        return;
      }

      setCandidate(response.data);

    } catch (error) {
      console.error(
        "Failed to load candidate:",
        error
      );

      setError(
        "Unable to load candidate details. Please check the backend."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard">
        <p>Loading candidate details...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="dashboard">

        <h1>Candidate Details</h1>

        <p className="error">
          {error}
        </p>

        <Link to="/candidates">
          ← Back to Candidates
        </Link>

      </div>
    );
  }

  // =====================================================
  // SKILL GAP DATA
  // =====================================================

  const matchedSkills =
    candidate?.skill_gap?.matched_skills || [];

  const missingSkills =
    candidate?.skill_gap?.missing_skills || [];

  const recommendations =
    candidate?.skill_gap?.recommendations || [];

  // =====================================================
  // RECOMMENDATIONS
  // =====================================================

  let recommendationList = [];

  if (Array.isArray(recommendations)) {
    recommendationList = recommendations;

  } else if (typeof recommendations === "string") {
    recommendationList = [
      {
        skill: "AI Recommendation",
        recommendation: recommendations
      }
    ];
  }

  // =====================================================
  // REQUIRED JOB SKILLS
  // =====================================================

  let requiredSkills = [];

  if (Array.isArray(candidate?.required_skills)) {

    requiredSkills = candidate.required_skills;

  } else if (
    typeof candidate?.required_skills === "string"
  ) {

    requiredSkills = candidate.required_skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);

  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard">

      {/* =================================================
          BACK
      ================================================= */}

      <Link to="/candidates">
        ← Back to Candidates
      </Link>

      {/* =================================================
          HEADER
      ================================================= */}

      <h1>
        Candidate Details
      </h1>

      <p>
        Detailed AI screening information for this candidate.
      </p>

      {/* =================================================
          BASIC INFORMATION
      ================================================= */}

      <div className="result-card">

        <h2>
          Candidate #{candidate.candidate_id}
        </h2>

        <p className="candidate-id">
          <strong>Resume:</strong>{" "}
          {candidate.filename || "N/A"}
        </p>

        <p className="candidate-id">
          <strong>Resume ID:</strong>{" "}
          {candidate.resume_id || "N/A"}
        </p>

        <p className="candidate-id">
          <strong>Evaluation ID:</strong>{" "}
          {candidate.evaluation_id || "N/A"}
        </p>

        {/* =================================================
            JOB INFORMATION
        ================================================= */}

        <div className="summary-section">

          <h3>
            💼 Job Information
          </h3>

          <div className="result-box">

            <span>
              Job Title
            </span>

            <strong>
              {candidate.job_title || "N/A"}
            </strong>

          </div>

          <h3>
            Required Skills
          </h3>

          {requiredSkills.length > 0 ? (

            <div className="skill-list">

              {requiredSkills.map(
                (skill, index) => (

                  <span
                    className="skill"
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>

                )
              )}

            </div>

          ) : (

            <p>
              No required skills available.
            </p>

          )}

        </div>

        {/* =================================================
            SCORE / MATCH / DECISION
        ================================================= */}

        <div className="result-top">

          {/* SCORE */}

          <div className="result-box">

            <span>
              Resume Score
            </span>

            <strong>
              {candidate.score ?? 0}/100
            </strong>

            <div className="progress">

              <div
                className="progress-fill"
                style={{
                  width: `${candidate.score ?? 0}%`
                }}
              />

            </div>

          </div>

          {/* JOB MATCH */}

          <div className="result-box">

            <span>
              Job Match
            </span>

            <strong>
              {candidate.match_percentage ?? 0}%
            </strong>

            <div className="progress">

              <div
                className="progress-fill"
                style={{
                  width: `${candidate.match_percentage ?? 0}%`
                }}
              />

            </div>

          </div>

          {/* DECISION */}

          <div className="result-box">

            <span>
              Decision
            </span>

            <strong
              className={`decision ${
                candidate.decision
                  ?.toLowerCase()
                  .replace(/\s+/g, "-") || "review"
              }`}
            >
              {candidate.decision || "REVIEW"}
            </strong>

          </div>

        </div>

        {/* =================================================
            MATCHED SKILLS
        ================================================= */}

        <div className="skills-section">

          <h3>
            ✓ Matched Skills
          </h3>

          {matchedSkills.length > 0 ? (

            <div className="skill-list">

              {matchedSkills.map(
                (skill, index) => (

                  <span
                    className="skill matched"
                    key={`${skill}-${index}`}
                  >
                    ✓ {skill}
                  </span>

                )
              )}

            </div>

          ) : (

            <p>
              No matched skills found.
            </p>

          )}

        </div>

        {/* =================================================
            MISSING SKILLS
        ================================================= */}

        <div className="skills-section">

          <h3>
            ⚠ Skill Gaps
          </h3>

          {missingSkills.length > 0 ? (

            <div className="skill-list">

              {missingSkills.map(
                (skill, index) => (

                  <span
                    className="skill missing"
                    key={`${skill}-${index}`}
                  >
                    ✗ {skill}
                  </span>

                )
              )}

            </div>

          ) : (

            <p>
              No major skill gaps found.
            </p>

          )}

        </div>

        {/* =================================================
            AI RECOMMENDATIONS
        ================================================= */}

        <div className="recommendations">

          <h3>
            🤖 AI Recommendations
          </h3>

          {recommendationList.length > 0 ? (

            <div className="recommendation-list">

              {recommendationList.map(
                (item, index) => (

                  <div
                    className="recommendation"
                    key={index}
                  >

                    <strong>
                      {item.skill || "Recommendation"}
                    </strong>

                    <p>
                      {item.recommendation ||
                        String(item)}
                    </p>

                  </div>

                )
              )}

            </div>

          ) : (

            <p>
              No recommendations available.
            </p>

          )}

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="summary-section">

          <h3>
            AI Summary
          </h3>

          <p>
            {candidate.summary ||
              "No summary available."}
          </p>

        </div>

        {/* =================================================
            SCREENING DATE
        ================================================= */}

        {candidate.created_at && (

          <div className="summary-section">

            <h3>
              Screening Date
            </h3>

            <p>
              {new Date(
                candidate.created_at
              ).toLocaleString()}
            </p>

          </div>

        )}

      </div>

    </div>
  );
}

export default CandidateDetails;
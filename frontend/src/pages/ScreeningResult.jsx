import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ScreeningResult.css";

function ScreeningResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result || {};

  // =====================================================
  // SAFE VALUE HELPERS
  // =====================================================

  const safeText = (value, fallback = "") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === "string") {
      return value;
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => safeText(item))
        .filter(Boolean)
        .join(", ");
    }

    if (typeof value === "object") {
      if (value.recommendation) {
        return safeText(value.recommendation);
      }

      if (value.skill) {
        return safeText(value.skill);
      }

      if (value.title) {
        return safeText(value.title);
      }

      try {
        return JSON.stringify(value);
      } catch {
        return fallback;
      }
    }

    return fallback;
  };

  const safeNumber = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : fallback;
  };

  const safeArray = (value) => {
    return Array.isArray(value)
      ? value
      : [];
  };

  // =====================================================
  // BASIC RESULT DATA
  // =====================================================

  const candidateId =
    result.candidate_id ?? null;

  const candidateCode =
    safeText(
      result.candidate_code,
      "N/A"
    );

  const filename =
    safeText(
      result.filename,
      "Resume"
    );

  const finalScore =
    safeNumber(result.score);

  const resumeQualityScore =
    safeNumber(
      result.resume_quality_score
    );

  const sbertSimilarity =
    safeNumber(
      result.sbert_similarity
    );

  const mlPrediction =
    safeText(
      result.ml_prediction,
      "REVIEW"
    );

  const mlConfidence =
    safeNumber(
      result.ml_confidence
    );

  const decision =
    safeText(
      result.decision,
      "REVIEW"
    );

  const summary =
    safeText(
      result.summary,
      "No resume summary available."
    );

  // =====================================================
  // RESUME SKILLS
  // =====================================================

  const resumeSkills =
    safeArray(result.skills)
      .map((skill) =>
        safeText(skill)
      )
      .filter(Boolean);

  // =====================================================
  // JOB
  // =====================================================

  const job =
    result.job &&
    typeof result.job === "object"
      ? result.job
      : {};

  const jobTitle =
    safeText(
      job.title,
      "Recommended Position"
    );

  const jobDescription =
    safeText(
      job.description,
      ""
    );

  // =====================================================
  // JOB MATCH
  // =====================================================

  const jobMatch =
    result.job_match &&
    typeof result.job_match === "object"
      ? result.job_match
      : {};

  const matchedSkills =
    safeArray(
      jobMatch.matched_skills
    )
      .map((skill) =>
        safeText(skill)
      )
      .filter(Boolean);

  const missingSkills =
    safeArray(
      jobMatch.missing_skills
    )
      .map((skill) =>
        safeText(skill)
      )
      .filter(Boolean);

  const matchPercentage =
    safeNumber(
      result.job_match_score ??
        jobMatch.match_percentage
    );

  // =====================================================
  // SKILL GAP
  // =====================================================

  const skillGap =
    result.skill_gap &&
    typeof result.skill_gap === "object"
      ? result.skill_gap
      : {};

  const recommendations =
    safeArray(
      skillGap.recommendations
    );

  // =====================================================
  // RECOMMENDED JOBS
  // =====================================================

  const recommendedJobs =
    safeArray(
      result.recommended_jobs
    );

  // =====================================================
  // FORMATTERS
  // =====================================================

  const formatScore = (value) => {
    return safeNumber(value)
      .toFixed(2);
  };

  const getScoreLevel = (score) => {
    if (score >= 75) {
      return "score-high";
    }

    if (score >= 50) {
      return "score-medium";
    }

    return "score-low";
  };

  const getDecisionClass = (value) => {
    const decisionValue =
      String(value)
        .toUpperCase();

    if (
      decisionValue ===
      "SHORTLIST"
    ) {
      return "decision-shortlist";
    }

    if (
      decisionValue ===
      "REVIEW"
    ) {
      return "decision-review";
    }

    return "decision-reject";
  };

  // =====================================================
  // NO RESULT
  // =====================================================

  if (!location.state?.result) {
    return (
      <div className="screening-result-page">

        <div className="result-container">

          <section className="result-section">

            <div className="empty-state">

              <h2>
                No Screening Result
              </h2>

              <p>
                Please upload a resume first.
              </p>

              <button
                type="button"
                className="primary-action"
                onClick={() =>
                  navigate("/upload")
                }
              >
                Upload Resume
              </button>

            </div>

          </section>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="screening-result-page">

      <div className="result-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="result-header">

          <div>

            <span className="page-eyebrow">
              AI RESUME SCREENING
            </span>

            <h1>
              Screening Result
            </h1>

            <p>
              AI-powered resume analysis,
              skill matching and job
              recommendations.
            </p>

          </div>

          <div
            className={`decision-badge ${getDecisionClass(
              decision
            )}`}
          >
            {decision}
          </div>

        </div>

        {/* =================================================
            CANDIDATE INFORMATION
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                CANDIDATE
              </span>

              <h2>
                Candidate Information
              </h2>

            </div>

          </div>

          <div className="result-info-grid">

            <div className="result-info-item">

              <span className="info-label">
                Resume
              </span>

              <strong
                className="info-value filename-value"
                title={filename}
              >
                {filename}
              </strong>

            </div>

            <div className="result-info-item">

              <span className="info-label">
                Candidate
              </span>

              <strong className="info-value">
                {candidateCode}
              </strong>

            </div>

            <div className="result-info-item">

              <span className="info-label">
                Best Job
              </span>

              <strong className="info-value">
                {jobTitle}
              </strong>

            </div>

            <div className="result-info-item">

              <span className="info-label">
                ML Prediction
              </span>

              <strong className="info-value">
                {mlPrediction}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            SCORE
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                AI EVALUATION
              </span>

              <h2>
                Resume Score
              </h2>

            </div>

          </div>

          <div className="score-grid">

            <div
              className={`score-card ${getScoreLevel(
                finalScore
              )}`}
            >

              <span>
                Overall Score
              </span>

              <strong>
                {formatScore(
                  finalScore
                )}%
              </strong>

            </div>

            <div className="score-card">

              <span>
                Resume Quality
              </span>

              <strong>
                {formatScore(
                  resumeQualityScore
                )}%
              </strong>

            </div>

            <div className="score-card">

              <span>
                Skill Match
              </span>

              <strong>
                {formatScore(
                  matchPercentage
                )}%
              </strong>

            </div>

            <div className="score-card">

              <span>
                SBERT Similarity
              </span>

              <strong>
                {formatScore(
                  sbertSimilarity
                )}%
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            RESUME SKILLS
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                SKILLS
              </span>

              <h2>
                Detected Resume Skills
              </h2>

            </div>

            <span className="jobs-count">
              {resumeSkills.length} Skills
            </span>

          </div>

          {resumeSkills.length > 0 ? (

            <div className="skill-list">

              {resumeSkills.map(
                (skill, index) => (

                  <span
                    className="skill-pill"
                    key={`${skill}-${index}`}
                  >
                    ✓ {skill}
                  </span>

                )
              )}

            </div>

          ) : (

            <div className="skills-empty">
              No skills detected.
            </div>

          )}

        </section>

        {/* =================================================
            BEST JOB
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                JOB MATCH
              </span>

              <h2>
                Best Job Match
              </h2>

            </div>

          </div>

          <div className="description-card">

            <h3>
              {jobTitle}
            </h3>

            {jobDescription && (

              <p>
                {jobDescription}
              </p>

            )}

            <div className="job-score-details">

              <div className="job-score-item">

                <span>
                  Skill Match
                </span>

                <strong>
                  {formatScore(
                    matchPercentage
                  )}%
                </strong>

              </div>

              <div className="job-score-item">

                <span>
                  SBERT Similarity
                </span>

                <strong>
                  {formatScore(
                    sbertSimilarity
                  )}%
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            MATCHED AND MISSING SKILLS
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                SKILL ANALYSIS
              </span>

              <h2>
                Skill Match Analysis
              </h2>

            </div>

          </div>

          <div className="skills-analysis-grid">

            {/* MATCHED */}

            <div className="skills-card matched-card">

              <div className="skills-card-header">

                <div>

                  <span className="skills-icon">
                    ✓
                  </span>

                  <h3>
                    Matched Skills
                  </h3>

                </div>

                <span className="skills-count">
                  {matchedSkills.length}
                </span>

              </div>

              {matchedSkills.length > 0 ? (

                <div className="skill-list">

                  {matchedSkills.map(
                    (skill, index) => (

                      <span
                        className="skill-pill matched"
                        key={`${skill}-${index}`}
                      >
                        ✓ {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <div className="skills-empty">
                  No matching skills found.
                </div>

              )}

            </div>

            {/* MISSING */}

            <div className="skills-card missing-card">

              <div className="skills-card-header">

                <div>

                  <span className="skills-icon">
                    !
                  </span>

                  <h3>
                    Missing Skills
                  </h3>

                </div>

                <span className="skills-count">
                  {missingSkills.length}
                </span>

              </div>

              {missingSkills.length > 0 ? (

                <div className="skill-list">

                  {missingSkills.map(
                    (skill, index) => (

                      <span
                        className="skill-pill missing"
                        key={`${skill}-${index}`}
                      >
                        ✕ {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <div className="skills-empty success-text">
                  No missing skills.
                </div>

              )}

            </div>

          </div>

        </section>

        {/* =================================================
            JOB DESCRIPTION
        ================================================= */}

        {jobDescription && (

          <section className="result-section">

            <div className="section-heading">

              <div>

                <span className="section-eyebrow">
                  POSITION
                </span>

                <h2>
                  Job Description
                </h2>

              </div>

            </div>

            <div className="description-card">

              <h3>
                {jobTitle}
              </h3>

              <p>
                {jobDescription}
              </p>

            </div>

          </section>

        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                RESUME ANALYSIS
              </span>

              <h2>
                Resume Summary
              </h2>

            </div>

          </div>

          <div className="summary-card">

            <p>
              {summary}
            </p>

          </div>

        </section>

        {/* =================================================
            SKILL GAP
        ================================================= */}

        {recommendations.length > 0 && (

          <section className="result-section">

            <div className="section-heading">

              <div>

                <span className="section-eyebrow">
                  IMPROVEMENT
                </span>

                <h2>
                  Skill Gap Recommendations
                </h2>

              </div>

            </div>

            <div className="recommendation-list">

              {recommendations.map(
                (recommendation, index) => {

                  const recommendationText =
                    safeText(
                      recommendation,
                      "Improve this skill"
                    );

                  return (

                    <div
                      className="recommendation-item"
                      key={index}
                    >

                      <span>
                        {index + 1}
                      </span>

                      <p>
                        {recommendationText}
                      </p>

                    </div>

                  );
                }
              )}

            </div>

          </section>

        )}

        {/* =================================================
            RECOMMENDED JOBS
        ================================================= */}

        <section className="result-section recommended-jobs-section">

          <div className="section-heading recommended-heading">

            <div>

              <span className="section-eyebrow">
                JOB DISCOVERY
              </span>

              <h2>
                Recommended Jobs
              </h2>

              <p>
                Jobs ranked using resume
                skills and SBERT semantic
                similarity.
              </p>

            </div>

            <span className="jobs-count">
              {recommendedJobs.length} Jobs
            </span>

          </div>

          {recommendedJobs.length > 0 ? (

            <div className="recommended-jobs-grid">

              {recommendedJobs.map(
                (jobItem, index) => {

                  const currentJob =
                    jobItem &&
                    typeof jobItem ===
                    "object"
                      ? jobItem
                      : {};

                  const currentTitle =
                    safeText(
                      currentJob.title,
                      "Recommended Job"
                    );

                  const currentDescription =
                    safeText(
                      currentJob.description,
                      ""
                    );

                  const currentJobId =
                    safeText(
                      currentJob.job_id,
                      "N/A"
                    );

                  const currentFinalScore =
                    safeNumber(
                      currentJob.final_score
                    );

                  const currentSkillMatch =
                    safeNumber(
                      currentJob.skill_match
                    );

                  const currentSbert =
                    safeNumber(
                      currentJob.sbert_similarity
                    );

                  const currentMatched =
                    safeArray(
                      currentJob.matched_skills
                    )
                      .map((skill) =>
                        safeText(skill)
                      )
                      .filter(Boolean);

                  const currentMissing =
                    safeArray(
                      currentJob.missing_skills
                    )
                      .map((skill) =>
                        safeText(skill)
                      )
                      .filter(Boolean);

                  return (

                    <article
                      className="recommended-job-card"
                      key={`${currentJobId}-${index}`}
                    >

                      {/* HEADER */}

                      <div className="recommended-job-header">

                        <div className="job-rank">
                          #{index + 1}
                        </div>

                        <div className="job-title-block">

                          <h3>
                            {currentTitle}
                          </h3>

                          <span>
                            Job ID: #
                            {currentJobId}
                          </span>

                        </div>

                        <div
                          className={`job-final-score ${getScoreLevel(
                            currentFinalScore
                          )}`}
                        >
                          {formatScore(
                            currentFinalScore
                          )}%
                        </div>

                      </div>

                      {/* DESCRIPTION */}

                      {currentDescription && (

                        <p className="recommended-job-description">
                          {currentDescription}
                        </p>

                      )}

                      {/* SCORES */}

                      <div className="job-score-details">

                        <div className="job-score-item">

                          <span>
                            Skill Match
                          </span>

                          <strong>
                            {formatScore(
                              currentSkillMatch
                            )}%
                          </strong>

                        </div>

                        <div className="job-score-item">

                          <span>
                            SBERT Similarity
                          </span>

                          <strong>
                            {formatScore(
                              currentSbert
                            )}%
                          </strong>

                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div className="job-match-bar">

                        <div className="job-match-bar-top">

                          <span>
                            Overall Match
                          </span>

                          <strong>
                            {formatScore(
                              currentFinalScore
                            )}%
                          </strong>

                        </div>

                        <div className="job-progress">

                          <div
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  currentFinalScore,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* MATCHED */}

                      <div className="recommended-skills">

                        <h4>
                          Matched Skills
                        </h4>

                        {currentMatched.length > 0 ? (

                          <div className="recommended-skill-list">

                            {currentMatched.map(
                              (
                                skill,
                                skillIndex
                              ) => (

                                <span
                                  className="recommended-skill matched"
                                  key={`${skill}-${skillIndex}`}
                                >
                                  ✓ {skill}
                                </span>

                              )
                            )}

                          </div>

                        ) : (

                          <p className="no-job-skills">
                            No matched skills
                          </p>

                        )}

                      </div>

                      {/* MISSING */}

                      <div className="recommended-skills">

                        <h4>
                          Missing Skills
                        </h4>

                        {currentMissing.length > 0 ? (

                          <div className="recommended-skill-list">

                            {currentMissing.map(
                              (
                                skill,
                                skillIndex
                              ) => (

                                <span
                                  className="recommended-skill missing"
                                  key={`${skill}-${skillIndex}`}
                                >
                                  ✕ {skill}
                                </span>

                              )
                            )}

                          </div>

                        ) : (

                          <p className="no-job-skills success">
                            ✓ No missing skills
                          </p>

                        )}

                      </div>

                    </article>

                  );
                }
              )}

            </div>

          ) : (

            <div className="no-recommended-jobs">

              <h3>
                No Recommended Jobs
              </h3>

              <p>
                We could not find suitable
                jobs for this resume.
              </p>

            </div>

          )}

        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="result-actions">

          {candidateId && (

            <button
              type="button"
              className="primary-action"
              onClick={() =>
                navigate(
                  `/candidates/${candidateId}`
                )
              }
            >
              View Candidate Details
            </button>

          )}

          <button
            type="button"
            className="secondary-action"
            onClick={() =>
              navigate("/upload")
            }
          >
            Upload Another Resume
          </button>

          <button
            type="button"
            className="secondary-action"
            onClick={() =>
              navigate("/candidates")
            }
          >
            View All Candidates
          </button>

        </div>

      </div>

    </div>
  );
}

export default ScreeningResult;
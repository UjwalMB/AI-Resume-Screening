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
    return Array.isArray(value) ? value : [];
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
  // ATS ANALYSIS
  // =====================================================

  const atsAnalysis =
    result.ats_analysis &&
    typeof result.ats_analysis === "object"
      ? result.ats_analysis
      : {};

  const atsScore =
    safeNumber(
      atsAnalysis.ats_score
    );

  const keywordMatch =
    safeNumber(
      atsAnalysis.keyword_match
    );

  const structureScore =
    safeNumber(
      atsAnalysis.structure_score
    );

  const contactScore =
    safeNumber(
      atsAnalysis.contact_score
    );

  const atsSkillsScore =
    safeNumber(
      atsAnalysis.skills_score
    );

  const lengthScore =
    safeNumber(
      atsAnalysis.length_score
    );

  const wordCount =
    safeNumber(
      atsAnalysis.word_count
    );

  const detectedSections =
    atsAnalysis.detected_sections &&
    typeof atsAnalysis.detected_sections === "object"
      ? atsAnalysis.detected_sections
      : {};

  const contactChecks =
    atsAnalysis.contact_checks &&
    typeof atsAnalysis.contact_checks === "object"
      ? atsAnalysis.contact_checks
      : {};

  const matchedKeywords =
    safeArray(
      atsAnalysis.matched_keywords
    )
      .map((keyword) =>
        safeText(keyword)
      )
      .filter(Boolean);

  const missingKeywords =
    safeArray(
      atsAnalysis.missing_keywords
    )
      .map((keyword) =>
        safeText(keyword)
      )
      .filter(Boolean);

  const atsIssues =
    safeArray(
      atsAnalysis.issues
    )
      .map((issue) =>
        safeText(issue)
      )
      .filter(Boolean);

  const atsSuggestions =
    safeArray(
      atsAnalysis.suggestions
    )
      .map((suggestion) =>
        safeText(suggestion)
      )
      .filter(Boolean);

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
      result.recommended_jobs ||
        result.top_jobs
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
      return "high";
    }

    if (score >= 50) {
      return "medium";
    }

    return "low";
  };

  const getDecisionClass = (value) => {
    const decisionValue =
      String(value)
        .toUpperCase();

    if (
      decisionValue ===
      "SHORTLIST"
    ) {
      return "shortlist";
    }

    if (
      decisionValue ===
      "REVIEW"
    ) {
      return "review";
    }

    return "reject";
  };

  const formatSectionName = (section) => {
    return String(section)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // =====================================================
  // NO RESULT
  // =====================================================

  if (!location.state?.result) {
    return (
      <div className="screening-result-page">

        <div className="screening-result-container">

          <div className="empty-result-card">

            <div className="empty-result-icon">
              📄
            </div>

            <h1>
              No Screening Result
            </h1>

            <p>
              Please upload a resume first
              to view the AI screening result.
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

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="screening-result-page">

      <div className="screening-result-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="screening-page-header">

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

          <div className="result-info-card">

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
            MAIN SCORE
        ================================================= */}

        <section className="main-score-card">

          <div className="score-circle-wrapper">

            <div
              className="score-circle"
              style={{
                "--score": `${Math.min(
                  Math.max(finalScore, 0),
                  100
                )}%`
              }}
            >

              <div className="score-circle-inner">

                <strong>
                  {formatScore(finalScore)}
                </strong>

                <span>
                  Overall Score
                </span>

              </div>

            </div>

            <div className="score-caption">
              AI Resume Screening Score
            </div>

          </div>

          <div className="score-explanation">

            <span className="section-eyebrow">
              AI EVALUATION
            </span>

            <h2>
              Resume Screening Overview
            </h2>

            <p>
              The final score combines resume
              quality, skill matching, SBERT
              semantic similarity and machine
              learning confidence.
            </p>

            <div className="decision-large">

              <span>
                Final Decision
              </span>

              <strong
                className={getDecisionClass(
                  decision
                )}
              >
                {decision}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            SCORE BREAKDOWN
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                SCORE BREAKDOWN
              </span>

              <h2>
                AI Evaluation Metrics
              </h2>

            </div>

          </div>

          <div className="score-breakdown-grid">

            <div className="metric-card">

              <div className="metric-top">
                <span className="metric-icon">
                  📄
                </span>

                <strong className="metric-value">
                  {formatScore(
                    resumeQualityScore
                  )}%
                </strong>
              </div>

              <h3>
                Resume Quality
              </h3>

              <p>
                Overall quality based on
                resume content and structure.
              </p>

              <div className="metric-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(
                        resumeQualityScore,
                        0
                      ),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

            <div className="metric-card">

              <div className="metric-top">
                <span className="metric-icon">
                  🎯
                </span>

                <strong className="metric-value">
                  {formatScore(
                    matchPercentage
                  )}%
                </strong>
              </div>

              <h3>
                Skill Match
              </h3>

              <p>
                Percentage of required job
                skills matched by the resume.
              </p>

              <div className="metric-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(
                        matchPercentage,
                        0
                      ),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

            <div className="metric-card">

              <div className="metric-top">
                <span className="metric-icon">
                  🧠
                </span>

                <strong className="metric-value">
                  {formatScore(
                    sbertSimilarity
                  )}%
                </strong>
              </div>

              <h3>
                SBERT Similarity
              </h3>

              <p>
                Semantic similarity between
                resume and job description.
              </p>

              <div className="metric-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(
                        sbertSimilarity,
                        0
                      ),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

            <div className="metric-card">

              <div className="metric-top">
                <span className="metric-icon">
                  🤖
                </span>

                <strong className="metric-value">
                  {formatScore(
                    mlConfidence
                  )}%
                </strong>
              </div>

              <h3>
                ML Confidence
              </h3>

              <p>
                Confidence of the machine
                learning screening prediction.
              </p>

              <div className="metric-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(
                        mlConfidence,
                        0
                      ),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            ATS ANALYSIS
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>

              <span className="section-eyebrow">
                ATS ANALYSIS
              </span>

              <h2>
                Applicant Tracking System Score
              </h2>

              <p>
                ATS-style compatibility analysis
                of your resume.
              </p>

            </div>

            <span className="jobs-count">
              {wordCount} Words
            </span>

          </div>

          {/* ATS MAIN SCORE */}

          <div className="ats-main-card">

            <div
              className={`ats-score-circle ${getScoreLevel(
                atsScore
              )}`}
            >

              <strong>
                {formatScore(atsScore)}%
              </strong>

              <span>
                ATS Score
              </span>

            </div>

            <div className="ats-score-content">

              <h3>
                Resume ATS Compatibility
              </h3>

              <p>
                This score evaluates resume
                structure, contact information,
                job keywords, skills and length.
              </p>

              <div className="ats-status">

                <span>
                  Status
                </span>

                <strong>
                  {atsScore >= 75
                    ? "Strong"
                    : atsScore >= 50
                    ? "Moderate"
                    : "Needs Improvement"}
                </strong>

              </div>

            </div>

          </div>

          {/* ATS METRICS */}

          <div className="ats-metrics-grid">

            <div className="ats-metric-card">

              <span>
                Keyword Match
              </span>

              <strong>
                {formatScore(
                  keywordMatch
                )}%
              </strong>

              <div className="ats-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(
                        keywordMatch,
                        0
                      ),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

            <div className="ats-metric-card">

              <span>
                Structure
              </span>

              <strong>
                {formatScore(
                  structureScore
                )}%
              </strong>

              <div className="ats-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(
                        structureScore,
                        0
                      ),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

            <div className="ats-metric-card">

              <span>
                Contact Information
              </span>

              <strong>
                {formatScore(
                  contactScore
                )}%
              </strong>

              <div className="ats-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(
                        contactScore,
                        0
                      ),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

            <div className="ats-metric-card">

              <span>
                Skills
              </span>

              <strong>
                {formatScore(
                  atsSkillsScore
                )}%
              </strong>

              <div className="ats-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(
                        atsSkillsScore,
                        0
                      ),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

            <div className="ats-metric-card">

              <span>
                Resume Length
              </span>

              <strong>
                {formatScore(
                  lengthScore
                )}%
              </strong>

              <div className="ats-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(
                        lengthScore,
                        0
                      ),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

            <div className="ats-metric-card">

              <span>
                Word Count
              </span>

              <strong>
                {wordCount}
              </strong>

              <small>
                Words detected
              </small>

            </div>

          </div>

          {/* DETECTED SECTIONS */}

          {Object.keys(detectedSections).length > 0 && (

            <div className="ats-detail-card">

              <h3>
                Resume Sections
              </h3>

              <div className="ats-section-list">

                {Object.entries(
                  detectedSections
                ).map(
                  ([section, detected]) => (

                    <div
                      className={`ats-section-item ${
                        detected
                          ? "detected"
                          : "not-detected"
                      }`}
                      key={section}
                    >

                      <span>
                        {detected
                          ? "✓"
                          : "✕"}
                      </span>

                      <strong>
                        {formatSectionName(
                          section
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

          {/* CONTACT CHECKS */}

          {Object.keys(contactChecks).length > 0 && (

            <div className="ats-detail-card">

              <h3>
                Contact Information Checks
              </h3>

              <div className="contact-check-grid">

                {Object.entries(
                  contactChecks
                ).map(
                  ([item, detected]) => (

                    <div
                      className={`contact-check-item ${
                        detected
                          ? "detected"
                          : "not-detected"
                      }`}
                      key={item}
                    >

                      <span>
                        {detected
                          ? "✓"
                          : "✕"}
                      </span>

                      <strong>
                        {formatSectionName(
                          item
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

          {/* MATCHED KEYWORDS */}

          {matchedKeywords.length > 0 && (

            <div className="ats-detail-card">

              <h3>
                Matched Job Keywords
              </h3>

              <div className="skill-list">

                {matchedKeywords.map(
                  (keyword, index) => (

                    <span
                      className="skill-pill matched"
                      key={`${keyword}-${index}`}
                    >
                      ✓ {keyword}
                    </span>

                  )
                )}

              </div>

            </div>

          )}

          {/* MISSING KEYWORDS */}

          {missingKeywords.length > 0 && (

            <div className="ats-detail-card ats-warning-card">

              <h3>
                Missing Job Keywords
              </h3>

              <p>
                These keywords were found in the
                selected job requirements but not
                detected in the resume.
              </p>

              <div className="skill-list">

                {missingKeywords.map(
                  (keyword, index) => (

                    <span
                      className="skill-pill missing"
                      key={`${keyword}-${index}`}
                    >
                      ! {keyword}
                    </span>

                  )
                )}

              </div>

            </div>

          )}

          {/* ATS ISSUES */}

          {atsIssues.length > 0 && (

            <div className="ats-detail-card ats-issues-card">

              <h3>
                ATS Issues
              </h3>

              <ul>

                {atsIssues.map(
                  (issue, index) => (

                    <li key={index}>
                      {issue}
                    </li>

                  )
                )}

              </ul>

            </div>

          )}

          {/* ATS SUGGESTIONS */}

          {atsSuggestions.length > 0 && (

            <div className="ats-detail-card ats-suggestion-card">

              <h3>
                ATS Suggestions
              </h3>

              <ul>

                {atsSuggestions.map(
                  (suggestion, index) => (

                    <li key={index}>
                      {suggestion}
                    </li>

                  )
                )}

              </ul>

            </div>

          )}

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
                    typeof jobItem === "object"
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

                          <span
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  currentFinalScore,
                                  0
                                ),
                                100
                              )}%`
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
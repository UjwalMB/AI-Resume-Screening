import { useLocation, useNavigate } from "react-router-dom";
import "./ScreeningResult.css";

function ScreeningResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result || {};
  const selectedJob = location.state?.job || {};

  const filename =
    location.state?.filename ||
    result.filename ||
    "Resume";

  // =====================================================
  // HELPERS
  // =====================================================

  const getNumber = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        const number = Number(value);

        if (!Number.isNaN(number)) {
          return number;
        }
      }
    }

    return 0;
  };

  const formatScore = (value) => {
    return getNumber(value).toFixed(2);
  };

  const getDecisionClass = (value) => {
    const decision = String(value || "REVIEW")
      .toUpperCase()
      .trim();

    if (decision === "SHORTLIST") {
      return "shortlist";
    }

    if (decision === "REJECT") {
      return "reject";
    }

    return "review";
  };

  // =====================================================
  // SCORE DATA
  // =====================================================

  const finalScore = getNumber(
    result.score,
    result.final_score
  );

  const matchPercentage = getNumber(
    result.match_percentage,
    result.skill_match,
    result.job_match?.match_percentage
  );

  const sbertSimilarity = getNumber(
    result.sbert_similarity,
    result.sbert_score,
    result.job_sbert_score
  );

  const resumeQuality = getNumber(
    result.resume_quality,
    result.resume_quality_score
  );

  const mlConfidence = getNumber(
    result.ml_confidence,
    result.confidence
  );

  // =====================================================
  // RESULT DATA
  // =====================================================

  const decision =
    result.decision || "REVIEW";

  const mlPrediction =
    result.ml_prediction ||
    result.prediction ||
    "N/A";

  const systemsAgree =
    result.systems_agree;

  const candidateId =
    result.candidate_id;

  const candidateCode =
    result.candidate_code ||
    `CAND-${candidateId || "N/A"}`;

  const jobTitle =
    result.selected_job?.title ||
    result.job_title ||
    result.job?.title ||
    selectedJob.title ||
    "Selected Job";

  const jobDescription =
    result.selected_job?.description ||
    result.job?.description ||
    selectedJob.description ||
    "";

  // =====================================================
  // SKILLS
  // =====================================================

  const matchedSkills =
    result.job_match?.matched_skills ||
    result.matched_skills ||
    result.skill_gap?.matched_skills ||
    [];

  const missingSkills =
    result.job_match?.missing_skills ||
    result.missing_skills ||
    result.skill_gap?.missing_skills ||
    [];

  const recommendations =
    result.skill_gap?.recommendations ||
    [];

  const recommendedJobs =
    Array.isArray(result.recommended_jobs)
      ? result.recommended_jobs
      : [];

  // =====================================================
  // NO RESULT
  // =====================================================

  if (!location.state?.result) {
    return (
      <div className="screening-result-page">
        <div className="empty-result-card">

          <div className="empty-result-icon">
            📄
          </div>

          <h1>
            No Screening Result
          </h1>

          <p>
            Please upload and screen a resume
            before viewing this page.
          </p>

          <button
            type="button"
            className="primary-action"
            onClick={() => navigate("/upload")}
          >
            Upload Resume
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // SCORE COLOR
  // =====================================================

  const getScoreLevel = (score) => {
    if (score >= 75) return "high";
    if (score >= 50) return "medium";
    return "low";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="screening-result-page">

      <div className="screening-result-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="screening-page-header">

          <div>
            <div className="page-eyebrow">
              AI RESUME SCREENING
            </div>

            <h1>
              Screening Result
            </h1>

            <p>
              AI-powered resume analysis and job matching
              for <strong>{jobTitle}</strong>.
            </p>
          </div>

          <button
            type="button"
            className="secondary-action"
            onClick={() => navigate("/upload")}
          >
            + Screen Another Resume
          </button>

        </div>


        {/* =================================================
            RESUME / JOB INFO
        ================================================= */}

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
              Selected Job
            </span>

            <strong className="info-value">
              {jobTitle}
            </strong>

          </div>


          <div className="result-info-item">

            <span className="info-label">
              Decision
            </span>

            <span
              className={`decision-badge ${getDecisionClass(
                decision
              )}`}
            >
              {decision}
            </span>

          </div>

        </div>


        {/* =================================================
            MAIN SCORE SECTION
        ================================================= */}

        <div className="main-score-card">

          <div className="score-circle-wrapper">

            <div
              className={`score-circle ${getScoreLevel(
                finalScore
              )}`}
              style={{
                "--score":
                  `${Math.min(
                    Math.max(finalScore, 0),
                    100
                  ) * 3.6}deg`
              }}
            >

              <div className="score-circle-inner">

                <strong>
                  {formatScore(finalScore)}
                </strong>

                <span>
                  / 100
                </span>

              </div>

            </div>

            <div className="score-caption">
              Overall Screening Score
            </div>

          </div>


          <div className="score-explanation">

            <h2>
              {decision === "SHORTLIST"
                ? "Strong Candidate Match"
                : decision === "REVIEW"
                ? "Candidate Needs Review"
                : "Candidate Match Is Low"}
            </h2>

            <p>
              The final score combines skill matching,
              SBERT semantic similarity, resume quality,
              and machine-learning confidence.
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

        </div>


        {/* =================================================
            SCORE BREAKDOWN
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>
              <span className="section-eyebrow">
                ANALYSIS
              </span>

              <h2>
                Score Breakdown
              </h2>

              <p>
                How the AI system calculated the final
                screening score.
              </p>
            </div>

          </div>


          <div className="score-breakdown-grid">

            {/* SKILL MATCH */}

            <div className="metric-card">

              <div className="metric-top">
                <div className="metric-icon">
                  🎯
                </div>

                <span className="metric-value">
                  {formatScore(matchPercentage)}%
                </span>
              </div>

              <h3>
                Skill Match
              </h3>

              <p>
                Percentage of required job skills
                found in the resume.
              </p>

              <div className="metric-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(matchPercentage, 0),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>


            {/* SBERT */}

            <div className="metric-card">

              <div className="metric-top">
                <div className="metric-icon">
                  🧠
                </div>

                <span className="metric-value">
                  {formatScore(sbertSimilarity)}%
                </span>
              </div>

              <h3>
                SBERT Similarity
              </h3>

              <p>
                Semantic similarity between the resume
                and selected job.
              </p>

              <div className="metric-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(sbertSimilarity, 0),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>


            {/* RESUME QUALITY */}

            <div className="metric-card">

              <div className="metric-top">
                <div className="metric-icon">
                  📄
                </div>

                <span className="metric-value">
                  {formatScore(resumeQuality)}%
                </span>
              </div>

              <h3>
                Resume Quality
              </h3>

              <p>
                Completeness and structure of the
                submitted resume.
              </p>

              <div className="metric-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(resumeQuality, 0),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>


            {/* ML CONFIDENCE */}

            <div className="metric-card">

              <div className="metric-top">
                <div className="metric-icon">
                  🤖
                </div>

                <span className="metric-value">
                  {formatScore(mlConfidence)}%
                </span>
              </div>

              <h3>
                ML Confidence
              </h3>

              <p>
                Confidence of the machine-learning
                classification model.
              </p>

              <div className="metric-progress">
                <span
                  style={{
                    width: `${Math.min(
                      Math.max(mlConfidence, 0),
                      100
                    )}%`
                  }}
                />
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            AI / ML RESULT
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>
              <span className="section-eyebrow">
                MACHINE LEARNING
              </span>

              <h2>
                AI Model Result
              </h2>
            </div>

          </div>


          <div className="ml-result-card">

            <div className="ml-result-item">

              <span>
                Model Prediction
              </span>

              <strong
                className={getDecisionClass(
                  mlPrediction
                )}
              >
                {mlPrediction}
              </strong>

            </div>


            <div className="ml-result-item">

              <span>
                Confidence
              </span>

              <strong>
                {formatScore(mlConfidence)}%
              </strong>

            </div>


            <div className="ml-result-item">

              <span>
                System Agreement
              </span>

              <strong
                className={
                  systemsAgree === true
                    ? "agreement-yes"
                    : "agreement-no"
                }
              >
                {systemsAgree === true
                  ? "✓ Agree"
                  : systemsAgree === false
                  ? "✕ Different"
                  : "N/A"}
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            SKILLS
        ================================================= */}

        <section className="result-section">

          <div className="section-heading">

            <div>
              <span className="section-eyebrow">
                JOB FIT
              </span>

              <h2>
                Skill Analysis
              </h2>

              <p>
                Skills found and skills that are still
                required for this position.
              </p>
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
                  No missing skills. Excellent match!
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
                  SELECTED POSITION
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
            RESUME SUMMARY
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
              {result.summary ||
                "No resume summary available."}
            </p>

          </div>

        </section>


        {/* =================================================
            SKILL GAP RECOMMENDATIONS
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
                (recommendation, index) => (

                  <div
                    className="recommendation-item"
                    key={index}
                  >

                    <span>
                      {index + 1}
                    </span>

                    <p>
                      {typeof recommendation ===
                      "string"
                        ? recommendation
                        : `${recommendation.skill || "Skill"}: ${
                            recommendation.recommendation ||
                            ""
                          }`}
                    </p>

                  </div>

                )
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
                Jobs ranked using your resume skills
                and SBERT semantic similarity.
              </p>
            </div>

            <span className="jobs-count">
              {recommendedJobs.length} Jobs
            </span>

          </div>


          {recommendedJobs.length > 0 ? (

            <div className="recommended-jobs-grid">

              {recommendedJobs.map(
                (job, index) => {

                  const jobScore = getNumber(
                    job.final_score
                  );

                  return (
                    <article
                      className="recommended-job-card"
                      key={`${job.job_id}-${index}`}
                    >

                      {/* JOB HEADER */}

                      <div className="recommended-job-header">

                        <div className="job-rank">
                          #{index + 1}
                        </div>

                        <div className="job-title-block">

                          <h3>
                            {job.title ||
                              "Recommended Job"}
                          </h3>

                          <span>
                            Job ID: #{job.job_id}
                          </span>

                        </div>

                        <div
                          className={`job-final-score ${getScoreLevel(
                            jobScore
                          )}`}
                        >
                          {formatScore(jobScore)}%
                        </div>

                      </div>


                      {/* DESCRIPTION */}

                      {job.description && (

                        <p className="recommended-job-description">
                          {job.description}
                        </p>

                      )}


                      {/* SCORE DETAILS */}

                      <div className="job-score-details">

                        <div className="job-score-item">

                          <span>
                            Skill Match
                          </span>

                          <strong>
                            {formatScore(
                              job.skill_match
                            )}%
                          </strong>

                        </div>


                        <div className="job-score-item">

                          <span>
                            SBERT Similarity
                          </span>

                          <strong>
                            {formatScore(
                              job.sbert_similarity
                            )}%
                          </strong>

                        </div>

                      </div>


                      {/* SCORE BAR */}

                      <div className="job-match-bar">

                        <div className="job-match-bar-top">

                          <span>
                            Overall Match
                          </span>

                          <strong>
                            {formatScore(jobScore)}%
                          </strong>

                        </div>

                        <div className="job-progress">

                          <span
                            style={{
                              width: `${Math.min(
                                Math.max(jobScore, 0),
                                100
                              )}%`
                            }}
                          />

                        </div>

                      </div>


                      {/* MATCHED SKILLS */}

                      <div className="recommended-skills">

                        <h4>
                          Matched Skills
                        </h4>

                        {job.matched_skills?.length > 0 ? (

                          <div className="recommended-skill-list">

                            {job.matched_skills.map(
                              (skill, skillIndex) => (
                                <span
                                  className="recommended-skill matched"
                                  key={skillIndex}
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


                      {/* MISSING SKILLS */}

                      <div className="recommended-skills">

                        <h4>
                          Missing Skills
                        </h4>

                        {job.missing_skills?.length > 0 ? (

                          <div className="recommended-skill-list">

                            {job.missing_skills.map(
                              (skill, skillIndex) => (
                                <span
                                  className="recommended-skill missing"
                                  key={skillIndex}
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

              <div>
                🔎
              </div>

              <h3>
                No Recommended Jobs
              </h3>

              <p>
                We could not find suitable jobs
                for this resume.
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./UploadResume.css";

function UploadResume() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [file, setFile] = useState(null);

  const [jobs, setJobs] = useState([]);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD JOBS
  // =====================================================

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");

      const response = await api.get("/jobs");

      console.log("Jobs loaded:", response.data);

      setJobs(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load jobs:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load jobs."
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  // =====================================================
  // FILE SELECT
  // =====================================================

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // ---------------------------------------------------
    // PDF CHECK
    // ---------------------------------------------------

    if (
      selectedFile.type !==
        "application/pdf" &&
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Please upload a PDF resume."
      );

      setFile(null);

      return;
    }

    // ---------------------------------------------------
    // FILE SIZE
    // ---------------------------------------------------

    if (
      selectedFile.size >
      10 * 1024 * 1024
    ) {
      setError(
        "File size must be less than 10 MB."
      );

      setFile(null);

      return;
    }

    setFile(selectedFile);
  };

  // =====================================================
  // UPLOAD RESUME
  // =====================================================

  const handleUpload = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // ---------------------------------------------------
    // VALIDATE FILE
    // ---------------------------------------------------

    if (!file) {
      setError(
        "Please select a resume PDF."
      );

      return;
    }

    // ---------------------------------------------------
    // FORM DATA
    // ---------------------------------------------------

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    // ===================================================
    // IMPORTANT
    //
    // The backend now automatically:
    //
    // 1. Extracts resume
    // 2. Extracts skills
    // 3. Runs ML prediction
    // 4. Runs SBERT
    // 5. Checks all jobs
    // 6. Returns TOP 5 jobs
    //
    // Therefore DO NOT send job_id.
    //
    // ===================================================

    try {
      setUploading(true);

      console.log(
        "================================"
      );

      console.log(
        "UPLOADING RESUME"
      );

      console.log(
        "File:",
        file.name
      );

      console.log(
        "================================"
      );

      const response = await api.post(
        "/resume/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      // -------------------------------------------------
      // BACKEND RESULT
      // -------------------------------------------------

      const data = response.data;

      console.log(
        "================================"
      );

      console.log(
        "SCREENING RESULT"
      );

      console.log(data);

      console.log(
        "================================"
      );

      // -------------------------------------------------
      // CHECK SUCCESS
      // -------------------------------------------------

      if (
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
            "Resume screening failed."
        );
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setMessage(
        "Resume uploaded and screened successfully!"
      );

      // -------------------------------------------------
      // NAVIGATE TO RESULT
      // -------------------------------------------------

      navigate(
        "/screening-result",
        {
          state: {
            result: data,

            filename:
              file.name,

            recommendedJobs:
              data.recommended_jobs ||
              data.top_jobs ||
              [],

            job:
              data.job ||
              null,
          },
        }
      );

    } catch (err) {
      console.error(
        "Resume upload failed:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      // -------------------------------------------------
      // ERROR HANDLING
      // -------------------------------------------------

      if (
        err.response?.status === 401
      ) {
        setError(
          "Authentication required. Please login again."
        );

      } else if (
        err.response?.status === 400
      ) {
        setError(
          err.response?.data?.detail ||
            "Invalid resume file."
        );

      } else if (
        err.response?.status === 404
      ) {
        setError(
          err.response?.data?.detail ||
            "No suitable jobs were found."
        );

      } else if (
        err.response?.status === 422
      ) {
        const detail =
          err.response?.data?.detail;

        if (
          Array.isArray(detail)
        ) {
          setError(
            detail
              .map(
                (item) =>
                  item.msg ||
                  "Invalid request"
              )
              .join(", ")
          );

        } else {
          setError(
            detail ||
              "Invalid upload data."
          );
        }

      } else {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Unable to upload resume."
        );
      }

    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setFile(null);

    setMessage("");

    setError("");

    const input =
      document.getElementById(
        "resume-file"
      );

    if (input) {
      input.value = "";
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="upload-resume-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="upload-header">

        <div>

          <span className="page-eyebrow">
            AI RESUME SCREENING
          </span>

          <h1>
            Upload Resume
          </h1>

          <p>
            Upload a candidate resume and let
            the AI system automatically analyze
            the resume and recommend the most
            suitable jobs.
          </p>

        </div>

      </div>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="upload-layout">

        {/* =================================================
            LEFT - UPLOAD
        ================================================= */}

        <div className="upload-card">

          <div className="section-title">

            <div className="section-icon">
              📄
            </div>

            <div>

              <h2>
                Resume
              </h2>

              <p>
                Upload the candidate's PDF resume.
              </p>

            </div>

          </div>


          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <label
            htmlFor="resume-file"
            className={`upload-dropzone ${
              file ? "has-file" : ""
            }`}
          >

            <input
              id="resume-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              hidden
              disabled={uploading}
            />

            {!file ? (

              <>
                <div className="upload-icon">
                  ⬆
                </div>

                <h3>
                  Drop your resume here
                </h3>

                <p>
                  or click to browse your computer
                </p>

                <span className="upload-format">
                  PDF only • Maximum 10 MB
                </span>
              </>

            ) : (

              <>
                <div className="file-icon">
                  📄
                </div>

                <h3>
                  {file.name}
                </h3>

                <p>
                  {(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>

                <span className="change-file">
                  Click to change file
                </span>
              </>

            )}

          </label>


          {/* =================================================
              AUTOMATIC JOB MATCHING
          ================================================= */}

          <div className="required-skills-box">

            <div className="required-skills-header">

              <div>

                <h3>
                  Automatic Job Matching
                </h3>

                <p>
                  You don't need to select a job.
                  Our AI will compare your resume
                  with all available jobs.
                </p>

              </div>

              <span className="skill-count">
                {jobs.length}
              </span>

            </div>


            {loadingJobs ? (

              <div className="skills-placeholder">

                <span>
                  🔄
                </span>

                <p>
                  Loading available jobs...
                </p>

              </div>

            ) : jobs.length > 0 ? (

              <div className="skills-placeholder">

                <span>
                  🤖
                </span>

                <p>
                  AI will analyze your resume
                  against {jobs.length} available
                  jobs and return the Top 5 matches.
                </p>

              </div>

            ) : (

              <div className="skills-placeholder">

                <span>
                  ⚠
                </span>

                <p>
                  No jobs are currently available.
                </p>

              </div>

            )}

          </div>


          {/* =================================================
              MESSAGES
          ================================================= */}

          {error && (

            <div className="upload-message error-message">

              <span>
                ⚠
              </span>

              {error}

            </div>

          )}


          {message && (

            <div className="upload-message success-message">

              <span>
                ✓
              </span>

              {message}

            </div>

          )}


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="upload-actions">

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
              disabled={uploading}
            >
              Reset
            </button>


            <button
              type="button"
              className="upload-button"
              onClick={handleUpload}
              disabled={
                uploading ||
                !file
              }
            >

              {uploading ? (

                <>
                  <span className="button-spinner"></span>

                  AI Screening...
                </>

              ) : (

                <>
                  🚀 Analyze Resume
                </>

              )}

            </button>

          </div>

        </div>


        {/* =================================================
            RIGHT - AI PROCESS
        ================================================= */}

        <div className="process-card">

          <div className="section-title">

            <div className="section-icon">
              🤖
            </div>

            <div>

              <h2>
                AI Screening
              </h2>

              <p>
                Automatic resume analysis
              </p>

            </div>

          </div>


          <div className="process-list">

            <div className="process-item">

              <div className="process-number">
                1
              </div>

              <div>

                <h3>
                  Resume Parsing
                </h3>

                <p>
                  Extract candidate information
                  and resume content.
                </p>

              </div>

            </div>


            <div className="process-item">

              <div className="process-number">
                2
              </div>

              <div>

                <h3>
                  Skill Extraction
                </h3>

                <p>
                  Identify technical skills
                  from the resume.
                </p>

              </div>

            </div>


            <div className="process-item">

              <div className="process-number">
                3
              </div>

              <div>

                <h3>
                  SBERT Job Matching
                </h3>

                <p>
                  Compare the resume with all
                  available jobs using semantic
                  similarity.
                </p>

              </div>

            </div>


            <div className="process-item">

              <div className="process-number">
                4
              </div>

              <div>

                <h3>
                  Top 5 Recommendations
                </h3>

                <p>
                  Rank the best jobs according
                  to skills and semantic similarity.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              FEATURES
          ================================================= */}

          <div className="screening-features">

            <div>
              <span>✓</span>
              Skill Matching
            </div>

            <div>
              <span>✓</span>
              SBERT Similarity
            </div>

            <div>
              <span>✓</span>
              Skill Gap Analysis
            </div>

            <div>
              <span>✓</span>
              Top 5 Job Recommendations
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default UploadResume;
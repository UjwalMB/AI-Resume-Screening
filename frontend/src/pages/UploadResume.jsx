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
  const [selectedJob, setSelectedJob] = useState("");

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

      console.log("Jobs:", response.data);

      setJobs(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Failed to load jobs:", err);

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
    const selectedFile = event.target.files?.[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Check PDF
    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError("Please upload a PDF resume.");
      setFile(null);
      return;
    }

    // 10 MB limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(
        "File size must be less than 10 MB."
      );
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // =====================================================
  // JOB CHANGE
  // =====================================================

  const handleJobChange = (event) => {
    setSelectedJob(event.target.value);

    setMessage("");
    setError("");
  };

  // =====================================================
  // GET SELECTED JOB
  // =====================================================

  const selectedJobData = jobs.find(
    (job) =>
      String(job.id) === String(selectedJob)
  );

  // =====================================================
  // REQUIRED SKILLS
  // =====================================================

  const getRequiredSkills = () => {
    if (!selectedJobData) {
      return [];
    }

    const skills =
      selectedJobData.required_skills;

    if (Array.isArray(skills)) {
      return skills;
    }

    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  const requiredSkills =
    getRequiredSkills();

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
    // VALIDATE JOB
    // ---------------------------------------------------

    if (!selectedJob) {
      setError(
        "Please select a job."
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

    // IMPORTANT:
    // Backend currently accepts:
    //
    // POST /resume/upload?job_id=1
    //
    // Therefore job_id goes in the URL.

    // ---------------------------------------------------
    // SEND REQUEST
    // ---------------------------------------------------

    try {
      setUploading(true);

      console.log(
        "Uploading resume:",
        file.name
      );

      console.log(
        "Selected job:",
        selectedJob
      );

      const response = await api.post(
        `/resume/upload?job_id=${selectedJob}`,
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
        "SCREENING RESULT FROM BACKEND:"
      );

      console.log(data);

      console.log(
        "================================"
      );

      // -------------------------------------------------
      // SUCCESS MESSAGE
      // -------------------------------------------------

      setMessage(
        "Resume uploaded and screened successfully!"
      );

      // -------------------------------------------------
      // GO TO SCREENING RESULT
      // -------------------------------------------------

      navigate(
        "/screening-result",
        {
          state: {
            result: data,

            // Also pass selected job information
            job: selectedJobData || null,

            // Pass filename
            filename: file.name,
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
        err.response?.status === 404
      ) {
        setError(
          "Upload endpoint not found. Check that the backend route is /resume/upload."
        );

      } else if (
        err.response?.status === 422
      ) {
        const detail =
          err.response?.data?.detail;

        if (Array.isArray(detail)) {
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
    setSelectedJob("");
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
            Upload a candidate resume and
            select a job to analyze their
            skills, compatibility and
            screening score.
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
              JOB SELECTION
          ================================================= */}

          <div className="form-group">

            <label htmlFor="job">
              Select Job
            </label>

            <select
              id="job"
              value={selectedJob}
              onChange={handleJobChange}
              disabled={
                loadingJobs ||
                uploading
              }
            >

              <option value="">
                {loadingJobs
                  ? "Loading jobs..."
                  : "Select a job"}
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


          {/* =================================================
              REQUIRED SKILLS
          ================================================= */}

          <div className="required-skills-box">

            <div className="required-skills-header">

              <div>

                <h3>
                  Required Skills
                </h3>

                <p>
                  Skills required for the
                  selected position.
                </p>

              </div>


              {selectedJob && (

                <span className="skill-count">
                  {requiredSkills.length}
                </span>

              )}

            </div>


            {!selectedJob ? (

              <div className="skills-placeholder">

                <span>
                  💡
                </span>

                <p>
                  Select a job to see required
                  skills.
                </p>

              </div>

            ) : requiredSkills.length > 0 ? (

              <div className="skill-tags">

                {requiredSkills.map(
                  (skill, index) => (

                    <span
                      key={`${skill}-${index}`}
                      className="skill-tag"
                    >
                      ✓ {skill}
                    </span>

                  )
                )}

              </div>

            ) : (

              <div className="skills-placeholder">

                <p>
                  No required skills found
                  for this job.
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
                !file ||
                !selectedJob
              }
            >

              {uploading ? (

                <>
                  <span className="button-spinner"></span>
                  Screening Resume...
                </>

              ) : (

                <>
                  🚀 Upload & Screen
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
                What happens after upload?
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
                  SBERT Matching
                </h3>

                <p>
                  Compare the resume with
                  the selected job semantically.
                </p>

              </div>

            </div>


            <div className="process-item">

              <div className="process-number">
                4
              </div>

              <div>

                <h3>
                  AI Decision
                </h3>

                <p>
                  Generate screening score,
                  match percentage and decision.
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
              Job Recommendations
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default UploadResume;
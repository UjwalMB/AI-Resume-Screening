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

  const [jobId, setJobId] = useState("");

  const [loadingJobs, setLoadingJobs] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");


  // =====================================================
  // LOAD JOBS
  // =====================================================

  useEffect(() => {

    loadJobs();

  }, []);


  const loadJobs = async () => {

    try {

      setLoadingJobs(true);
      setError("");

      const response = await api.get(
        "/jobs"
      );

      console.log(
        "Jobs:",
        response.data
      );


      const jobsData =
        Array.isArray(response.data)
          ? response.data
          : response.data?.jobs || [];


      setJobs(jobsData);


      // Select first job automatically

      if (jobsData.length > 0) {

        setJobId(
          String(jobsData[0].id)
        );

      }

    } catch (error) {

      console.error(
        "Failed to load jobs:",
        error
      );


      setError(

        error.response?.data?.detail ||

        "Unable to load jobs. Please try again."

      );

    } finally {

      setLoadingJobs(false);

    }

  };


  // =====================================================
  // SELECTED JOB
  // =====================================================

  const selectedJob = jobs.find(
    (job) =>
      String(job.id) ===
      String(jobId)
  );


  // =====================================================
  // GET REQUIRED SKILLS
  // =====================================================

  const getRequiredSkills = () => {

    if (!selectedJob) {

      return "";

    }


    if (
      Array.isArray(
        selectedJob.required_skills
      )
    ) {

      return selectedJob.required_skills.join(
        ", "
      );

    }


    return (
      selectedJob.required_skills ||
      ""
    );

  };


  // =====================================================
  // FILE SELECTION
  // =====================================================

  const handleFileChange = (
    event
  ) => {

    const selectedFile =
      event.target.files?.[0];


    setError("");
    setResult(null);


    if (!selectedFile) {

      setFile(null);

      return;

    }


    // -----------------------------------------------
    // CHECK PDF
    // -----------------------------------------------

    const isPDF =
      selectedFile.type ===
        "application/pdf" ||

      selectedFile.name
        .toLowerCase()
        .endsWith(".pdf");


    if (!isPDF) {

      setError(
        "Only PDF resume files are supported."
      );

      setFile(null);

      event.target.value = "";

      return;

    }


    // -----------------------------------------------
    // FILE SIZE
    // -----------------------------------------------

    const maxSize =
      10 * 1024 * 1024;


    if (
      selectedFile.size >
      maxSize
    ) {

      setError(
        "Resume file must be smaller than 10 MB."
      );

      setFile(null);

      event.target.value = "";

      return;

    }


    setFile(
      selectedFile
    );

  };


  // =====================================================
  // UPLOAD + SCREEN
  // =====================================================

  const handleUpload = async () => {

    setError("");
    setResult(null);


    // -----------------------------------------------
    // VALIDATE FILE
    // -----------------------------------------------

    if (!file) {

      setError(
        "Please select a PDF resume."
      );

      return;

    }


    // -----------------------------------------------
    // VALIDATE JOB
    // -----------------------------------------------

    if (!jobId) {

      setError(
        "Please select a job."
      );

      return;

    }


    setLoading(true);


    try {

      // ---------------------------------------------
      // CREATE FORM DATA
      // ---------------------------------------------

      const formData =
        new FormData();


      formData.append(
        "file",
        file
      );


      // ---------------------------------------------
      // REQUIRED SKILLS
      // ---------------------------------------------

      const requiredSkills =
        getRequiredSkills();


      console.log(
        "Uploading resume..."
      );

      console.log(
        "File:",
        file.name
      );

      console.log(
        "Job ID:",
        jobId
      );

      console.log(
        "Required Skills:",
        requiredSkills
      );


      // ---------------------------------------------
      // API REQUEST
      // ---------------------------------------------

      const response =
        await api.post(

          "/resume/upload",

          formData,

          {
            params: {

              job_id:
                Number(jobId),

              required_skills:
                requiredSkills

            }

          }

        );


      console.log(
        "Resume screening result:",
        response.data
      );


      // ---------------------------------------------
      // SAVE RESULT
      // ---------------------------------------------

      setResult(
        response.data
      );


      // ---------------------------------------------
      // RESET FILE
      // ---------------------------------------------

      setFile(null);

    } catch (error) {

      console.error(
        "Resume upload failed:",
        error
      );


      console.error(
        "Backend response:",
        error.response?.data
      );


      // ---------------------------------------------
      // AUTH ERROR
      // ---------------------------------------------

      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "authenticated"
        );

        localStorage.removeItem(
          "username"
        );


        navigate(
          "/login",
          {
            replace: true
          }
        );

        return;

      }


      // ---------------------------------------------
      // DISPLAY ERROR
      // ---------------------------------------------

      setError(

        error.response?.data?.detail ||

        "Unable to process the resume."

      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // VIEW CANDIDATE
  // =====================================================

  const viewCandidate = () => {

    if (
      !result?.candidate_id
    ) {

      return;

    }


    navigate(
      `/candidates/${result.candidate_id}`
    );

  };


  // =====================================================
  // UPLOAD ANOTHER RESUME
  // =====================================================

  const uploadAnother = () => {

    setFile(null);

    setResult(null);

    setError("");

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="upload-page">

      <div className="upload-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="upload-header">

          <h1>
            Upload Resume
          </h1>

          <p>
            Upload a candidate resume
            for AI-powered screening and
            job matching.
          </p>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="upload-error">

            <strong>
              Error
            </strong>

            <span>
              {error}
            </span>

          </div>

        )}


        {/* =================================================
            UPLOAD CARD
        ================================================= */}

        <div className="upload-card">


          {/* ---------------------------------------------
              JOB
          --------------------------------------------- */}

          <div className="form-group">

            <label>
              Select Job
            </label>


            {loadingJobs ? (

              <div className="loading-text">

                Loading jobs...

              </div>

            ) : jobs.length === 0 ? (

              <div className="no-jobs">

                <p>
                  No jobs available.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/jobs")
                  }
                >
                  Create a Job
                </button>

              </div>

            ) : (

              <select

                value={jobId}

                onChange={(event) =>
                  setJobId(
                    event.target.value
                  )
                }

              >

                <option value="">
                  Select a job
                </option>


                {jobs.map(
                  (job) => (

                    <option
                      key={job.id}
                      value={job.id}
                    >

                      #{job.id} -{" "}
                      {job.title}

                    </option>

                  )
                )}

              </select>

            )}

          </div>


          {/* ---------------------------------------------
              REQUIRED SKILLS
          --------------------------------------------- */}

          <div className="form-group">

            <label>
              Required Skills
            </label>

            <input

              type="text"

              value={
                getRequiredSkills()
              }

              readOnly

              placeholder={
                loadingJobs
                  ? "Loading..."
                  : "Select a job"
              }

            />

          </div>


          {/* ---------------------------------------------
              FILE
          --------------------------------------------- */}

          <div className="form-group">

            <label>
              Resume PDF
            </label>


            <div className="file-upload-box">

              <input

                id="resume-file"

                type="file"

                accept=".pdf,application/pdf"

                onChange={
                  handleFileChange
                }

              />


              <label
                htmlFor="resume-file"
                className="file-label"
              >

                <span className="file-icon">
                  📄
                </span>

                <span>
                  Choose PDF Resume
                </span>

              </label>

            </div>


            {file && (

              <div className="selected-file">

                <span>
                  📄
                </span>

                <strong>
                  {file.name}
                </strong>

                <span>
                  (
                  {
                    (
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)
                  } MB)
                </span>

              </div>

            )}

          </div>


          {/* ---------------------------------------------
              SCREEN BUTTON
          --------------------------------------------- */}

          <button

            type="button"

            className="screen-button"

            onClick={
              handleUpload
            }

            disabled={

              loading ||

              loadingJobs ||

              jobs.length === 0 ||

              !file ||

              !jobId

            }

          >

            {loading ? (

              <>
                <span className="button-spinner"></span>

                Screening Resume...
              </>

            ) : (

              <>
                🤖 Screen Resume
              </>

            )}

          </button>


        </div>


        {/* =================================================
            RESULT
        ================================================= */}

        {result && (

          <div className="result-card">


            {/* ---------------------------------------------
                RESULT HEADER
            --------------------------------------------- */}

            <div className="result-header">

              <div>

                <h2>
                  Screening Complete
                </h2>

                <p>
                  Resume successfully
                  processed by the AI system.
                </p>

              </div>

              <div className="success-icon">
                ✓
              </div>

            </div>


            {/* ---------------------------------------------
                RESULT GRID
            --------------------------------------------- */}

            <div className="result-grid">


              {/* CANDIDATE */}

              <div className="result-box">

                <span>
                  Candidate ID
                </span>

                <strong>
                  #{result.candidate_id}
                </strong>

              </div>


              {/* SCORE */}

              <div className="result-box">

                <span>
                  Resume Score
                </span>

                <strong>
                  {result.score ?? 0}/100
                </strong>

              </div>


              {/* MATCH */}

              <div className="result-box">

                <span>
                  Job Match
                </span>

                <strong>
                  {
                    result.job_match
                      ?.match_percentage ??
                    result.match_percentage ??
                    0
                  }%
                </strong>

              </div>


              {/* DECISION */}

              <div className="result-box">

                <span>
                  Decision
                </span>

                <strong>

                  {
                    result.decision ||
                    "REVIEW"
                  }

                </strong>

              </div>


              {/* ML PREDICTION */}

              <div className="result-box">

                <span>
                  ML Prediction
                </span>

                <strong>

                  {
                    result.ml_prediction ||
                    "REVIEW"
                  }

                </strong>

              </div>


              {/* ML CONFIDENCE */}

              <div className="result-box">

                <span>
                  ML Confidence
                </span>

                <strong>

                  {
                    result.ml_confidence ??
                    0
                  }%

                </strong>

              </div>

            </div>


            {/* ---------------------------------------------
                SYSTEM AGREEMENT
            --------------------------------------------- */}

            <div className="system-status">

              <span>
                AI Systems Agreement
              </span>

              <strong>

                {
                  result.systems_agree
                    ? "✓ Systems Agree"
                    : "⚠ Systems Differ"
                }

              </strong>

            </div>


            {/* ---------------------------------------------
                SUMMARY
            --------------------------------------------- */}

            <div className="result-section">

              <h3>
                Resume Summary
              </h3>

              <p>
                {
                  result.summary ||
                  "No summary available."
                }
              </p>

            </div>


            {/* ---------------------------------------------
                MATCHED SKILLS
            --------------------------------------------- */}

            <div className="result-section">

              <h3>
                Matched Skills
              </h3>

              <div className="skill-list">

                {
                  result.skill_gap
                    ?.matched_skills
                    ?.length > 0

                    ? result.skill_gap.matched_skills.map(
                        (skill, index) => (

                          <span
                            className="skill matched"
                            key={index}
                          >

                            ✓ {skill}

                          </span>

                        )
                      )

                    : (

                      <p>
                        No matched skills found.
                      </p>

                    )
                }

              </div>

            </div>


            {/* ---------------------------------------------
                MISSING SKILLS
            --------------------------------------------- */}

            <div className="result-section">

              <h3>
                Missing Skills
              </h3>

              <div className="skill-list">

                {
                  result.skill_gap
                    ?.missing_skills
                    ?.length > 0

                    ? result.skill_gap.missing_skills.map(
                        (skill, index) => (

                          <span
                            className="skill missing"
                            key={index}
                          >

                            ✗ {skill}

                          </span>

                        )
                      )

                    : (

                      <p>
                        No missing skills.
                      </p>

                    )
                }

              </div>

            </div>


            {/* ---------------------------------------------
                RECOMMENDATIONS
            --------------------------------------------- */}

            {
              result.skill_gap
                ?.recommendations
                ?.length > 0 && (

                <div className="result-section">

                  <h3>
                    Recommendations
                  </h3>

                  <ul>

                    {
                      result.skill_gap.recommendations.map(
                        (recommendation, index) => (

                          <li key={index}>
                            {recommendation}
                          </li>

                        )
                      )
                    }

                  </ul>

                </div>

              )
            }


            {/* ---------------------------------------------
                ACTIONS
            --------------------------------------------- */}

            <div className="result-actions">


              {result.candidate_id && (

                <button

                  type="button"

                  className="view-candidate-button"

                  onClick={
                    viewCandidate
                  }

                >

                  View Candidate Details

                </button>

              )}


              <button

                type="button"

                className="upload-another-button"

                onClick={
                  uploadAnother
                }

              >

                Upload Another Resume

              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}


export default UploadResume;
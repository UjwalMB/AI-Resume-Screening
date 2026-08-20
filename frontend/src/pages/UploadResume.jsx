import { useEffect, useState } from "react";
import axios from "axios";

function UploadResume() {
  const [file, setFile] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");


  // =====================================================
  // GET AUTH TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };


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

      const token = getToken();

      const response = await axios.get(
        "http://127.0.0.1:8000/jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs(response.data);

      // Select first job automatically
      if (response.data.length > 0) {
        setJobId(response.data[0].id);
      }

    } catch (error) {

      console.error(
        "Failed to load jobs:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load jobs. Please check the backend."
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
      String(job.id) === String(jobId)
  );


  // =====================================================
  // UPLOAD RESUME
  // =====================================================

  const handleUpload = async () => {

    if (!file) {

      setError(
        "Please select a PDF resume."
      );

      return;
    }


    if (!jobId) {

      setError(
        "Please select a job."
      );

      return;
    }


    setLoading(true);
    setError("");
    setResult(null);


    const formData = new FormData();

    formData.append(
      "file",
      file
    );


    try {

      const token = getToken();


      // -------------------------------------------------
      // REQUIRED SKILLS
      // -------------------------------------------------

      const requiredSkills =
        Array.isArray(
          selectedJob?.required_skills
        )
          ? selectedJob.required_skills.join(",")
          : selectedJob?.required_skills || "";


      // -------------------------------------------------
      // UPLOAD + SCREEN
      // -------------------------------------------------

      const response = await axios.post(

        `http://127.0.0.1:8000/resume/upload?job_id=${jobId}&required_skills=${encodeURIComponent(
          requiredSkills
        )}`,

        formData,

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "multipart/form-data",

          },
        }

      );


      setResult(
        response.data
      );


    } catch (error) {

      console.error(
        "Resume upload failed:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );


      setError(

        error.response?.data?.detail ||

        "Unable to process the resume. Please check the backend."

      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="upload-page">

      <h1>
        Upload Resume
      </h1>

      <p>
        Upload a candidate resume for AI screening.
      </p>


      {/* =================================================
          UPLOAD CARD
      ================================================== */}

      <div className="upload-card">


        {/* JOB */}

        <label>
          Select Job
        </label>


        {loadingJobs ? (

          <p>
            Loading jobs...
          </p>

        ) : jobs.length === 0 ? (

          <p className="error">
            No jobs available. Create a job first.
          </p>

        ) : (

          <select
            value={jobId}
            onChange={(event) =>
              setJobId(event.target.value)
            }
          >

            {jobs.map((job) => (

              <option
                value={job.id}
                key={job.id}
              >

                {job.title}

              </option>

            ))}

          </select>

        )}


        {/* REQUIRED SKILLS */}

        <label>
          Required Skills
        </label>


        <input

          type="text"

          value={
            Array.isArray(
              selectedJob?.required_skills
            )
              ? selectedJob.required_skills.join(
                  ", "
                )
              : selectedJob?.required_skills || ""
          }

          readOnly

          placeholder="Select a job"

        />


        {/* RESUME */}

        <label>
          Select Resume
        </label>


        <input

          type="file"

          accept=".pdf"

          onChange={(event) => {

            setFile(
              event.target.files[0]
            );

            setError("");

            setResult(null);

          }}

        />


        {file && (

          <p>

            Selected file:{" "}

            <strong>
              {file.name}
            </strong>

          </p>

        )}


        {/* BUTTON */}

        <button

          onClick={handleUpload}

          disabled={
            loading ||
            loadingJobs ||
            jobs.length === 0
          }

        >

          {loading
            ? "Screening Resume..."
            : "Screen Resume"}

        </button>


        {/* ERROR */}

        {error && (

          <p className="error">
            {error}
          </p>

        )}

      </div>


      {/* =================================================
          RESULT
      ================================================== */}

      {result && (

        <div className="result-card">

          <h2>
            Screening Result
          </h2>


          <div className="result-top">


            <div className="result-box">

              <span>
                Candidate ID
              </span>

              <strong>
                #{result.candidate_id}
              </strong>

            </div>


            <div className="result-box">

              <span>
                Resume Score
              </span>

              <strong>
                {result.score}/100
              </strong>

            </div>


            <div className="result-box">

              <span>
                Job Match
              </span>

              <strong>
                {result.job_match?.match_percentage ?? 0}%
              </strong>

            </div>

          </div>


          {/* DECISION */}

          <h3>
            Decision
          </h3>


          <strong
            className={`decision ${
              result.decision
                ?.toLowerCase()
                .replace(/\s+/g, "-")
            }`}
          >

            {result.decision}

          </strong>


          {/* MATCHED SKILLS */}

          <h3>
            ✓ Matched Skills
          </h3>


          <div className="skill-list">

            {result.skill_gap?.matched_skills?.length > 0 ? (

              result.skill_gap.matched_skills.map(
                (skill, index) => (

                  <span
                    className="skill matched"
                    key={`${skill}-${index}`}
                  >

                    ✓ {skill}

                  </span>

                )
              )

            ) : (

              <p>
                No matching skills found.
              </p>

            )}

          </div>


          {/* SKILL GAPS */}

          <h3>
            ⚠ Skill Gaps
          </h3>


          <div className="skill-list">

            {result.skill_gap?.missing_skills?.length > 0 ? (

              result.skill_gap.missing_skills.map(
                (skill, index) => (

                  <span
                    className="skill missing"
                    key={`${skill}-${index}`}
                  >

                    ✗ {skill}

                  </span>

                )
              )

            ) : (

              <p>
                No major skill gaps found.
              </p>

            )}

          </div>


          {/* RECOMMENDATIONS */}

          <h3>
            🤖 AI Recommendations
          </h3>


          <div className="recommendation-list">

            {Array.isArray(
              result.skill_gap?.recommendations
            ) &&
            result.skill_gap.recommendations.length > 0 ? (

              result.skill_gap.recommendations.map(
                (item, index) => (

                  <div
                    className="recommendation"
                    key={index}
                  >

                    <strong>
                      {item.skill}
                    </strong>

                    <p>
                      {item.recommendation}
                    </p>

                  </div>

                )
              )

            ) : (

              <p>
                No recommendations available.
              </p>

            )}

          </div>


          {/* SUMMARY */}

          <h3>
            Resume Summary
          </h3>

          <p>
            {result.summary ||
              "No summary available."}
          </p>

        </div>

      )}

    </div>

  );
}

export default UploadResume;
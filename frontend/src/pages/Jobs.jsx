import { useEffect, useState } from "react";
import api from "../api";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

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

      setLoading(true);
      setError("");

      const response = await api.get(
        "/jobs"
      );

      setJobs(response.data);

    } catch (error) {

      console.error(
        "Failed to load jobs:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load jobs. Please check the backend."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // CREATE JOB
  // =====================================================

  const createJob = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!title.trim()) {

      setError(
        "Please enter a job title."
      );

      return;
    }


    if (!description.trim()) {

      setError(
        "Please enter a job description."
      );

      return;
    }


    if (!skills.trim()) {

      setError(
        "Please enter required skills."
      );

      return;
    }


    setCreating(true);


    try {

      await api.post(
        "/jobs/create",
        {
          title: title.trim(),

          description:
            description.trim(),

          required_skills:
            skills.trim()
        }
      );


      // ---------------------------------------------------
      // SUCCESS
      // ---------------------------------------------------

      setMessage(
        "Job created successfully."
      );


      // Clear form

      setTitle("");
      setDescription("");
      setSkills("");


      // Reload jobs

      await fetchJobs();

    } catch (error) {

      console.error(
        "Failed to create job:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );


      setError(
        error.response?.data?.detail ||
        "Unable to create job. Please check the backend."
      );

    } finally {

      setCreating(false);

    }
  };


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard">


      {/* =================================================
          HEADER
      ================================================= */}

      <h1>
        Jobs
      </h1>

      <p>
        Create and manage job requirements
        for AI resume screening.
      </p>


      {/* =================================================
          CREATE JOB
      ================================================= */}

      <div className="candidate-section">

        <h2>
          Create New Job
        </h2>


        <form
          onSubmit={createJob}
        >


          {/* =============================================
              JOB TITLE
          ============================================= */}

          <label>
            Job Title
          </label>

          <input
            type="text"
            placeholder="Example: Python Developer"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            className="search-input"
          />


          {/* =============================================
              DESCRIPTION
          ============================================= */}

          <label>
            Job Description
          </label>

          <textarea
            placeholder="Example: Looking for a Python developer with backend development experience."
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            className="search-input"
            rows="5"
          />


          {/* =============================================
              REQUIRED SKILLS
          ============================================= */}

          <label>
            Required Skills
          </label>

          <input
            type="text"
            placeholder="Python, FastAPI, SQL, Git, Docker"
            value={skills}
            onChange={(event) =>
              setSkills(
                event.target.value
              )
            }
            className="search-input"
          />


          {/* =============================================
              CREATE BUTTON
          ============================================= */}

          <button
            type="submit"
            className="job-button"
            disabled={creating}
          >

            {creating
              ? "Creating..."
              : "Create Job"}

          </button>

        </form>


        {/* =============================================
            SUCCESS MESSAGE
        ============================================= */}

        {message && (

          <p className="success">
            {message}
          </p>

        )}


        {/* =============================================
            ERROR MESSAGE
        ============================================= */}

        {error && (

          <p className="error">
            {error}
          </p>

        )}

      </div>


      {/* =================================================
          JOB LIST
      ================================================= */}

      <div className="candidate-section">

        <h2>
          Available Jobs
        </h2>


        {/* =============================================
            LOADING
        ============================================= */}

        {loading ? (

          <p>
            Loading jobs...
          </p>


        ) : jobs.length === 0 ? (


          /* =============================================
             NO JOBS
          ============================================= */

          <p>
            No jobs created yet.
          </p>


        ) : (


          /* =============================================
             JOB TABLE
          ============================================= */

          <div className="candidate-table">

            <table>

              <thead>

                <tr>

                  <th>
                    Job ID
                  </th>

                  <th>
                    Job Title
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Required Skills
                  </th>

                </tr>

              </thead>


              <tbody>

                {jobs.map(
                  (job) => (

                    <tr
                      key={job.id}
                    >


                      {/* JOB ID */}

                      <td>
                        #{job.id}
                      </td>


                      {/* TITLE */}

                      <td>

                        <strong>
                          {job.title}
                        </strong>

                      </td>


                      {/* DESCRIPTION */}

                      <td>

                        {job.description ||
                          "N/A"}

                      </td>


                      {/* SKILLS */}

                      <td>

                        {Array.isArray(
                          job.required_skills
                        )
                          ? job.required_skills.join(
                              ", "
                            )
                          : job.required_skills ||
                            "N/A"}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Jobs;
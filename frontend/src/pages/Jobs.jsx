import { useEffect, useMemo, useState } from "react";
import api from "../api";
import "./Jobs.css";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");

  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("ALL");

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

      const response = await api.get("/jobs");

      const data = response.data;

      setJobs(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.jobs)
          ? data.jobs
          : []
      );
    } catch (err) {
      console.error("Failed to load jobs:", err);

      setError(
        err.response?.data?.detail ||
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

    if (!title.trim()) {
      setError("Please enter a job title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a job description.");
      return;
    }

    if (!skills.trim()) {
      setError("Please enter required skills.");
      return;
    }

    setCreating(true);

    try {
      const response = await api.post("/jobs/create", {
        title: title.trim(),
        description: description.trim(),
        required_skills: skills.trim(),
      });

      console.log("Created job:", response.data);

      setMessage("Job created successfully.");

      setTitle("");
      setDescription("");
      setSkills("");

      await fetchJobs();
    } catch (err) {
      console.error("Failed to create job:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to create job. Please check the backend."
      );
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // GET JOB SKILLS
  // =====================================================

  const getJobSkills = (job) => {
    if (Array.isArray(job.required_skills)) {
      return job.required_skills
        .map((skill) => String(skill).trim())
        .filter(Boolean);
    }

    if (typeof job.required_skills === "string") {
      return job.required_skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  // =====================================================
  // ALL UNIQUE SKILLS
  // =====================================================

  const availableSkills = useMemo(() => {
    const skillSet = new Set();

    jobs.forEach((job) => {
      getJobSkills(job).forEach((skill) => {
        skillSet.add(skill);
      });
    });

    return [...skillSet].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  }, [jobs]);

  // =====================================================
  // FILTER JOBS
  // =====================================================

  const filteredJobs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const jobSkills = getJobSkills(job);

      const matchesSearch =
        !searchText ||
        String(job.title || "")
          .toLowerCase()
          .includes(searchText) ||
        String(job.description || "")
          .toLowerCase()
          .includes(searchText) ||
        jobSkills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        );

      const matchesSkill =
        skillFilter === "ALL" ||
        jobSkills.some(
          (skill) =>
            skill.toLowerCase() === skillFilter.toLowerCase()
        );

      return matchesSearch && matchesSkill;
    });
  }, [jobs, search, skillFilter]);

  // =====================================================
  // CLEAR FORM
  // =====================================================

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setSkills("");
    setError("");
    setMessage("");
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setSkillFilter("ALL");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="jobs-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="jobs-page-header">

        <div className="jobs-header-content">

          <span className="jobs-eyebrow">
            RECRUITMENT MANAGEMENT
          </span>

          <h1>Jobs</h1>

          <p>
            Create, manage and match candidates
            with your job requirements.
          </p>

        </div>

        <div className="jobs-header-stat">

          <div className="header-stat-icon">
            💼
          </div>

          <div>
            <span>Total Jobs</span>
            <strong>{jobs.length}</strong>
          </div>

        </div>

      </section>


      {/* =================================================
          ALERTS
      ================================================= */}

      {message && (
        <div className="jobs-alert success-alert">

          <div className="alert-icon">
            ✓
          </div>

          <div className="alert-content">
            <strong>Success</strong>
            <p>{message}</p>
          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            ×
          </button>

        </div>
      )}

      {error && (
        <div className="jobs-alert error-alert">

          <div className="alert-icon">
            !
          </div>

          <div className="alert-content">
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            ×
          </button>

        </div>
      )}


      {/* =================================================
          CREATE JOB
      ================================================= */}

      <section className="create-job-card">

        <div className="section-heading">

          <div className="section-icon">
            ✨
          </div>

          <div>
            <h2>Create New Job</h2>

            <p>
              Add a new position for AI-powered candidate matching.
            </p>
          </div>

        </div>

        <form onSubmit={createJob}>

          <div className="form-grid">

            <div className="form-group">

              <label htmlFor="job-title">
                Job Title
              </label>

              <input
                id="job-title"
                type="text"
                placeholder="Python Developer"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label htmlFor="required-skills">
                Required Skills
              </label>

              <input
                id="required-skills"
                type="text"
                placeholder="Python, FastAPI, SQL, Git"
                value={skills}
                onChange={(event) =>
                  setSkills(event.target.value)
                }
              />

              <span className="field-hint">
                Separate skills using commas.
              </span>

            </div>


            <div className="form-group full-width">

              <label htmlFor="job-description">
                Job Description
              </label>

              <textarea
                id="job-description"
                placeholder="Describe the responsibilities, experience and requirements..."
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={5}
              />

              <span className="field-hint">
                A detailed description improves SBERT semantic matching.
              </span>

            </div>

          </div>


          <div className="form-actions">

            <button
              type="button"
              className="clear-button"
              onClick={clearForm}
            >
              Clear
            </button>

            <button
              type="submit"
              className="create-job-button"
              disabled={creating}
            >
              {creating ? (
                <>
                  <span className="button-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span>+</span>
                  Create Job
                </>
              )}
            </button>

          </div>

        </form>

      </section>


      {/* =================================================
          JOB LIST TOOLBAR
      ================================================= */}

      <section className="jobs-list-section">

        <div className="jobs-list-header">

          <div>
            <span className="section-mini-label">
              JOB DATABASE
            </span>

            <h2>Available Jobs</h2>

            <p>
              Showing {filteredJobs.length} of {jobs.length} positions
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchJobs}
            disabled={loading}
          >
            <span>↻</span>
            Refresh
          </button>

        </div>


        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        {!loading && jobs.length > 0 && (
          <div className="jobs-filters">

            <div className="search-box">

              <span className="search-icon">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search jobs, descriptions or skills..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}

            </div>


            <select
              className="skill-filter"
              value={skillFilter}
              onChange={(event) =>
                setSkillFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Skills
              </option>

              {availableSkills.map((skill) => (
                <option
                  value={skill}
                  key={skill}
                >
                  {skill}
                </option>
              ))}

            </select>


            {(search || skillFilter !== "ALL") && (
              <button
                type="button"
                className="reset-filter-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}

          </div>
        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="jobs-loading">

            <div className="loading-spinner"></div>

            <h3>Loading jobs...</h3>

            <p>
              Fetching job requirements from the backend.
            </p>

          </div>
        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && jobs.length === 0 && (
          <div className="jobs-empty">

            <div className="empty-icon">
              💼
            </div>

            <h3>No jobs created yet</h3>

            <p>
              Create your first job above to start
              matching resumes with job requirements.
            </p>

          </div>
        )}


        {/* =================================================
            NO FILTER RESULTS
        ================================================= */}

        {!loading &&
          jobs.length > 0 &&
          filteredJobs.length === 0 && (
            <div className="jobs-empty filter-empty">

              <div className="empty-icon">
                🔎
              </div>

              <h3>No matching jobs</h3>

              <p>
                Try a different search term or skill filter.
              </p>

              <button
                type="button"
                className="empty-clear-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>
          )}


        {/* =================================================
            JOB CARDS
        ================================================= */}

        {!loading && filteredJobs.length > 0 && (
          <div className="jobs-grid">

            {filteredJobs.map((job, index) => {

              const jobSkills = getJobSkills(job);

              const firstLetter =
                job.title?.charAt(0)?.toUpperCase() || "J";

              return (
                <article
                  className="job-card"
                  key={job.id || index}
                >

                  {/* CARD TOP */}

                  <div className="job-card-top">

                    <div className="job-card-icon">
                      {firstLetter}
                    </div>

                    <span className="job-card-id">
                      JOB #{job.id || index + 1}
                    </span>

                  </div>


                  {/* TITLE */}

                  <h3>
                    {job.title || "Untitled Position"}
                  </h3>


                  {/* DESCRIPTION */}

                  <p className="job-description">

                    {job.description ||
                      "No job description available."}

                  </p>


                  {/* SKILLS */}

                  <div className="job-skills-section">

                    <div className="skills-header">

                      <span className="skills-label">
                        Required Skills
                      </span>

                      <span className="skills-number">
                        {jobSkills.length}
                      </span>

                    </div>

                    <div className="job-skills">

                      {jobSkills.length > 0 ? (
                        jobSkills.map((skill, skillIndex) => (
                          <span
                            className="job-skill"
                            key={`${skill}-${skillIndex}`}
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="no-skills">
                          No skills specified
                        </span>
                      )}

                    </div>

                  </div>


                  {/* FOOTER */}

                  <div className="job-card-footer">

                    <div className="job-status">
                      <span className="status-dot"></span>
                      Active
                    </div>

                    <span className="job-created-label">
                      Available for screening
                    </span>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

    </div>
  );
}

export default Jobs;
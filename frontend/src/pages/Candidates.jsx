import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] =
    useState("all");
  const [sortOrder, setSortOrder] =
    useState("none");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // LOAD CANDIDATES
  // =====================================================

  useEffect(() => {
    fetchCandidates();
  }, []);


  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/candidates"
      );

      setCandidates(response.data);

    } catch (error) {

      console.error(
        "Failed to load candidates:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load candidates. Please check the backend."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // LOAD JOBS
  // =====================================================

  useEffect(() => {
    fetchJobs();
  }, []);


  const fetchJobs = async () => {
    try {

      const response = await api.get(
        "/jobs"
      );

      setJobs(response.data);

    } catch (error) {

      console.error(
        "Failed to load jobs:",
        error
      );

    }
  };


  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredCandidates = candidates
    .filter((candidate) => {

      const searchText =
        search.toLowerCase();


      // SEARCH

      const matchesSearch =
        String(
          candidate.candidate_id || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          candidate.filename || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          candidate.decision || ""
        )
          .toLowerCase()
          .includes(searchText);


      // JOB FILTER

      const matchesJob =
        jobFilter === "all" ||
        String(candidate.job_id) ===
          String(jobFilter);


      // DECISION FILTER

      const matchesDecision =
        decisionFilter === "all" ||
        candidate.decision
          ?.toLowerCase() ===
          decisionFilter.toLowerCase();


      return (
        matchesSearch &&
        matchesJob &&
        matchesDecision
      );

    })
    .sort((a, b) => {

      // HIGHEST SCORE FIRST

      if (sortOrder === "high") {

        return (
          Number(b.score || 0) -
          Number(a.score || 0)
        );

      }


      // LOWEST SCORE FIRST

      if (sortOrder === "low") {

        return (
          Number(a.score || 0) -
          Number(b.score || 0)
        );

      }


      return 0;

    });


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <h1>
        Candidates
      </h1>

      <p>
        View and filter all candidates screened
        by the AI system.
      </p>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="upload-card">

        <h2>
          Candidate Filters
        </h2>


        {/* SEARCH */}

        <label>
          Search
        </label>

        <input
          type="text"
          placeholder="Search by ID, resume or decision..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="search-input"
        />


        {/* JOB FILTER */}

        <label>
          Filter by Job
        </label>

        <select
          value={jobFilter}
          onChange={(event) =>
            setJobFilter(event.target.value)
          }
        >

          <option value="all">
            All Jobs
          </option>

          {jobs.map((job) => (

            <option
              key={job.id}
              value={job.id}
            >
              #{job.id} - {job.title}
            </option>

          ))}

        </select>


        {/* DECISION FILTER */}

        <label>
          Filter by Decision
        </label>

        <select
          value={decisionFilter}
          onChange={(event) =>
            setDecisionFilter(
              event.target.value
            )
          }
        >

          <option value="all">
            All Decisions
          </option>

          <option value="shortlist">
            Shortlisted
          </option>

          <option value="review">
            Review
          </option>

          <option value="reject">
            Rejected
          </option>

        </select>


        {/* SCORE SORT */}

        <label>
          Sort by Score
        </label>

        <select
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(
              event.target.value
            )
          }
        >

          <option value="none">
            Default
          </option>

          <option value="high">
            Highest Score First
          </option>

          <option value="low">
            Lowest Score First
          </option>

        </select>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <p className="error">
          {error}
        </p>

      )}


      {/* =================================================
          RESULTS COUNT
      ================================================= */}

      {!loading && (

        <p>
          Showing{" "}
          <strong>
            {filteredCandidates.length}
          </strong>{" "}
          of{" "}
          <strong>
            {candidates.length}
          </strong>{" "}
          candidates.
        </p>

      )}


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <p>
          Loading candidates...
        </p>

      ) : filteredCandidates.length === 0 ? (

        <p>
          No candidates match your filters.
        </p>

      ) : (

        /* =================================================
           CANDIDATE TABLE
        ================================================= */

        <div className="candidate-table">

          <table>

            <thead>

              <tr>

                <th>
                  Candidate ID
                </th>

                <th>
                  Resume
                </th>

                <th>
                  Job ID
                </th>

                <th>
                  Score
                </th>

                <th>
                  Job Match
                </th>

                <th>
                  Decision
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredCandidates.map(
                (candidate) => (

                  <tr
                    key={
                      candidate.candidate_id
                    }
                  >

                    {/* CANDIDATE ID */}

                    <td>

                      <Link
                        to={`/candidates/${candidate.candidate_id}`}
                      >
                        #
                        {
                          candidate.candidate_id
                        }
                      </Link>

                    </td>


                    {/* RESUME */}

                    <td>
                      {
                        candidate.filename ||
                        "N/A"
                      }
                    </td>


                    {/* JOB */}

                    <td>
                      {candidate.job_id
                        ? `#${candidate.job_id}`
                        : "N/A"}
                    </td>


                    {/* SCORE */}

                    <td>
                      {
                        candidate.score ??
                        0
                      }/100
                    </td>


                    {/* JOB MATCH */}

                    <td>
                      {
                        candidate.match_percentage ??
                        0
                      }%
                    </td>


                    {/* DECISION */}

                    <td>

                      <strong
                        className={`decision ${
                          candidate.decision
                            ?.toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            ) ||
                          "review"
                        }`}
                      >
                        {
                          candidate.decision ||
                          "REVIEW"
                        }
                      </strong>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Candidates;
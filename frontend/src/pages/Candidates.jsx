import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

import "./Candidates.css";


function Candidates() {

  // =====================================================
  // STATE
  // =====================================================

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] =
    useState("all");

  const [sortOrder, setSortOrder] =
    useState("none");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


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

      setCandidates(
        Array.isArray(response.data)
          ? response.data
          : []
      );

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

      setJobs(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Failed to load jobs:",
        error
      );

    }

  };


  // =====================================================
  // FILTER + SORT CANDIDATES
  // =====================================================

  const filteredCandidates = useMemo(() => {

    const searchText =
      search.trim().toLowerCase();


    const filtered = candidates.filter(
      (candidate) => {

        // -----------------------------------------------
        // SEARCH
        // -----------------------------------------------

        const matchesSearch =

          String(
            candidate.candidate_id ?? ""
          )
            .toLowerCase()
            .includes(searchText)

          ||

          String(
            candidate.filename ?? ""
          )
            .toLowerCase()
            .includes(searchText)

          ||

          String(
            candidate.decision ?? ""
          )
            .toLowerCase()
            .includes(searchText);


        // -----------------------------------------------
        // JOB FILTER
        // -----------------------------------------------

        const matchesJob =

          jobFilter === "all"

          ||

          String(
            candidate.job_id ?? ""
          ) === String(jobFilter);


        // -----------------------------------------------
        // DECISION FILTER
        // -----------------------------------------------

        const candidateDecision =
          String(
            candidate.decision ?? "REVIEW"
          )
            .toLowerCase()
            .trim();


        const matchesDecision =

          decisionFilter === "all"

          ||

          candidateDecision ===
            decisionFilter.toLowerCase();


        return (
          matchesSearch &&
          matchesJob &&
          matchesDecision
        );

      }
    );


    // ===================================================
    // SORT
    // ===================================================

    if (sortOrder === "high") {

      filtered.sort(
        (a, b) =>
          Number(b.score ?? 0) -
          Number(a.score ?? 0)
      );

    }


    if (sortOrder === "low") {

      filtered.sort(
        (a, b) =>
          Number(a.score ?? 0) -
          Number(b.score ?? 0)
      );

    }


    return filtered;

  }, [
    candidates,
    search,
    jobFilter,
    decisionFilter,
    sortOrder
  ]);


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalCandidates =
    candidates.length;


  const shortlisted =
    candidates.filter(
      (candidate) =>
        String(candidate.decision ?? "")
          .toLowerCase() === "shortlist"
    ).length;


  const rejected =
    candidates.filter(
      (candidate) =>
        String(candidate.decision ?? "")
          .toLowerCase() === "reject"
    ).length;


  const review =
    candidates.filter(
      (candidate) =>
        String(candidate.decision ?? "")
          .toLowerCase() === "review"
    ).length;


  // =====================================================
  // DECISION CLASS
  // =====================================================

  const getDecisionClass = (decision) => {

    const value =
      String(
        decision || "REVIEW"
      )
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");


    if (
      value === "shortlist" ||
      value === "shortlisted"
    ) {

      return "shortlisted";

    }


    if (
      value === "reject" ||
      value === "rejected"
    ) {

      return "rejected";

    }


    return "review";

  };


  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {

    setSearch("");
    setJobFilter("all");
    setDecisionFilter("all");
    setSortOrder("none");

  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="candidates-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="candidates-header">

        <h1>
          Candidates
        </h1>

        <p>
          View, search and analyze candidates
          screened by the AI Resume Screening System.
        </p>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      {!loading && !error && (

        <div className="candidate-stats">


          {/* TOTAL */}

          <div className="stat-card">

            <span>
              Total Candidates
            </span>

            <strong>
              {totalCandidates}
            </strong>

          </div>


          {/* SHORTLISTED */}

          <div className="stat-card">

            <span>
              Shortlisted
            </span>

            <strong>
              {shortlisted}
            </strong>

          </div>


          {/* REVIEW */}

          <div className="stat-card">

            <span>
              Under Review
            </span>

            <strong>
              {review}
            </strong>

          </div>


          {/* REJECTED */}

          <div className="stat-card">

            <span>
              Rejected
            </span>

            <strong>
              {rejected}
            </strong>

          </div>

        </div>

      )}


      {/* =================================================
          FILTER CARD
      ================================================= */}

      <div className="candidate-filters">

        <h2>
          Candidate Filters
        </h2>


        <div className="filter-grid">


          {/* SEARCH */}

          <div className="filter-group">

            <label>
              Search Candidate
            </label>

            <input

              type="text"

              placeholder="Search by ID, resume or decision..."

              value={search}

              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }

            />

          </div>


          {/* JOB */}

          <div className="filter-group">

            <label>
              Filter by Job
            </label>

            <select

              value={jobFilter}

              onChange={(event) =>
                setJobFilter(
                  event.target.value
                )
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

          </div>


          {/* DECISION */}

          <div className="filter-group">

            <label>
              Decision
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

          </div>


          {/* SORT */}

          <div className="filter-group">

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
                Highest Score
              </option>

              <option value="low">
                Lowest Score
              </option>

            </select>

          </div>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="candidates-error">

          {error}

        </div>

      )}


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="candidates-empty">

          <p>
            Loading candidates...
          </p>

        </div>

      )}


      {/* =================================================
          RESULT COUNT
      ================================================= */}

      {!loading && !error && (

        <div className="candidates-result-count">

          Showing{" "}

          <strong>
            {filteredCandidates.length}
          </strong>

          {" "}of{" "}

          <strong>
            {totalCandidates}
          </strong>

          {" "}candidates

        </div>

      )}


      {/* =================================================
          EMPTY RESULTS
      ================================================= */}

      {!loading &&
        !error &&
        filteredCandidates.length === 0 && (

          <div className="candidates-empty">

            <h3>
              No candidates found
            </h3>

            <p>
              No candidates match your
              current filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
            >
              Clear Filters
            </button>

          </div>

        )}


      {/* =================================================
          CANDIDATE TABLE
      ================================================= */}

      {!loading &&
        !error &&
        filteredCandidates.length > 0 && (

          <div className="candidates-table-card">

            <div className="candidates-table-wrapper">

              <table className="candidates-table">

                {/* =================================================
                    TABLE HEADER
                ================================================= */}

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


                {/* =================================================
                    TABLE BODY
                ================================================= */}

                <tbody>

                  {filteredCandidates.map(
                    (candidate) => (

                      <tr
                        key={
                          candidate.candidate_id
                        }
                      >


                        {/* -----------------------------------------
                            CANDIDATE ID
                        ----------------------------------------- */}

                        <td>

                          <Link

                            to={`/candidates/${candidate.candidate_id}`}

                            className="candidate-id-link"

                          >

                            #
                            {
                              candidate.candidate_id
                            }

                          </Link>

                        </td>


                        {/* -----------------------------------------
                            RESUME
                        ----------------------------------------- */}

                        <td>

                          <div
                            className="resume-name"
                            title={
                              candidate.filename ||
                              "N/A"
                            }
                          >

                            {
                              candidate.filename ||
                              "N/A"
                            }

                          </div>

                        </td>


                        {/* -----------------------------------------
                            JOB
                        ----------------------------------------- */}

                        <td>

                          {candidate.job_id
                            ? `#${candidate.job_id}`
                            : "N/A"}

                        </td>


                        {/* -----------------------------------------
                            SCORE
                        ----------------------------------------- */}

                        <td>

                          <span className="score-value">

                            {
                              Number(
                                candidate.score ?? 0
                              )
                            }

                            /100

                          </span>

                        </td>


                        {/* -----------------------------------------
                            MATCH
                        ----------------------------------------- */}

                        <td>

                          <span className="match-value">

                            {
                              Number(
                                candidate.match_percentage ?? 0
                              )
                            }

                            %

                          </span>

                        </td>


                        {/* -----------------------------------------
                            DECISION
                        ----------------------------------------- */}

                        <td>

                          <span
                            className={`decision ${getDecisionClass(
                              candidate.decision
                            )}`}
                          >

                            {
                              candidate.decision ||
                              "REVIEW"
                            }

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

    </div>

  );

}


export default Candidates;
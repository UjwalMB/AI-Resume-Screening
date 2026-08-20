import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";


function Dashboard() {

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedJob, setSelectedJob] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // GET TOKEN
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

      const token = getToken();

      if (!token) {

        setError(
          "Authentication required. Please login again."
        );

        return;
      }


      const response = await axios.get(

        "http://127.0.0.1:8000/jobs",

        {
          headers: {

            Authorization:
              `Bearer ${token}`

          }
        }

      );


      setJobs(response.data);

    }

    catch (error) {

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

        "Unable to load jobs."

      );

    }

  };


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


      const token = getToken();


      if (!token) {

        setError(
          "Authentication required. Please login again."
        );

        setCandidates([]);

        return;

      }


      const response = await axios.get(

        "http://127.0.0.1:8000/candidates",

        {
          headers: {

            Authorization:
              `Bearer ${token}`

          }
        }

      );


      console.log(
        "Candidates received:",
        response.data
      );


      setCandidates(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    }

    catch (error) {

      console.error(
        "Failed to load candidates:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );


      setCandidates([]);


      setError(

        error.response?.data?.detail ||

        "Unable to load candidates."

      );

    }

    finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FILTER CANDIDATES BY JOB
  // =====================================================

  const filteredCandidates =

    selectedJob === "all"

      ? candidates

      : candidates.filter(

          (candidate) =>

            String(candidate.job_id) ===
            String(selectedJob)

        );


  // =====================================================
  // BASIC STATISTICS
  // =====================================================

  const totalCandidates =
    filteredCandidates.length;


  // =====================================================
  // DECISIONS
  // =====================================================

  const shortlisted =

    filteredCandidates.filter(

      (candidate) =>

        candidate.decision
          ?.toLowerCase()
          .trim() === "shortlist"

    ).length;


  const review =

    filteredCandidates.filter(

      (candidate) =>

        candidate.decision
          ?.toLowerCase()
          .trim() === "review"

    ).length;


  const rejected =

    filteredCandidates.filter(

      (candidate) =>

        candidate.decision
          ?.toLowerCase()
          .trim() === "reject"

    ).length;


  // =====================================================
  // AVERAGE SCORE
  // =====================================================

  const averageScore =

    totalCandidates > 0

      ? Math.round(

          filteredCandidates.reduce(

            (total, candidate) =>

              total +
              Number(
                candidate.score || 0
              ),

            0

          ) / totalCandidates

        )

      : 0;


  // =====================================================
  // AVERAGE JOB MATCH
  // =====================================================

  const averageJobMatch =

    totalCandidates > 0

      ? Math.round(

          filteredCandidates.reduce(

            (total, candidate) =>

              total +

              Number(
                candidate.match_percentage || 0
              ),

            0

          ) / totalCandidates

        )

      : 0;


  // =====================================================
  // DECISION CHART
  // =====================================================

  const decisionData = [

    {
      name: "Shortlisted",
      value: shortlisted,
    },

    {
      name: "Review",
      value: review,
    },

    {
      name: "Rejected",
      value: rejected,
    },

  ];


  // =====================================================
  // SCORE DISTRIBUTION
  // =====================================================

  const scoreData = [

    {
      name: "0-20",

      candidates:

        filteredCandidates.filter(

          (candidate) =>

            Number(
              candidate.score || 0
            ) <= 20

        ).length,
    },


    {
      name: "21-40",

      candidates:

        filteredCandidates.filter(

          (candidate) => {

            const score =

              Number(
                candidate.score || 0
              );


            return (
              score >= 21 &&
              score <= 40
            );

          }

        ).length,
    },


    {
      name: "41-60",

      candidates:

        filteredCandidates.filter(

          (candidate) => {

            const score =

              Number(
                candidate.score || 0
              );


            return (
              score >= 41 &&
              score <= 60
            );

          }

        ).length,
    },


    {
      name: "61-80",

      candidates:

        filteredCandidates.filter(

          (candidate) => {

            const score =

              Number(
                candidate.score || 0
              );


            return (
              score >= 61 &&
              score <= 80
            );

          }

        ).length,
    },


    {
      name: "81-100",

      candidates:

        filteredCandidates.filter(

          (candidate) =>

            Number(
              candidate.score || 0
            ) >= 81

        ).length,
    },

  ];


  // =====================================================
  // SELECTED JOB NAME
  // =====================================================

  const selectedJobObject =

    jobs.find(

      (job) =>

        String(job.id) ===
        String(selectedJob)

    );


  const selectedJobName =

    selectedJob === "all"

      ? "All Jobs"

      : selectedJobObject?.title ||
        `Job #${selectedJob}`;


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="dashboard">


      {/* =================================================
          HEADER
      ================================================= */}

      <h1>
        AI Resume Screening Dashboard
      </h1>


      <p>
        Overview of candidates screened by the
        AI resume screening system.
      </p>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <p className="error">
          {error}
        </p>

      )}


      {/* =================================================
          JOB FILTER
      ================================================= */}

      <div className="upload-card">

        <label htmlFor="job-select">

          Filter by Job

        </label>


        <select

          id="job-select"

          value={selectedJob}

          onChange={(event) =>

            setSelectedJob(
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

              {job.title}

            </option>

          ))}

        </select>

      </div>


      {/* =================================================
          SELECTED JOB
      ================================================= */}

      <h2>

        {selectedJobName}

      </h2>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <p>
          Loading dashboard...
        </p>

      ) : (

        <>


          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="dashboard-cards">


            <div className="dashboard-card">

              <span>
                Total Candidates
              </span>

              <strong>
                {totalCandidates}
              </strong>

            </div>


            <div className="dashboard-card">

              <span>
                Shortlisted
              </span>

              <strong>
                {shortlisted}
              </strong>

            </div>


            <div className="dashboard-card">

              <span>
                Needs Review
              </span>

              <strong>
                {review}
              </strong>

            </div>


            <div className="dashboard-card">

              <span>
                Rejected
              </span>

              <strong>
                {rejected}
              </strong>

            </div>


            <div className="dashboard-card">

              <span>
                Average Score
              </span>

              <strong>
                {averageScore}/100
              </strong>

            </div>


            <div className="dashboard-card">

              <span>
                Average Job Match
              </span>

              <strong>
                {averageJobMatch}%
              </strong>

            </div>


          </div>


          {/* =================================================
              CHARTS
          ================================================= */}

          <div className="dashboard-charts">


            {/* DECISION CHART */}

            <div className="chart-card">

              <h2>
                Candidate Decisions
              </h2>


              {totalCandidates === 0 ? (

                <p>
                  No candidate data available.
                </p>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={350}
                >

                  <PieChart>

                    <Pie

                      data={decisionData}

                      dataKey="value"

                      nameKey="name"

                      cx="50%"

                      cy="50%"

                      outerRadius={110}

                      label

                    />


                    <Tooltip />


                    <Legend />


                  </PieChart>

                </ResponsiveContainer>

              )}

            </div>


            {/* SCORE CHART */}

            <div className="chart-card">

              <h2>
                Score Distribution
              </h2>


              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <BarChart
                  data={scoreData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />


                  <XAxis
                    dataKey="name"
                  />


                  <YAxis
                    allowDecimals={false}
                  />


                  <Tooltip />


                  <Legend />


                  <Bar

                    dataKey="candidates"

                    name="Candidates"

                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


          </div>


          {/* =================================================
              CANDIDATES
          ================================================= */}

          <div className="candidate-section">


            <h2>
              Candidates
            </h2>


            {filteredCandidates.length === 0 ? (

              <p>
                No candidates found for this job.
              </p>

            ) : (

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

                    {filteredCandidates

                      .slice(0, 10)

                      .map(
                        (candidate) => (

                          <tr

                            key={
                              candidate.candidate_id
                            }

                          >


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


                            <td>

                              {
                                candidate.filename ||
                                "N/A"
                              }

                            </td>


                            <td>

                              {
                                candidate.score ??
                                0
                              }/100

                            </td>


                            <td>

                              {
                                candidate.match_percentage ??
                                0
                              }%

                            </td>


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


        </>

      )}


    </div>

  );

}


export default Dashboard;
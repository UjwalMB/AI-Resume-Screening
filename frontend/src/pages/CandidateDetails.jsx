import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import "./CandidateDetails.css";

function CandidateDetails() {

  const { candidateId } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchCandidate = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await api.get(
          `/candidates/${candidateId}`
        );

        console.log(
          "Candidate details:",
          response.data
        );

        setCandidate(response.data);

      } catch (error) {

        console.error(
          "Failed to load candidate:",
          error
        );

        setError(
          error.response?.data?.detail ||
          "Unable to load candidate."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchCandidate();

  }, [candidateId]);


  if (loading) {
    return (
      <div className="candidate-details-page">
        <p>Loading candidate...</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="candidate-details-page">

        <div className="error">
          {error}
        </div>

        <Link to="/candidates">
          ← Back to Candidates
        </Link>

      </div>
    );
  }


  if (!candidate) {
    return (
      <div className="candidate-details-page">

        <p>
          Candidate not found.
        </p>

        <Link to="/candidates">
          ← Back to Candidates
        </Link>

      </div>
    );
  }


  return (
    <div className="candidate-details-page">

      <Link
        to="/candidates"
        className="back-link"
      >
        ← Back to Candidates
      </Link>


      <div className="candidate-header">

        <div>

          <h1>
            Candidate #{candidate.candidate_id}
          </h1>

          <p>
            {candidate.filename || "Resume"}
          </p>

        </div>

        <strong>
          {candidate.decision || "REVIEW"}
        </strong>

      </div>


      <div className="candidate-grid">

        <div className="candidate-card">

          <h2>Screening Result</h2>

          <p>
            <strong>Score:</strong>{" "}
            {candidate.score ?? 0}/100
          </p>

          <p>
            <strong>Job Match:</strong>{" "}
            {candidate.match_percentage ?? 0}%
          </p>

          <p>
            <strong>Decision:</strong>{" "}
            {candidate.decision || "REVIEW"}
          </p>

        </div>


        <div className="candidate-card">

          <h2>Job Information</h2>

          <p>
            <strong>Job ID:</strong>{" "}
            {candidate.job_id ?? "N/A"}
          </p>

          <p>
            <strong>Job Title:</strong>{" "}
            {candidate.job_title || "N/A"}
          </p>

        </div>


        <div className="candidate-card">

          <h2>Summary</h2>

          <p>
            {candidate.summary ||
              "No summary available."}
          </p>

        </div>


        <div className="candidate-card">

          <h2>Required Skills</h2>

          {candidate.required_skills?.length > 0 ? (

            <ul>

              {candidate.required_skills.map(
                (skill, index) => (
                  <li key={index}>
                    {skill}
                  </li>
                )
              )}

            </ul>

          ) : (

            <p>No required skills available.</p>

          )}

        </div>


        <div className="candidate-card">

          <h2>Matched Skills</h2>

          {candidate.skill_gap?.matched_skills?.length > 0 ? (

            <ul>

              {candidate.skill_gap.matched_skills.map(
                (skill, index) => (
                  <li key={index}>
                    {skill}
                  </li>
                )
              )}

            </ul>

          ) : (

            <p>No matched skills.</p>

          )}

        </div>


        <div className="candidate-card">

          <h2>Missing Skills</h2>

          {candidate.skill_gap?.missing_skills?.length > 0 ? (

            <ul>

              {candidate.skill_gap.missing_skills.map(
                (skill, index) => (
                  <li key={index}>
                    {skill}
                  </li>
                )
              )}

            </ul>

          ) : (

            <p>No missing skills.</p>

          )}

        </div>


        <div className="candidate-card">

          <h2>Recommendations</h2>

          {candidate.skill_gap?.recommendations ? (

            <p>
              {Array.isArray(
                candidate.skill_gap.recommendations
              )
                ? candidate.skill_gap.recommendations.join(
                    ", "
                  )
                : candidate.skill_gap.recommendations}
            </p>

          ) : (

            <p>
              No recommendations available.
            </p>

          )}

        </div>

      </div>

    </div>
  );
}

export default CandidateDetails;
-- =========================================================
-- AI RESUME SCREENING - DATABASE INITIALIZATION
-- =========================================================


-- ---------------------------------------------------------
-- USERS TABLE
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ---------------------------------------------------------
-- CANDIDATES TABLE
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS candidates (
    id              SERIAL PRIMARY KEY,
    candidate_code  VARCHAR(50) UNIQUE NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ---------------------------------------------------------
-- RESUMES TABLE
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS resumes (
    id              SERIAL PRIMARY KEY,
    candidate_id    INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    filename        VARCHAR(255),
    raw_text        TEXT,
    redacted_text   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ---------------------------------------------------------
-- JOBS TABLE
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS jobs (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    required_skills TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ---------------------------------------------------------
-- EVALUATIONS TABLE
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS evaluations (
    id                  SERIAL PRIMARY KEY,
    resume_id           INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
    job_id              INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    score               INTEGER,
    match_percentage    DECIMAL(5, 2),
    summary             TEXT,
    decision            VARCHAR(20),
    ml_prediction       VARCHAR(20),
    ml_confidence       DECIMAL(5, 2),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ---------------------------------------------------------
-- CANDIDATE SKILL GAPS TABLE
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS candidate_skill_gaps (
    id              SERIAL PRIMARY KEY,
    candidate_id    INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
    matched_skills  TEXT,
    missing_skills  TEXT,
    recommendations TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ---------------------------------------------------------
-- DEFAULT JOB (so job_id=1 exists for uploads)
-- ---------------------------------------------------------

INSERT INTO jobs (title, description, required_skills)
SELECT 'General Software Developer',
       'General software development position',
       'Python, JavaScript, SQL, Git'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE id = 1);

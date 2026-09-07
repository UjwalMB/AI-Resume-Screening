# 🤖 AI Resume Screening & Job Recommendation System

An AI-powered resume screening system that analyzes resumes, extracts skills, evaluates candidates, matches them with suitable jobs, identifies skill gaps, and provides personalized job recommendations.

The system combines **NLP, Machine Learning, SBERT semantic similarity, rule-based scoring, and skill matching** to provide an intelligent resume evaluation pipeline.

---

## 🚀 Features

### 📄 Resume Analysis
- Upload PDF resumes
- Extract resume text automatically
- Analyze resume quality
- Generate an overall resume score

### 🧠 AI Skill Extraction
Automatically detects technical skills such as:

- Python
- Java
- JavaScript
- React
- SQL
- MySQL
- FastAPI
- Flask
- Machine Learning
- NLP
- SBERT
- Pandas
- NumPy
- Scikit-learn
- Docker
- AWS
- Git
- GitHub

### 🎯 Job Matching

Compares candidate skills with job requirements and calculates:

- Matched skills
- Missing skills
- Skill match percentage

### 🤖 SBERT Semantic Matching

The system uses **Sentence-BERT (SBERT)** to calculate semantic similarity between:

- Resume content
- Job descriptions

This allows the system to consider the meaning of the resume instead of relying only on exact keyword matching.

### 📊 Skill Gap Analysis

Identifies skills required by a job but missing from the candidate's resume.

The system also provides recommendations for improving missing skills.

### 💼 Job Recommendation

The system analyzes the resume against available job roles and recommends the most suitable jobs.

Each recommendation contains:

- Job title
- Required skills
- Matched skills
- Missing skills
- Skill match percentage
- SBERT similarity
- Final recommendation score

### 🧮 Machine Learning Prediction

The ML component predicts candidate screening status:

- `SHORTLIST`
- `REVIEW`
- `REJECT`

The system also compares the ML prediction with the rule-based decision.

### 📈 Recruiter Dashboard

The dashboard displays:

- Total candidates
- Shortlisted candidates
- Rejected candidates
- Candidates requiring review
- Average match percentage

---

# 🏗️ System Architecture

```text
                         ┌───────────────────┐
                         │       User        │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │  React Frontend   │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │   Nginx Proxy     │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │   FastAPI Backend  │
                         └─────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
       │ PDF Parser  │      │    Skill     │      │     NLP     │
       │  PyMuPDF    │      │  Extractor   │      │ Processing  │
       └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │       SBERT       │
                         │ Semantic Matching │
                         └─────────┬─────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
        ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
        │ Job Matching│    │ Skill Gap   │    │ ML Model    │
        └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
               │                  │                  │
               └──────────────────┼──────────────────┘
                                  │
                                  ▼
                         ┌───────────────────┐
                         │ Final Evaluation  │
                         └─────────┬─────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
              ┌──────────────┐           ┌──────────────┐
              │ Screening    │           │ Recommended  │
              │ Decision     │           │ Jobs         │
              └──────────────┘           └──────────────┘
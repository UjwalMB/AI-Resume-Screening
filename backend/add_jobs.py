from app.database import get_connection


jobs = [
    (
        "Python Developer",
        "Develop backend applications, REST APIs and automation tools using Python.",
        "Python, FastAPI, Flask, SQL, Git"
    ),
    (
        "Backend Developer",
        "Build scalable backend services and APIs for web applications.",
        "Python, FastAPI, PostgreSQL, REST API, Git, Docker"
    ),
    (
        "FastAPI Developer",
        "Develop high-performance REST APIs and backend services using FastAPI.",
        "Python, FastAPI, PostgreSQL, SQL, Docker, Git"
    ),
    (
        "Machine Learning Engineer",
        "Build, train and deploy machine learning models for real-world applications.",
        "Python, Machine Learning, Scikit-learn, Pandas, NumPy, SQL"
    ),
    (
        "Data Scientist",
        "Analyze datasets, build predictive models and generate business insights.",
        "Python, Pandas, NumPy, Machine Learning, SQL, Statistics"
    ),
    (
        "Data Analyst",
        "Analyze business data and create reports and data-driven insights.",
        "Python, SQL, Pandas, Excel, Statistics, Power BI"
    ),
    (
        "AI Engineer",
        "Develop artificial intelligence applications using machine learning and NLP techniques.",
        "Python, Machine Learning, NLP, TensorFlow, PyTorch, SQL"
    ),
    (
        "NLP Engineer",
        "Develop natural language processing systems for text classification and semantic search.",
        "Python, NLP, Machine Learning, Transformers, PyTorch, SBERT"
    ),
    (
        "Software Developer",
        "Design, develop, test and maintain software applications.",
        "Python, Java, JavaScript, SQL, Git, Data Structures"
    ),
    (
        "Full Stack Developer",
        "Develop complete web applications across frontend and backend systems.",
        "Python, JavaScript, React, Node.js, SQL, Git"
    ),
    (
        "React Developer",
        "Build responsive and interactive web interfaces using React.",
        "JavaScript, React, HTML, CSS, Git, REST API"
    ),
    (
        "DevOps Engineer",
        "Automate deployment pipelines and manage application infrastructure.",
        "Docker, Kubernetes, Linux, Git, AWS, CI/CD"
    ),
    (
        "Cloud Engineer",
        "Deploy and maintain cloud-based applications and infrastructure.",
        "AWS, Docker, Kubernetes, Linux, Python, Git"
    ),
    (
        "SQL Developer",
        "Design databases, write complex queries and optimize database performance.",
        "SQL, PostgreSQL, MySQL, Database Design, Python"
    ),
    (
        "Python Data Analyst",
        "Use Python and data analysis libraries to process and visualize datasets.",
        "Python, Pandas, NumPy, SQL, Matplotlib, Statistics"
    ),
    (
        "Machine Learning Intern",
        "Assist in developing machine learning models and preparing datasets.",
        "Python, Machine Learning, Pandas, NumPy, Scikit-learn"
    ),
    (
        "Data Science Intern",
        "Support data analysis, preprocessing and machine learning projects.",
        "Python, Pandas, NumPy, SQL, Machine Learning"
    ),
    (
        "AI/ML Intern",
        "Work on artificial intelligence and machine learning projects under senior engineers.",
        "Python, Machine Learning, NLP, Pandas, NumPy, Git"
    ),
    (
        "Backend Developer Intern",
        "Assist in developing REST APIs and backend services.",
        "Python, FastAPI, SQL, Git, REST API"
    ),
    (
        "Software Engineer",
        "Develop reliable software systems and collaborate on application development.",
        "Python, Java, SQL, Git, Data Structures, Algorithms"
    )
]


connection = get_connection()
cursor = connection.cursor()

try:
    cursor.execute("DELETE FROM jobs")

    cursor.executemany(
        """
        INSERT INTO jobs
        (title, description, required_skills)
        VALUES (%s, %s, %s)
        """,
        jobs
    )

    connection.commit()

    print("=" * 50)
    print("JOB DATASET INSERTED SUCCESSFULLY")
    print("=" * 50)
    print(f"Total jobs inserted: {len(jobs)}")

except Exception as e:
    connection.rollback()
    print("Error inserting jobs:")
    print(e)

finally:
    cursor.close()
    connection.close()
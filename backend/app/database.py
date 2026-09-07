import os
import psycopg
from dotenv import load_dotenv


# --------------------------------------------------
# Load environment variables from backend/.env
# --------------------------------------------------

load_dotenv()


# --------------------------------------------------
# Database configuration
# --------------------------------------------------

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "dbname=resume_screening user=ujwal password=password host=localhost port=5432"
)


# --------------------------------------------------
# Create database connection
# --------------------------------------------------

def get_connection():
    return psycopg.connect(DATABASE_URL)


# --------------------------------------------------
# Test database connection
# --------------------------------------------------

def test_connection():

    try:
        connection = get_connection()

        print("Database connected successfully!")

        connection.close()

    except Exception as e:

        print("Database connection failed!")
        print(f"Error: {e}")


# --------------------------------------------------
# Run directly
# --------------------------------------------------

if __name__ == "__main__":
    test_connection()
"""
WSGI entry point for production deployment
"""
import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

from API import app

if __name__ == "__main__":
    app.run()

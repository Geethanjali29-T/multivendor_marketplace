"""
Vercel Serverless Entry Point for Flask Backend.
This file imports the Flask app from app.py and exposes it as `app`
so Vercel's Python runtime can serve it as a serverless function.
"""
import sys
import os

# Add the flask_backend directory to the path so we can import app.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

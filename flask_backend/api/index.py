"""
Vercel Serverless Entry Point for Flask Backend.
When Vercel deploys from the flask_backend/ directory,
this file at api/index.py is found automatically.
The Flask `app` object is the WSGI handler Vercel needs.
"""
import sys
import os

# Make sure app.py (one level up from api/) is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel looks for `app` as the WSGI callable

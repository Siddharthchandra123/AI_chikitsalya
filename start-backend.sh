#!/bin/bash

# Backend startup script for production

set -e

cd "$(dirname "$0")/backend"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Set environment variables
export FLASK_ENV=production
export PYTHONUNBUFFERED=1

# Run migrations if applicable
echo "Starting Medical AI Backend..."

# Start with gunicorn
exec gunicorn \
    --bind 0.0.0.0:${PORT:-5000} \
    --workers ${WORKERS:-4} \
    --worker-class sync \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    API:app

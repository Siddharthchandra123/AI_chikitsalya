# Deployment Guide

Prereqs:

- Docker and Docker Compose installed.
- (Optional) A GitHub repo to use GHCR for image hosting.

Local quickstart:

1. Copy `.env.example` to `.env` and edit values.

2. Build and run with docker-compose:

```bash
docker compose build
docker compose up -d
```

3. Open the frontend at http://localhost:3000 and backend API at http://localhost:5000

Continuous Integration:

- The repository contains `.github/workflows/ci-build.yml` which builds and pushes images to `ghcr.io/${{ github.repository_owner }}` on pushes to `main`.
- No additional secrets are required for basic GHCR pushes since the workflow uses `GITHUB_TOKEN`.

Notes:

- The Python backend Dockerfile uses Gunicorn to serve the Flask app (`API:app`).
- The frontend build uses the provided Next.js dockerfile at `frontend/dockerfile.frontend`.
- If you prefer Docker Hub, update the workflow credentials and tags accordingly.

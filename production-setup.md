# Production Setup Guide - Chikitsalya Medical AI

## Overview
This guide walks you through setting up the Chikitsalya Medical AI application for production deployment.

## Prerequisites
- Docker & Docker Compose (recommended)
- Node.js 20+ (for local deployment)
- Python 3.10+ (for local deployment)
- Git

## Quick Start with Docker

### 1. Environment Configuration
```bash
# Copy and update environment files
cp .env.example .env.production
# Edit .env.production with your actual URLs and settings
```

### 2. Build and Run
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Local Deployment (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
set FLASK_ENV=production
set PORT=5000

# Run with gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 API:app
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server
pnpm start
```

## Production Deployment Checklist

### Security
- [ ] Update CORS settings in backend API
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure headers (already configured in next.config.production.mjs)
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CSRF protection if needed

### Backend
- [ ] Update API_URL in frontend .env files
- [ ] Configure database connections (if applicable)
- [ ] Set up logging and monitoring
- [ ] Configure backup strategies
- [ ] Set up health checks
- [ ] Configure auto-restart policies

### Frontend
- [ ] Update NEXT_PUBLIC_API_URL to production API URL
- [ ] Verify analytics integration
- [ ] Test all API endpoints
- [ ] Optimize images and assets
- [ ] Set up CDN for static files
- [ ] Configure cache headers

### Infrastructure
- [ ] Set up load balancing if needed
- [ ] Configure auto-scaling
- [ ] Set up monitoring and alerts
- [ ] Configure backup and disaster recovery
- [ ] Document deployment process
- [ ] Set up CI/CD pipeline

## Environment Variables

### Backend (.env)
```
FLASK_ENV=production
PORT=5000
HOST=0.0.0.0
MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
USE_SUMMARIZER=true
```

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME=Chikitsalya Medical AI
```

## Monitoring and Logging

### Backend Logs
```bash
# View logs
docker-compose logs backend -f

# Access application logs
tail -f /var/log/flask-app.log
```

### Health Checks
- Backend: GET `/predict` endpoint
- Frontend: Check 3000 port response

## Troubleshooting

### Backend Issues
1. Check logs: `docker-compose logs backend`
2. Verify Python dependencies: `pip list`
3. Check port availability: `netstat -an | grep 5000`
4. Verify CORS configuration

### Frontend Issues
1. Check build output: `pnpm build`
2. Verify environment variables
3. Check API connectivity: Test API_URL in browser console
4. Clear .next cache: `rm -rf .next`

## Performance Optimization

### Backend
- Use Gunicorn with appropriate worker count (CPUs * 2 + 1)
- Enable caching for model predictions
- Use connection pooling for databases
- Monitor memory usage

### Frontend
- Enable image optimization
- Minimize CSS/JS bundles
- Use Next.js built-in compression
- Configure CDN for static assets

## Maintenance

### Regular Tasks
- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Backup data regularly
- Test disaster recovery procedures

## Support
For issues or questions, refer to the main README.md or contact the development team.

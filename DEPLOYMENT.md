# Deployment Instructions

## Overview
This document provides step-by-step instructions for deploying the Chikitsalya Medical AI application to production.

## Pre-Deployment Checklist

### Environment Preparation
- [ ] Verify all dependencies are installed
- [ ] Test application locally
- [ ] Update environment variables
- [ ] Backup existing database/data
- [ ] Review security settings

### Configuration
- [ ] Update API URLs in frontend `.env.production`
- [ ] Configure CORS origins in backend
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging and monitoring
- [ ] Set database connection strings

## Deployment Methods

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone <repo-url>
cd AI_chikitsalya

# Setup environment
cp .env.example .env.production
# Edit .env.production with your settings

# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Deployment (Ubuntu/Linux)

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_ENV=production
export PORT=5000

# Run backend with gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 API:app
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
pnpm install

# Build production bundle
pnpm build

# Start production server
pnpm start
```

### Option 3: Systemd Service (Linux)

Create `/etc/systemd/system/medical-ai-backend.service`:
```ini
[Unit]
Description=Medical AI Backend
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/opt/medical-ai/backend
ExecStart=/opt/medical-ai/backend/venv/bin/gunicorn \
    --bind 0.0.0.0:5000 \
    --workers 4 \
    --timeout 120 \
    API:app
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable medical-ai-backend
sudo systemctl start medical-ai-backend
```

### Option 4: PM2 (Node.js Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem.config.js in project root
# (See ecosystem.config.js template below)

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Configure PM2 to start on boot
pm2 startup
```

#### ecosystem.config.js Template
```javascript
module.exports = {
  apps: [
    {
      name: 'medical-ai-backend',
      script: './backend/API.py',
      interpreter: '/usr/bin/python3',
      instances: 4,
      max_memory_restart: '1G',
      env: {
        FLASK_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'medical-ai-frontend',
      script: './frontend/node_modules/.bin/next',
      args: 'start',
      instances: 1,
      max_memory_restart: '1G',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

## Render Free Deployment

This project includes a `render.yaml` manifest for Render free-tier deployment.

1. Create two Render services:
   - `AI Chikitsalya Backend` using `Dockerfile.backend`
   - `AI Chikitsalya Frontend` using `Dockerfile.frontend`
2. Set service environment variables:
   - `BACKEND`: `PORT=5000`, `CORS_ORIGINS` to the frontend service URL
   - `FRONTEND`: `PORT=3000`, `NEXT_PUBLIC_API_URL` to the backend service URL
3. Deploy from the `main` branch and update the live service URLs in the Render dashboard.

> Render will build the Docker images automatically using the service manifest.

## Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/medical-ai`:

```nginx
upstream frontend {
    server 127.0.0.1:3000;
}

upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 100M;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 60s;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/medical-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Post-Deployment Verification

```bash
# Check backend health
curl http://localhost:5000/predict

# Check frontend
curl http://localhost:3000

# Check logs
docker-compose logs -f # if using Docker

# Monitor resource usage
docker stats # if using Docker
top # or htop for Linux
```

## SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo systemctl enable certbot.timer
```

## Monitoring and Logging

### Backend Logs
```bash
# Docker
docker-compose logs backend -f

# Systemd
sudo journalctl -u medical-ai-backend -f

# PM2
pm2 logs medical-ai-backend
```

### Health Checks
Setup monitoring with services like:
- UptimeRobot
- Datadog
- New Relic
- CloudWatch

Configure health check endpoints:
- Backend: GET `/predict`
- Frontend: GET `/api/health`

## Troubleshooting

### Port Already in Use
```bash
# Kill process using port
sudo lsof -i :5000
sudo kill -9 <PID>

# Or change port in environment variables
export PORT=5001
```

### Database Connection Issues
- Verify database server is running
- Check connection string in environment variables
- Verify firewall rules

### Memory Issues
- Monitor resource usage: `docker stats` or `top`
- Increase worker count for backend
- Optimize frontend bundle size

### SSL Certificate Errors
- Verify certificate paths in Nginx config
- Check certificate expiration: `openssl x509 -enddate -noout -in /path/to/cert`
- Renew certificate if expired

## Rollback Procedure

```bash
# Docker rollback
docker-compose down
git checkout <previous-version>
docker-compose build
docker-compose up -d

# Traditional rollback
# Backup current version
cp -r /opt/medical-ai /opt/medical-ai-backup-$(date +%s)
# Restore previous version
git checkout <previous-version>
systemctl restart medical-ai-backend
```

## Performance Optimization

1. **Enable caching** in frontend (`next.config.mjs`)
2. **Use CDN** for static assets (Cloudflare, AWS CloudFront)
3. **Database optimization** - add indexes for frequent queries
4. **API rate limiting** - implement in backend
5. **Compression** - enable gzip in Nginx
6. **Load balancing** - use for high-traffic deployments

## Maintenance

### Regular Tasks
- Monitor logs daily
- Review performance metrics
- Update dependencies monthly
- Test backup/recovery procedures
- Update SSL certificates 30 days before expiration

### Database Maintenance
- Backup regularly (daily recommended)
- Vacuum and optimize tables
- Monitor disk space
- Archive old logs

## Support and Documentation

For additional help:
- Check logs first
- Review [production-setup.md](./production-setup.md)
- Consult main [README.md](./readme.md)
- Contact development team

---
Last Updated: May 2026

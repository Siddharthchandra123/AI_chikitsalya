# Security Layer Documentation

## Overview
This document outlines all security layers implemented in the Chikitsalya Medical AI application.

## Backend Security (Python/Flask)

### 1. **CORS (Cross-Origin Resource Sharing)**
- **File**: `backend/security.py`
- **Configuration**:
  - Restricted origins (configurable via `CORS_ORIGINS` env var)
  - Limited HTTP methods (GET, POST, OPTIONS)
  - Explicit allowed headers
  - Max-age caching for preflight requests

### 2. **Rate Limiting**
- **Type**: Per-IP rate limiting
- **Configuration**:
  - 100 requests per hour per IP
  - Sliding window algorithm
  - Returns 429 status when exceeded
  - Tracks remaining requests in response headers

### 3. **Input Validation & Sanitization**
- **Query Validation**:
  - Length checks (3-5000 characters)
  - Character whitelist (alphanumeric + punctuation)
  - XSS prevention through pattern matching
  
- **File Upload Validation**:
  - Allowed extensions only (.jpg, .png, .gif, .bmp)
  - Maximum file size: 20MB
  - Filename sanitization to prevent directory traversal
  - File size verification

- **Language Validation**:
  - Whitelist of supported languages
  - Prevents invalid language codes

### 4. **Security Headers**
Applied to all responses:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### 5. **Request Size Limits**
- Max content length: 50MB
- Max JSON payload: 10MB
- Max query length: 5000 characters

### 6. **Error Handling**
- Custom error handlers for 400, 404, 405, 500
- Generic error messages (no sensitive info leaked)
- Comprehensive logging of errors

### 7. **Logging & Monitoring**
- Security events logged to `logs/security.log`
- API requests logged with timestamps
- Client IP tracking (with proxy support)
- Rate limit tracking per IP
- All security violations logged with context

### 8. **File Upload Security**
- Secure filename generation using `werkzeug.security`
- File extension validation
- Size validation
- Uploaded files in isolated directory
- Optional file cleanup after processing

## Frontend Security (React/Next.js)

### 1. **Content Security Policy (CSP)**
- Configured in `frontend/next.config.mjs`
- Restricts script sources
- Prevents inline scripts

### 2. **Input Validation**
- **File**: `frontend/lib/security.ts`
- Query length and character validation
- File type and size validation
- Real-time validation feedback

### 3. **XSS Prevention**
- Input sanitization function
- HTML entity encoding
- Output escaping in React components

### 4. **HTTPS/TLS**
- Strict-Transport-Security header
- HTTPS-only in production
- Certificate pinning recommendations

### 5. **API Communication Security**
- Validated API base URL from environment
- Request timeout configuration (120 seconds)
- Secure axios instance with interceptors
- Token management for authenticated requests

### 6. **Security Headers**
- Applied via Next.js middleware
- Frames denied (X-Frame-Options: DENY)
- Content-type enforcement
- XSS protection headers

## Environment Variables Security

### Backend (.env.production)
```
FLASK_ENV=production          # Disable debug mode
SECRET_KEY=<strong-key>       # Change in production
CORS_ORIGINS=your-domain.com
ENABLE_CORS=true
```

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Docker Security

### Backend Container
- Non-root user execution (recommended in Dockerfile)
- Minimal base image (python:3.10-slim)
- Read-only filesystem (where possible)
- Resource limits

### Frontend Container
- Multi-stage build
- Minimal production image
- No node_modules in production
- Security scanning recommended

## Network Security

### Nginx Configuration (.nginx.conf)
- HTTPS enforcement
- Security headers
- Request size limits (100MB for uploads)
- Timeout configurations
- SSL/TLS configuration

### Load Balancer Configuration
- DDoS protection
- Geographic restrictions (if needed)
- WAF (Web Application Firewall) recommended
- Rate limiting at edge

## Database Security

### Recommendations
- Use parameterized queries (already done with ORM)
- Encrypt sensitive data at rest
- Use connection pooling
- Implement database-level access controls
- Regular backups and encryption

## API Security Best Practices Implemented

✅ **Rate Limiting**: Per-IP request throttling
✅ **Input Validation**: Whitelist approach for all inputs
✅ **Output Encoding**: Proper response formatting
✅ **CORS**: Restricted to configured origins
✅ **Security Headers**: All major headers configured
✅ **Error Handling**: Generic error messages
✅ **Logging**: Comprehensive security event logging
✅ **HTTPS**: Ready for production deployment
✅ **Request Size Limits**: Prevents denial of service
✅ **File Upload Security**: Validated and sanitized

## Monitoring & Alerts

### Security Events to Monitor
1. Rate limit exceeded - indicates potential attack
2. Invalid inputs - SQL injection or XSS attempts
3. File upload violations - suspicious activity
4. Authentication failures - unauthorized access attempts
5. High error rates - application issues
6. Unusual traffic patterns - bot activity

### Recommended Tools
- **Logging**: ELK Stack, Datadog, CloudWatch
- **Monitoring**: Prometheus, Grafana, New Relic
- **SIEM**: Splunk, Sumo Logic
- **WAF**: AWS WAF, Cloudflare, Imperva

## Compliance Checklist

### OWASP Top 10
- [ ] A01:2021 – Broken Access Control
- [ ] A02:2021 – Cryptographic Failures
- [ ] A03:2021 – Injection
- [ ] A04:2021 – Insecure Design
- [ ] A05:2021 – Security Misconfiguration
- [ ] A06:2021 – Vulnerable and Outdated Components
- [ ] A07:2021 – Identification and Authentication Failures
- [ ] A08:2021 – Software and Data Integrity Failures
- [ ] A09:2021 – Logging and Monitoring Failures
- [ ] A10:2021 – Server-Side Request Forgery

### Data Protection
- [ ] Encrypt data in transit (HTTPS)
- [ ] Encrypt data at rest
- [ ] Secure data deletion
- [ ] GDPR compliance
- [ ] Data retention policies

## Testing Security

### Recommended Testing Tools
- **Static Analysis**: SonarQube, Semgrep
- **Dynamic Analysis**: OWASP ZAP, Burp Suite
- **Dependency Scanning**: Snyk, Dependabot
- **Penetration Testing**: Professional service annually

### Security Testing Checklist
- [ ] SQL Injection tests
- [ ] XSS vulnerability tests
- [ ] CSRF token validation
- [ ] Authentication bypass attempts
- [ ] Authorization tests
- [ ] Rate limit enforcement
- [ ] Input validation bypass
- [ ] File upload exploits
- [ ] API endpoint security

## Incident Response

### Security Incident Procedures
1. **Detection**: Monitor security logs for anomalies
2. **Response**: Isolate affected systems
3. **Investigation**: Analyze logs and impacts
4. **Mitigation**: Apply fixes and patches
5. **Communication**: Notify stakeholders
6. **Recovery**: Restore normal operations
7. **Post-Incident**: Document and improve

### Emergency Contacts
- Security Team Lead: [contact info]
- Incident Response Team: [contact info]
- Legal/Compliance: [contact info]

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security](https://flask.palletsprojects.com/en/2.3.x/security/)
- [Next.js Security](https://nextjs.org/docs/going-to-production/security)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Maintenance Schedule

### Daily
- Monitor security logs
- Review rate limit violations
- Check error logs

### Weekly
- Security metrics review
- Update threat intelligence
- Test backup procedures

### Monthly
- Dependency updates
- Security patch application
- Penetration test (if applicable)

### Quarterly
- Security audit
- Compliance review
- Incident response drill

### Annually
- Full security assessment
- Third-party penetration test
- Security training update

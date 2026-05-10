# Security Implementation Checklist & Quick Start

## ✅ Security Layers Implemented

### Backend Security (Python/Flask)

#### 1. **CORS Protection** ✅
- Restricted origins configuration
- Limited HTTP methods
- Explicit allowed headers
- Prevents unauthorized cross-origin requests

#### 2. **Rate Limiting** ✅
- Per-IP rate limiting (100 requests/hour)
- Sliding window implementation
- 429 status code responses
- Rate limit headers in response

#### 3. **Input Validation & Sanitization** ✅
- Query validation (length, character whitelist, XSS prevention)
- File upload validation (extension, size, path traversal prevention)
- Language code validation against whitelist
- Filename sanitization using werkzeug

#### 4. **Security Headers** ✅
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Content-Security-Policy
- Referrer-Policy

#### 5. **Request Size Limits** ✅
- Max content length: 50MB
- Max JSON payload: 10MB
- Max query length: 5000 characters
- Prevents DoS attacks

#### 6. **Comprehensive Error Handling** ✅
- Custom handlers for 400, 404, 405, 500
- Generic error messages (no info disclosure)
- Proper HTTP status codes

#### 7. **Security Logging & Monitoring** ✅
- All security events logged to `logs/security.log`
- Client IP tracking (proxy-aware)
- Failed validation attempts logged
- Rate limit violations logged
- API request metrics

#### 8. **File Upload Security** ✅
- Allowed extensions whitelist
- File size validation
- Filename sanitization
- Path traversal attack prevention
- Isolated upload directory

### Frontend Security (React/Next.js)

#### 1. **Content Security Policy** ✅
- Implemented in Next.js config
- Restricts script sources
- Prevents inline script execution

#### 2. **Input Validation** ✅
- Query validation utility
- File validation utility
- Real-time validation feedback

#### 3. **XSS Prevention** ✅
- Input sanitization function
- HTML entity encoding
- Output escaping in components

#### 4. **HTTPS/TLS Ready** ✅
- Strict-Transport-Security header
- Environment-based URL configuration

#### 5. **API Security** ✅
- Secure axios configuration
- Request/response interceptors
- Token management utilities

## 🚀 Quick Start with Security

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
```bash
# Create .env.production file
FLASK_ENV=production
PORT=5000
CORS_ORIGINS=http://localhost:3000
```

### Step 3: Start Backend (Production)
```bash
# Option 1: Using Gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 API:app

# Option 2: Using provided script
./start-backend.bat  # Windows
./start-backend.sh   # Linux/Mac
```

### Step 4: Verify Security
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test rate limiting
for i in {1..101}; do curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"query": "I have a headache"}'; done
# Should return 429 after 100 requests
```

## 📋 Security Configuration

### Backend Environment Variables
```
FLASK_ENV=production              # Must be 'production'
PORT=5000                         # API port
HOST=0.0.0.0                      # Listen on all interfaces
CORS_ORIGINS=your-domain.com      # Allowed origins (comma-separated)
SECRET_KEY=<strong-random-key>    # Change in production
```

### Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🔒 Security Headers Explained

| Header | Purpose | Value |
|--------|---------|-------|
| `X-Content-Type-Options` | Prevent MIME sniffing | `nosniff` |
| `X-Frame-Options` | Prevent clickjacking | `DENY` |
| `X-XSS-Protection` | Enable browser XSS protection | `1; mode=block` |
| `Strict-Transport-Security` | Force HTTPS | `max-age=31536000` |
| `Content-Security-Policy` | Restrict resource loading | `default-src 'self'` |
| `Referrer-Policy` | Control referrer info | `strict-origin-when-cross-origin` |

## 📊 Monitoring Security

### View Security Logs
```bash
# Real-time monitoring
tail -f logs/security.log

# Count security events
grep "RATE_LIMIT" logs/security.log | wc -l
grep "INVALID" logs/security.log | wc -l
```

### Security Events to Monitor
- `RATE_LIMIT_EXCEEDED` - Potential attacks
- `INVALID_QUERY` - XSS/injection attempts
- `INVALID_FILE_UPLOAD` - Suspicious uploads
- `MISSING_API_KEY` - Unauthorized access
- `INVALID_LANGUAGE` - Parameter tampering
- `SERVER_ERROR` - Application issues

## 🛡️ Testing Security

### Test Rate Limiting
```bash
# Should succeed
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"query": "I have a headache"}'

# Check remaining requests
curl -i http://localhost:5000/predict | grep X-RateLimit
```

### Test Input Validation
```bash
# Too short query - should fail
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"query": "ab"}'

# Invalid characters - should fail
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"query": "test<script>alert(1)</script>"}'

# Invalid language - should fail
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"query": "headache", "lang": "xx"}'
```

### Test File Upload Security
```bash
# Invalid file type - should fail
curl -X POST http://localhost:5000/analyze-image \
  -F "image=@test.exe"

# Too large file - should fail
# Create 21MB file and upload
dd if=/dev/zero of=large.jpg bs=1M count=21
curl -X POST http://localhost:5000/analyze-image \
  -F "image=@large.jpg"
```

## 📈 Performance with Security

Rate limiting stats:
- 100 requests per hour per IP
- Sliding window algorithm
- Minimal performance impact
- Returns 429 when exceeded

Request validation overhead:
- <1ms for query validation
- Pattern matching for XSS prevention
- No significant performance impact

## 🔐 Production Deployment

### Pre-Deployment Security Checklist
- [ ] Change `SECRET_KEY` to strong random value
- [ ] Set `FLASK_ENV=production`
- [ ] Update `CORS_ORIGINS` to production domain
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up logging aggregation
- [ ] Configure monitoring & alerts
- [ ] Review security logs regularly
- [ ] Set up backup procedures
- [ ] Document incident response plan

### Deployment with Docker
```bash
docker-compose build
docker-compose up -d

# Verify security
docker-compose logs backend | grep "SECURITY\|ERROR"
```

### Nginx Reverse Proxy
```nginx
# Already configured in .nginx.conf
# Use with docker-compose for production
```

## 🆘 Troubleshooting Security

### 429 Rate Limited
- Wait 1 hour for window to reset
- Or use different IP/client
- Configure `RATE_LIMIT_REQUESTS` if needed

### 400 Bad Request
- Check query length (3-5000 characters)
- Verify no special characters in query
- Ensure `Content-Type: application/json`

### 403 CORS Error
- Verify origin in `CORS_ORIGINS`
- Check browser console for specific error
- Frontend and backend must have same origin

### 500 Server Error
- Check logs: `tail -f logs/security.log`
- Verify all dependencies installed
- Check Python syntax: `python -m py_compile API.py`

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Flask Security](https://flask.palletsprojects.com/en/2.3.x/security/)
- [Next.js Security](https://nextjs.org/docs/going-to-production/security)

## 📞 Security Support

For security issues:
1. Check [SECURITY.md](./SECURITY.md) for detailed documentation
2. Review logs in `logs/security.log`
3. Consult security team
4. Never disclose vulnerabilities publicly

---

**Last Updated**: May 2026
**Security Version**: 2.0
**Next Review**: June 2026

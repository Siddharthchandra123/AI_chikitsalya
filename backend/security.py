"""
Security configuration and middleware for the Medical AI backend
"""
import os
from functools import wraps
from datetime import datetime
import logging
import re
from typing import Tuple, Optional
from flask import request, jsonify

# Security logging
security_logger = logging.getLogger('security')
security_handler = logging.FileHandler('logs/security.log')
security_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))
security_logger.addHandler(security_handler)
security_logger.setLevel(logging.INFO)


class SecurityConfig:
    """Security configuration constants"""
    
    # CORS Configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    CORS_ALLOW_HEADERS = ['Content-Type', 'Authorization']
    CORS_ALLOW_METHODS = ['GET', 'POST', 'OPTIONS']
    CORS_MAX_AGE = 3600
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = 100  # requests per window
    RATE_LIMIT_WINDOW = 3600   # seconds (1 hour)
    RATE_LIMIT_PER_IP = 50     # requests per IP per minute
    
    # Login protection
    MAX_LOGIN_ATTEMPTS = 5
    LOGIN_LOCKOUT_SECONDS = 900  # 15 minutes

    # Request Limits
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    MAX_JSON_SIZE = 10 * 1024 * 1024       # 10MB for JSON payloads
    MAX_QUERY_LENGTH = 10000                # max characters in query
    REQUEST_TIMEOUT = 120                   # seconds
    
    # File Upload Security
    ALLOWED_UPLOAD_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
    MAX_UPLOAD_SIZE = 20 * 1024 * 1024     # 20MB
    UPLOAD_FOLDER = 'uploads'
    
    # Input Validation
    VALID_LANGUAGES = ['en', 'hi', 'es', 'fr', 'de', 'pt', 'bn', 'te', 'mr', 'ta']
    MIN_QUERY_LENGTH = 3
    MAX_QUERY_LENGTH = 5000
    
    # Security Headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
    }
    
    # Session / token management
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
    SESSION_TOKEN_EXPIRATION = 86400  # seconds (24 hours)


class InputValidator:
    """Validate and sanitize user inputs"""
    
    @staticmethod
    def validate_query(query: str) -> Tuple[bool, Optional[str]]:
        """Validate medical query input"""
        if not query:
            return False, "Query cannot be empty"
        
        if len(query) < SecurityConfig.MIN_QUERY_LENGTH:
            return False, f"Query must be at least {SecurityConfig.MIN_QUERY_LENGTH} characters"
        
        if len(query) > SecurityConfig.MAX_QUERY_LENGTH:
            return False, f"Query exceeds maximum length of {SecurityConfig.MAX_QUERY_LENGTH}"
        
        # Check for valid characters (basic XSS prevention)
        if not re.match(r'^[a-zA-Z0-9\s.,?!\'"-]+$', query):
            return False, "Query contains invalid characters"
        
        return True, None
    
    @staticmethod
    def validate_language(lang: str) -> Tuple[bool, Optional[str]]:
        """Validate language code"""
        if lang not in SecurityConfig.VALID_LANGUAGES:
            return False, f"Unsupported language: {lang}. Supported: {', '.join(SecurityConfig.VALID_LANGUAGES)}"
        
        return True, None
    
    @staticmethod
    def validate_file_upload(filename: str, file_size: int) -> Tuple[bool, Optional[str]]:
        """Validate file uploads"""
        if not filename:
            return False, "Filename cannot be empty"
        
        # Check file extension
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext not in SecurityConfig.ALLOWED_UPLOAD_EXTENSIONS:
            return False, f"File type not allowed. Allowed: {', '.join(SecurityConfig.ALLOWED_UPLOAD_EXTENSIONS)}"
        
        # Check file size
        if file_size > SecurityConfig.MAX_UPLOAD_SIZE:
            return False, f"File size exceeds maximum of {SecurityConfig.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
        
        # Prevent directory traversal attacks
        if '..' in filename or '/' in filename or '\\' in filename:
            return False, "Invalid filename detected"
        
        return True, None
    
    @staticmethod
    def validate_identity(name: str, mobile: str) -> Tuple[bool, Optional[str]]:
        """Validate user login identity details"""
        if not name:
            return False, "Name is required"

        if len(name) < 3 or len(name) > 50:
            return False, "Name must be between 3 and 50 characters"

        if not re.match(r"^[A-Za-z][A-Za-z .'-]{1,49}$", name):
            return False, "Name contains invalid characters"

        if not mobile:
            return False, "Mobile number is required"

        if not re.match(r'^[6-9][0-9]{9}$', mobile):
            return False, "Mobile number must be a valid 10-digit number"

        return True, None
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent attacks"""
        # Remove any path components
        filename = os.path.basename(filename)
        # Remove special characters except dots and underscores
        filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
        # Remove leading dots
        filename = filename.lstrip('.')
        return filename or 'file.bin'


class RateLimiter:
    """Rate limiting implementation"""
    
    def __init__(self):
        self.requests = {}  # {ip: [(timestamp, count)]}
    
    def is_rate_limited(self, client_ip: str) -> bool:
        """Check if client exceeds rate limit"""
        import time
        current_time = time.time()
        window_start = current_time - SecurityConfig.RATE_LIMIT_WINDOW
        
        if client_ip not in self.requests:
            self.requests[client_ip] = [(current_time, 1)]
            return False
        
        # Remove old requests outside the window
        self.requests[client_ip] = [
            (ts, count) for ts, count in self.requests[client_ip]
            if ts > window_start
        ]
        
        # Count total requests
        total_requests = sum(count for _, count in self.requests[client_ip])
        
        if total_requests >= SecurityConfig.RATE_LIMIT_REQUESTS:
            return True
        
        # Add current request
        self.requests[client_ip].append((current_time, 1))
        return False
    
    def get_remaining_requests(self, client_ip: str) -> int:
        """Get remaining requests for client"""
        if client_ip not in self.requests:
            return SecurityConfig.RATE_LIMIT_REQUESTS
        
        import time
        current_time = time.time()
        window_start = current_time - SecurityConfig.RATE_LIMIT_WINDOW
        
        requests_in_window = sum(
            count for ts, count in self.requests[client_ip]
            if ts > window_start
        )
        
        return max(0, SecurityConfig.RATE_LIMIT_REQUESTS - requests_in_window)


class AuthManager:
    """Simple session token manager for login and validation"""

    def __init__(self):
        self.sessions = {}  # token -> {user, expires_at}
        self.login_attempts = {}  # mobile -> [(timestamp)]

    def is_locked(self, mobile: str) -> bool:
        import time
        attempts = self.login_attempts.get(mobile, [])
        attempts = [ts for ts in attempts if ts > time.time() - SecurityConfig.LOGIN_LOCKOUT_SECONDS]
        self.login_attempts[mobile] = attempts
        return len(attempts) >= SecurityConfig.MAX_LOGIN_ATTEMPTS

    def record_attempt(self, mobile: str) -> None:
        import time
        self.login_attempts.setdefault(mobile, []).append(time.time())

    def create_session(self, user: dict) -> str:
        import secrets, time
        token = secrets.token_urlsafe(32)
        self.sessions[token] = {
            'user': user,
            'expires_at': time.time() + SecurityConfig.SESSION_TOKEN_EXPIRATION,
        }
        return token

    def validate_session(self, token: str) -> Tuple[bool, Optional[dict]]:
        import time
        session = self.sessions.get(token)
        if not session:
            return False, None
        if session['expires_at'] < time.time():
            del self.sessions[token]
            return False, None
        return True, session['user']

    def invalidate_session(self, token: str) -> None:
        if token in self.sessions:
            del self.sessions[token]


# Global rate limiter instance
rate_limiter = RateLimiter()
# Global auth manager instance
auth_manager = AuthManager()


def log_security_event(event_type: str, details: dict, level: str = 'info'):
    """Log security events"""
    log_message = f"{event_type}: {details}"
    if level == 'warning':
        security_logger.warning(log_message)
    elif level == 'error':
        security_logger.error(log_message)
    else:
        security_logger.info(log_message)


def require_auth(f):
    """Decorator to require valid session token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', "")
        token = None

        if auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[1].strip()
        elif request.is_json:
            token = request.json.get("token")

        if not token:
            log_security_event('MISSING_AUTH_TOKEN', {
                'ip': request.remote_addr,
                'endpoint': request.path
            }, 'warning')
            return jsonify({'error': 'Authorization token required'}), 401

        is_valid, user = auth_manager.validate_session(token)
        if not is_valid:
            log_security_event('INVALID_AUTH_TOKEN', {
                'ip': request.remote_addr,
                'endpoint': request.path
            }, 'warning')
            return jsonify({'error': 'Invalid or expired token'}), 401

        return f(*args, **kwargs)
    
    return decorated_function


def require_api_key(f):
    """Decorator to require API key"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            log_security_event('MISSING_API_KEY', {
                'ip': request.remote_addr,
                'endpoint': request.path
            }, 'warning')
            return jsonify({'error': 'API key required'}), 401
        
        # Validate API key (implement your validation logic)
        if not validate_api_key(api_key):
            log_security_event('INVALID_API_KEY', {
                'ip': request.remote_addr,
                'endpoint': request.path
            }, 'warning')
            return jsonify({'error': 'Invalid API key'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_api_key(api_key: str) -> bool:
    """Validate API key (implement your logic)"""
    valid_keys = os.environ.get('VALID_API_KEYS', '').split(',')
    return api_key in valid_keys


def get_client_ip(request_obj) -> str:
    """Get client IP address considering proxies"""
    if request_obj.environ.get('HTTP_X_FORWARDED_FOR'):
        return request_obj.environ.get('HTTP_X_FORWARDED_FOR').split(',')[0].strip()
    return request_obj.remote_addr

"""
Updated API with comprehensive security layers
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from medical import ask
from deep_translator import GoogleTranslator
from vision.image_analyzer import ImageAnalyzer
from security import (
    SecurityConfig, InputValidator, RateLimiter, 
    log_security_event, get_client_ip, rate_limiter,
    auth_manager, require_auth
)
import os
import re
import logging
from werkzeug.utils import secure_filename
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create logs directory
os.makedirs('logs', exist_ok=True)

# Initialize Flask app
app = Flask(__name__)

# Security: Set max content length
app.config['MAX_CONTENT_LENGTH'] = SecurityConfig.MAX_CONTENT_LENGTH

# CORS Configuration - More restrictive than default
cors_config = {
    'origins': SecurityConfig.CORS_ORIGINS,
    'methods': SecurityConfig.CORS_ALLOW_METHODS,
    'allow_headers': SecurityConfig.CORS_ALLOW_HEADERS,
    'max_age': SecurityConfig.CORS_MAX_AGE,
    'supports_credentials': False
}

CORS(app, resources={r"/*": cors_config})

# Security: Add security headers middleware
@app.after_request
def set_security_headers(response):
    """Add security headers to all responses"""
    for header, value in SecurityConfig.SECURITY_HEADERS.items():
        response.headers[header] = value
    
    # Add rate limit headers
    client_ip = get_client_ip(request)
    remaining = rate_limiter.get_remaining_requests(client_ip)
    response.headers['X-RateLimit-Remaining'] = str(remaining)
    response.headers['X-RateLimit-Limit'] = str(SecurityConfig.RATE_LIMIT_REQUESTS)
    
    return response


# Security: Rate limiting middleware
@app.before_request
def check_rate_limit():
    """Check rate limiting before processing request"""
    client_ip = get_client_ip(request)
    
    if rate_limiter.is_rate_limited(client_ip):
        log_security_event('RATE_LIMIT_EXCEEDED', {
            'ip': client_ip,
            'endpoint': request.path
        }, 'warning')
        return jsonify({
            'error': 'Rate limit exceeded. Maximum requests per hour exceeded.',
            'retry_after': SecurityConfig.RATE_LIMIT_WINDOW
        }), 429


# Initialize services
analyzer = ImageAnalyzer()

# Create upload folder if it doesn't exist
UPLOAD_FOLDER = SecurityConfig.UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }), 200


@app.route("/auth/login", methods=["POST"])
def auth_login():
    """Login endpoint accepting name and mobile number."""
    try:
        client_ip = get_client_ip(request)

        if not request.is_json:
            log_security_event('INVALID_CONTENT_TYPE', {
                'ip': client_ip,
                'content_type': request.content_type
            }, 'warning')
            return jsonify({"error": "Content-Type must be application/json"}), 400

        data = request.json or {}
        name = str(data.get("name", "")).strip()
        mobile = str(data.get("mobile", "")).strip()

        valid_identity, identity_error = InputValidator.validate_identity(name, mobile)
        if not valid_identity:
            auth_manager.record_attempt(mobile)
            log_security_event('INVALID_LOGIN', {
                'ip': client_ip,
                'mobile': mobile,
                'reason': identity_error
            }, 'warning')
            return jsonify({"error": identity_error}), 400

        if auth_manager.is_locked(mobile):
            log_security_event('LOGIN_LOCKED', {
                'ip': client_ip,
                'mobile': mobile
            }, 'warning')
            return jsonify({
                "error": "Too many failed login attempts. Try again later."
            }), 429

        user = {
            "id": f"USER-{mobile}",
            "name": name,
            "role": "patient",
            "mobile": mobile,
        }
        token = auth_manager.create_session(user)

        logger.info(f"User login success: {mobile} from {client_ip}")
        log_security_event('LOGIN_SUCCESS', {
            'ip': client_ip,
            'mobile': mobile,
        })

        return jsonify({
            "user": {
                "id": user["id"],
                "name": user["name"],
                "role": user["role"],
                "mobile": user["mobile"],
            },
            "token": token,
        }), 200
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        log_security_event('LOGIN_ERROR', {
            'ip': get_client_ip(request),
            'error': str(e)
        }, 'error')
        return jsonify({"error": "Authentication service unavailable"}), 503


@app.route("/auth/validate", methods=["POST"])
def auth_validate():
    """Validate an existing session token."""
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split("Bearer ")[1].strip()
    else:
        token = request.json.get("token") if request.is_json else None

    if not token:
        return jsonify({"valid": False, "error": "Token required"}), 400

    is_valid, user = auth_manager.validate_session(token)
    if not is_valid:
        return jsonify({"valid": False, "error": "Token invalid or expired"}), 401

    return jsonify({"valid": True, "user": user}), 200


@app.route("/auth/logout", methods=["POST"])
def auth_logout():
    """Invalidate a session token."""
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split("Bearer ")[1].strip()
    elif request.is_json:
        token = request.json.get("token")

    if token:
        auth_manager.invalidate_session(token)

    return jsonify({"success": True}), 200


@app.route("/medicare/discharge", methods=["POST"])
@require_auth
def medicare_discharge():
    """Simulate Medicare discharge integration."""
    try:
        client_ip = get_client_ip(request)

        if not request.is_json:
            log_security_event('INVALID_CONTENT_TYPE', {
                'ip': client_ip,
                'content_type': request.content_type
            }, 'warning')
            return jsonify({"error": "Content-Type must be application/json"}), 400

        data = request.json or {}
        patient_id = str(data.get("patient_id", "")).strip()
        patient_name = str(data.get("patient_name", "")).strip()

        if not patient_id:
            log_security_event('MISSING_PATIENT_ID', {
                'ip': client_ip,
                'endpoint': '/medicare/discharge'
            }, 'warning')
            return jsonify({"error": "Patient ID is required"}), 400

        if len(patient_id) > 50 or not re.match(r'^[A-Za-z0-9 _-]+$', patient_id):
            log_security_event('INVALID_PATIENT_ID', {
                'ip': client_ip,
                'patient_id': patient_id
            }, 'warning')
            return jsonify({"error": "Patient ID contains invalid characters"}), 400

        response_data = {
            "status": "Submitted",
            "detail": "Discharge summary has been forwarded to Medicare for final authorization.",
            "patient_id": patient_id,
            "patient_name": patient_name or "Unknown Patient",
            "authorization_ref": f"MC-{patient_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "approved": True,
            "approved_amount": 12500,
            "claims_contact": "help@medicare.plus",
            "timestamp": datetime.utcnow().isoformat()
        }

        log_security_event('MEDICARE_SYNC_SUCCESS', {
            'ip': client_ip,
            'patient_id': patient_id,
            'authorization_ref': response_data['authorization_ref']
        })

        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"Medicare sync error: {str(e)}")
        log_security_event('MEDICARE_SYNC_ERROR', {
            'ip': get_client_ip(request),
            'error': str(e)
        }, 'error')
        return jsonify({"error": "Failed to sync with Medicare"}), 500


@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    """
    Analyze medical images with security checks
    """
    try:
        client_ip = get_client_ip(request)
        
        # Check if file is present
        if "image" not in request.files:
            log_security_event('MISSING_FILE', {
                'ip': client_ip,
                'endpoint': '/analyze-image'
            }, 'warning')
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files["image"]
        
        if file.filename == '':
            log_security_event('EMPTY_FILENAME', {
                'ip': client_ip,
                'endpoint': '/analyze-image'
            }, 'warning')
            return jsonify({"error": "No selected file"}), 400
        
        # Validate file upload
        file_size = len(file.read())
        file.seek(0)  # Reset file pointer
        
        is_valid, error_msg = InputValidator.validate_file_upload(file.filename, file_size)
        if not is_valid:
            log_security_event('INVALID_FILE_UPLOAD', {
                'ip': client_ip,
                'filename': file.filename,
                'size': file_size,
                'reason': error_msg
            }, 'warning')
            return jsonify({"error": error_msg}), 400
        
        # Sanitize filename
        safe_filename = secure_filename(InputValidator.sanitize_filename(file.filename))
        
        # Save file
        filepath = os.path.join(UPLOAD_FOLDER, safe_filename)
        file.save(filepath)
        
        logger.info(f"Image file uploaded: {safe_filename} from {client_ip}")
        
        # Analyze image
        label, score = analyzer.analyze(filepath)
        
        # Clean up file after analysis (optional)
        # os.remove(filepath)
        
        log_security_event('IMAGE_ANALYSIS_SUCCESS', {
            'ip': client_ip,
            'filename': safe_filename,
            'prediction': label,
            'confidence': score
        })
        
        return jsonify({
            "prediction": label,
            "confidence": float(score),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    
    except Exception as e:
        logger.error(f"Image analysis error: {str(e)}")
        log_security_event('IMAGE_ANALYSIS_ERROR', {
            'ip': get_client_ip(request),
            'error': str(e)
        }, 'error')
        return jsonify({
            "error": "Image analysis failed"
        }), 500


@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    """
    Predict disease/symptoms with security checks
    """
    try:
        client_ip = get_client_ip(request)
        
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            return jsonify({"status": "ok"}), 200
        
        # Validate request has JSON
        if not request.is_json:
            log_security_event('INVALID_CONTENT_TYPE', {
                'ip': client_ip,
                'content_type': request.content_type
            }, 'warning')
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.json
        
        # Validate query exists
        if not data or 'query' not in data:
            log_security_event('MISSING_QUERY', {
                'ip': client_ip
            }, 'warning')
            return jsonify({"error": "Query field is required"}), 400
        
        user_input = data.get("query", "").strip()
        target_lang = data.get("lang", "en").strip().lower()
        
        # Validate query
        is_valid_query, query_error = InputValidator.validate_query(user_input)
        if not is_valid_query:
            log_security_event('INVALID_QUERY', {
                'ip': client_ip,
                'reason': query_error
            }, 'warning')
            return jsonify({"error": query_error}), 400
        
        # Validate language
        is_valid_lang, lang_error = InputValidator.validate_language(target_lang)
        if not is_valid_lang:
            log_security_event('INVALID_LANGUAGE', {
                'ip': client_ip,
                'language': target_lang
            }, 'warning')
            return jsonify({"error": lang_error}), 400
        
        logger.info(f"Prediction request from {client_ip}: lang={target_lang}")
        
        # Translate User Input from Regional -> English (if necessary)
        if target_lang != "en":
            try:
                user_input = GoogleTranslator(source='auto', target='en').translate(user_input)
                logger.debug(f"Translated input to English: {user_input}")
            except Exception as e:
                logger.error(f"Translation error: {str(e)}")
                log_security_event('TRANSLATION_ERROR', {
                    'ip': client_ip,
                    'target_lang': target_lang,
                    'error': str(e)
                }, 'error')
                return jsonify({"error": "Translation service unavailable"}), 503
        
        # Get AI Prediction in English
        try:
            prediction_result = ask(user_input)
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            log_security_event('PREDICTION_ERROR', {
                'ip': client_ip,
                'query': user_input,
                'error': str(e)
            }, 'error')
            return jsonify({"error": "Prediction service unavailable"}), 503
        
        # Translate Prediction back to English -> Regional (if necessary)
        if target_lang != "en":
            try:
                prediction_result = GoogleTranslator(source='en', target=target_lang).translate(prediction_result)
                logger.debug(f"Translated result to {target_lang}")
            except Exception as e:
                logger.error(f"Back-translation error: {str(e)}")
                log_security_event('BACK_TRANSLATION_ERROR', {
                    'ip': client_ip,
                    'target_lang': target_lang,
                    'error': str(e)
                }, 'error')
                # Continue with English result if translation fails
                pass
        
        log_security_event('PREDICTION_SUCCESS', {
            'ip': client_ip,
            'language': target_lang,
            'query_length': len(user_input)
        })
        
        return jsonify({
            "reply": prediction_result,
            "language": target_lang,
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    
    except Exception as e:
        logger.error(f"Unexpected error in predict: {str(e)}")
        log_security_event('PREDICT_ERROR', {
            'ip': get_client_ip(request),
            'error': str(e)
        }, 'error')
        return jsonify({
            "error": "An unexpected error occurred"
        }), 500


@app.errorhandler(400)
def bad_request(error):
    """Handle 400 errors"""
    log_security_event('BAD_REQUEST', {
        'ip': get_client_ip(request),
        'error': str(error)
    }, 'warning')
    return jsonify({"error": "Bad request"}), 400


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    log_security_event('NOT_FOUND', {
        'ip': get_client_ip(request),
        'path': request.path
    }, 'warning')
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    log_security_event('METHOD_NOT_ALLOWED', {
        'ip': get_client_ip(request),
        'method': request.method,
        'path': request.path
    }, 'warning')
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    log_security_event('SERVER_ERROR', {
        'ip': get_client_ip(request),
        'error': str(error)
    }, 'error')
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV', 'production') != 'production'
    
    logger.info(f"Starting Medical AI API on port {port} (debug={debug_mode})")
    
    # In production, use gunicorn instead
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode,
        use_reloader=False  # Disable in production
    )

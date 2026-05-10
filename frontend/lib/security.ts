"""
Frontend security configuration and utilities
"""

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// API security configuration
export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 120000, // 120 seconds
  maxContentLength: 50 * 1024 * 1024, // 50MB
  validateStatus: (status) => status >= 200 && status < 500,
};

// Input validation rules
export const validationRules = {
  query: {
    minLength: 3,
    maxLength: 5000,
    pattern: /^[a-zA-Z0-9\s.,?!'"-]+$/,
    message: 'Query contains invalid characters or length',
  },
  language: {
    allowedLanguages: ['en', 'hi', 'es', 'fr', 'de', 'pt', 'bn', 'te', 'mr', 'ta'],
  },
  fileUpload: {
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return input.replace(/[&<>"']/g, (m) => map[m]);
};

// Validate query input
export const validateQuery = (query: string): { valid: boolean; error?: string } => {
  if (!query) {
    return { valid: false, error: 'Query cannot be empty' };
  }
  
  if (query.length < validationRules.query.minLength) {
    return {
      valid: false,
      error: `Query must be at least ${validationRules.query.minLength} characters`,
    };
  }
  
  if (query.length > validationRules.query.maxLength) {
    return {
      valid: false,
      error: `Query exceeds maximum length of ${validationRules.query.maxLength}`,
    };
  }
  
  if (!validationRules.query.pattern.test(query)) {
    return { valid: false, error: validationRules.query.message };
  }
  
  return { valid: true };
};

// Validate file uploads
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
  
  if (!validationRules.fileUpload.allowedExtensions.includes(fileExt)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed: ${validationRules.fileUpload.allowedExtensions.join(', ')}`,
    };
  }
  
  if (file.size > validationRules.fileUpload.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${validationRules.fileUpload.maxSize / 1024 / 1024}MB`,
    };
  }
  
  return { valid: true };
};

// Log security events on frontend
export const logSecurityEvent = (
  eventType: string,
  details: Record<string, any> = {},
) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[SECURITY] ${eventType}:`, details);
  }
  
  // In production, send to logging service
  // sendToLoggingService(eventType, details);
};

// Secure HTTP client configuration
export const createSecureAxiosInstance = (token?: string) => {
  const axios = require('axios');
  
  const instance = axios.create({
    ...apiConfig,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add security tokens if needed
      return config;
    },
    (error) => {
      logSecurityEvent('REQUEST_ERROR', { error: error.message });
      return Promise.reject(error);
    }
  );
  
  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logSecurityEvent('UNAUTHORIZED', { endpoint: error.config?.url });
        // Redirect to login
      }
      
      if (error.response?.status === 429) {
        logSecurityEvent('RATE_LIMIT', { endpoint: error.config?.url });
      }
      
      return Promise.reject(error);
    }
  );
  
  return instance;
};

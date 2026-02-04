"""
Production settings override for Django ecommerce project.
This file extends settings.py with production-specific configurations.
Import this by setting DJANGO_SETTINGS_MODULE=ecommerce.production_settings
"""

import os
from .settings import *

# Override DEBUG setting from environment
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Security settings for production
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)

# Allowed hosts from environment
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Database configuration from environment
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'ecommerce_db'),
        'USER': os.environ.get('DB_USER', 'root'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'db'),
        'PORT': os.environ.get('DB_PORT', '3306'),
    }
}

# CORS settings for production
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost'
).split(',')

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

# Razorpay settings from environment (fallback to existing if not set)
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', RAZORPAY_KEY_ID)
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', RAZORPAY_KEY_SECRET)

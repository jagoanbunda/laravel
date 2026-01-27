# =============================================================================
# NAKES (JagoanBunda) - Production Dockerfile
# Multi-stage build optimized for Laravel 12 + Inertia.js React + Coolify
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Composer dependencies
# -----------------------------------------------------------------------------
FROM composer:2.8 AS composer-stage

WORKDIR /app

# Install system dependencies and PHP extensions before composer install
RUN apt-get update && apt-get install -y libpng-dev \
    && docker-php-ext-install gd intl zip

# Copy composer files first for better layer caching
COPY composer.json composer.lock ./

# Install production dependencies only
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction \
    --no-progress

# -----------------------------------------------------------------------------
# Stage 2: Node.js build (frontend assets)
# -----------------------------------------------------------------------------
FROM node:22-alpine AS node-builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source files needed for build
COPY resources/ resources/
COPY vite.config.js tsconfig.json ./

# Build production assets
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Production image
# -----------------------------------------------------------------------------
FROM serversideup/php:8.4-fpm-nginx AS production

# Labels for container registry and Coolify
LABEL org.opencontainers.image.title="JagoanBunda"
LABEL org.opencontainers.image.description="Child health monitoring system - stunting, ASQ-3 development screening, PMT nutrition"
LABEL org.opencontainers.image.source="https://github.com/kreanova/nakes"
LABEL org.opencontainers.image.vendor="Kreanova"

# Environment variables for production
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV PHP_OPCACHE_ENABLE=1
ENV AUTORUN_ENABLED=true
ENV AUTORUN_LARAVEL_MIGRATION=true
ENV SSL_MODE=off

# Switch to root to install additional packages
USER root

# Install additional PHP extensions needed for the application
# - intl: for localization (id_ID locale)
# - gd: for image processing (potential future use)
# - zip: for Excel exports (maatwebsite/excel)
# Note: Extensions already installed in composer-stage, skipped here

# Install Node.js for any runtime needs (optional, can be removed if not needed)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Switch back to www-data for security
USER www-data

WORKDIR /var/www/html

# Copy composer dependencies from composer stage
COPY --from=composer-stage --chown=www-data:www-data /app/vendor ./vendor

# Copy application source code
COPY --chown=www-data:www-data . .

# Copy built frontend assets from node stage
COPY --from=node-builder --chown=www-data:www-data /app/public/build ./public/build

# Generate optimized autoloader and run post-install scripts
RUN composer dump-autoload --optimize --no-dev \
    && composer run-script post-autoload-dump

# Create required directories with proper permissions
RUN mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Health check endpoint (Laravel 12 default /up route)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/up || exit 1

# Expose the port (serversideup/php uses 8080 by default for non-root)
EXPOSE 8080

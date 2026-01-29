# =============================================================================
# NAKES (JagoanBunda) - Application Image
# Application code only - built on every code change
# Uses pre-built base image with all dependencies
# =============================================================================

# Use the base image from same repository
FROM ghcr.io/jagoanbunda/laravel:base AS production

# Labels for container registry and Coolify
LABEL org.opencontainers.image.title="JagoanBunda"
LABEL org.opencontainers.image.description="Child health monitoring system - application layer"
LABEL org.opencontainers.image.source="https://github.com/jagoanbunda/laravel"
LABEL org.opencontainers.image.vendor="JagoanBunda"

# Environment variables for production
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV AUTORUN_ENABLED=true
ENV AUTORUN_LARAVEL_MIGRATION=true
ENV AUTORUN_LARAVEL_STORAGE_LINK=true
ENV AUTORUN_LARAVEL_OPTIMIZE=true

WORKDIR /var/www/html

# Copy application source code
COPY --chown=www-data:www-data . .

# Generate optimized autoloader and run post-install scripts
RUN composer dump-autoload --optimize --no-dev \
    && composer run-script post-autoload-dump

# Create storage directories with proper ownership
# Note: These may be overwritten by volume mounts at runtime,
# so serversideup entrypoint scripts also handle this
USER root
RUN mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache
USER www-data

# Health check endpoint (Laravel 12 default /up route)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/up || exit 1

# Expose port (serversideup/php uses 8080 by default for non-root)
EXPOSE 8080

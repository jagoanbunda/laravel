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

# =============================================================================
# Storage Directory Setup
# =============================================================================
# PROBLEM: Docker volume mounts create root-owned directories
# SOLUTION: Pre-create directories as root, then chown to www-data (33:33)
#
# For volume mounts to work correctly, EITHER:
# 1. Don't mount /storage directly - mount subdirs (storage/app/public)
# 2. Initialize volume on host: sudo chown -R 33:33 /path/to/volume
# 3. Use docker-compose with init service to fix permissions
#
# serversideup/php runs as www-data (UID 33) - volumes must match
# =============================================================================

USER root

# Create ALL storage directories at build time with www-data ownership
# These persist if no volume is mounted, or serve as template
RUN mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/app/public \
    bootstrap/cache \
    resources/views \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy entrypoint script for non-volume cases
COPY docker/entrypoint.d/10-storage-permissions.sh /etc/entrypoint.d/10-storage-permissions.sh
RUN chmod +x /etc/entrypoint.d/10-storage-permissions.sh

USER www-data

# Health check endpoint (Laravel 12 default /up route)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/up || exit 1

# Expose port (serversideup/php uses 8080 by default for non-root)
EXPOSE 8080

#!/bin/sh
# =============================================================================
# Laravel Storage Directory Setup
# =============================================================================
# This script ensures Laravel storage directories exist.
# 
# NOTE: This runs as www-data (NOT root) in serversideup/php images.
# It can only create directories if the parent is writable by www-data.
# 
# For volume mounts, ensure the volume is initialized with correct permissions
# BEFORE starting the container (e.g., via docker-compose or init container).
# =============================================================================

echo "[entrypoint.d] Ensuring Laravel directories exist..."

# Create storage directories (will succeed if parent is writable by www-data)
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache \
         /var/www/html/resources/views 2>/dev/null || true

# Set permissions on directories we own (skip chown - we're not root)
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

echo "[entrypoint.d] Laravel directories ready."

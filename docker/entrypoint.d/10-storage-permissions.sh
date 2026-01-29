#!/bin/sh
# Ensure Laravel storage directories exist and are writable
# This runs at container startup, AFTER volume mounts

echo "Ensuring Laravel directories exist..."

# Storage directories (may be empty from volume mount)
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache

# Ensure resources/views exists (required by view:cache)
mkdir -p /var/www/html/resources/views

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "Laravel directories ready."

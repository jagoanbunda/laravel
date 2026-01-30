#!/command/with-contenv sh
# =============================================================================
# Laravel Storage Permissions Setup
# =============================================================================
# This script ensures Laravel storage directories exist and are writable.
# 
# IMPORTANT: This script must run as root to create directories in volume mounts.
# Place in /etc/cont-init.d/ (not /etc/entrypoint.d/) to run during S6 init as root.
# =============================================================================

echo "[cont-init.d] Ensuring Laravel directories exist..."

# Create storage directories (may be empty from volume mount)
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/storage/app/public \
         /var/www/html/bootstrap/cache

# Ensure resources/views exists (required by view:cache)
mkdir -p /var/www/html/resources/views

# Set proper ownership and permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "[cont-init.d] Laravel directories ready."

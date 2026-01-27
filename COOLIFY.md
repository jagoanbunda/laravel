# Coolify Deployment Guide for NAKES (JagoanBunda)

This guide explains how to deploy the NAKES application to Coolify using the pre-built Docker image from GitHub Container Registry.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Environment Variables](#environment-variables)
5. [Service Stack Deployment](#service-stack-deployment)
6. [Health Checks](#health-checks)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Coolify v4.0+ installed and running
- GitHub repository with the Docker image pushed to GHCR
- Domain name configured (optional, for HTTPS)

---

## Quick Start

### Option 1: Single Container (Simplest)

1. In Coolify, go to **Projects** → **Add Resource** → **Application**
2. Select **Docker Image**
3. Enter image: `ghcr.io/jagoanbunda/laravel:latest`
4. Set **Port Exposes**: `8080`
5. Add environment variables (see [Environment Variables](#environment-variables))
6. Deploy!

### Option 2: Service Stack (Recommended for Production)

Use the `docker-compose.yml` file from the repository for a complete setup with queue workers and scheduler.

---

## Detailed Setup

### Docker Images Overview

This project uses **separated Docker images** for optimized builds:

| Image | Purpose | Rebuild Time |
|-------|----------|---------------|
| `ghcr.io/jagoanbunda/laravel:base` | Dependencies (PHP extensions, Composer vendor, Node modules) | ~2-5 min |
| `ghcr.io/jagoanbunda/laravel:latest` | Application code only | ~30 sec |

**Why this approach:**
- Code changes trigger fast app builds (30s)
- Dependency changes trigger full base builds (2-5min)
- Coolify deployments are instant (no dependency rebuild)

### Step 1: Create Database Resource

1. Go to **Projects** → **Add Resource** → **Database**
2. Select **MySQL 8.0**
3. Configure:
   - Database Name: `jagoanbunda`
   - Username: `nakes`
   - Password: (generate secure password)
4. Note the connection details provided by Coolify

### Step 2: Create Application Resource

1. Go to **Projects** → **Add Resource** → **Application**
2. Choose deployment method:

#### Method A: Docker Image (Recommended)
- Select **Docker Image**
- Image: `ghcr.io/jagoanbunda/laravel:latest`
- Note: This image contains application code only (dependencies in separate base image)

#### Method B: From Git Repository with Dockerfile
- Select **Git Repository**
- Repository URL: `https://github.com/jagoanbunda/laravel`
- Build Pack: **Dockerfile**
- Dockerfile Location: `./Dockerfile`

### Step 3: Configure Application Settings

#### General Settings
| Setting | Value |
|---------|-------|
| Port Exposes | `8080` |
| Health Check Path | `/up` |
| Health Check Port | `8080` |

#### Domain Configuration
- Add your domain under **Domains**
- Coolify will automatically provision SSL via Let's Encrypt

---

## Environment Variables

Add these environment variables in Coolify's **Environment Variables** section:

### Required Variables

```bash
# Laravel Core
APP_NAME=NAKES
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_TIMEZONE=Asia/Jakarta

# Database (use values from Coolify's MySQL resource)
DB_CONNECTION=mysql
DB_HOST=<COOLIFY_MYSQL_HOST>
DB_PORT=3306
DB_DATABASE=jagoanbunda
DB_USERNAME=nakes
DB_PASSWORD=<YOUR_DB_PASSWORD>

# Session/Cache/Queue
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Logging
LOG_CHANNEL=stderr
LOG_LEVEL=warning
```

### ServersideUp Configuration

```bash
# Auto-run migrations on container start
AUTORUN_ENABLED=true
AUTORUN_LARAVEL_MIGRATION=true
AUTORUN_LARAVEL_STORAGE_LINK=true
AUTORUN_LARAVEL_OPTIMIZE=true

# PHP Configuration
PHP_OPCACHE_ENABLE=1
SSL_MODE=off
```

### Generating APP_KEY

Run this command locally to generate an APP_KEY:

```bash
php artisan key:generate --show
```

Or use this PHP one-liner:
```bash
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

---

## Service Stack Deployment

For production with queue workers and scheduler, use Coolify's **Service Stack** feature.

### Step 1: Create Service Stack

1. Go to **Projects** → **Add Resource** → **Service Stack**
2. Name: `nakes-production`

### Step 2: Create docker-compose.coolify.yml

Create this file for Coolify-specific configuration:

```yaml
services:
  # Main Application
  app:
    image: ghcr.io/jagoanbunda/laravel:latest
    environment:
      APP_NAME: ${APP_NAME}
      APP_ENV: production
      APP_KEY: ${APP_KEY}
      APP_DEBUG: false
      APP_URL: ${APP_URL}
      DB_CONNECTION: mysql
      DB_HOST: ${DB_HOST}
      DB_PORT: 3306
      DB_DATABASE: ${DB_DATABASE}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      SESSION_DRIVER: database
      CACHE_STORE: database
      QUEUE_CONNECTION: database
      LOG_CHANNEL: stderr
      AUTORUN_ENABLED: "true"
      AUTORUN_LARAVEL_MIGRATION: "true"
      AUTORUN_LARAVEL_STORAGE_LINK: "true"
      PHP_OPCACHE_ENABLE: "1"
      SSL_MODE: "off"
    volumes:
      - nakes-storage:/var/www/html/storage
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/up"]
      interval: 30s
      timeout: 5s
      retries: 3

  # Queue Worker
  queue:
    image: ghcr.io/jagoanbunda/laravel:latest
    command: ["php", "/var/www/html/artisan", "queue:work", "--sleep=3", "--tries=3", "--max-time=3600"]
    environment:
      APP_NAME: ${APP_NAME}
      APP_ENV: production
      APP_KEY: ${APP_KEY}
      DB_CONNECTION: mysql
      DB_HOST: ${DB_HOST}
      DB_PORT: 3306
      DB_DATABASE: ${DB_DATABASE}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      QUEUE_CONNECTION: database
      LOG_CHANNEL: stderr
    volumes:
      - nakes-storage:/var/www/html/storage
    depends_on:
      - app

  # Scheduler
  scheduler:
    image: ghcr.io/jagoanbunda/laravel:latest
    command: ["php", "/var/www/html/artisan", "schedule:work"]
    environment:
      APP_NAME: ${APP_NAME}
      APP_ENV: production
      APP_KEY: ${APP_KEY}
      DB_CONNECTION: mysql
      DB_HOST: ${DB_HOST}
      DB_PORT: 3306
      DB_DATABASE: ${DB_DATABASE}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      QUEUE_CONNECTION: database
      LOG_CHANNEL: stderr
    volumes:
      - nakes-storage:/var/www/html/storage
    depends_on:
      - app

volumes:
  nakes-storage:
```

### Step 3: Configure in Coolify

1. Paste the compose file content
2. Set environment variables in Coolify's UI
3. Enable **Connect To Predefined Network** for database access
4. Deploy the stack

---

## Health Checks

The application includes a health check endpoint at `/up` (Laravel 12 default).

### Coolify Health Check Configuration

| Setting | Value |
|---------|-------|
| Health Check Enabled | Yes |
| Health Check Path | `/up` |
| Health Check Port | `8080` |
| Health Check Interval | `30s` |
| Health Check Timeout | `5s` |
| Health Check Retries | `3` |
| Health Check Start Period | `30s` |

### Dockerfile Health Check

The Dockerfile includes a built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/up || exit 1
```

---

## Troubleshooting

### Common Issues

#### 1. "No available server" or 404 errors

**Cause:** Health check failing, Traefik won't route traffic.

**Solution:**
- Check if the container is running: View logs in Coolify
- Verify environment variables are set correctly
- Ensure database is accessible
- Check if `/up` endpoint returns 200

#### 2. Database connection errors

**Cause:** Wrong DB credentials or host.

**Solution:**
- Verify `DB_HOST` uses Coolify's internal hostname
- Check if database resource is healthy
- Enable "Connect To Predefined Network" in Service Stack settings

#### 3. Storage permission errors

**Cause:** Volume mount permissions.

**Solution:**
Run in Coolify's Command Center:
```bash
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage
```

#### 4. Assets not loading (CSS/JS 404)

**Cause:** Assets not built or Vite manifest missing.

**Solution:**
- Ensure the Docker image was built correctly with frontend assets
- Check that `/public/build` directory exists in the container

#### 5. APP_KEY errors

**Cause:** Missing or invalid APP_KEY.

**Solution:**
- Generate a new key and set it in environment variables
- Format must be: `base64:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX=`

### Viewing Logs

In Coolify:
1. Go to your application resource
2. Click **Logs** tab
3. View real-time or historical logs

The application logs to `stderr` for easy container log collection.

### Manual Commands

Run artisan commands via Coolify's Command Center:

```bash
# Clear cache
php /var/www/html/artisan cache:clear

# Run migrations
php /var/www/html/artisan migrate --force

# Create storage link
php /var/www/html/artisan storage:link

# Optimize
php /var/www/html/artisan optimize
```

---

## Updating the Application

### New Deployment Workflow (Separated Base + App Images)

The project now uses **separated Docker images** for faster deployments:

#### Image Structure
- **Base Image** (`ghcr.io/jagoanbunda/laravel:base`)
  - Contains: PHP extensions, Composer vendor, Node modules, built frontend
  - Built only when: Dockerfile.base, composer.json, or package.json changes
  - Build time: ~2-5 minutes
  - Updated rarely

- **Application Image** (`ghcr.io/jagoanbunda/laravel:latest`)
  - Contains: Application code only
  - Built on: Every push to main/develop branches
  - Build time: ~30 seconds (uses pre-built base image)
  - Updated frequently

#### Deployment Workflow

1. **Dependency Changes** (composer.json, package.json, Dockerfile.base):
   ```
   Push to GitHub → docker-build.yml runs → Base image rebuilds (2-5 min)
   ```

2. **Code Changes** (PHP, React, routes, etc.):
   ```
   Push to GitHub → docker-build-app.yml runs → App image rebuilds (30 sec)
   Coolify pulls latest → Fast deployment
   ```

3. **Manual Force Rebuild**:
   - Use `workflow_dispatch` in GitHub Actions
   - Go to Actions tab → Select workflow → Run workflow

### Automatic Updates (Recommended)

1. Push changes to GitHub
2. GitHub Actions builds and pushes new image to GHCR
3. In Coolify, click **Redeploy** or enable **Auto Deploy on Push**

### Manual Update

1. In Coolify, go to your application
2. Click **Redeploy**
3. Coolify pulls the latest image and restarts containers

### Rolling Updates

Coolify supports zero-downtime deployments when health checks are configured. The new container must pass health checks before the old one is stopped.

---

## CI/CD Integration

The project now has **two GitHub Actions workflows**:

### 1. Base Image Build (`.github/workflows/docker-build.yml`)

**Triggers:**
- Dockerfile.base changes
- Dockerfile changes
- docker-compose.yml changes
- composer.json changes
- package.json changes

**Builds:**
- `ghcr.io/jagoanbunda/laravel:base`
- Full image with PHP extensions, Composer vendor, Node modules
- Build time: ~2-5 minutes

**When it runs:** Rarely (dependency updates only)

### 2. Application Image Build (`.github/workflows/docker-build-app.yml`)

**Triggers:**
- ANY push to main/develop branches
- Manual workflow dispatch

**Builds:**
- `ghcr.io/jagoanbunda/laravel:latest`
- Application code only (uses pre-built base image)
- Build time: ~30 seconds

**When it runs:** Every code push (fast deployment)
 
### Coolify Webhook (Optional)

To trigger automatic deployments:

1. In Coolify, get the webhook URL from your application settings
2. Add as a repository secret in GitHub: `COOLIFY_WEBHOOK_URL`
3. Add to the workflow:

```yaml
- name: Trigger Coolify Deployment
  if: github.ref == 'refs/heads/main'
  run: |
    curl -X POST "${{ secrets.COOLIFY_WEBHOOK_URL }}"
```

---

## Security Recommendations

1. **Never commit `.env` files** - Use Coolify's environment variables
2. **Use secrets for sensitive data** - DB passwords, API keys
3. **Enable HTTPS** - Coolify handles this automatically with Let's Encrypt
4. **Restrict GHCR access** - Make the package private if needed
5. **Regular updates** - Rebuild images to get security patches

---

## Support

- **Coolify Documentation**: https://coolify.io/docs
- **ServersideUp PHP Images**: https://serversideup.net/open-source/docker-php
- **Laravel Documentation**: https://laravel.com/docs

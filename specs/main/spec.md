# Feature Specification: API Testing for Mobile Application

## Overview
Create comprehensive API tests for the existing NAKES (Child Health Tracking) mobile application backend. The API is built with Laravel 12 using Sanctum authentication and follows RESTful conventions.

## User Request
> "I need your help to test existing API for my mobile application, can you do it?"

## Feature Requirements

### FR-1: Authentication API Tests
Test all authentication endpoints:
- POST `/api/v1/auth/register` - User registration
- POST `/api/v1/auth/login` - User login with token generation
- POST `/api/v1/auth/logout` - Token revocation (protected)
- POST `/api/v1/auth/refresh` - Token refresh (protected)
- GET `/api/v1/auth/me` - Get current user profile (protected)
- PUT `/api/v1/auth/profile` - Update user profile (protected)

### FR-2: Children Management API Tests
Test CRUD operations for children:
- GET `/api/v1/children` - List user's children
- POST `/api/v1/children` - Create a child record
- GET `/api/v1/children/{child}` - Get child details
- PUT `/api/v1/children/{child}` - Update child record
- DELETE `/api/v1/children/{child}` - Soft delete child
- GET `/api/v1/children/{child}/summary` - Get child summary with measurements

### FR-3: Anthropometry API Tests
Test growth measurement endpoints:
- GET `/api/v1/children/{child}/anthropometry` - List measurements
- POST `/api/v1/children/{child}/anthropometry` - Record measurement
- GET `/api/v1/children/{child}/anthropometry/{id}` - Get measurement
- PUT `/api/v1/children/{child}/anthropometry/{id}` - Update measurement
- DELETE `/api/v1/children/{child}/anthropometry/{id}` - Delete measurement
- GET `/api/v1/children/{child}/growth-chart` - Get growth chart data

### FR-4: Food & Nutrition API Tests
Test food and food log endpoints:
- GET `/api/v1/foods` - List foods
- POST `/api/v1/foods` - Create food
- GET `/api/v1/foods/{food}` - Get food details
- PUT `/api/v1/foods/{food}` - Update food
- DELETE `/api/v1/foods/{food}` - Delete food
- GET `/api/v1/foods-categories` - Get food categories
- Food Logs (nested under children):
  - GET `/api/v1/children/{child}/food-logs`
  - POST `/api/v1/children/{child}/food-logs`
  - GET `/api/v1/children/{child}/food-logs/{id}`
  - PUT `/api/v1/children/{child}/food-logs/{id}`
  - DELETE `/api/v1/children/{child}/food-logs/{id}`
  - GET `/api/v1/children/{child}/nutrition-summary`

### FR-5: ASQ-3 Screening API Tests
Test developmental screening endpoints:
- Master Data:
  - GET `/api/v1/asq3/domains` - Get ASQ-3 domains
  - GET `/api/v1/asq3/age-intervals` - Get age intervals
  - GET `/api/v1/asq3/age-intervals/{interval}/questions` - Get questions
  - GET `/api/v1/asq3/recommendations` - Get recommendations
- Screenings (nested under children):
  - GET `/api/v1/children/{child}/screenings`
  - POST `/api/v1/children/{child}/screenings`
  - GET `/api/v1/children/{child}/screenings/{id}`
  - PUT `/api/v1/children/{child}/screenings/{id}`
  - POST `/api/v1/children/{child}/screenings/{id}/answers`
  - GET `/api/v1/children/{child}/screenings/{id}/results`

### FR-6: PMT (Supplementary Feeding) API Tests
Test PMT schedule and logging endpoints:
- GET `/api/v1/pmt/menus` - Get PMT menus
- GET `/api/v1/children/{child}/pmt-schedules` - Get schedules
- POST `/api/v1/children/{child}/pmt-schedules` - Create schedule
- GET `/api/v1/children/{child}/pmt-progress` - Get progress
- POST `/api/v1/pmt-schedules/{schedule}/log` - Log PMT activity
- PUT `/api/v1/pmt-schedules/{schedule}/log` - Update PMT log

### FR-7: Notifications API Tests
Test notification endpoints:
- GET `/api/v1/notifications` - List notifications
- GET `/api/v1/notifications/unread-count` - Get unread count
- PUT `/api/v1/notifications/{id}/read` - Mark as read
- POST `/api/v1/notifications/read-all` - Mark all as read
- DELETE `/api/v1/notifications/{id}` - Delete notification

## Non-Functional Requirements

### NFR-1: Test Coverage
- All API endpoints must have tests
- Both happy path and error scenarios covered
- Authorization tests (403 for unauthorized access)
- Validation tests (422 for invalid input)

### NFR-2: Test Organization
- Feature tests organized by domain
- Use PHPUnit (as per project convention)
- Use factories for test data generation
- Follow Laravel testing best practices

### NFR-3: Test Isolation
- Each test should be independent
- Use `RefreshDatabase` trait
- Clean up test data properly

## Success Criteria
1. All API endpoints have corresponding tests
2. Tests pass with `php artisan test`
3. Tests cover authentication, authorization, validation, and business logic
4. Tests follow existing project conventions

## Technical Constraints
- Laravel 12 with PHP 8.5
- PHPUnit 11 (not Pest)
- Sanctum for API authentication
- Existing model factories should be used where available

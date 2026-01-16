# Data Model: API Testing for Mobile Application

## Overview
This document describes the existing data models in the NAKES application that will be tested. All models already exist with factories.

## Entity Relationship Diagram
```
User (1)──────────────< (N) Child
  │                        │
  │                        ├──< AnthropometryMeasurement
  │                        │
  │                        ├──< FoodLog ──< FoodLogItem >──────< Food
  │                        │
  │                        ├──< Asq3Screening ──< Asq3ScreeningAnswer
  │                        │       │                     │
  │                        │       └──< Asq3ScreeningResult
  │                        │                     │
  │                        │       Asq3Domain <──┘
  │                        │       Asq3AgeInterval ──< Asq3Question
  │                        │       Asq3Recommendation
  │                        │       Asq3CutoffScore
  │                        │
  │                        └──< PmtSchedule ──< PmtLog
  │                                  │
  │                           PmtMenu <──┘
  │
  └──────────────< (N) Notification
  │
  └──────────────< (N) Food (created_by)
```

## Core Entities

### User
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| name | string(255) | required | User's full name |
| email | string(255) | required, unique, email | Login identifier |
| password | string | required, min:8 | Hashed |
| phone | string(20) | nullable | Contact number |
| avatar_url | string(500) | nullable, url | Profile image |
| push_notifications | boolean | default: true | Notification preference |
| weekly_report | boolean | default: false | Report preference |
| email_verified_at | timestamp | nullable | Verification status |
| created_at | timestamp | auto | |
| deleted_at | timestamp | nullable | Soft delete |

**Factory**: `UserFactory` with states: `unverified()`, `withNotifications()`

### Child
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| user_id | bigint | FK | Parent user |
| name | string(255) | required | Child's name |
| birthday | date | required, before_or_equal:today | Birth date |
| gender | enum | required, in:male,female,other | |
| avatar_url | string(500) | nullable, url | Profile image |
| birth_weight | decimal(4,2) | nullable, 0.5-10 | Weight in kg |
| birth_height | decimal(5,2) | nullable, 20-70 | Height in cm |
| head_circumference | decimal(4,2) | nullable, 20-50 | HC in cm |
| is_active | boolean | default: true | Active status |
| created_at | timestamp | auto | |
| deleted_at | timestamp | nullable | Soft delete |

**Factory**: `ChildFactory` with states: `male()`, `female()`, `newborn()`, `toddler()`

**Computed Attributes**:
- `age_in_months`: Calculated from birthday
- `age_in_days`: Calculated from birthday

### AnthropometryMeasurement
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| child_id | bigint | FK | Child being measured |
| measurement_date | date | required, before_or_equal:today | |
| weight | decimal(5,2) | required, 1-100 | kg |
| height | decimal(5,2) | required, 30-200 | cm |
| head_circumference | decimal(4,2) | nullable, 20-60 | cm |
| is_lying | boolean | default: false | Measurement position |
| measurement_location | enum | in:posyandu,home,clinic,hospital,other | |
| weight_for_age_zscore | decimal(4,2) | calculated | WHO z-score |
| height_for_age_zscore | decimal(4,2) | calculated | WHO z-score |
| weight_for_height_zscore | decimal(4,2) | calculated | WHO z-score |
| bmi_for_age_zscore | decimal(4,2) | calculated | WHO z-score |
| head_circumference_zscore | decimal(4,2) | calculated | WHO z-score |
| nutritional_status | enum | in:normal,underweight,overweight | Derived |
| stunting_status | enum | in:normal,stunted | Derived |
| wasting_status | enum | in:normal,wasted | Derived |
| notes | text | nullable, max:1000 | |
| created_at | timestamp | auto | |

**Factory**: `AnthropometryMeasurementFactory` with states: `normal()`, `stunted()`, `atPosyandu()`

### Food
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| name | string(255) | required | Food name |
| category | string(100) | required | Karbohidrat, Protein, etc. |
| icon | string(50) | default: restaurant | Display icon |
| serving_size | int | default: 100 | Grams |
| calories | decimal(8,2) | required | kcal per serving |
| protein | decimal(6,2) | required | grams |
| fat | decimal(6,2) | required | grams |
| carbohydrate | decimal(6,2) | required | grams |
| fiber | decimal(5,2) | nullable | grams |
| sugar | decimal(5,2) | nullable | grams |
| is_active | boolean | default: true | |
| is_system | boolean | default: true | System vs user-created |
| created_by | bigint | FK, nullable | User who created |
| created_at | timestamp | auto | |

**Factory**: `FoodFactory` with states: `userCreated()`, `protein()`, `carbohydrate()`

### FoodLog
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| child_id | bigint | FK | Child |
| log_date | date | required | Date of meal |
| meal_time | enum | in:breakfast,lunch,dinner,snack | |
| total_calories | decimal(8,2) | calculated | Sum from items |
| total_protein | decimal(6,2) | calculated | Sum from items |
| total_fat | decimal(6,2) | calculated | Sum from items |
| total_carbohydrate | decimal(6,2) | calculated | Sum from items |
| notes | text | nullable | |
| created_at | timestamp | auto | |

**Factory**: `FoodLogFactory` with states: `breakfast()`, `lunch()`, `dinner()`, `snack()`

### FoodLogItem
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| food_log_id | bigint | FK | Parent log |
| food_id | bigint | FK | Food item |
| quantity | decimal(5,2) | required | Servings |
| calories | decimal(8,2) | calculated | |
| protein | decimal(6,2) | calculated | |
| fat | decimal(6,2) | calculated | |
| carbohydrate | decimal(6,2) | calculated | |
| created_at | timestamp | auto | |

**Factory**: `FoodLogItemFactory`

### Asq3Screening
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| child_id | bigint | FK | Child |
| age_interval_id | bigint | FK | Age interval used |
| screening_date | date | required | |
| age_at_screening_months | int | calculated | |
| age_at_screening_days | int | calculated | |
| status | enum | in:in_progress,completed,cancelled | |
| completed_at | timestamp | nullable | |
| overall_status | enum | nullable, in:sesuai,pantau,perlu_rujukan | |
| notes | text | nullable | |
| created_at | timestamp | auto | |

**Factory**: `Asq3ScreeningFactory` with states: `completed()`, `cancelled()`, `normalResults()`

### Asq3Domain (Master Data)
| Field | Type | Notes |
|-------|------|-------|
| id | bigint | PK |
| name | string | Domain name (e.g., Communication, Motor) |
| description | text | Domain description |
| order | int | Display order |

### Asq3AgeInterval (Master Data)
| Field | Type | Notes |
|-------|------|-------|
| id | bigint | PK |
| label | string | e.g., "2 bulan", "4 bulan" |
| min_months | int | Minimum age |
| max_months | int | Maximum age |
| min_days | int | Minimum days |
| max_days | int | Maximum days |

### Asq3Question (Master Data)
| Field | Type | Notes |
|-------|------|-------|
| id | bigint | PK |
| age_interval_id | bigint | FK |
| domain_id | bigint | FK |
| question_text | text | Question content |
| order | int | Display order |

### PmtMenu (Master Data)
| Field | Type | Notes |
|-------|------|-------|
| id | bigint | PK |
| name | string | Menu name |
| description | text | Description |
| target_age_min | int | Minimum age months |
| target_age_max | int | Maximum age months |
| calories | decimal | Nutritional info |
| protein | decimal | |
| is_active | boolean | |

**Factory**: `PmtMenuFactory`

### PmtSchedule
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| child_id | bigint | FK | Child |
| menu_id | bigint | FK | PMT menu |
| scheduled_date | date | required | |
| created_at | timestamp | auto | |

**Factory**: `PmtScheduleFactory` with states: `today()`, `past()`, `future()`

### PmtLog
| Field | Type | Notes |
|-------|------|-------|
| id | bigint | PK |
| schedule_id | bigint | FK |
| given_at | timestamp | When PMT was given |
| given_by | string | Who gave it |
| notes | text | |
| created_at | timestamp | |

**Factory**: `PmtLogFactory`

### Notification
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| id | bigint | auto | PK |
| user_id | bigint | FK | User |
| type | string | required | screening_reminder, pmt_reminder, etc. |
| title | string(255) | required | |
| body | text | required | |
| data | json | nullable | Additional data |
| read_at | timestamp | nullable | When read |
| created_at | timestamp | auto | |

**Factory**: `NotificationFactory` with states: `unread()`, `read()`, `screeningReminder()`, `pmtReminder()`

## Relationships Summary

| Model | Relationship | Related Model |
|-------|-------------|---------------|
| User | hasMany | Child |
| User | hasMany | Notification |
| User | hasMany | Food (created_by) |
| Child | belongsTo | User |
| Child | hasMany | AnthropometryMeasurement |
| Child | hasMany | FoodLog |
| Child | hasMany | Asq3Screening |
| Child | hasMany | PmtSchedule |
| FoodLog | hasMany | FoodLogItem |
| FoodLogItem | belongsTo | Food |
| Asq3Screening | belongsTo | Asq3AgeInterval |
| Asq3Screening | hasMany | Asq3ScreeningAnswer |
| Asq3Screening | hasMany | Asq3ScreeningResult |
| PmtSchedule | belongsTo | PmtMenu |
| PmtSchedule | hasMany | PmtLog |

## Authorization Rules

| Resource | Rule |
|----------|------|
| Child | User can only access their own children |
| AnthropometryMeasurement | Via child ownership |
| FoodLog | Via child ownership |
| Asq3Screening | Via child ownership |
| PmtSchedule | Via child ownership |
| Notification | User can only access their own notifications |
| Food | System foods are read-only; users can CRUD their own |

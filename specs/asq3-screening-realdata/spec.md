# Feature Specification: ASQ-3 Screening Real Data Implementation

## Overview
Replace mock data in `screenings-tab.tsx` with real screening data from the database. Create `Asq3RecommendationSeeder` with age-interval specific Indonesian recommendations, update the ChildController to provide screening data as props, and refactor the frontend component to consume real data.

## User Request
> "Does `screenings-tab.tsx` use real data or mock data? If using mock data, check seeder. If seeder not found, create seeder for screening. Use Perplexity MCP to generate template recommendation according to screening score."

## Analysis Summary

### Current State
- **`screenings-tab.tsx`**: Uses hardcoded mock data (confirmed at line 29: `// Mock screening data aligned with ERD`)
- **`Asq3ScreeningSeeder`**: EXISTS - creates screenings, answers, domain results
- **`Asq3RecommendationSeeder`**: MISSING - `asq3_recommendations` table is empty
- **Component props**: `screenings-tab.tsx` receives NO props, all data is hardcoded

### Mock Data Identified
1. `latestScreening` - hardcoded screening data (lines 30-43)
2. `domainScores` - hardcoded domain scores array (lines 45-105)
3. `recommendations` - hardcoded recommendations (lines 107-122)
4. `screeningHistory` - hardcoded history array (lines 124-134)

## Feature Requirements

### FR-1: Create Asq3RecommendationSeeder
Create a database seeder that populates `asq3_recommendations` table with:
- **Language**: Indonesian (Bahasa Indonesia)
- **Structure**: Age-interval specific recommendations (Option B - ~100+ records)
- **Coverage**: All 5 ASQ-3 domains × 21 age intervals × multiple recommendations per domain

Domains:
1. `communication` - Komunikasi
2. `gross_motor` - Motorik Kasar
3. `fine_motor` - Motorik Halus
4. `problem_solving` - Pemecahan Masalah
5. `personal_social` - Personal Sosial

Recommendations should be evidence-based stimulation activities aligned with official ASQ-3 Learning Activities.

### FR-2: Update Asq3ScreeningSeeder
Enhance existing seeder to:
- Create intervention records linking screenings to recommendations (using `asq3_screening_interventions` table)
- Generate realistic intervention data for completed screenings
- Associate recommendations based on domain results status (sesuai/pantau/perlu_rujukan)

### FR-3: Refactor screenings-tab.tsx
Transform the component to:
- Accept screening data as props from parent component
- Remove all mock data objects (`latestScreening`, `domainScores`, `recommendations`, `screeningHistory`)
- Display real screening results with proper TypeScript interfaces
- Handle empty states gracefully when no screenings exist

Props interface should include:
```typescript
interface ScreeningsTabProps {
  childId: number;
  latestScreening: Asq3Screening | null;
  screeningHistory: Asq3ScreeningHistoryItem[];
}
```

### FR-4: Update ChildController::show()
Modify the controller to:
- Eager load full screening data with relationships:
  - `domainResults.domain`
  - `domainResults.domain.recommendations`
  - `ageInterval`
  - `interventions`
- Format data structure matching frontend TypeScript interfaces
- Pass screening data as props to the Inertia page

### FR-5: Register Seeders Properly
- Add `Asq3RecommendationSeeder` to `ProductionSeeder` (master data)
- Ensure proper seeding order: Domains → Age Intervals → Cutoffs → Recommendations → Screenings

## Non-Functional Requirements

### NFR-1: Data Quality
- Recommendations must be evidence-based (ASQ-3 Learning Activities)
- Indonesian language throughout (consistent with existing UI)
- Age-appropriate activities for each age interval (2-60 months)

### NFR-2: Code Quality
- Follow existing Laravel conventions (Eloquent, Form Requests)
- Follow existing React/TypeScript conventions (strict types, no `any`)
- Maintain existing component styling patterns

### NFR-3: Performance
- Eager loading to prevent N+1 queries
- Limit screening history to last 10 records
- Efficient recommendation lookup by domain and age interval

### NFR-4: Testing
- PHPUnit tests for recommendation seeder
- Verify seeder creates expected record counts
- Verify screening data transformation in controller

## Success Criteria
1. `screenings-tab.tsx` displays real data from database
2. Running `php artisan db:seed --class=Asq3RecommendationSeeder` creates 100+ Indonesian recommendations
3. Each domain has age-appropriate recommendations for all age intervals
4. Component handles empty state (no screenings) gracefully
5. No TypeScript errors in frontend
6. No mock data remains in component

## Technical Constraints
- Laravel 12 with PHP 8.4
- React 19 with TypeScript
- Inertia.js v2 for data passing
- PHPUnit 11 (not Pest)
- Existing model factories and seeders must be preserved

## Data Model Reference

### asq3_recommendations table
```
id: bigint (PK)
domain_id: bigint (FK to asq3_domains)
age_interval_id: bigint (FK, nullable - NULL = all ages)
recommendation_text: text
priority: tinyint (0 = default)
created_at: timestamp
```

### asq3_screening_interventions table
```
id: bigint (PK)
screening_id: bigint (FK to asq3_screenings)
domain_id: bigint (FK, nullable)
type: enum ('stimulation', 'referral', 'follow_up', 'counseling', 'other')
action: text
notes: text (nullable)
status: enum ('planned', 'in_progress', 'completed', 'cancelled')
follow_up_date: date (nullable)
completed_at: timestamp (nullable)
created_by: bigint (FK, nullable)
created_at, updated_at: timestamps
```

## ASQ-3 Domains Reference (Indonesian)
| Code | Name (Indonesian) | Icon |
|------|-------------------|------|
| communication | Komunikasi | chat |
| gross_motor | Motorik Kasar | directions_run |
| fine_motor | Motorik Halus | pan_tool |
| problem_solving | Pemecahan Masalah | psychology |
| personal_social | Personal Sosial | people |

## Recommendation Categories by Status
- **sesuai** (on track): General developmental activities to maintain progress
- **pantau** (monitoring zone): Targeted stimulation activities for improvement
- **perlu_rujukan** (needs referral): Intensive interventions + professional referral guidance

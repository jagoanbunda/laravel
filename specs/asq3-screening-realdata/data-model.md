# Data Model: ASQ-3 Screening Real Data Implementation

**Date**: 2026-01-23  
**Feature**: ASQ-3 Screening Real Data Implementation

## Overview

This document defines the data models for the ASQ-3 screening real data implementation. Most entities already exist; this documents the relationships and new seeder data.

---

## Existing Entities (No Changes)

### Asq3Domain
Represents the 5 developmental domains assessed by ASQ-3.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PK, auto | Primary key |
| code | string | unique | Domain code (communication, gross_motor, etc.) |
| name | string | required | Indonesian name (Komunikasi, etc.) |
| icon | string | nullable | Icon identifier |
| color | string | nullable | Hex color code |
| display_order | integer | default 0 | Sort order |

**Existing Records**: 5 (seeded by Asq3DomainSeeder)

### Asq3AgeInterval
Represents the 21 age intervals for ASQ-3 questionnaires.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PK, auto | Primary key |
| age_label | string | required | Display label (e.g., "24 bulan") |
| min_age_months | integer | required | Minimum age in months |
| max_age_months | integer | required | Maximum age in months |

**Existing Records**: 21 (seeded by Asq3AgeIntervalSeeder)

### Asq3Screening
Represents a screening session for a child.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PK, auto | Primary key |
| child_id | bigint | FK, required | Reference to Child |
| age_interval_id | bigint | FK, required | Reference to AgeInterval |
| screening_date | date | required | Date of screening |
| age_at_screening_months | integer | required | Child's age at screening |
| age_at_screening_days | integer | required | Child's age in days |
| status | enum | required | 'in_progress', 'completed', 'cancelled' |
| overall_status | enum | nullable | 'sesuai', 'pantau', 'perlu_rujukan' |
| completed_at | timestamp | nullable | When screening was completed |
| notes | text | nullable | Additional notes |

**Relationships**:
- belongsTo Child
- belongsTo Asq3AgeInterval
- hasMany Asq3ScreeningResult (as domainResults)
- hasMany Asq3ScreeningAnswer
- hasMany Asq3ScreeningIntervention

### Asq3ScreeningResult
Domain-level results for a screening.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PK, auto | Primary key |
| screening_id | bigint | FK, required | Reference to Screening |
| domain_id | bigint | FK, required | Reference to Domain |
| total_score | decimal | required | Sum of domain answers |
| cutoff_score | decimal | required | Cutoff threshold |
| monitoring_score | decimal | required | Monitoring zone threshold |
| status | enum | required | 'sesuai', 'pantau', 'perlu_rujukan' |

**Relationships**:
- belongsTo Asq3Screening
- belongsTo Asq3Domain

---

## Entity: Asq3Recommendation (Needs Seeding)

Master data for developmental stimulation recommendations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PK, auto | Primary key |
| domain_id | bigint | FK, required | Reference to Domain |
| age_interval_id | bigint | FK, nullable | Reference to AgeInterval (NULL = all ages) |
| recommendation_text | text | required | Indonesian recommendation text |
| priority | tinyint | default 0 | Sort order within domain |
| created_at | timestamp | auto | Creation timestamp |

**Relationships**:
- belongsTo Asq3Domain
- belongsTo Asq3AgeInterval (nullable)

**Seeder Requirements**:
- Create 2-3 recommendations per domain per age interval
- Total: ~150-250 records
- Language: Indonesian (Bahasa Indonesia)
- Content: Evidence-based ASQ-3 Learning Activities

### Sample Recommendation Records

```php
// Communication - 24 bulan interval
[
    'domain_id' => 1, // communication
    'age_interval_id' => 13, // 24 bulan
    'recommendation_text' => 'Bacakan buku bergambar setiap hari dan minta anak menunjukkan gambar yang Anda sebutkan.',
    'priority' => 1,
],
[
    'domain_id' => 1,
    'age_interval_id' => 13,
    'recommendation_text' => 'Ajak anak berbicara tentang aktivitas sehari-hari menggunakan kalimat pendek dan jelas.',
    'priority' => 2,
],

// Gross Motor - 24 bulan interval
[
    'domain_id' => 2, // gross_motor
    'age_interval_id' => 13,
    'recommendation_text' => 'Buat obstacle course sederhana dengan bantal dan kotak untuk dilalui anak.',
    'priority' => 1,
],
```

---

## Entity: Asq3ScreeningIntervention (Needs Seeding Enhancement)

Records interventions/actions for a screening.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | bigint | PK, auto | Primary key |
| screening_id | bigint | FK, required | Reference to Screening |
| domain_id | bigint | FK, nullable | Reference to Domain |
| type | enum | required | 'stimulation', 'referral', 'follow_up', 'counseling', 'other' |
| action | text | required | Description of intervention |
| notes | text | nullable | Additional notes |
| status | enum | required | 'planned', 'in_progress', 'completed', 'cancelled' |
| follow_up_date | date | nullable | Scheduled follow-up |
| completed_at | timestamp | nullable | When completed |
| created_by | bigint | FK, nullable | User who created |

**Relationships**:
- belongsTo Asq3Screening
- belongsTo Asq3Domain (nullable)
- belongsTo User (as creator)

**Seeder Enhancement**:
Current `Asq3ScreeningSeeder` does not create interventions. Update to:
- Create 1-2 interventions for completed screenings with pantau/perlu_rujukan status
- Link interventions to appropriate domain based on result status

---

## Frontend TypeScript Interfaces

### Existing Interfaces (in types/models.ts)

```typescript
export type ScreeningResult = 'sesuai' | 'pantau' | 'perlu_rujukan';
export type ScreeningStatus = 'in_progress' | 'completed' | 'cancelled';

export type ASQ3DomainCode = 
  | 'communication' 
  | 'gross_motor' 
  | 'fine_motor' 
  | 'problem_solving' 
  | 'personal_social';

export const ScreeningResultLabels: Record<ScreeningResult, string> = {
  sesuai: 'Perkembangan Sesuai',
  pantau: 'Perlu Pemantauan',
  perlu_rujukan: 'Perlu Rujukan',
};

export const ASQ3DomainLabels: Record<ASQ3DomainCode, string> = {
  communication: 'Komunikasi',
  gross_motor: 'Motorik Kasar',
  fine_motor: 'Motorik Halus',
  problem_solving: 'Pemecahan Masalah',
  personal_social: 'Personal Sosial',
};
```

### New Interfaces (to add)

```typescript
export interface Asq3DomainResult {
  id: number;
  domain_code: ASQ3DomainCode;
  domain_name: string;
  total_score: number;
  cutoff_score: number;
  monitoring_score: number;
  max_score: number;
  status: ScreeningResult;
}

export interface Asq3Recommendation {
  id: number;
  domain_id: number;
  title: string; // Derived from domain name + context
  recommendation_text: string;
  priority: number;
}

export interface Asq3ScreeningDetail {
  id: number;
  child_id: number;
  screening_date: string;
  age_at_screening_months: number;
  age_at_screening_days: number;
  age_interval_label: string;
  status: ScreeningStatus;
  overall_status: ScreeningResult | null;
  total_score: number;
  max_score: number;
  domain_results: Asq3DomainResult[];
  recommendations: Asq3Recommendation[];
  next_screening_date: string | null;
  days_until_next: number | null;
}

export interface Asq3ScreeningHistoryItem {
  id: number;
  screening_date: string;
  age_at_screening_months: number;
  total_score: number;
  overall_status: ScreeningResult;
}

export interface ScreeningsTabProps {
  childId: number;
  latestScreening: Asq3ScreeningDetail | null;
  screeningHistory: Asq3ScreeningHistoryItem[];
}
```

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    Child    │───────│  Asq3Screening   │───────│ Asq3AgeInterval │
└─────────────┘  1:N  └──────────────────┘  N:1  └─────────────────┘
                              │                          │
                              │ 1:N                      │
                              ▼                          │
                 ┌────────────────────────┐              │
                 │  Asq3ScreeningResult   │              │
                 └────────────────────────┘              │
                              │                          │
                              │ N:1                      │
                              ▼                          │
                      ┌─────────────┐                    │
                      │ Asq3Domain  │◄───────────────────┘
                      └─────────────┘        N:1
                              │
                              │ 1:N
                              ▼
                 ┌────────────────────────┐
                 │  Asq3Recommendation    │
                 └────────────────────────┘

┌──────────────────┐       ┌──────────────────────────┐
│  Asq3Screening   │───────│ Asq3ScreeningIntervention│
└──────────────────┘  1:N  └──────────────────────────┘
                                      │
                                      │ N:1
                                      ▼
                              ┌─────────────┐
                              │ Asq3Domain  │
                              └─────────────┘
```

---

## Validation Rules

### Asq3Recommendation
- `domain_id`: required, exists in asq3_domains
- `age_interval_id`: nullable, if present must exist in asq3_age_intervals
- `recommendation_text`: required, min 10 characters
- `priority`: integer, 0-255

### Asq3ScreeningIntervention
- `screening_id`: required, exists in asq3_screenings
- `domain_id`: nullable, if present must exist in asq3_domains
- `type`: required, one of enum values
- `action`: required, min 10 characters
- `status`: required, one of enum values
- `follow_up_date`: nullable, if present must be future date

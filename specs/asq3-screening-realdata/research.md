# Research: ASQ-3 Screening Real Data Implementation

**Date**: 2026-01-23  
**Feature**: ASQ-3 Screening Real Data Implementation

## Research Summary

All technical decisions resolved. Research completed using Perplexity and Exa web search for ASQ-3 recommendations.

---

## R1: ASQ-3 Domain-Specific Stimulation Activities

### Decision
Use evidence-based stimulation activities from official ASQ-3 Learning Activities resource, translated to Indonesian.

### Rationale
- Official ASQ-3 materials provide validated, age-appropriate activities
- Activities are organized by developmental domain and age interval
- Materials designed for parent/caregiver implementation at home

### Research Findings

#### Communication (Komunikasi)
| Age Range | Activities (Indonesian) |
|-----------|------------------------|
| 0-12 mo | Bicara, bernyanyi, membaca saat rutinitas harian; Permainan bergiliran dengan suara dan ocehan |
| 12-24 mo | Menamai benda, bagian tubuh, dan orang; Bermain telepon-teleponan |
| 24-36 mo | Membaca buku bergambar bersama; Mengikuti instruksi sederhana |
| 36-60 mo | Bercerita tentang aktivitas harian; Bermain peran dengan dialog |

#### Gross Motor (Motorik Kasar)
| Age Range | Activities (Indonesian) |
|-----------|------------------------|
| 0-12 mo | Tummy time untuk menguatkan leher dan punggung; Mendorong berguling dan merangkak |
| 12-24 mo | Berjalan dengan pegangan; Menari dan melompat |
| 24-36 mo | Obstacle course dengan bantal dan kotak; Jalan binatang (beruang, kelinci) |
| 36-60 mo | Berlari dan berhenti sesuai instruksi; Menendang dan melempar bola |

#### Fine Motor (Motorik Halus)
| Age Range | Activities (Indonesian) |
|-----------|------------------------|
| 0-12 mo | Memegang benda bertekstur berbeda; Permainan jatuhkan dan ambil |
| 12-24 mo | Finger painting; Mencoret dengan krayon besar |
| 24-36 mo | Merangkai manik besar atau makaroni; Bermain playdough |
| 36-60 mo | Berlatih kancing dan resleting; Menggunting dengan gunting aman |

#### Problem Solving (Pemecahan Masalah)
| Age Range | Activities (Indonesian) |
|-----------|------------------------|
| 0-12 mo | Petak umpet dengan mainan di bawah selimut; Mainan sebab-akibat |
| 12-24 mo | Mencocokkan bentuk dan warna; Puzzle sederhana 2-3 keping |
| 24-36 mo | Menyortir benda berdasarkan kategori (besar/kecil); Menuang dan memindahkan |
| 36-60 mo | Puzzle 4-6 keping; Permainan memori sederhana |

#### Personal-Social (Personal Sosial)
| Age Range | Activities (Indonesian) |
|-----------|------------------------|
| 0-12 mo | Bermain cilukba; Makan sendiri dengan finger food |
| 12-24 mo | Bermain di samping anak lain; Berlatih memakai baju |
| 24-36 mo | Bermain pura-pura (masak-masakan); Berlatih berbagi |
| 36-60 mo | Bermain kooperatif dengan teman; Membuat pilihan antara dua opsi |

### Alternatives Considered
1. **Custom recommendations without evidence base** - Rejected: Lack of validation
2. **English recommendations** - Rejected: User specified Indonesian language
3. **Generic recommendations for all ages** - Rejected: User selected Option B (age-specific)

---

## R2: Recommendation Structure Design

### Decision
Structure recommendations by `domain_id` + `age_interval_id` with `priority` for ordering.

### Rationale
- Matches existing `asq3_recommendations` table schema
- Allows NULL `age_interval_id` for universal recommendations
- Priority field enables ordering within domain

### Database Schema (Existing)
```sql
asq3_recommendations:
  - id: bigint PK
  - domain_id: bigint FK (required)
  - age_interval_id: bigint FK (nullable, NULL = all ages)
  - recommendation_text: text
  - priority: tinyint (0 = default)
  - created_at: timestamp
```

### Seeder Record Count Estimate
| Domain | Age Intervals | Recs/Interval | Total |
|--------|--------------|---------------|-------|
| communication | 21 | 2-3 | 42-63 |
| gross_motor | 21 | 2-3 | 42-63 |
| fine_motor | 21 | 2-3 | 42-63 |
| problem_solving | 21 | 2-3 | 42-63 |
| personal_social | 21 | 2-3 | 42-63 |
| **Total** | | | **210-315** |

### Alternatives Considered
1. **Separate table for status-based recommendations** - Rejected: Overcomplicates, status is dynamic
2. **JSON field for recommendations** - Rejected: Loses queryability
3. **Recommendations without age specificity** - Rejected: User wants comprehensive (Option B)

---

## R3: Frontend Data Flow Pattern

### Decision
Pass screening data as Inertia props, transform in controller using existing patterns.

### Rationale
- Matches existing pattern for `growth_data`, `food_logs`, `pmt_schedules`
- Keeps component stateless and testable
- Allows server-side data transformation

### Existing Pattern Reference (ChildController::show)
```php
// Current pattern for other tabs
'screenings' => $child->asq3Screenings->map(fn ($screening) => [
    'id' => $screening->id,
    'screening_date' => $screening->screening_date,
    'age_interval' => $screening->ageInterval->age_label,
    'status' => $screening->status,
    'overall_status' => $screening->overall_status,
]),
```

### Required Changes
1. Expand `screenings` mapping to include:
   - `domainResults` with scores and status
   - `recommendations` based on age interval
   - `interventions` if any

2. Update `ScreeningsTabContent` component:
   - Accept props instead of using mock data
   - Match existing prop patterns in sibling tabs

### Alternatives Considered
1. **Fetch data via API in component** - Rejected: Unnecessary complexity, breaks Inertia pattern
2. **Redux/global state** - Rejected: Inertia props are sufficient
3. **Deferred props** - Considered: Could use for heavy data, but screening data is small

---

## R4: ASQ-3 Age Intervals Reference

### Decision
Use existing 21 age intervals from `asq3_age_intervals` table seeded by `Asq3AgeIntervalSeeder`.

### Age Intervals (from official ASQ-3)
| ID | Age Label | Min Age (mo) | Max Age (mo) |
|----|-----------|--------------|--------------|
| 1 | 2 bulan | 1 | 2 |
| 2 | 4 bulan | 3 | 4 |
| 3 | 6 bulan | 5 | 6 |
| 4 | 8 bulan | 7 | 8 |
| 5 | 9 bulan | 8 | 9 |
| 6 | 10 bulan | 9 | 10 |
| 7 | 12 bulan | 11 | 12 |
| 8 | 14 bulan | 13 | 14 |
| 9 | 16 bulan | 15 | 16 |
| 10 | 18 bulan | 17 | 18 |
| 11 | 20 bulan | 19 | 20 |
| 12 | 22 bulan | 21 | 22 |
| 13 | 24 bulan | 23 | 24 |
| 14 | 27 bulan | 25 | 27 |
| 15 | 30 bulan | 28 | 30 |
| 16 | 33 bulan | 31 | 33 |
| 17 | 36 bulan | 34 | 36 |
| 18 | 42 bulan | 37 | 42 |
| 19 | 48 bulan | 43 | 48 |
| 20 | 54 bulan | 49 | 54 |
| 21 | 60 bulan | 55 | 60 |

### Rationale
- Standard ASQ-3 age intervals
- Already seeded in database
- Recommendations can reference these directly

---

## R5: Seeder Registration Order

### Decision
Add `Asq3RecommendationSeeder` to `ProductionSeeder` after domains, age intervals, and cutoffs.

### Rationale
- Recommendations depend on domains and age intervals existing
- Should run before `Asq3ScreeningSeeder` (which may create interventions)
- Part of master data (not sample data)

### Seeder Execution Order
```php
// In ProductionSeeder::run()
$this->call([
    // ... existing seeders ...
    Asq3DomainSeeder::class,        // Must run first (domains)
    Asq3AgeIntervalSeeder::class,   // Must run second (age intervals)
    Asq3QuestionSeeder::class,      // Depends on domains + intervals
    // Asq3CutoffScoreSeeder::class, // If exists
    Asq3RecommendationSeeder::class, // NEW - depends on domains + intervals
]);

// In DevelopmentSeeder::run() - after ProductionSeeder
$this->call([
    Asq3ScreeningSeeder::class,     // Can now create interventions with recommendations
]);
```

### Alternatives Considered
1. **Inline in DevelopmentSeeder** - Rejected: Recommendations are master data
2. **Separate command** - Rejected: Overcomplicates, seeder is standard approach

---

## Resolved Clarifications

| Item | Resolution |
|------|------------|
| Recommendation language | Indonesian (Bahasa Indonesia) per user request |
| Recommendation granularity | Age-interval specific (Option B) per user request |
| Implementation scope | All 5 phases per user request |
| Constitution gates | All pass - no project-specific constraints |

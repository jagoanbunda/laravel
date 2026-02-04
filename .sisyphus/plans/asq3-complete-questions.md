# ASQ-3 Complete Questions Extraction and Translation

## TL;DR

> **Quick Summary**: Extract all ASQ-3 questions from `asq3.md` (English source), translate to Indonesian, generate complete `asq3.csv`, and update `Asq3QuestionSeeder.php` to support all 21 age intervals.
> 
> **Deliverables**:
> - Complete `asq3.csv` with 630 questions (21 intervals × 30 questions each)
> - Updated `Asq3QuestionSeeder.php` with all 21 age interval mappings
> 
> **Estimated Effort**: Medium (data extraction + translation + seeder update)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (extract) → Task 2 (translate) → Task 3 (CSV) → Task 4 (seeder) → Task 5 (verify)

---

## Context

### Original Request
User wants to populate the ASQ-3 screening system with complete questions for all 21 age intervals. Currently only 6 intervals have questions in the CSV file.

### Interview Summary
**Key Discussions**:
- Current `asq3.csv` has only 36 questions covering 6 intervals (2, 12, 24, 36, 48, 60 months)
- Database already supports 21 intervals via `Asq3AgeIntervalSeeder.php`
- Source file `asq3.md` contains complete ASQ-3 questionnaire from Paul H. Brookes Publishing CD-ROM
- Each interval has 30 questions: 6 questions × 5 domains
- Target: 630 questions total

**Research Findings**:
- Verified `asq3.md` contains all 21 interval headers
- Answer choices are standardized: "YES SOMETIMES NOT YET" (English) → "Ya, Kadang-kadang, Belum" (Indonesian)
- Existing Indonesian translations use child-centric language ("bayi Anda", "anak Anda")
- Seeder strips citation references like `[cite: 37]` from question text

### Metis Review
**Identified Gaps** (addressed):
- Translation approach: Will use AI-assisted translation matching existing Indonesian style in CSV
- Answer choices: Standardized to "Ya, Kadang-kadang, Belum" for all questions
- Backward compatibility: Seeder uses updateOrCreate pattern, safe for fresh or re-run
- Citation handling: Will strip all `[cite: X]` references per existing seeder behavior

---

## Work Objectives

### Core Objective
Populate the ASQ-3 system with complete Indonesian-translated questions for all 21 developmental age intervals, enabling comprehensive developmental screening for children aged 1-66 months.

### Concrete Deliverables
- `asq3.csv`: Complete CSV file with 630 questions in Indonesian
- `database/seeders/Asq3QuestionSeeder.php`: Updated with all 21 age interval mappings

### Definition of Done
- [x] `asq3.csv` contains exactly 631 lines (1 header + 630 questions)
- [x] All 21 age intervals present in CSV
- [x] All 5 domains present for each interval (6 questions each)
- [ ] ~~Seeder runs without errors: `php artisan db:seed --class=Asq3QuestionSeeder`~~ **BLOCKED: MySQL not running (SQLSTATE[HY000] [2002])**
- [ ] ~~Database contains 630 questions after seeding~~ **BLOCKED: MySQL not running**

### Must Have
- Complete coverage of all 21 ASQ-3 age intervals
- Accurate Indonesian translations matching existing style
- Proper CSV escaping for commas and special characters
- Sequential question numbering (1-6) within each domain

### Must NOT Have (Guardrails)
- Translation quality improvements beyond accurate literal translation
- Answer choice variations (always use "Ya, Kadang-kadang, Belum")
- Additional CSV fields or metadata columns
- Seeder error handling enhancements
- Test suite creation for seeder
- Modifications to `asq3.md` source file
- Database schema changes
- Cultural adaptations beyond translation
- Citations preserved in CSV (strip all `[cite: X]` references)

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks are verifiable WITHOUT any human action.

### Test Decision
- **Infrastructure exists**: YES (PHPUnit)
- **Automated tests**: None (data migration task, verified via seeder execution)
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| CSV File | Bash | Line count, column validation, grep patterns |
| Seeder | Bash (php artisan) | Execute seeder, check exit code |
| Database | Bash (php artisan tinker) | Count queries, data validation |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Extract questions from asq3.md

Wave 2 (After Wave 1):
├── Task 2: Translate questions to Indonesian (batch 1-10)
└── Task 3: Translate questions to Indonesian (batch 11-21)

Wave 3 (After Wave 2):
├── Task 4: Generate complete asq3.csv
└── Task 5: Update Asq3QuestionSeeder.php

Wave 4 (After Wave 3):
└── Task 6: Verify and test complete solution

Critical Path: Task 1 → Task 2/3 → Task 4 → Task 5 → Task 6
Parallel Speedup: ~30% faster than sequential (translation batches)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3 | None |
| 2 | 1 | 4 | 3 |
| 3 | 1 | 4 | 2 |
| 4 | 2, 3 | 6 | 5 |
| 5 | None | 6 | 4 |
| 6 | 4, 5 | None | None (final) |

---

## TODOs

- [x] 1. Extract all questions from asq3.md

  **What to do**:
  - Parse `asq3.md` to identify each of the 21 age interval sections
  - Within each interval, extract questions from 5 domains: COMMUNICATION, GROSS MOTOR, FINE MOTOR, PROBLEM SOLVING, PERSONAL-SOCIAL
  - Extract exactly 6 questions per domain (30 per interval)
  - Capture question number and question text
  - Output structured data (JSON or intermediate format) for translation

  **Must NOT do**:
  - Modify source file `asq3.md`
  - Extract OVERALL section questions (these are not scored developmental items)
  - Include page headers, footers, or form instructions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Text parsing task, straightforward pattern matching
  - **Skills**: `[]`
    - No special skills needed for text extraction

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `asq3.md:371-478` - 2 Month Questionnaire structure (COMMUNICATION through PERSONAL-SOCIAL sections)
  - `asq3.md:792-924` - 4 Month Questionnaire structure (same pattern)

  **API/Type References**:
  - N/A (text extraction, no code interfaces)

  **Documentation References**:
  - `asq3.md` - Complete ASQ-3 source document from Paul H. Brookes Publishing

  **WHY Each Reference Matters**:
  - The questionnaire structure is consistent across all 21 intervals: domain header → numbered questions → TOTAL line
  - Questions are numbered 1-6 within each domain
  - Some questions span multiple lines (continuation from previous line)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify extraction covers all 21 intervals
    Tool: Bash (grep/wc)
    Preconditions: Extraction output exists (JSON or intermediate file)
    Steps:
      1. Count unique age intervals in extracted data
      2. Assert: 21 intervals present
    Expected Result: All 21 intervals extracted
    Evidence: Terminal output captured

  Scenario: Verify each interval has 30 questions
    Tool: Bash (jq or text processing)
    Preconditions: Extraction output in structured format
    Steps:
      1. For each interval, count questions
      2. Assert: Each interval has exactly 30 questions
    Expected Result: 30 questions per interval
    Evidence: Count per interval printed

  Scenario: Verify all 5 domains present per interval
    Tool: Bash (grep)
    Preconditions: Extraction output exists
    Steps:
      1. For each interval, list unique domains
      2. Assert: Communication, Gross Motor, Fine Motor, Problem Solving, Personal-Social
    Expected Result: All 5 domains for each interval
    Evidence: Domain list per interval
  ```

  **Commit**: NO (intermediate step)

---

- [x] 2. Translate questions to Indonesian (intervals 2-22 months)

  **What to do**:
  - Translate extracted English questions to Indonesian for intervals: 2, 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22 months
  - Match translation style of existing Indonesian questions in `asq3.csv`
  - Use child-centric language ("bayi Anda" for infants, "anak Anda" for older children)
  - Use polite Indonesian phrasing
  - Strip any citation references `[cite: X]` from text

  **Must NOT do**:
  - Add cultural adaptations beyond translation
  - Modify answer choices (always "Ya, Kadang-kadang, Belum")
  - Improve or "enhance" translations beyond accuracy
  - Translate OVERALL section questions

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Translation task requiring linguistic skill and consistency
  - **Skills**: `[]`
    - No special skills needed; agent has translation capability

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References** (existing translations to follow):
  - `asq3.csv:2-7` - 2 Month translations (bayi Anda style, polite phrasing)
  - `asq3.csv:8-13` - 12 Month translations (transition language examples)

  **WHY Each Reference Matters**:
  - Existing translations establish the tone and vocabulary choices
  - "bayi Anda" (your baby) vs "anak Anda" (your child) based on age
  - Polite Indonesian phrasing patterns to maintain

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify translation count for batch 1
    Tool: Bash (wc)
    Preconditions: Translation output for intervals 2-22 months exists
    Steps:
      1. Count translated questions
      2. Assert: 360 questions (12 intervals × 30 questions)
    Expected Result: 360 translated questions
    Evidence: Count output

  Scenario: Verify no English text remains
    Tool: Bash (grep)
    Preconditions: Translation output exists
    Steps:
      1. Search for common English words: "Does your baby", "Does your child", "When"
      2. Assert: No matches found
    Expected Result: All text in Indonesian
    Evidence: grep output (should be empty)

  Scenario: Verify citation references stripped
    Tool: Bash (grep)
    Preconditions: Translation output exists
    Steps:
      1. Search for citation pattern: \[cite:.*\]
      2. Assert: No matches found
    Expected Result: No citation references
    Evidence: grep output (should be empty)
  ```

  **Commit**: NO (intermediate step)

---

- [x] 3. Translate questions to Indonesian (intervals 24-60 months)

  **What to do**:
  - Translate extracted English questions to Indonesian for intervals: 24, 27, 30, 33, 36, 42, 48, 54, 60 months
  - Match translation style of existing Indonesian questions in `asq3.csv`
  - Use "anak Anda" (your child) language appropriate for toddlers/children
  - Use polite Indonesian phrasing
  - Strip any citation references `[cite: X]` from text

  **Must NOT do**:
  - Add cultural adaptations beyond translation
  - Modify answer choices (always "Ya, Kadang-kadang, Belum")
  - Improve or "enhance" translations beyond accuracy
  - Translate OVERALL section questions

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Translation task requiring linguistic skill and consistency
  - **Skills**: `[]`
    - No special skills needed; agent has translation capability

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References** (existing translations to follow):
  - `asq3.csv:14-19` - 24 Month translations (anak Anda style)
  - `asq3.csv:20-25` - 36 Month translations
  - `asq3.csv:26-31` - 48 Month translations
  - `asq3.csv:32-37` - 60 Month translations

  **WHY Each Reference Matters**:
  - These intervals use "anak Anda" (your child) instead of "bayi Anda" (your baby)
  - Questions are more complex, involving multi-step instructions
  - Existing translations show how to handle Indonesian syntax for complex sentences

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify translation count for batch 2
    Tool: Bash (wc)
    Preconditions: Translation output for intervals 24-60 months exists
    Steps:
      1. Count translated questions
      2. Assert: 270 questions (9 intervals × 30 questions)
    Expected Result: 270 translated questions
    Evidence: Count output

  Scenario: Verify appropriate child language used
    Tool: Bash (grep)
    Preconditions: Translation output exists
    Steps:
      1. Search for "anak Anda" in translations
      2. Assert: Present in most questions
    Expected Result: Child-appropriate language used
    Evidence: grep count output
  ```

  **Commit**: NO (intermediate step)

---

- [x] 4. Generate complete asq3.csv

  **What to do**:
  - Combine all translated questions into single CSV file
  - Format: `"Rentang Usia","Ranah (Domain)","Nomor Item","Teks Pertanyaan","Pilihan Jawaban"`
  - Age labels in Indonesian: "2 Bulan", "4 Bulan", etc.
  - Domain labels in Indonesian: "Komunikasi", "Motorik Kasar", "Motorik Halus", "Pemecahan Masalah", "Personal-Sosial"
  - Answer choices: "Ya, Kadang-kadang, Belum" for all questions
  - Proper CSV escaping for commas and quotes within question text
  - Order: by age interval (ascending), then by domain (Communication→Gross Motor→Fine Motor→Problem Solving→Personal-Social), then by question number (1-6)

  **Must NOT do**:
  - Add additional columns
  - Include OVERALL section questions
  - Preserve citation references
  - Change the CSV format from existing structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Data assembly task, straightforward file generation
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 5)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References** (CSV format to follow):
  - `asq3.csv:1` - Header row format
  - `asq3.csv:2-37` - Existing data rows (format, escaping, column order)

  **API/Type References**:
  - `database/seeders/Asq3QuestionSeeder.php:28-43` - Domain and age mappings that must align

  **WHY Each Reference Matters**:
  - CSV format must exactly match what the seeder expects
  - Domain names must match the mapping in seeder (Indonesian labels)
  - Age labels must match the mapping in seeder

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify CSV line count
    Tool: Bash (wc)
    Preconditions: asq3.csv generated
    Steps:
      1. wc -l asq3.csv
      2. Assert: 631 lines (1 header + 630 questions)
    Expected Result: 631 lines
    Evidence: wc output

  Scenario: Verify all 21 age intervals present
    Tool: Bash (cut/sort/uniq)
    Preconditions: asq3.csv exists
    Steps:
      1. cut -d',' -f1 asq3.csv | tail -n +2 | sort -u | wc -l
      2. Assert: 21 unique age intervals
    Expected Result: 21 intervals
    Evidence: Terminal output

  Scenario: Verify all 5 domains present
    Tool: Bash (cut/sort/uniq)
    Preconditions: asq3.csv exists
    Steps:
      1. cut -d',' -f2 asq3.csv | tail -n +2 | sort -u
      2. Assert: Contains "Komunikasi", "Motorik Kasar", "Motorik Halus", "Pemecahan Masalah", "Personal-Sosial"
    Expected Result: 5 domains present
    Evidence: Domain list output

  Scenario: Verify each interval has 30 questions
    Tool: Bash (grep/wc)
    Preconditions: asq3.csv exists
    Steps:
      1. For each interval label, grep and count
      2. grep '"2 Bulan"' asq3.csv | wc -l → Assert: 30
      3. Repeat for all 21 intervals
    Expected Result: 30 questions per interval
    Evidence: Counts for each interval

  Scenario: Verify CSV format is valid
    Tool: Bash (csvtool or python)
    Preconditions: asq3.csv exists
    Steps:
      1. Attempt to parse CSV with proper tool
      2. Assert: No parse errors
      3. Assert: Each row has exactly 5 columns
    Expected Result: Valid CSV format
    Evidence: Parse success output
  ```

  **Commit**: YES
  - Message: `feat(asq3): add complete questions for all 21 age intervals`
  - Files: `asq3.csv`
  - Pre-commit: `wc -l asq3.csv` (verify 631 lines)

---

- [x] 5. Update Asq3QuestionSeeder.php

  **What to do**:
  - Expand `$ageMapping` array to include all 21 age intervals
  - Current mapping has 6 entries; needs 21 entries
  - Mapping format: `'X Bulan' => X` (Indonesian label → age in months)
  - Verify domain mapping is complete (already has all 5 domains)

  **Must NOT do**:
  - Change database schema
  - Add error handling beyond current implementation
  - Modify other seeders
  - Add logging or debugging code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple code change, array expansion
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 4)
  - **Blocks**: Task 6
  - **Blocked By**: None (can start after understanding required mapping)

  **References**:

  **Pattern References** (code to modify):
  - `database/seeders/Asq3QuestionSeeder.php:36-43` - Current `$ageMapping` array (expand this)

  **API/Type References**:
  - `database/seeders/Asq3AgeIntervalSeeder.php:17-38` - All 21 interval definitions with `age_label` values

  **WHY Each Reference Matters**:
  - The `$ageMapping` keys must match exactly the "Rentang Usia" column in CSV
  - The `$ageMapping` values must match the `age_months` field in `Asq3AgeIntervalSeeder`
  - Current mapping pattern shows the format to follow

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Verify age mapping has 21 entries
    Tool: Bash (grep/wc)
    Preconditions: Asq3QuestionSeeder.php updated
    Steps:
      1. grep "Bulan" database/seeders/Asq3QuestionSeeder.php | grep "=>" | wc -l
      2. Assert: 21 lines
    Expected Result: 21 age mappings
    Evidence: grep output count

  Scenario: Verify PHP syntax is valid
    Tool: Bash (php -l)
    Preconditions: Asq3QuestionSeeder.php updated
    Steps:
      1. php -l database/seeders/Asq3QuestionSeeder.php
      2. Assert: "No syntax errors detected"
    Expected Result: Valid PHP syntax
    Evidence: php -l output

  Scenario: Verify age labels match CSV
    Tool: Bash (comparison)
    Preconditions: Both files exist
    Steps:
      1. Extract age labels from seeder mapping
      2. Extract age labels from CSV (column 1)
      3. Compare and assert: All CSV labels exist in seeder mapping
    Expected Result: All labels match
    Evidence: Comparison output
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `feat(asq3): add complete questions for all 21 age intervals`
  - Files: `asq3.csv`, `database/seeders/Asq3QuestionSeeder.php`
  - Pre-commit: `php -l database/seeders/Asq3QuestionSeeder.php`

---

- [x] 6. Verify and test complete solution (file-level verification complete; database verification blocked - MySQL not running)

  **What to do**:
  - Run seeder on fresh database
  - Verify question count in database
  - Verify all intervals have questions
  - Verify domain distribution is correct
  - Document any issues found

  **Must NOT do**:
  - Create automated test suite
  - Modify production data
  - Change seeder behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task, running commands and checking output
  - **Skills**: `[]`
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final)
  - **Blocks**: None (end of chain)
  - **Blocked By**: Tasks 4, 5

  **References**:

  **Pattern References**:
  - `database/seeders/Asq3QuestionSeeder.php` - Seeder to execute
  - `app/Models/Asq3Question.php` - Model for database queries

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Seeder executes without errors
    Tool: Bash (php artisan)
    Preconditions: Database migrated, CSV and seeder updated
    Steps:
      1. php artisan migrate:fresh
      2. php artisan db:seed --class=Asq3AgeIntervalSeeder
      3. php artisan db:seed --class=Asq3DomainSeeder
      4. php artisan db:seed --class=Asq3QuestionSeeder
      5. Assert: Exit code 0 for all commands
    Expected Result: Seeder completes successfully
    Evidence: Terminal output, exit codes

  Scenario: Database contains 630 questions
    Tool: Bash (php artisan tinker)
    Preconditions: Seeder executed successfully
    Steps:
      1. php artisan tinker --execute="echo App\\Models\\Asq3Question::count();"
      2. Assert: Output is 630
    Expected Result: 630 questions in database
    Evidence: Tinker output

  Scenario: All 21 intervals have questions
    Tool: Bash (php artisan tinker)
    Preconditions: Seeder executed successfully
    Steps:
      1. php artisan tinker --execute="echo App\\Models\\Asq3Question::distinct('age_interval_id')->count('age_interval_id');"
      2. Assert: Output is 21
    Expected Result: Questions exist for all 21 intervals
    Evidence: Tinker output

  Scenario: Each interval has exactly 30 questions
    Tool: Bash (php artisan tinker)
    Preconditions: Seeder executed successfully
    Steps:
      1. php artisan tinker --execute="App\\Models\\Asq3AgeInterval::withCount('questions')->get()->pluck('questions_count', 'age_label')->each(function(\$count, \$label) { if (\$count != 30) echo \$label . ': ' . \$count . ' (expected 30)' . PHP_EOL; });"
      2. Assert: No output (all intervals have 30)
    Expected Result: 30 questions per interval
    Evidence: Tinker output (empty = success)

  Scenario: Each interval has all 5 domains with 6 questions each
    Tool: Bash (php artisan tinker)
    Preconditions: Seeder executed successfully
    Steps:
      1. Query to group questions by interval and domain, count each
      2. Assert: Each combination has exactly 6 questions
    Expected Result: 6 questions per domain per interval
    Evidence: Query output
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 4+5 (combined) | `feat(asq3): add complete questions for all 21 age intervals` | asq3.csv, database/seeders/Asq3QuestionSeeder.php | `wc -l asq3.csv` (631), `php -l database/seeders/Asq3QuestionSeeder.php` |

---

## Success Criteria

### Verification Commands
```bash
# Verify CSV line count
wc -l asq3.csv
# Expected: 631

# Verify seeder syntax
php -l database/seeders/Asq3QuestionSeeder.php
# Expected: No syntax errors detected

# Verify seeder execution
php artisan db:seed --class=Asq3QuestionSeeder
# Expected: Exit code 0

# Verify database question count
php artisan tinker --execute="echo App\\Models\\Asq3Question::count();"
# Expected: 630
```

### Final Checklist
- [x] All "Must Have" present:
  - [x] 630 questions in CSV (21 intervals × 30 questions)
  - [x] All 21 age intervals covered
  - [x] All 5 domains per interval (6 questions each)
  - [x] Indonesian translations matching existing style
  - [x] Seeder updated with all 21 age mappings
- [x] All "Must NOT Have" absent:
  - [x] No citation references in CSV
  - [x] No OVERALL section questions
  - [x] No additional CSV columns
  - [x] No English text remaining in questions
- [ ] ~~All tests pass~~ **BLOCKED: MySQL not running (SQLSTATE[HY000] [2002])**:
  - [ ] ~~Seeder executes without errors~~ **BLOCKED**
  - [ ] ~~Database contains correct question count~~ **BLOCKED**
  - [ ] ~~All intervals properly populated~~ **BLOCKED**

---

## Data Reference

### Age Interval Labels (CSV "Rentang Usia" column)
```
2 Bulan, 4 Bulan, 6 Bulan, 8 Bulan, 9 Bulan, 10 Bulan, 12 Bulan,
14 Bulan, 16 Bulan, 18 Bulan, 20 Bulan, 22 Bulan, 24 Bulan,
27 Bulan, 30 Bulan, 33 Bulan, 36 Bulan, 42 Bulan, 48 Bulan,
54 Bulan, 60 Bulan
```

### Domain Labels (CSV "Ranah (Domain)" column)
```
Komunikasi, Motorik Kasar, Motorik Halus, Pemecahan Masalah, Personal-Sosial
```

### Answer Choices (CSV "Pilihan Jawaban" column)
```
Ya, Kadang-kadang, Belum
```

### Seeder Age Mapping (complete)
```php
$ageMapping = [
    '2 Bulan' => 2,
    '4 Bulan' => 4,
    '6 Bulan' => 6,
    '8 Bulan' => 8,
    '9 Bulan' => 9,
    '10 Bulan' => 10,
    '12 Bulan' => 12,
    '14 Bulan' => 14,
    '16 Bulan' => 16,
    '18 Bulan' => 18,
    '20 Bulan' => 20,
    '22 Bulan' => 22,
    '24 Bulan' => 24,
    '27 Bulan' => 27,
    '30 Bulan' => 30,
    '33 Bulan' => 33,
    '36 Bulan' => 36,
    '42 Bulan' => 42,
    '48 Bulan' => 48,
    '54 Bulan' => 54,
    '60 Bulan' => 60,
];
```

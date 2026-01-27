# Quickstart: ASQ-3 Screening Real Data Implementation

**Date**: 2026-01-23  
**Feature**: ASQ-3 Screening Real Data Implementation

## Prerequisites

- Laravel 12 development environment running
- Database migrated with ASQ-3 tables
- Existing seeders run (`Asq3DomainSeeder`, `Asq3AgeIntervalSeeder`)

## Implementation Steps

### Phase 1: Create Asq3RecommendationSeeder

**File**: `database/seeders/Asq3RecommendationSeeder.php`

```bash
php artisan make:seeder Asq3RecommendationSeeder
```

**Key Implementation Points**:
1. Load all domains and age intervals
2. Create 2-3 Indonesian recommendations per domain per interval
3. Use evidence-based activities from ASQ-3 Learning Activities
4. Set appropriate priority for ordering

**Run**:
```bash
php artisan db:seed --class=Asq3RecommendationSeeder
```

**Verify**:
```bash
php artisan tinker
>>> App\Models\Asq3Recommendation::count()
# Expected: 150-250 records
```

---

### Phase 2: Update Asq3ScreeningSeeder

**File**: `database/seeders/Asq3ScreeningSeeder.php`

**Changes**:
1. After creating screening results, check for `pantau` or `perlu_rujukan` status
2. Create `Asq3ScreeningIntervention` records for those domains
3. Link to recommendations by domain and age interval

**Key Code Addition**:
```php
// In createScreeningAnswersAndResults() method, after creating results:
if ($domainStatus !== 'sesuai') {
    $this->createIntervention($screening, $domain, $domainStatus);
}
```

---

### Phase 3: Register Seeders

**File**: `database/seeders/ProductionSeeder.php`

**Add** `Asq3RecommendationSeeder` after domain/interval seeders:
```php
$this->call([
    // ... existing seeders
    Asq3RecommendationSeeder::class,
]);
```

**Full Refresh**:
```bash
php artisan migrate:fresh --seed
```

---

### Phase 4: Update ChildController

**File**: `app/Http/Controllers/ChildController.php`

**Modify** `show()` method to expand screening data:

```php
// Replace existing screenings mapping with detailed version
'screenings' => $this->formatScreeningsForTab($child),
```

**Add** new private method:
```php
private function formatScreeningsForTab(Child $child): array
{
    $screenings = $child->asq3Screenings()
        ->with(['ageInterval', 'domainResults.domain', 'interventions'])
        ->completed()
        ->orderBy('screening_date', 'desc')
        ->limit(10)
        ->get();

    if ($screenings->isEmpty()) {
        return [
            'latestScreening' => null,
            'screeningHistory' => [],
        ];
    }

    $latest = $screenings->first();
    
    return [
        'latestScreening' => $this->formatScreeningDetail($latest),
        'screeningHistory' => $screenings->skip(1)->map(fn ($s) => [
            'id' => $s->id,
            'screening_date' => $s->screening_date->format('Y-m-d'),
            'age_at_screening_months' => $s->age_at_screening_months,
            'total_score' => $s->domainResults->sum('total_score'),
            'overall_status' => $s->overall_status,
        ])->values()->all(),
    ];
}
```

---

### Phase 5: Refactor screenings-tab.tsx

**File**: `resources/js/components/children/screenings-tab.tsx`

**Changes**:
1. Remove all mock data constants (`latestScreening`, `domainScores`, etc.)
2. Add props interface
3. Accept props from parent
4. Handle empty state

**Before** (mock data):
```tsx
export default function ScreeningsTabContent() {
    // Uses hardcoded mock data
}
```

**After** (real data):
```tsx
interface ScreeningsTabProps {
    childId: number;
    latestScreening: Asq3ScreeningDetail | null;
    screeningHistory: Asq3ScreeningHistoryItem[];
}

export default function ScreeningsTabContent({ 
    childId, 
    latestScreening, 
    screeningHistory 
}: ScreeningsTabProps) {
    // Uses props from controller
    if (!latestScreening) {
        return <EmptyState />;
    }
    // ... rest of component
}
```

---

### Phase 6: Update show.tsx

**File**: `resources/js/pages/children/show.tsx`

**Changes**:
1. Update Props interface to include screening data
2. Pass props to ScreeningsTabContent

**Update interface**:
```tsx
interface Props {
    child: {
        // ... existing fields
        screenings: {
            latestScreening: Asq3ScreeningDetail | null;
            screeningHistory: Asq3ScreeningHistoryItem[];
        };
    };
}
```

**Update component usage**:
```tsx
{activeTab === 'screenings' ? (
    <ScreeningsTabContent 
        childId={child.id}
        latestScreening={child.screenings.latestScreening}
        screeningHistory={child.screenings.screeningHistory}
    />
) : /* ... */}
```

---

## Verification Checklist

### Backend
- [ ] `Asq3RecommendationSeeder` creates 150+ records
- [ ] All 5 domains have recommendations
- [ ] All 21 age intervals have recommendations
- [ ] `Asq3ScreeningSeeder` creates interventions for non-sesuai results
- [ ] `ChildController::show()` returns formatted screening data
- [ ] No N+1 queries (eager loading verified)

### Frontend
- [ ] No TypeScript errors
- [ ] Component renders with real data
- [ ] Empty state displays when no screenings
- [ ] Domain scores display correctly
- [ ] Recommendations display correctly
- [ ] History list displays correctly

### Testing
```bash
# Run all tests
php artisan test

# Run specific seeder test
php artisan test --filter=Asq3RecommendationSeederTest

# Check TypeScript
npm run build
```

---

## Rollback Plan

If issues arise:

1. **Seeder issues**: 
   ```bash
   php artisan migrate:fresh --seed
   ```

2. **Frontend issues**: 
   - Revert `screenings-tab.tsx` to mock data version
   - Git: `git checkout resources/js/components/children/screenings-tab.tsx`

3. **Controller issues**:
   - Revert to original simple mapping
   - Git: `git checkout app/Http/Controllers/ChildController.php`

---

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `database/seeders/Asq3RecommendationSeeder.php` | CREATE | New seeder with Indonesian recommendations |
| `database/seeders/Asq3ScreeningSeeder.php` | UPDATE | Add intervention creation |
| `database/seeders/ProductionSeeder.php` | UPDATE | Register recommendation seeder |
| `app/Http/Controllers/ChildController.php` | UPDATE | Expand screening data formatting |
| `resources/js/components/children/screenings-tab.tsx` | REFACTOR | Remove mock, accept props |
| `resources/js/pages/children/show.tsx` | UPDATE | Pass screening props |
| `resources/js/types/models.ts` | UPDATE | Add new interfaces |
| `tests/Feature/Asq3RecommendationSeederTest.php` | CREATE | Seeder verification test |

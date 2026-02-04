# ASQ-3 Complete Questions - Decisions

## 2026-02-04 Orchestrator
### Approach Decision
- Use `deep` category for CSV generation task - requires thorough extraction and translation
- Include explicit Write tool instruction in prompt
- Combine Tasks 1-4 into single delegation (extraction + translation + CSV generation)

### Citation Handling
- PRESERVE `[cite: X]` references per existing CSV pattern (line 2-5 show citations)
- Seeder strips citations during import anyway

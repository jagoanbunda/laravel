# Decisions - ASQ-3 Checkpoint/Progress Endpoint

## 2026-02-04 Architectural Decisions

### Decision 1: Use `updated_at` as `last_saved_at`

**Context**: Need to show when progress was last saved
**Decision**: Use screening's `updated_at` field
**Rationale**: 
- No database migration needed
- `updated_at` is already touched when answers are submitted
- Follows "use existing data" principle

### Decision 2: Return Data for All Screening Statuses

**Context**: How to handle completed/cancelled screenings?
**Decision**: Return progress data for ALL statuses (not error)
**Rationale**:
- Mobile app can display historical progress
- Simpler API behavior (always returns data if screening exists)
- Status field tells client how to interpret

### Decision 3: Hardcode Question Counts

**Context**: How to calculate progress percentages?
**Decision**: Hardcode 30 total questions, 6 per domain
**Rationale**:
- ASQ-3 spec defines exactly 30 questions (5×6)
- Avoids database query to count questions
- Faster response time

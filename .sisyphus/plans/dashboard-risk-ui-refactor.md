# Dashboard Risk UI Refactor

## Context

### Original Request
User identified that the "Risk Attention" section in the dashboard is poorly placed (buried at bottom-right), failing to convey its high priority.

### Solution Strategy
1.  **Priority Inbox**: Move the "Risk Attention" card to the top of the right sidebar column.
2.  **Emergency Banner**: Add a conditional `Alert` banner at the very top of the dashboard content area to ensure visibility on all devices (especially mobile where the sidebar stacks at the bottom).

---

## Work Objectives

### Core Objective
Elevate the visual hierarchy of "At Risk" children to ensure healthcare workers never miss actionable alerts.

### Concrete Deliverables
-   Modified `resources/js/pages/dashboard/index.tsx`:
    -   New `Alert` banner component implementation.
    -   Reordered right-column layout.

### Must Have
-   Banner appears ONLY when `children_at_risk.length > 0`.
-   Banner uses `variant="error"` (or appropriate destructive variant) for maximum visibility.
-   Right sidebar order: Risk Attention → Nutritional Status → Screening Results.

---

## Verification Strategy

### Test Decision
-   **Infrastructure**: Existing test infra (PHPUnit) is for backend. Frontend tests (React) are not mentioned/active.
-   **Strategy**: **Manual Verification** via browser is required as this is a visual/layout change.

### Manual QA Procedure
1.  **Banner Verification**:
    -   Navigate to Dashboard.
    -   Verify Banner appears if risks exist.
    -   Verify Banner content: "Action Required: X children flagged..."
    -   Verify Banner is absent if no risks.
2.  **Sidebar Layout**:
    -   Verify "Risk Attention" card is at the top of the right column.
    -   Verify layout integrity (no broken grids).
3.  **Mobile Check**:
    -   Resize browser to mobile width.
    -   Verify Banner is the FIRST element user sees under the header.

---

## TODOs

- [ ] 1. Implement Risk Alert Banner
    **What to do**:
    -   Import `Alert`, `AlertTitle`, `AlertDescription` from `@/components/ui/alert`.
    -   Insert `Alert` block at the top of the main content area (inside `max-w-7xl`, before `grid` layouts).
    -   Condition: `children_at_risk.length > 0`.
    -   Variant: `error`.
    -   Content: "Action Required" title, text indicating number of children needing attention.

    **References**:
    -   `resources/js/components/ui/alert.tsx`: Component API.
    -   `resources/js/pages/dashboard/index.tsx`: Target file.

    **Acceptance Criteria**:
    -   [ ] Banner renders with red/destructive styling.
    -   [ ] Shows correct count of at-risk children.
    -   [ ] Link to focus on the list or children page (optional but good).

    **Parallelizable**: NO (modifies same file as task 2)

- [ ] 2. Reorder Right Sidebar Column
    **What to do**:
    -   Locate the right column `div` (the one containing `NutritionalPieChart`).
    -   Move the "Risk Attention" `Card` block from the bottom of this `div` to the very top.

    **References**:
    -   `resources/js/pages/dashboard/index.tsx`: Target file.

    **Acceptance Criteria**:
    -   [ ] "Risk Attention" is the first card in the right column.
    -   [ ] "Nutritional Status" is second.
    -   [ ] "Screening Results" is third.

    **Parallelizable**: NO (modifies same file as task 1)

---

## Success Criteria

### Verification Commands
```bash
# Since this is visual, use the build command to ensure no TS errors
npm run build
```

### Final Checklist
- [ ] Risk Attention is immediately visible on page load (top right).
- [ ] Critical Alerts are visible even on mobile (via Banner).
- [ ] Dashboard layout remains balanced.

# Dashboard UI/UX Improvements

## Context

### Original Request
Audit and improve the Dashboard page UI/UX to follow best practices, fixing logical inconsistencies, misleading charts, and visual affordance issues.

### Interview Summary
**Key Discussions**:
- **Risk Logic**: Identified contradiction where "At Risk" children show "Normal" status.
- **Chart Issues**: "Growth Trends" line chart is misleading for count data; Y-axis decimals are incorrect.
- **Affordance**: "Quick Actions" buttons look like passive cards.

**Research Findings**:
- Stack: Inertia.js (React) + Tailwind v4 + Recharts + Lucide Icons.
- File: `resources/js/pages/dashboard/index.tsx` is the primary target.
- Theme: OKLCH color palette defined in `app.css`.

### Metis/Self-Review
**Identified Gaps** (addressed):
- **Backend Dependency**: We are assuming `children_at_risk` prop is the source of truth. We will handle the visual logic on the frontend (e.g., showing a specific "Risk" badge contextually) without modifying backend logic.
- **Mobile Responsiveness**: Charts need careful handling on smaller screens. Grouped bars will be used with `ResponsiveContainer`.

---

## Work Objectives

### Core Objective
Polish the Dashboard to be trustworthy, accessible, and action-oriented.

### Concrete Deliverables
- Modified `resources/js/pages/dashboard/index.tsx`
- New/Refactored `StatCard` component (internal or extracted)
- Improved Chart configurations

### Definition of Done
- [ ] "Risk Attention" card shows consistent warnings (no green "Normal" badges for at-risk kids).
- [ ] "Activity Trends" uses a Bar Chart with integer-only Y-axis.
- [ ] "Quick Actions" have hover states and button-like affordance.
- [ ] Chart colors pass accessibility contrast checks.

### Must Have
- Accessible color contrast for all charts.
- Integer ticks on Y-axes (allowDecimals=false).
- Mobile responsive layout (no horizontal scroll).

### Must NOT Have (Guardrails)
- **Backend Changes**: Do not modify `DashboardController.php` or `app/Services/*`. Fix visuals only.
- **New Libraries**: Do not install new packages. Use existing Recharts/Lucide/Tailwind.

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: Yes (PHPUnit/Pest for backend, but limited frontend testing).
- **User wants tests**: Manual QA focus (Visual UI/UX work).
- **Framework**: Manual Verification via Browser.

### Manual QA Only
**CRITICAL**: Without automated frontend tests, manual verification MUST be exhaustive.

---

## Task Flow

```
1. Extract StatCard → 2. Fix Risk Logic → 3. Fix Charts → 4. Visual Polish (Quick Actions)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 1 | Foundation refactor |
| B | 2, 3 | Independent components (Risk Card vs Charts) |
| C | 4 | Final polish |

---

## TODOs

- [ ] 1. Refactor StatCard & Chart Components

  **What to do**:
  - Extract the internal `StatCard` function to a separate definition (or keep internal but clean up props).
  - Extract `NutritionalPieChart`, `ScreeningBarChart`, `MonthlyTrendsChart` to be cleaner, typed components within the file or separate if large.
  - **Why**: The current file is 374 lines and growing. Cleaning it up first makes specific chart fixes easier.

  **References**:
  - `resources/js/pages/dashboard/index.tsx` - Current implementation.

  **Acceptance Criteria**:
  - [ ] Components are defined clearly with typed props.
  - [ ] No functional change (refactor only).
  - [ ] Page still loads correctly.

- [ ] 2. Fix Risk Attention Logic & UI

  **What to do**:
  - In the "Risk Attention" card loop (`children_at_risk`):
  - **Override the status badge**: If they appear in this list, display a specific context badge (e.g., "Perlu Perhatian" in Yellow/Red) *regardless* of their base status, OR add a secondary text explaining *why* they are at risk (e.g., "Missed Screening").
  - *Decision*: Since backend data might be limited, we will display the `status` badge BUT add a red "⚠️ Check Status" label next to it if status is "Sesuai", to highlight the discrepancy.
  - Improve empty state: Add a cheerful illustration or icon (Green Checkmark) for "No children at risk".

  **References**:
  - `resources/js/pages/dashboard/index.tsx` - Lines 313-349.
  - `resources/js/components/ui/status-badge.tsx` - Reference for badge variants.

  **Acceptance Criteria**:
  - [ ] Child in "Risk" list with "Sesuai" status shows a visual warning/explanation.
  - [ ] Empty state looks visually distinct and positive.
  - [ ] Visual verification: `http://localhost:8000/dashboard`

- [ ] 3. Fix Charts (Type, Axis, Colors)

  **What to do**:
  - **Monthly Trends**:
    - Rename "Growth Trends" to "Activity Trends".
    - Switch `LineChart` to `BarChart` (Grouped).
    - Set `YAxis allowDecimals={false}`.
    - Add descriptive tooltip.
  - **Nutritional Status**:
    - Update colors to be distinct (Green=Normal, Yellow=Underweight, Orange=Stunted, Red=Wasted).
    - Currently they are likely using `var(--chart-*)` variables. Hardcode specific accessible colors or define new palette.
  - **Screening Results**:
    - Set `YAxis allowDecimals={false}`.

  **References**:
  - `resources/js/pages/dashboard/index.tsx` - Chart components.
  - Recharts Docs: `<BarChart>`, `<YAxis allowDecimals={false}>`.

  **Acceptance Criteria**:
  - [ ] "Activity Trends" is a Bar Chart showing discrete counts.
  - [ ] Y-axes do not show 0.5, 1.5, etc.
  - [ ] Nutritional chart sectors are easily distinguishable by color.

- [ ] 4. Polish "Quick Actions" & Visuals

  **What to do**:
  - **Quick Actions**:
    - Change background to `bg-background` with `border` and `shadow-sm`.
    - On hover: `border-primary` and `text-primary`.
    - Add `cursor-pointer` (ensure it's a button/link).
    - Move key actions (New Screening) to be more prominent? (Keep grid for now but style better).
  - **Header**:
    - Change "New Entry" button to a `DropdownMenu` (using shadcn/ui or simple primitive if available, else just keep button but maybe rename to "Add Data"). *Stick to simple button "New Entry" but ensure it links to a meaningful place or opens a dialog.*
  - **Sidebar**:
    - Check active state styling (ensure contrast).

  **References**:
  - `resources/js/pages/dashboard/index.tsx` - QuickAction component.

  **Acceptance Criteria**:
  - [ ] Quick Actions buttons clearly look clickable (hover effects, borders).
  - [ ] Layout spacing is consistent.

---

## Success Criteria

### Verification Commands
```bash
# Start dev server
npm run dev
# OR
composer run dev

# Navigate
open http://localhost:8000/dashboard
```

### Final Checklist
- [ ] No "Growth Trends" line chart (replaced by Bar).
- [ ] No "Normal" green badge in "Risk" section without warning.
- [ ] All charts readable.

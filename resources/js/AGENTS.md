# Frontend (React + Inertia.js + Tailwind v4)

React 19 SPA for **Nakes** (healthcare workers). Session-based auth via Inertia.js v2.

## Structure

```
resources/js/
├── app.tsx              # Inertia entry point
├── components/
│   ├── layouts/         # AppLayout (sidebar, navigation)
│   ├── ui/              # Primitives (Button, Input, Card, StatusBadge)
│   └── children/        # Domain components (growth-tab, nutrition-tab)
├── pages/               # Inertia page components (lowercase dirs)
│   ├── auth/            # Login
│   ├── children/        # Child management
│   ├── dashboard/       # Analytics
│   ├── pmt/             # PMT programs
│   └── screenings/      # ASQ-3 monitoring
├── types/               # TypeScript definitions (models.ts)
└── lib/                 # Utilities
```

## Conventions

### Layout Pattern
Every page wraps content in `AppLayout`:
```tsx
export default function PageName() {
  return (
    <AppLayout title="Page Title">
      {/* content */}
    </AppLayout>
  );
}
```

### Inertia Data Flow
- Props from Laravel controllers are strictly typed
- Use `usePage<PageProps>()` for shared data (auth, flash)
- Navigation: `<Link>` for declarative, `router.get/post` for imperative

### Tailwind v4 Specifics
- **OKLCH colors** used throughout (not hex/rgb)
- Theme defined in `resources/css/app.css` via `@theme` directive
- Soft themes available (Sage, Blue)
- Use `gap-*` for spacing (not margins between items)

### Status Indicators
Use `StatusBadge` component for all health statuses:
```tsx
<StatusBadge status="sesuai" />     // Green - normal
<StatusBadge status="pantau" />     // Yellow - monitor
<StatusBadge status="perlu_rujukan" /> // Red - needs referral
```

### Charts
- **Recharts** for dashboard analytics (Pie, Bar, Line)
- **Manual SVG** for WHO growth charts (components/children/growth-tab.tsx)

### Form Handling
Use Inertia v2 `<Form>` component (preferred) or `useForm()` hook:
```tsx
<Form action="/endpoint" method="post">
  {({ errors, processing }) => (
    <>
      <Input name="field" />
      {errors.field && <Error>{errors.field}</Error>}
      <Button disabled={processing}>Submit</Button>
    </>
  )}
</Form>
```

## Anti-Patterns

| Forbidden | Do Instead |
|-----------|------------|
| `bg-opacity-*` | `bg-black/50` (Tailwind v4) |
| `flex-shrink-*` | `shrink-*` (Tailwind v4) |
| Global state (Redux) | Use Inertia props + local state |
| Inline styles | Use Tailwind classes |
| Custom colors | Use OKLCH theme variables |

## Key Files

| File | Purpose |
|------|---------|
| `components/layouts/app-layout.tsx` | Sidebar, navigation, mobile menu |
| `components/ui/status-badge.tsx` | Indonesian health status labels |
| `components/children/growth-tab.tsx` | WHO growth chart SVG |
| `types/models.ts` | Domain types + Indonesian label maps |
| `css/app.css` | Tailwind v4 theme, OKLCH palette |

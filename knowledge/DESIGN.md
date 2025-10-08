# DESIGN: UI/UX Specification

## Design Principles

### Core Values
1. **Clarity over Complexity** - Jeder Schritt ist selbsterklärend
2. **Progressive Disclosure** - Zeige nur relevante Informationen zum aktuellen Zeitpunkt
3. **Visual Hierarchy** - Wichtigste Elemente stechen sofort hervor
4. **Instant Feedback** - Nutzer sehen sofort Ergebnisse ihrer Aktionen

## Visual Design System

### Color Palette

**Primary Colors:**
- `Primary`: #2563EB (Blue-600) - Aktionen, Links, Wikidata-Branding
- `Success`: #16A34A (Green-600) - Matches, Bestätigungen
- `Warning`: #EA580C (Orange-600) - Review needed
- `Error`: #DC2626 (Red-600) - Keine Matches, Fehler

**Neutral Colors:**
- `Background`: #FFFFFF (White)
- `Surface`: #F9FAFB (Gray-50)
- `Border`: #E5E7EB (Gray-200)
- `Text Primary`: #111827 (Gray-900)
- `Text Secondary`: #6B7280 (Gray-500)

**Confidence Score Colors:**
```
95-100%: #16A34A (Green - High Confidence)
80-94%:  #3B82F6 (Blue - Good)
60-79%:  #F59E0B (Amber - Medium)
< 60%:   #EF4444 (Red - Low)
```

### Typography

**Font Family:**
- UI: `Inter, system-ui, sans-serif`
- Monospace (Data): `'JetBrains Mono', monospace`

**Font Scales:**
```
Heading 1: 30px / 700 / -0.02em
Heading 2: 24px / 600 / -0.01em
Heading 3: 18px / 600 / normal
Body:      14px / 400 / normal
Small:     12px / 400 / normal
```

### Spacing System
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### Elevation (Shadows)
```
sm:  0 1px 2px rgba(0,0,0,0.05)
md:  0 4px 6px rgba(0,0,0,0.07)
lg:  0 10px 15px rgba(0,0,0,0.1)
```

## Layout Structure

### Application Shell
```
┌─────────────────────────────────────┐
│ Header (60px fixed)                 │
│ Logo | Title | Language | Help      │
├─────────────────────────────────────┤
│                                     │
│ Main Content Area                   │
│ (Fluid, max-width: 1400px)         │
│                                     │
├─────────────────────────────────────┤
│ Footer (40px)                       │
│ Progress | Stats | Export           │
└─────────────────────────────────────┘
```

### Workflow Steps (Stepper)
```
[1. Upload] → [2. Configure] → [3. Review] → [4. Export]
   Active       Pending         Pending       Pending
   ●────────────○────────────○────────────○
```

**Visual Encoding:**
- Active: Filled circle, blue, bold text
- Completed: Checkmark, green
- Pending: Hollow circle, gray
- Error: Exclamation, red

## Component Specifications

### 1. File Upload Zone

**State: Empty**
```
┌────────────────────────────────────┐
│                                    │
│         📄 [Icon 48px]            │
│                                    │
│   Drag & Drop CSV/TSV here        │
│   or click to browse               │
│                                    │
│   Max 10 MB · UTF-8 encoding       │
│                                    │
└────────────────────────────────────┘
Border: Dashed 2px #E5E7EB
Hover: Border → #2563EB
```

**State: Dragging Over**
```
Background: #EFF6FF (Blue-50)
Border: Solid 2px #2563EB
```

**State: File Loaded**
```
┌────────────────────────────────────┐
│ ✓ filename.csv (1.2 MB)           │
│ 1,247 rows · 5 columns             │
│                         [×] Remove │
└────────────────────────────────────┘
```

### 2. Column Mapper

**Layout:**
```
Select column(s) to reconcile:

[Dropdown: name           ▼] ← Primary column
[Dropdown: occupation     ▼] ← Context (optional)
[Dropdown: birth_year     ▼] ← Context (optional)

Entity Type Filter (optional):
[x] Person (Q5)
[ ] Organization (Q43229)
[ ] Place (Q618123)

Language: [English (en)   ▼]

             [Start Reconciliation →]
```

### 3. Reconciliation Table

**Table Layout:**
```
┌──────────┬─────────────────────┬──────────────────┬────────┐
│ Row      │ Original Value      │ Wikidata Match   │ Action │
├──────────┼─────────────────────┼──────────────────┼────────┤
│ 1  [→]   │ Albert Einstein     │ ● Q937 (100%)   │  ✓  ✗ │
│          │                     │ Albert Einstein  │        │
│          │                     │ physicist (1879) │        │
├──────────┼─────────────────────┼──────────────────┼────────┤
│ 2        │ Marie Curie         │ ● Q7186 (98%)   │  ✓  ✗ │
│          │                     │ ○ Q47071 (72%)  │        │
│          │                     │ ○ Q1234 (45%)   │        │
└──────────┴─────────────────────┴──────────────────┴────────┘
```

**Visual Encoding:**
- `●` Filled dot = Selected candidate
- `○` Hollow dot = Alternative candidate
- Green row background = Confirmed match
- Yellow row background = Needs review
- Red row background = No matches / rejected

**Row States:**
```css
.row-pending     { background: white; }
.row-auto-match  { background: #F0FDF4; border-left: 4px solid #16A34A; }
.row-needs-review{ background: #FFFBEB; border-left: 4px solid #F59E0B; }
.row-no-match    { background: #FEF2F2; border-left: 4px solid #EF4444; }
.row-active      { background: #EFF6FF; box-shadow: 0 0 0 2px #2563EB; }
```

### 4. Candidate Card (Expanded)

```
┌─────────────────────────────────────────────┐
│ Q937 · Albert Einstein                  [↗] │
│ German-born theoretical physicist           │
│                                             │
│ [Photo]  Born:       1879-03-14            │
│          Died:       1955-04-18            │
│          Occupation: Physicist             │
│          Awards:     Nobel Prize (1921)    │
│                                             │
│ Match Confidence: ████████████░ 96%        │
│                                             │
│                 [✓ Select Match]  [✗ Skip] │
└─────────────────────────────────────────────┘
```

**Confidence Bar:**
```css
.confidence-high   { background: linear-gradient(90deg, #16A34A, #22C55E); }
.confidence-medium { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
.confidence-low    { background: linear-gradient(90deg, #EF4444, #F87171); }
```

### 5. Progress Indicator

**Top of table:**
```
Reconciliation Progress
████████████████░░░░░░░░░░ 547 / 1,247 (43.9%)

✓ 432 Matched  ⚠ 115 Review  ✗ 12 No Match  ○ 688 Pending
```

**Bottom Status Bar:**
```
┌─────────────────────────────────────────────┐
│ Processing row 547...  [Pause] [Resume]    │
│                                 [Export →]  │
└─────────────────────────────────────────────┘
```

### 6. Keyboard Shortcuts Overlay

```
Press ? for keyboard shortcuts

Navigation:
  ↑ / ↓     Previous / Next row
  Enter     Expand candidate details
  Space     Select first candidate

Actions:
  1-9       Select candidate by number
  A         Auto-accept all high confidence (>95%)
  R         Mark for manual review
  X         Reject all candidates

Review:
  Tab       Jump to next needs-review
  Shift+Tab Jump to previous needs-review

Export:
  E         Export reconciled data
  Esc       Close dialog
```

## Interaction Patterns

### Auto-Match Behavior
```
Score >= 95% AND Type matches AND only 1 candidate
  → Auto-select + green highlight
  → User can still override

Score < 95% OR Multiple candidates
  → Yellow highlight "Review needed"
  → Show top 3 candidates

Score < 60%
  → Red highlight "Low confidence"
  → Suggest manual search
```

### Batch Actions
```
[✓ Select All with >95% confidence]
[Auto-confirm selected (432 items)]
```

### Undo/Redo Stack
```
Toolbar: [↶ Undo] [↷ Redo]

Shows last action:
"Matched 'Albert Einstein' → Q937"
"Rejected candidates for row 42"
```

## Responsive Behavior

### Desktop (>1024px)
- Full table with all columns visible
- Side-by-side candidate comparison
- Expanded entity previews

### Tablet (768-1023px)
- Stacked table rows
- Collapsed candidate cards (expand on tap)
- Bottom sheet for entity details

### Mobile (<768px)
- Card-based layout (no table)
- Swipe gestures (→ Accept, ← Reject)
- Full-screen entity preview

## Accessibility (WCAG 2.1 AA)

### Requirements
- All colors meet 4.5:1 contrast ratio
- Focus indicators (2px solid #2563EB)
- Screen reader labels on all interactive elements
- Keyboard navigation for entire workflow
- `aria-live` regions for progress updates

### Focus Management
```
Tab order:
1. Column selectors
2. Entity type filters
3. Start button
4. Table rows (↑↓ for navigation)
5. Candidate buttons (→← for selection)
6. Export button
```

## Loading States

### Initial API Call
```
[Spinner] Connecting to Wikidata...
```

### Batch Processing
```
[Progress Bar] Reconciling items 50-100...
⏱ Estimated time remaining: 2 minutes
```

### Rate Limit Hit
```
⚠ Slowing down to respect API limits...
[Animated hourglass]
```

## Error States

### No Matches Found
```
┌─────────────────────────────────────┐
│  🔍 No matches found                │
│                                     │
│  Try:                               │
│  • Checking spelling                │
│  • Removing type filters            │
│  • Using fewer context columns      │
│                                     │
│  [Manual Search on Wikidata.org]   │
└─────────────────────────────────────┘
```

### API Error
```
❌ Connection failed
We couldn't reach Wikidata API.
Check your internet connection.

[Retry]  [Skip Row]
```

## Animation & Motion

### Principles
- **Duration**: 200-300ms for UI transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Reduce motion**: Respect `prefers-reduced-motion`

### Key Animations
```css
/* Row selection */
.row-active {
  animation: highlight 300ms ease-out;
}

/* Candidate card expand */
.candidate-expanded {
  animation: slideDown 250ms ease-out;
}

/* Confidence bar fill */
.confidence-bar {
  animation: fillBar 600ms ease-in-out;
}

/* Success checkmark */
.match-confirmed {
  animation: checkmark 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Design Tokens (CSS Variables)

```css
:root {
  --color-primary: #2563EB;
  --color-success: #16A34A;
  --color-warning: #EA580C;
  --color-error: #DC2626;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);

  --transition-fast: 150ms;
  --transition-base: 250ms;
  --transition-slow: 350ms;
}
```

# IMPLEMENTATION MASTER PLAN
## Wikidata Reconciliation Tool - GitHub Pages Deployment

---

## 🎯 Project Overview

**Goal**: Single-Page-Application für Wikidata-Reconciliation
**Hosting**: GitHub Pages (static deployment)
**Timeline**: 4 Phasen mit klaren Milestones
**Stack**: React + TypeScript + Vite

---

## 📋 Phase 1: Project Setup & Foundation

### 1.1 Repository & Build Setup
**Duration**: 1 Tag

- [ ] Initialize Vite project mit React + TypeScript Template
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [ ] Configure GitHub Pages deployment
  - Set `base: '/Wikidata-Reconciliation-Tool/'` in vite.config.ts
  - Add `homepage` in package.json
- [ ] Setup deployment workflow
  - Create `.github/workflows/deploy.yml`
  - Auto-deploy on push to `main`
- [ ] Install core dependencies:
  ```json
  {
    "papaparse": "^5.4.1",
    "@types/papaparse": "^5.3.14",
    "tailwindcss": "^3.4.0"
  }
  ```

**Deliverable**: ✓ Empty app deploying to GitHub Pages

---

### 1.2 Design System Implementation
**Duration**: 1 Tag

- [ ] Setup Tailwind CSS with custom theme (knowledge/DESIGN.md)
- [ ] Create design tokens in `tailwind.config.js`:
  ```js
  colors: {
    primary: '#2563EB',
    success: '#16A34A',
    warning: '#EA580C',
    error: '#DC2626'
  }
  ```
- [ ] Build base components:
  - `Button.tsx` (primary, secondary, ghost variants)
  - `Card.tsx` (surface container)
  - `ProgressBar.tsx` (confidence scores)
  - `Badge.tsx` (status indicators)

**Deliverable**: ✓ Storybook/component showcase page

---

## 📋 Phase 2: Core Features

### 2.1 File Upload & Parsing
**Duration**: 2 Tage

**Components:**
- [ ] `FileUploadZone.tsx`
  - Drag & drop mit visual feedback
  - File validation (CSV/TSV, max 10MB, UTF-8)
  - Error handling für invalid files
- [ ] `CSVParser.ts` (Service)
  ```typescript
  interface ParsedData {
    headers: string[];
    rows: Record<string, string>[];
    rowCount: number;
  }
  ```
- [ ] `DataPreview.tsx`
  - Show first 10 rows in table
  - Column headers preview
  - Row/column statistics

**Validation Checkpoints:**
- ✓ Parse 1000-row CSV in < 500ms
- ✓ Handle malformed CSVs gracefully
- ✓ UTF-8 BOM detection works

---

### 2.2 Column Mapping Interface
**Duration**: 1 Tag

**Components:**
- [ ] `ColumnMapper.tsx`
  - Dropdown für primary column selection
  - Optional: 2 context columns (birth_year, occupation)
  - Entity type filter (Q5 Person, Q43229 Organization, etc.)
  - Language selector (en, de, fr, es)
- [ ] `EntityTypeSelector.tsx` (checkbox group)
- [ ] Validation logic:
  ```typescript
  if (!primaryColumn) throw new Error("Select primary column");
  ```

**Deliverable**: ✓ Valid configuration object for reconciliation

---

### 2.3 Wikidata API Integration
**Duration**: 3 Tage

**Service Layer:**
- [ ] `wikidataAPI.ts`
  ```typescript
  async function reconcile(
    queries: ReconcileQuery[],
    options: ReconcileOptions
  ): Promise<ReconcileResult[]>
  ```
- [ ] Rate limiting (60 req/min)
  - Implement queue with delays
  - Exponential backoff on 429 errors
- [ ] Response parsing & validation
  - Handle missing descriptions
  - Normalize score to 0-100 range
- [ ] Caching layer (SessionStorage)
  - Key: `${query}_${lang}_${types}`
  - TTL: Session lifetime

**Batch Processing:**
```typescript
const BATCH_SIZE = 50;
const DELAY_MS = 1000;

for (const batch of chunks(items, BATCH_SIZE)) {
  await reconcileBatch(batch);
  await sleep(DELAY_MS);
  updateProgress();
}
```

**Error Handling:**
- 429 Rate Limit → Pause + retry
- Network error → Queue for manual retry
- Invalid response → Skip + log error

**Validation Checkpoints:**
- ✓ 100 queries complete in ~5 seconds
- ✓ Rate limit respected (no 429 errors)
- ✓ Cache reduces redundant API calls by >70%

---

### 2.4 Reconciliation UI
**Duration**: 4 Tage

**Components:**

**A) ReconciliationWorkspace.tsx** (Main container)
- [ ] Stepper progress indicator
- [ ] Progress stats (matched/review/no-match/pending)
- [ ] Pause/Resume controls

**B) ReconciliationTable.tsx**
- [ ] Virtual scrolling (react-window) for >100 rows
- [ ] Row states (pending/auto-match/needs-review/no-match)
- [ ] Keyboard navigation (↑↓ for rows, Enter to expand)

**C) ReconciliationRow.tsx**
```tsx
interface RowProps {
  originalValue: string;
  candidates: Candidate[];
  status: RowStatus;
  onSelect: (candidateId: string) => void;
  onReject: () => void;
}
```
- [ ] Collapsible candidate list
- [ ] Visual confidence indicators
- [ ] Quick action buttons (✓ / ✗)

**D) CandidateCard.tsx**
- [ ] Wikidata entity preview
  - Label + description
  - Key properties (birth, occupation, etc.)
  - Thumbnail image (if available)
- [ ] Confidence bar with color coding
- [ ] Link to Wikidata entity page [↗]

**State Management:**
```typescript
interface ReconciliationState {
  items: ReconciliationItem[];
  currentIndex: number;
  stats: {
    matched: number;
    needsReview: number;
    noMatch: number;
    pending: number;
  };
}

// Actions:
- SELECT_CANDIDATE
- REJECT_CANDIDATES
- AUTO_MATCH_HIGH_CONFIDENCE
- UNDO / REDO
```

**Auto-Match Logic:**
```typescript
if (
  candidates.length === 1 &&
  candidates[0].score >= 95 &&
  candidates[0].match === true
) {
  autoSelect(candidates[0]);
}
```

**Validation Checkpoints:**
- ✓ 1000 rows render smoothly (no lag)
- ✓ Keyboard shortcuts work as expected
- ✓ Undo/redo stack handles 50+ actions

---

## 📋 Phase 3: Advanced Features

### 3.1 Batch Actions & Workflows
**Duration**: 2 Tage

- [ ] "Auto-confirm all >95%" button
  - Batch select high-confidence matches
  - Show confirmation dialog with count
- [ ] "Jump to next review" button (Tab shortcut)
- [ ] Filter view:
  - [ ] Show only "needs review"
  - [ ] Show only "no match"
- [ ] Bulk reject/accept selected rows

---

### 3.2 Export Functionality
**Duration**: 1 Tag

- [ ] `ExportService.ts`
  ```typescript
  function exportCSV(
    originalData: ParsedData,
    reconciliationResults: ReconciliationItem[]
  ): string
  ```
- [ ] Add columns:
  - `wikidata_id` (e.g., Q937)
  - `wikidata_url` (full URL)
  - `match_confidence` (0-100)
  - `match_status` (auto/manual/rejected)
- [ ] Download as CSV with UTF-8 BOM
- [ ] Filename: `reconciled_${originalFilename}_${timestamp}.csv`

**Pre-Export Validation:**
- [ ] Warn if >10% pending items remain
- [ ] Show export preview (first 5 rows)

---

### 3.3 Settings & Preferences
**Duration**: 1 Tag

- [ ] LocalStorage persistence:
  ```typescript
  interface UserSettings {
    defaultLanguage: string;
    autoMatchThreshold: number; // 90-100
    theme: 'light' | 'dark';
  }
  ```
- [ ] Settings modal
- [ ] Import/Export settings JSON

---

## 📋 Phase 4: Polish & Deployment

### 4.1 Error Handling & Edge Cases
**Duration**: 2 Tage

- [ ] Empty CSV handling
- [ ] Single-column CSV (no context)
- [ ] Non-UTF-8 encoding detection + warning
- [ ] API timeout handling (>30s)
- [ ] Network offline detection
- [ ] Browser compatibility fallbacks

**Error Messages:**
```typescript
// User-friendly messages
"Oops! This CSV seems to be empty."
"We couldn't connect to Wikidata. Check your internet."
"This file might not be UTF-8 encoded. Try re-saving it."
```

---

### 4.2 Performance Optimization
**Duration**: 1 Tag

- [ ] Code splitting (lazy load reconciliation UI)
  ```tsx
  const ReconciliationWorkspace = lazy(() => import('./Reconciliation'));
  ```
- [ ] API response compression
- [ ] Debounced search (300ms)
- [ ] Memoize expensive computations (confidence calculations)
- [ ] Lighthouse score >90 (Performance, Accessibility, Best Practices)

---

### 4.3 Documentation & Help
**Duration**: 1 Tag

- [ ] In-app tutorial (first-time user flow)
- [ ] Keyboard shortcuts overlay (? key)
- [ ] Help section:
  - What is reconciliation?
  - How to prepare your CSV
  - Understanding confidence scores
- [ ] GitHub README with screenshots
- [ ] Link to Wikidata documentation

---

### 4.4 Testing & QA
**Duration**: 2 Tage

**Unit Tests:**
- [ ] CSV parsing (PapaParse wrapper)
- [ ] Wikidata API response parsing
- [ ] Export CSV generation
- [ ] Confidence score calculations

**Integration Tests:**
- [ ] Full workflow: Upload → Configure → Reconcile → Export
- [ ] Error recovery (API failure during reconciliation)

**Manual QA Checklist:**
- [ ] Test with real-world datasets (100, 500, 1000 rows)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing (iPhone, Android)
- [ ] Accessibility audit (keyboard-only navigation, screen reader)

---

### 4.5 GitHub Pages Deployment
**Duration**: 0.5 Tag

**Production Build:**
```bash
npm run build
# Outputs to /dist with correct base path
```

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Vite Configuration** (`vite.config.ts`):
```typescript
export default defineConfig({
  base: '/Wikidata-Reconciliation-Tool/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          parser: ['papaparse']
        }
      }
    }
  }
});
```

**Validation:**
- [ ] Build succeeds without errors
- [ ] App loads at `https://<username>.github.io/Wikidata-Reconciliation-Tool/`
- [ ] All assets load correctly (no 404s)
- [ ] API calls work from GitHub Pages domain

---

## 📊 Milestones & Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| **Phase 1** | 2 Tage | ✓ App deploying, design system ready |
| **Phase 2** | 10 Tage | ✓ Core workflow functional (upload → reconcile → view) |
| **Phase 3** | 4 Tage | ✓ Batch actions, export working |
| **Phase 4** | 5.5 Tage | ✓ Production-ready, deployed to GitHub Pages |
| **Total** | **21.5 Tage** | 🚀 **Public Launch** |

---

## 🔧 Tech Stack Summary

### Core Framework
- **React 18** + **TypeScript 5**
- **Vite** (build tool, dev server)

### UI & Styling
- **Tailwind CSS** (utility-first styling)
- **Heroicons** (icon set)

### Data Processing
- **PapaParse** (CSV parsing)
- **react-window** (virtual scrolling)

### State Management
- **React Context** + **useReducer** (no external lib)

### API & Network
- **Fetch API** (native, no axios)
- **Wikidata Reconciliation API** (https://wikidata.reconci.link)

### Deployment
- **GitHub Pages** (static hosting)
- **GitHub Actions** (CI/CD)

---

## 📁 Project Structure

```
Wikidata-Reconciliation-Tool/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── knowledge/
│   ├── DATA.md
│   ├── REQUIREMENTS.md
│   ├── INSTRUCTIONS.md
│   └── DESIGN.md
├── src/
│   ├── components/
│   │   ├── ui/               # Base components (Button, Card, etc.)
│   │   ├── FileUpload/
│   │   ├── ColumnMapper/
│   │   ├── Reconciliation/
│   │   │   ├── ReconciliationWorkspace.tsx
│   │   │   ├── ReconciliationTable.tsx
│   │   │   ├── ReconciliationRow.tsx
│   │   │   └── CandidateCard.tsx
│   │   └── Export/
│   ├── services/
│   │   ├── csvParser.ts
│   │   ├── wikidataAPI.ts
│   │   └── exportService.ts
│   ├── hooks/
│   │   ├── useReconciliation.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── favicon.ico
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── README.md
└── IMPLEMENTATION-PLAN.md
```

---

## ✅ Definition of Done

### MVP Ready Criteria
- [ ] User can upload CSV, configure columns, reconcile, and export
- [ ] Auto-match works for high-confidence items (>95%)
- [ ] Manual review workflow is intuitive
- [ ] Keyboard shortcuts functional
- [ ] Mobile-responsive
- [ ] Deploys successfully to GitHub Pages
- [ ] README with usage instructions
- [ ] No critical bugs

### Nice-to-Have (Post-MVP)
- [ ] Dark mode toggle
- [ ] Custom Wikibase instance support
- [ ] Export to JSON-LD format
- [ ] Save/load reconciliation sessions (IndexedDB)
- [ ] Multi-language UI (i18n)

---

## 🚀 Getting Started

### Prerequisites
```bash
node >= 18.x
npm >= 9.x
```

### Development Setup
```bash
# Clone repo
git clone https://github.com/<username>/Wikidata-Reconciliation-Tool.git
cd Wikidata-Reconciliation-Tool

# Install dependencies
npm install

# Start dev server
npm run dev
# → Opens at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to GitHub Pages
```bash
# Manual deployment
npm run build
npm run deploy

# OR: Push to main branch (auto-deploys via GitHub Actions)
git push origin main
```

---

## 📞 Support & Contribution

- **Issues**: Report bugs at GitHub Issues
- **Documentation**: See [knowledge/](./knowledge/) folder
- **API Reference**: https://openrefine.org/docs/technical-reference/reconciliation-api

---

**I AM YOUR Promptotyping Expert Assistant::**

**Nächste Schritte:**
1. **JETZT STARTEN**: Soll ich mit Phase 1.1 (Project Setup) beginnen?
2. **PHASE ÜBERSPRINGEN**: Möchten Sie direkt mit einer bestimmten Phase anfangen?
3. **REQUIREMENTS ANPASSEN**: Gibt es Änderungen am Plan?

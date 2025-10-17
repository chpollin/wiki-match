# Not Implemented Features - WikiMatch MVP

**Last Updated**: 2025-10-17
**Version**: 1.0 Production

This document lists all features from the original requirements that were **not implemented** in the MVP, along with rationale and implementation notes for future versions.

---

## ❌ Core Features Not Implemented

### 1. Multi-Column Context Matching (REQ-011)
**Status**: ❌ Not Implemented
**Priority**: Medium
**Original Requirement**: Use multiple columns (e.g., name + birth year + occupation) for better matching accuracy

**Why Not in MVP**:
- Adds complexity to UI (column mapping becomes more complex)
- API supports it, but requires additional property mapping
- Single column sufficient for MVP validation

**Future Implementation** (v1.2):
```javascript
// Example API payload with context
{
  query: "Einstein",
  properties: [
    { pid: "P569", v: "1879" },  // birth year
    { pid: "P106", v: "Q169470" } // occupation: physicist
  ]
}
```

**Effort**: Medium (2-3 days)
- UI: Add "Context Columns" section with property mapping
- API: Modify payload builder to include properties
- Validation: Handle missing context gracefully

---

### 2. Undo/Redo (REQ-022)
**Status**: ❌ Not Implemented
**Priority**: Medium
**Original Requirement**: Undo/redo for match decisions

**Why Not in MVP**:
- Users can manually unselect/reselect
- Adds state management complexity
- Not critical for first iteration

**Future Implementation** (v1.1):
```javascript
// Action history stack
const history = {
  past: [],
  future: [],
  record(action) {
    this.past.push(action);
    this.future = []; // Clear redo stack
  },
  undo() {
    const action = this.past.pop();
    this.future.push(action);
    return action.inverse();
  },
  redo() {
    const action = this.future.pop();
    this.past.push(action);
    return action.execute();
  }
};
```

**Effort**: Medium (2 days)
- Implement command pattern for actions
- Add undo/redo UI buttons
- Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- Limit stack size (50-100 actions)

---

### 3. Data Preview Before Reconciliation (REQ-020)
**Status**: ❌ Not Implemented
**Priority**: Low
**Original Requirement**: Show first 100 rows in table before starting reconciliation

**Why Not in MVP**:
- File info shows row/column count
- Not critical for workflow
- Adds UI complexity

**Future Implementation** (v1.2):
```html
<!-- Preview table in Step 2 -->
<div class="preview-section">
  <h3>Data Preview (first 10 rows)</h3>
  <table>
    <thead><!-- Headers --></thead>
    <tbody><!-- First 10 rows --></tbody>
  </table>
  <p>Showing 10 of 1,247 rows</p>
</div>
```

**Effort**: Low (1 day)
- Add preview table component
- Show first N rows from parsed CSV
- Column statistics (unique values, null count)

---

### 4. Enhanced Entity Preview (REQ-024, partial)
**Status**: ⚠️ Partially Implemented
**Current**: ID, name, description, confidence, link
**Missing**: Thumbnail images, key properties, Wikipedia excerpt

**Why Not in MVP**:
- Requires additional Wikidata API calls
- Slows down reconciliation (rate limiting)
- Basic info sufficient for matching

**Future Implementation** (v1.2):
```javascript
// Fetch entity details from Wikidata
async function fetchEntityDetails(qid) {
  const response = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`
  );
  const data = await response.json();
  return {
    image: data.entities[qid].claims.P18?.[0]?.mainsnak?.datavalue?.value,
    birthDate: data.entities[qid].claims.P569?.[0]?.mainsnak?.datavalue?.value,
    occupation: data.entities[qid].claims.P106?.[0]?.mainsnak?.datavalue?.value
  };
}
```

**Effort**: Medium (2-3 days)
- Fetch additional entity data (on-demand or pre-fetch)
- Display thumbnail images
- Show key properties (birth, occupation, etc.)
- Link to Wikipedia article

---

### 7. Session Persistence (Nice-to-Have)
**Status**: ❌ Not Implemented
**Priority**: Medium
**Original Requirement**: Save/resume reconciliation sessions

**Why Not in MVP**:
- Adds complexity with data serialization
- Browser refresh = acceptable for MVP
- Most sessions complete in one sitting

**Future Implementation** (v1.2):
```javascript
// LocalStorage persistence
function saveSession() {
  const session = {
    timestamp: Date.now(),
    fileName: parsedData.fileName,
    config: config,
    items: Reconciliation.items,
    stats: Reconciliation.stats
  };
  localStorage.setItem('wikimatch_session', JSON.stringify(session));
}

function resumeSession() {
  const session = JSON.parse(localStorage.getItem('wikimatch_session'));
  if (session && Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
    // Resume if < 24 hours old
    return session;
  }
  return null;
}
```

**Effort**: Medium (2-3 days)
- Serialize reconciliation state
- LocalStorage or IndexedDB
- "Resume last session?" prompt on load
- Export/import session JSON
- Session expiry (24-48 hours)

---

### 8. Virtual Scrolling (Performance)
**Status**: ❌ Not Implemented
**Priority**: Low (unless testing shows lag)
**Original Requirement**: Handle 10,000+ rows smoothly

**Why Not in MVP**:
- Current DOM rendering works for <1000 rows
- API rate limiting is bottleneck, not UI rendering
- Can be added if performance issues arise

**Future Implementation** (v2.0):
```javascript
// Use react-window or custom implementation
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={120}
>
  {({ index, style }) => (
    <ReconciliationRow item={items[index]} style={style} />
  )}
</FixedSizeList>
```

**Effort**: Medium (2-3 days)
- Choose library (react-window, or vanilla)
- Refactor reconciliation table
- Test with 5000-10000 rows
- Optimize scroll performance

---

### 9. Dark Mode (Nice-to-Have)
**Status**: ❌ Not Implemented
**Priority**: Low
**Original Requirement**: Light/dark theme toggle

**Why Not in MVP**:
- Not functional requirement
- Tailwind dark mode is easy to add
- Low user impact

**Future Implementation** (v1.3):
```javascript
// Tailwind dark mode
<html class="dark"> <!-- Toggle this class -->

// CSS variables
:root {
  --bg: white;
  --text: black;
}

.dark {
  --bg: #1a1a1a;
  --text: #f0f0f0;
}

// Toggle button
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
```

**Effort**: Low (1 day)
- Add dark mode toggle button
- Update Tailwind config
- Add dark: variants to all components
- Persist preference in LocalStorage

---

### 10. Custom Wikibase Support (Nice-to-Have)
**Status**: ❌ Not Implemented
**Priority**: Low
**Original Requirement**: Support other Wikibase instances (not just Wikidata)

**Why Not in MVP**:
- Wikidata is primary use case
- Requires URL configuration
- Limited user demand

**Future Implementation** (v2.0):
```javascript
// Configuration UI
const wikibases = {
  wikidata: 'https://wikidata.reconci.link/en/api',
  factgrid: 'https://database.factgrid.de/reconcile/en/api',
  custom: 'https://user-provided-url.com/api'
};

// Settings modal
<select id="wikibaseSelector">
  <option value="wikidata">Wikidata (default)</option>
  <option value="factgrid">FactGrid</option>
  <option value="custom">Custom URL...</option>
</select>
```

**Effort**: Medium (2 days)
- Add Wikibase URL selector
- Validate custom URLs
- Handle different API response formats
- Save preference

---

### 11. Export Formats (Beyond CSV)
**Status**: ❌ Not Implemented
**Priority**: Low
**Original Requirement**: Export to JSON-LD, RDF/Turtle, Excel

**Why Not in MVP**:
- CSV is universal format
- JSON-LD adds complexity
- Limited user demand for v1

**Future Implementation** (v1.3):
```javascript
// Export format selector
<select id="exportFormat">
  <option value="csv">CSV (default)</option>
  <option value="json">JSON</option>
  <option value="jsonld">JSON-LD</option>
  <option value="xlsx">Excel (.xlsx)</option>
  <option value="turtle">RDF Turtle</option>
</select>

// JSON-LD example
{
  "@context": "https://www.w3.org/ns/csvw",
  "tables": [{
    "url": "reconciled_data.csv",
    "tableSchema": {
      "columns": [
        { "name": "name", "datatype": "string" },
        { "name": "wikidata_id", "propertyUrl": "http://www.wikidata.org/entity/{wikidata_id}" }
      ]
    }
  }]
}
```

**Effort**: Medium (2-3 days per format)
- JSON: 1 day (simple)
- JSON-LD: 2 days (schema mapping)
- Excel: 2 days (requires library like SheetJS)
- RDF: 3 days (complex serialization)

---

### 12. PWA / Offline Support (NFR-031)
**Status**: ❌ Not Implemented
**Priority**: Low
**Original Requirement**: Work offline after initial load

**Why Not in MVP**:
- Requires Wikidata API (must be online)
- Service worker adds complexity
- "Zero-install" already achieved via browser

**Future Implementation** (v2.0):
```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('wikimatch-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/js/app.js',
        // ... all JS files
      ]);
    })
  );
});

// Offline reconciliation queue
const offlineQueue = [];
navigator.onLine ? processQueue() : queueForLater();
```

**Effort**: High (5 days)
- Create service worker
- Cache static assets
- Handle offline API calls (queue for later)
- Add install prompt
- Test offline scenarios

---

## 📊 Summary: What's Missing

### ✅ IMPLEMENTED in v1.0 (2025-10-17)
- ✅ **Batch actions** - "Accept All ≥95%", "Select First for All"
- ✅ **Top export button** - No scrolling needed

### High Priority (v1.1)
1. ✅ Undo/Redo - **Effort: 2 days**
2. ✅ Toast notifications (replace alerts) - **Effort: 1 day**

### Medium Priority (v1.2)
3. ✅ Multi-column context - **Effort: 2-3 days**
4. ✅ Session persistence - **Effort: 2-3 days**
5. ✅ Enhanced entity preview - **Effort: 2-3 days**
6. ✅ Data preview - **Effort: 1 day**

### Low Priority (v1.3+)
7. ✅ Dark mode - **Effort: 1 day**
8. ✅ Export formats - **Effort: 2-3 days per format**
9. ✅ Custom Wikibase - **Effort: 2 days**

### Future (v2.0)
10. ✅ Virtual scrolling - **Effort: 2-3 days**
11. ✅ PWA/Offline - **Effort: 5 days**

---

## 🎯 Recommended Next Steps

### Immediate (Pre-v1.1):
1. Manual testing with all test data files
2. Cross-browser compatibility testing
3. Mobile responsive testing
4. Performance testing with 500-1000 rows
5. Deploy to GitHub Pages

### v1.1 Goals (UX Polish):
- Toast notifications (better UX than alerts)
- Undo/Redo (reduces user anxiety)

**Total effort**: ~3 days for v1.1

### v1.2 Goals (Advanced Matching):
- Multi-column context (improves accuracy)
- Session persistence (reduces frustration)
- Enhanced preview (better decision-making)

**Total effort**: ~6-8 days for v1.2

---

## 💡 Design Decisions Rationale

### Why No Frameworks?
- ✅ Faster initial load
- ✅ No build step complexity
- ✅ Easier for researchers to fork/modify
- ✅ Educational value (pure JavaScript)
- ⚠️ Manual DOM updates can become complex (consider lightweight framework if scaling)

### Why No Backend?
- ✅ Simpler deployment (GitHub Pages)
- ✅ Privacy-preserving (data stays in browser)
- ✅ Zero hosting costs
- ⚠️ Limits collaboration features
- ⚠️ No server-side caching

### Why Rate Limiting So Conservative?
- ✅ Respects Wikidata API fair use
- ✅ Prevents 429 errors
- ✅ Sustainable for community service
- ⚠️ Slow for large datasets (intentional tradeoff)

---

**Conclusion**: MVP is intentionally minimal. Missing features are well-documented and can be added iteratively based on user feedback.

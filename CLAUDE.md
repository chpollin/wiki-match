# WikiMatch - Current Development Status

**Last Updated**: 2025-10-08 22:48
**Session**: TEI Taxonomy Support & Bug Fixes

---

## 🎯 Current Status: Active Bug Investigation

### ✅ Recently Completed Features

1. **TEI Taxonomy/Category Support** (Committed: 0eabb0b)
   - Extract concepts from `<category>` elements in `<taxonomy>`
   - Parse `<catDesc><term>` structure for term names
   - Added "Concepts" entity type to reconciliation workflow
   - Display concept count in file stats and entity type dropdown

2. **Existing Wikidata ID Detection** (Committed: 0eabb0b)
   - Detects existing `@ref` attributes on all entity types
   - Supports both `wd:Q123` and full URL formats
   - Preserves existing refs during parsing
   - Exports use `wd:Q123` format for consistency
   - Adds `@ref` to `<term>` elements for categories

3. **"All Entity Types" Option** (Committed: 3d977de)
   - Added "All entity types (N)" dropdown option
   - Auto-updates entity type checkboxes based on selection
   - Allows reconciling persons, places, orgs, and concepts in single run

4. **Download Button UX Fix** (Committed: cacdb98)
   - Button now shows "Download CSV" or "Download TEI XML" based on file type
   - Updates dynamically after reconciliation completes

---

## 🐛 ACTIVE BUG: Type Filter Issue

### Problem Discovered
While testing with `depcha.wheaton.1.xml` (718 persons, 53 orgs, 350 concepts):
- Selected "All entity types (1121)"
- Entity type checkboxes show: ✅ Person (Q5), ✅ Organization (Q43229), ✅ Place (Q618123)
- **Result**: Most queries return 0 candidates, even for known persons

### Evidence
```
❌ "John Adams" → 0 results (should find US President!)
❌ "Benjamin Lincoln" → 0 results
❌ "Mary Lyon" → 0 results (famous educator)
❌ "Henry Beecher" → 0 results
✅ "George Washington" → 2 results (works!)
```

### Root Cause Identified
**File**: [js/wikidataAPI.js:136](js/wikidataAPI.js#L136)

```javascript
// PROBLEM: Only uses first type in array
payload.queries.q0.type = options.types[0]; // API accepts single type as string
```

**What's happening**:
1. User selects "All entity types"
2. Checkboxes update to: `['Q43229', 'Q5', 'Q618123']` (Org, Person, Place)
3. API payload uses `options.types[0]` = `Q43229` (Organization)
4. Query "John Adams" with type=Organization → 0 results ❌
5. Should query with type=Person or no type filter ✅

### Checkbox Order Issue
The `updateEntityTypeCheckboxes()` function checks all boxes for "all", but the array order is:
```javascript
// From HTML checkboxes order:
['Q5', 'Q43229', 'Q618123'] // Person, Org, Place
```

But when "all" is selected, the array becomes:
```javascript
// After querySelectorAll and map:
['Q5', 'Q43229', 'Q618123'] // Based on DOM order
```

**Actual issue**: The code takes `types[0]` which could be any of these depending on checkbox order in HTML.

---

## 🔧 Proposed Fixes

### Option 1: Remove Type Filter for "All" (Recommended)
```javascript
// In columnConfig.js or app.js
if (config.entityTypeFilter === 'all') {
    config.entityTypes = []; // Empty = no type filter
}
```

### Option 2: Send No Type When Multiple Selected
```javascript
// In wikidataAPI.js buildPayload()
if (options.types && options.types.length === 1) {
    payload.queries.q0.type = options.types[0];
}
// If multiple types, omit type filter (let API return anything)
```

### Option 3: Query Multiple Times (Slower)
- Query once per type filter
- Merge results
- ⚠️ Would be much slower (3x API calls)

---

## 📁 Files Modified This Session

### Committed Files
- ✅ `js/teiParser.js` - Taxonomy support, existing ID detection
- ✅ `js/columnConfig.js` - "All entity types" option, checkbox sync
- ✅ `js/fileUpload.js` - Display concept counts
- ✅ `js/export.js` - Dynamic button label
- ✅ `js/reconciliation.js` - Update button label on complete
- ✅ `README.md` - Updated feature list

### Files Needing Changes (Bug Fix)
- 🔴 `js/wikidataAPI.js` - Fix type filter logic (line 136)
- 🔴 `js/columnConfig.js` - Clear entity types when "all" selected (optional)

---

## 📊 Test Data Used

**File**: `test-data/depcha.wheaton.1.xml`
- **Size**: 594.39 KB
- **Content**:
  - 718 persons (from `<listPerson>`)
  - 53 organizations (from `<listOrg>`)
  - 350 concepts (from `<taxonomy>/<category>`)
  - **Total**: 1,121 entities

**Test Scenario**: Select "All entity types (1121)" → Start Reconciliation

---

## 🎯 Next Steps

### Immediate (Fix Bug)
1. Decide on fix approach (Option 1 or 2 recommended)
2. Modify `js/wikidataAPI.js` to handle multiple types correctly
3. Test with known persons (John Adams, Mary Lyon, etc.)
4. Verify "All entity types" returns results

### Short Term (Post-Fix)
1. Test reconciliation with all 1,121 entities (will take ~37 minutes)
2. Verify TEI XML export preserves `@ref` attributes correctly
3. Test with entities that already have `@ref` attributes
4. Cross-browser testing (Firefox, Safari, Edge)

### Documentation Updates Needed
- Update MVP-STATUS.md with taxonomy support
- Update NOT-IMPLEMENTED.md (remove keyboard shortcuts note if still not wanted)
- Add troubleshooting section for type filter issues

---

## 💡 Design Decisions This Session

### Why "All Entity Types" Clears Individual Filters
- **User Intent**: Selecting "All" means "reconcile everything"
- **API Limitation**: Wikidata Reconciliation API accepts single type OR no type
- **Solution**: When "all" selected → send no type filter (most permissive)

### Why `wd:Q123` Format for Export
- **Consistency**: TEI convention uses prefixed URIs
- **Compactness**: Shorter than full URLs
- **Standard**: Wikidata's official prefix is `wd:`

### Why Extract Taxonomy Categories
- **User Request**: User provided TEI with taxonomy elements
- **Digital Humanities Use Case**: Common in scholarly TEI documents
- **Completeness**: Support all entity-like structures in TEI header/back

---

## 📝 Known Issues (Beyond Current Bug)

### Minor Issues
1. Tailwind CDN warning (expected, not for production)
2. LF→CRLF line ending warnings (Windows git config)
3. No loading state during initial API call
4. No "pause/resume" for long reconciliations

### Limitations by Design
- Rate limiting: 1.2s per item (respects API limits)
- Max file size: 10 MB (browser memory)
- Single column reconciliation only (no multi-column context yet)
- No session persistence (refresh loses progress)

---

## 🔍 Debug Info

### API Payload Structure (Current)
```json
{
  "queries": {
    "q0": {
      "query": "John Adams",
      "limit": 5,
      "type": "Q43229"  // ❌ WRONG: Should be Q5 (Person) or omitted
    }
  }
}
```

### Expected Payload (After Fix)
```json
{
  "queries": {
    "q0": {
      "query": "John Adams",
      "limit": 5
      // No "type" field = no filter
    }
  }
}
```

---

## 🚀 Deployment Status

- **Branch**: main
- **Last Commit**: 3d977de ("Add 'All entity types' option for TEI reconciliation")
- **Commits Ahead of Origin**: 3
- **Ready to Push**: ⚠️ No (bug fix needed first)

---

## 📚 Related Documentation

- [README.md](README.md) - User-facing documentation
- [knowledge/MVP-STATUS.md](knowledge/MVP-STATUS.md) - Implementation status
- [knowledge/NOT-IMPLEMENTED.md](knowledge/NOT-IMPLEMENTED.md) - Future features
- [knowledge/REQUIREMENTS.md](knowledge/REQUIREMENTS.md) - Original requirements
- [knowledge/DESIGN.md](knowledge/DESIGN.md) - UI/UX specification

---

**End of Status Report**

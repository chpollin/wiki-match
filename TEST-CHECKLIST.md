# WikiMatch - Manual Test Checklist

## 🧪 Test Plan for All Data Files

### Test 1: People (names.csv)
- [ ] Upload `test-data/names.csv`
- [ ] Select column: `names`
- [ ] Entity type: ☑ Person (Q5)
- [ ] Language: English
- [ ] Expected: ~11 auto-matches, ~16 review, ~4 no-match
- [ ] Verify: "Jane Addams" → Q180989 (100% confidence)
- [ ] Export and check CSV has 5 columns

### Test 2: Places CSV (places.csv)
- [ ] Upload `test-data/places.csv`
- [ ] Select column: `city`
- [ ] Entity type: ☑ Place (Q618123)
- [ ] Language: English
- [ ] Expected: Major cities should auto-match
- [ ] Verify: "Paris" → Q90 (capital of France)
- [ ] Verify: "London" → Q84 (capital of UK)
- [ ] Export and verify

### Test 3: Places TSV (places.tsv)
- [ ] Upload `test-data/places.tsv`
- [ ] Select column: `place`
- [ ] Entity type: ☑ Place (Q618123)
- [ ] Language: English
- [ ] Expected: Natural features should match
- [ ] Verify: "Mount Everest" → Q513
- [ ] Verify: "Sahara Desert" → Q6583
- [ ] Check TSV parsing works correctly

### Test 4: Concepts CSV (concepts.csv)
- [ ] Upload `test-data/concepts.csv`
- [ ] Select column: `term`
- [ ] Entity type: ☐ No filter (concepts vary)
- [ ] Language: English
- [ ] Expected: Abstract concepts harder to match
- [ ] Verify: "Democracy" → Q7174
- [ ] Verify: "Quantum mechanics" → Q42213
- [ ] Check ambiguous terms need review

### Test 5: Concepts TSV (concepts.tsv)
- [ ] Upload `test-data/concepts.tsv`
- [ ] Select column: `concept`
- [ ] Entity type: ☐ No filter
- [ ] Language: English
- [ ] Expected: Modern terms may have multiple matches
- [ ] Verify: "Artificial Intelligence" → Q11660
- [ ] Verify: "Machine Learning" → Q2539
- [ ] Test TSV delimiter handling

### Test 6: Organizations (organizations.txt)
- [ ] Upload `test-data/organizations.txt`
- [ ] Select column: `organization`
- [ ] Entity type: ☑ Organization (Q43229)
- [ ] Language: English
- [ ] Expected: Well-known orgs auto-match
- [ ] Verify: "United Nations" → Q1065
- [ ] Verify: "UNESCO" → Q7809
- [ ] Test semicolon delimiter parsing

### Test 7: Sample Scientists (sample.csv)
- [ ] Upload `sample.csv`
- [ ] Select column: `name`
- [ ] Entity type: ☑ Person (Q5)
- [ ] Language: English
- [ ] Expected: All famous scientists should auto-match 100%
- [ ] Verify: "Albert Einstein" → Q937
- [ ] Verify: "Marie Curie" → Q7186
- [ ] Verify: "Isaac Newton" → Q935

## 🔍 Edge Cases to Test

### File Handling
- [ ] Upload very small file (1 row)
- [ ] Upload file with special characters (José, é, ñ)
- [ ] Upload file with UTF-8 BOM
- [ ] Try uploading non-CSV file (should error)
- [ ] Try uploading >10MB file (should error)

### UI Navigation
- [ ] Click "Back" buttons to navigate between steps
- [ ] Refresh page mid-reconciliation (data lost - expected)
- [ ] Select different columns and see preview
- [ ] Toggle entity type filters on/off
- [ ] Change language setting

### Reconciliation
- [ ] Test with NO entity type filter
- [ ] Test with multiple entity types selected
- [ ] Manually select candidates from review list
- [ ] Unselect an auto-matched item
- [ ] Try to export before reconciliation completes

### Console Logging
- [ ] Open browser console
- [ ] Verify color-coded logs appear
- [ ] Check test results show 100% pass
- [ ] Look for any errors or warnings
- [ ] Verify progress updates during reconciliation

### Export
- [ ] Check exported filename has timestamp
- [ ] Verify UTF-8 BOM for Excel compatibility
- [ ] Open in Excel/Google Sheets
- [ ] Verify all original columns preserved
- [ ] Verify 4 new columns added
- [ ] Check Wikidata URLs are clickable

## 🐛 Known Issues to Document

### Expected Behavior
- [ ] Rate limiting causes 1.2s delay per item (by design)
- [ ] Cache prevents re-querying same term
- [ ] Type filters may exclude valid matches
- [ ] Some names have multiple candidates (needs manual review)

### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile (responsive design)

## 📊 Success Criteria

### Minimum Viable Product (MVP) Complete If:
- ✅ Can upload CSV/TSV files
- ✅ Can select column to reconcile
- ✅ API returns candidates from Wikidata
- ✅ Can manually select from candidates
- ✅ Can export CSV with Wikidata IDs
- ✅ No critical errors in console
- ✅ Works in modern browsers

### Nice to Have (Post-MVP)
- Keyboard shortcuts
- Batch accept/reject
- Session persistence
- Dark mode
- Progress pause/resume

---

## 🎯 Your Testing Results

Please test each scenario and mark with:
- ✅ Works as expected
- ⚠️ Works but with issues (describe)
- ❌ Broken (provide error details)

Add your findings below:

### Test Results:
```
[Paste your test results here]
```

### Issues Found:
```
[List any bugs or unexpected behavior]
```

### Browser Used:
```
[Chrome/Firefox/Safari/Edge + version]
```

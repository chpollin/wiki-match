# WikiMatch - Usage Guide

## 🚀 Quick Start

1. **Open** `index.html` in your browser
2. **Upload** a CSV/TSV file with data to reconcile
3. **Configure** which column to match and entity type filters
4. **Review** automatic matches and manually select from candidates
5. **Export** enhanced CSV with Wikidata IDs and metadata

## ✨ Features Implemented

### Core Functionality
- ✅ CSV/TSV file upload (drag & drop)
- ✅ Column selection for reconciliation
- ✅ Entity type filtering (Person, Organization, Place)
- ✅ Wikidata API integration with rate limiting
- ✅ Auto-matching for high-confidence results (95%+)
- ✅ Manual review interface with candidate cards
- ✅ CSV export with Wikidata IDs

### Technical Details
- **Vanilla JavaScript** - No framework dependencies
- **Tailwind CSS** - Styling via CDN
- **PapaParse** - CSV parsing
- **Built-in logging** - Color-coded console logs
- **Unit tests** - Auto-run on page load

## 📊 Test Data Included

### People
- `test-data/names.csv` - 31 historical figures
- `sample.csv` - 10 famous scientists

### Places
- `test-data/places.csv` - 10 major cities
- `test-data/places.tsv` - 8 geographic features

### Concepts
- `test-data/concepts.csv` - 10 abstract concepts
- `test-data/concepts.tsv` - 8 modern concepts

### Organizations
- `test-data/organizations.txt` - 8 international orgs (semicolon-separated)

## 🎯 Workflow Example

### Step 1: Upload
```
File: names.csv
31 rows · 1 column
```

### Step 2: Configure
```
Primary Column: names
Entity Type: ☑ Person (Q5)
Language: Deutsch (de)
```

### Step 3: Reconcile
```
✓ 11 Matched (auto-selected, 100% confidence)
⚠ 16 Review (multiple candidates)
✗ 4 No Match (not found in Wikidata)
```

### Step 4: Export
```
Output: reconciled_names_2025-10-08.csv
Columns added:
- wikidata_id (e.g., Q180989)
- wikidata_url (full URL)
- match_confidence (0-100)
- match_status (matched/needs_review/no_match)
```

## 🔍 Console Logging

The app provides detailed console logging with color-coding:

```
🔧 [21:32:45] [WIKIDATA] Querying: Jane Addams
🔧 [21:32:45] [WIKIDATA] Raw API returned 1 results
🔧 [21:32:45] [WIKIDATA] ✓ Found 1 candidates for "Jane Addams"
```

- **Blue** - Info
- **Green** - Success
- **Orange** - Warning
- **Red** - Error
- **Purple** - Tests

## 🧪 Testing

Open browser console to see:
- ✅ CSVParser tests (8/8 passed)
- ✅ WikidataAPI tests (8/8 passed)

## 📝 API Details

**Endpoint**: `https://wikidata.reconci.link/en/api`

**Request Format**: Form-encoded data
```javascript
const formData = new URLSearchParams();
formData.append('queries', JSON.stringify({
  q0: {
    query: "Jane Addams",
    type: "Q5",
    limit: 5
  }
}));
```

**Rate Limiting**: 50 requests/minute (1.2s delay between calls)

## 🎨 Match Confidence Levels

- **95-100%** → Green (High confidence, auto-match)
- **80-94%** → Blue (Good match)
- **60-79%** → Amber (Medium confidence)
- **< 60%** → Red (Low confidence)

## 🚧 Known Limitations (MVP)

- Max file size: 10 MB
- Max recommended rows: 1000 (browser memory)
- No server-side persistence
- Single entity type filter per query
- English, German, French, Spanish UI languages only

## 🔮 Future Enhancements

- [ ] Keyboard shortcuts for navigation
- [ ] Batch accept/reject actions
- [ ] Undo/redo functionality
- [ ] Dark mode
- [ ] Save/resume sessions (LocalStorage)
- [ ] Multi-column context matching
- [ ] Custom Wikibase instance support
- [ ] Virtual scrolling for 10k+ rows

## 📦 Deployment

### GitHub Pages
1. Push to `main` branch
2. Enable GitHub Pages in repo settings
3. Set `base` path in `vite.config.js` (if using build step)
4. Access at: `https://username.github.io/wiki-match/`

### Local Development
Simply open `index.html` in a modern browser. No build step required!

## 🐛 Troubleshooting

**No results returned?**
- Check browser console for API errors
- Verify entity type filter isn't too restrictive
- Try without type filter first

**CSV parsing errors?**
- Ensure UTF-8 encoding
- Check for proper delimiter (comma, tab, semicolon)
- Verify file size < 10 MB

**Slow reconciliation?**
- Normal! Rate limiting means ~1.2s per item
- 100 rows ≈ 2 minutes
- Check console for progress

## 📚 Resources

- [Wikidata](https://www.wikidata.org)
- [Reconciliation API Spec](https://reconciliation-api.github.io/specs/latest/)
- [OpenRefine Documentation](https://openrefine.org/docs)

---

**Built with** ❤️ **using Vanilla JS** • No frameworks, no build tools, just working code!

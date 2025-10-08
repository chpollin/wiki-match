# WikiMatch - Wikidata Reconciliation Tool

[![Status](https://img.shields.io/badge/status-MVP_Complete-success)](knowledge/MVP-STATUS.md)
[![Tech](https://img.shields.io/badge/tech-Vanilla_JS-yellow)](index.html)
[![License](https://img.shields.io/badge/license-MIT-blue)]()

> Browser-based Single-Page-Application for Wikidata entity reconciliation with zero installation required.

## 🎯 Project Overview

**Domain**: Entity Resolution / Data Reconciliation for Wikidata
**Target Users**: Researchers, Data Analysts, Digital Humanities Professionals, Data Curators
**Goal**: Quick Wikidata reconciliation with minimal learning curve

### Core Value Proposition
- ✅ Zero-Installation (runs in browser)
- ✅ Direct Wikidata API access
- ✅ Intuitive workflow (4 steps)
- ✅ Immediate results

---

## 🚀 Quick Start

1. **Open** `index.html` in your browser
2. **Upload** CSV/TSV/TEI XML file (drag & drop or browse)
3. **Configure** primary column + optional entity type filter
4. **Review** auto-matched and suggested candidates
5. **Export** CSV (or enriched TEI XML) with Wikidata IDs

### Live Demo
[Coming soon: GitHub Pages deployment]

---

## ✨ Features (MVP v1.0)

### Implemented ✅
- **File Upload**: CSV, TSV, TXT (semicolon-delimited), TEI XML with drag & drop
- **TEI XML Support**: Extract entities from `listPerson`, `listPlace`, `listOrg`, and `taxonomy/category` in header/back matter
- **Existing Wikidata IDs**: Detects and preserves existing `@ref` attributes (formats: `wd:Q123` or full URLs)
- **Entity Type Filtering**: Person (Q5), Organization (Q43229), Place (Q618123), Concepts
- **Auto-Matching**: High-confidence results (≥95%) automatically selected
- **Manual Review**: Select from multiple candidates with confidence scores
- **CSV Export**: Original data + Wikidata IDs, URLs, confidence scores, status
- **TEI Export**: Enriched TEI XML with `@ref` attributes (uses `wd:Q123` format)
- **Rate Limiting**: Respects Wikidata API limits (50 req/min)
- **Caching**: Session-based to reduce redundant queries
- **Logging**: Color-coded console logs for debugging
- **Testing**: Built-in unit tests (16 passing)

### Not Yet Implemented ❌
- Batch actions ("Accept all >95%", "Reject all")
- Undo/Redo functionality
- Multi-column context matching (name + birth year)
- Session persistence (LocalStorage/IndexedDB)
- Enhanced entity preview (images, properties)
- Virtual scrolling (for 10k+ rows)

See [MVP-STATUS.md](knowledge/MVP-STATUS.md) for detailed implementation status.

---

## 📊 Test Data Included

### File Formats Supported
All test files in `test-data/` directory:

| Format | Files | Description |
|--------|-------|-------------|
| **CSV** | `names.csv`, `places.csv`, `concepts.csv` | Comma-separated |
| **TSV** | `places.tsv`, `concepts.tsv` | Tab-separated |
| **TXT** | `organizations.txt` | Semicolon-delimited |
| **TEI XML** | `depcha.wheaton.1.xml` | TEI header/back entities only |

### Sample Datasets
- **People** (31 rows): Historical figures, authors
- **Places** (10+8 rows): Cities and geographic features
- **Concepts** (10+8 rows): Scientific theories, art movements
- **Organizations** (8 rows): International institutions
- **Scientists** (10 rows): Famous researchers
- **TEI XML** (594KB): Digital Humanities TEI document with 130+ persons, 28+ orgs

---

## 🛠 Tech Stack

**Zero framework dependencies** - Pure Vanilla JavaScript!

- **HTML5 + CSS3 + JavaScript** (ES6+)
- **Tailwind CSS** (via CDN for rapid styling)
- **PapaParse** (CSV parsing library, CDN)
- **Wikidata Reconciliation API** (`https://wikidata.reconci.link`)

### Architecture
```
wiki-match/
├── index.html              # Main SPA entry point
├── js/
│   ├── app.js              # Main controller & navigation
│   ├── utils.js            # Logging, testing, helpers
│   ├── csvParser.js        # CSV parsing service
│   ├── teiParser.js        # TEI XML parsing & export service
│   ├── wikidataAPI.js      # API integration + caching
│   ├── fileUpload.js       # File upload component (CSV/TSV/TEI)
│   ├── columnConfig.js     # Column mapping UI
│   ├── reconciliation.js   # Match review interface
│   └── export.js           # CSV/TEI export service
├── test-data/              # Sample CSV/TSV/TEI files
│   ├── names.csv           # People
│   ├── places.csv/tsv      # Geographic entities
│   ├── concepts.csv/tsv    # Abstract concepts
│   ├── organizations.txt   # Organizations
│   └── depcha.wheaton.1.xml # TEI XML sample
├── README.md               # This file
└── knowledge/              # Planning & status docs
    ├── MVP-STATUS.md       # Implementation status
    ├── NOT-IMPLEMENTED.md  # Features not in MVP
    ├── REQUIREMENTS.md     # Original requirements
    ├── DESIGN.md           # UI/UX specification
    └── IMPLEMENTATION-PLAN.md  # Development roadmap
```

---

## 📖 Documentation

- **[knowledge/MVP-STATUS.md](knowledge/MVP-STATUS.md)** - Implementation status (85% complete)
- **[knowledge/NOT-IMPLEMENTED.md](knowledge/NOT-IMPLEMENTED.md)** - Missing features & roadmap
- **[knowledge/REQUIREMENTS.md](knowledge/REQUIREMENTS.md)** - Functional requirements
- **[knowledge/DESIGN.md](knowledge/DESIGN.md)** - UI/UX design specification

---

## 🧪 Testing

### Automated Tests
Open `index.html` and check browser console:
- ✅ CSVParser: 8/8 tests passing
- ✅ WikidataAPI: 8/8 tests passing

### Manual Testing
Use the test data files in `test-data/` directory.

**Example Test Run** (31 people from `test-data/names.csv`):
```
✓ 11 auto-matched (35.5%)
⚠ 16 need review (51.6%)
✗ 4 no matches (12.9%)
⏱ ~62 seconds total
```

---

## 🎯 Scope

### ✅ In Scope (v1.0 MVP)
- CSV/TSV/TEI XML upload with validation
- TEI XML entity extraction (listPerson/Place/Org in header/back only)
- Fuzzy matching against Wikidata
- Manual review interface
- Export with Wikidata IDs (CSV or enriched TEI XML)
- Entity type filtering
- Auto-matching (≥95% confidence)

### ❌ Out of Scope (Future Versions)
- Multi-user collaboration
- Server-side persistence
- Batch API for millions of entries
- Custom Wikibase instances
- Multi-column context matching
- Session save/resume
- Keyboard shortcuts
- Dark mode

---

## 🚧 Known Limitations (MVP)

### Performance
- **Rate limiting**: ~1.2s per item (respects API limits)
- **Time estimate**: 100 items ≈ 2 minutes, 500 items ≈ 10 minutes
- **Max file size**: 10 MB (browser memory constraint)
- **Recommended limit**: 1,000 rows (untested beyond this)

### Functionality
- **Single column only**: No multi-column context yet
- **No session persistence**: Refresh = lost progress
- **No keyboard navigation**: Mouse/touch only
- **No batch operations**: Must review one by one

### Browser Compatibility
- **Tested**: Chrome (working)
- **Needs testing**: Firefox, Safari, Edge, Mobile browsers

---

## 🔮 Roadmap

### v1.1 (Next Release)
- [ ] Batch actions ("Accept all >95%")
- [ ] Undo/Redo functionality
- [ ] Cross-browser testing
- [ ] Mobile responsive testing
- [ ] GitHub Pages deployment

### v1.2 (UX Enhancements)
- [ ] Multi-column context matching
- [ ] Session persistence (LocalStorage)
- [ ] Enhanced entity preview (images, properties)
- [ ] Data preview before reconciliation

### v2.0 (Advanced Features)
- [ ] Virtual scrolling for 10k+ rows
- [ ] Custom Wikibase support
- [ ] Export to JSON-LD/RDF
- [ ] PWA with offline mode

---

## 🤝 Contributing

This is a research/academic tool. Contributions welcome!

### Development
```bash
# No build step required - just open index.html
open index.html

# Or use a local server
python -m http.server 8000
# Then open http://localhost:8000
```

### Reporting Issues
- Test with files from `test-data/` first
- Include browser version and console logs
- Provide sample CSV if possible

---

## 📊 Constraints

- **API Rate Limit**: Wikidata Reconciliation API = 60 req/min (conservative: 50 req/min)
- **Browser Memory**: Practical limit ~10,000 rows
- **No Backend**: Pure client-side SPA (no server required)

---

## 📚 Resources

- [Wikidata](https://www.wikidata.org) - The free knowledge base
- [Reconciliation API Spec](https://reconciliation-api.github.io/specs/latest/)
- [OpenRefine](https://openrefine.org) - Desktop alternative with more features

---

## 📄 License

MIT License (or specify your license)

---

## 🙏 Acknowledgments

- Built with ❤️ using Vanilla JavaScript
- Powered by [Wikidata Reconciliation API](https://wikidata.reconci.link)
- CSV parsing by [PapaParse](https://www.papaparse.com/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)
- 🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

**Status**: ✅ MVP Complete | **Version**: 1.0 | **Last Updated**: 2025-10-08

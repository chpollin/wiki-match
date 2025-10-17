# WikiMatch - Wikidata Reconciliation Tool

[![Status](https://img.shields.io/badge/status-Production_Ready-success)](CLAUDE.md)
[![Tech](https://img.shields.io/badge/tech-Vanilla_JS-yellow)](index.html)
[![License](https://img.shields.io/badge/license-MIT-blue)]()

> Zero-installation browser tool for Wikidata entity reconciliation. Upload CSV/TSV/TEI XML → Match entities → Export with Wikidata IDs.

**Target Users**: Researchers, Data Curators, Digital Humanities Professionals

---

## 🚀 Quick Start

1. Open `index.html` in browser (or visit [GitHub Pages - coming soon])
2. Upload file (CSV, TSV, TEI XML) via drag & drop
3. Configure primary column + entity type filters
4. Use batch actions or manual review
5. Export CSV or enriched TEI XML

**No installation. No signup. Runs entirely in your browser.**

---

## ✨ Features

### Core ✅
- **File Formats**: CSV, TSV, TXT (semicolon), TEI XML
- **TEI Support**: Extract from `<listPerson>`, `<listPlace>`, `<listOrg>`, `<taxonomy>`
- **Entity Types**: Person (Q5), Org (Q43229), Place (Q618123), Concepts
- **Auto-Match**: High-confidence (≥95%) automatically selected
- **Manual Review**: Choose from multiple candidates with scores
- **Export**: CSV with IDs OR TEI XML with `@ref="wd:Q123"` attributes

### NEW: Batch Actions 🎉 (v1.0)
- **"Accept All ≥95%"**: Auto-select all high-confidence matches
- **"Select First for All"**: Quick bulk selection of top candidates
- **Top Export Button**: No scrolling needed on large datasets

### Technical ✅
- **Existing IDs**: Detects/preserves existing `@ref` attributes
- **Rate Limiting**: Respects API limits (50 req/min, ~1.2s/item)
- **Caching**: Session-based, reduces redundant queries
- **Testing**: 16 unit tests passing

---

## 📊 Test Data

Sample files in `test-data/`:

| File | Entities | Notes |
|------|----------|-------|
| `names.csv` | 31 people | Historical figures |
| `places.csv/tsv` | 18 places | Cities, features |
| `concepts.csv/tsv` | 18 concepts | Theories, movements |
| `organizations.txt` | 8 orgs | Intl institutions |
| `depcha.wheaton.1.xml` | 1,121 TEI | 718 persons, 53 orgs, 350 concepts |

### Example Results
**31 people from `names.csv`**:
- ✓ 11 auto-matched (35%)
- ⚠ 16 need review (52%)
- ✗ 4 no matches (13%)
- ⏱ ~62 seconds

---

## 🛠 Tech Stack

**Zero framework dependencies** - Pure Vanilla JavaScript

- HTML5 + CSS3 + JavaScript ES6+
- Tailwind CSS (CDN)
- PapaParse (CSV parsing, CDN)
- Wikidata Reconciliation API

### Architecture
```
wiki-match/
├── index.html           # SPA entry
├── js/
│   ├── app.js           # Main controller
│   ├── utils.js         # Logger, tests
│   ├── csvParser.js     # CSV/TSV parsing
│   ├── teiParser.js     # TEI XML parsing/export
│   ├── wikidataAPI.js   # API integration
│   ├── fileUpload.js    # Upload UI
│   ├── columnConfig.js  # Column mapping
│   ├── reconciliation.js # Review interface
│   └── export.js        # CSV/TEI export
├── test-data/           # Samples
└── knowledge/           # Docs
```

---

## 🚀 Deployment

### Local
```bash
# No build - just open
open index.html

# Or use server
python -m http.server 8000
```

### GitHub Pages
1. Enable in repo settings
2. Source: `main` branch, root `/`
3. Done! (no build needed)

---

## 📖 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Dev status, bug fixes (2025-10-17)
- **[knowledge/MVP-STATUS.md](knowledge/MVP-STATUS.md)** - Implementation details
- **[knowledge/NOT-IMPLEMENTED.md](knowledge/NOT-IMPLEMENTED.md)** - Future features
- **[knowledge/REQUIREMENTS.md](knowledge/REQUIREMENTS.md)** - Requirements
- **[knowledge/DESIGN.md](knowledge/DESIGN.md)** - UI/UX design

---

## ⚡ Performance

- **Rate**: 1.2s/item (API limit compliance)
- **100 items**: ~2 min | **500 items**: ~10 min | **1,000 items**: ~20 min
- **Max file**: 10 MB (browser memory)
- **Recommended**: Up to 1,000 rows

---

## 🧪 Testing

### Automated
Console shows:
- ✅ CSVParser: 8/8
- ✅ WikidataAPI: 8/8

### Manual
Use `test-data/` files

---

## 🔧 Known Limitations

- Single column only (no multi-column context)
- No session persistence (refresh = lost)
- No keyboard shortcuts
- Browser: Chrome tested, others TBD

---

## 🗺 Roadmap

### v1.1
- [ ] Keyboard shortcuts (↑/↓, Enter)
- [ ] Undo/Redo
- [ ] Toast notifications (replace alerts)
- [ ] Cross-browser testing

### v1.2
- [ ] Session persistence (LocalStorage)
- [ ] Multi-column context
- [ ] Enhanced preview (images)
- [ ] Virtual scrolling (10k+ rows)

### v2.0
- [ ] PWA + offline mode
- [ ] Custom Wikibase
- [ ] JSON-LD/RDF export
- [ ] Dark mode

---

## 🤝 Contributing

Academic/research tool - contributions welcome!

```bash
# Edit & reload - no build step
open index.html
```

**Report issues**: Include browser version, console logs, sample file

---

## 📚 Resources

- [Wikidata](https://www.wikidata.org) - Free knowledge base
- [Reconciliation API Spec](https://reconciliation-api.github.io/specs/latest/)
- [OpenRefine](https://openrefine.org) - Desktop alternative

---

## 📄 License

MIT License

---

## 🙏 Credits

- [Wikidata Reconciliation API](https://wikidata.reconci.link)
- [PapaParse](https://www.papaparse.com/) - CSV parsing
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- 🤖 [Claude Code](https://claude.com/claude-code)

---

**Status**: ✅ Production Ready | **Version**: 1.0 | **Updated**: 2025-10-17

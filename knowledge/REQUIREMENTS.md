# REQUIREMENTS: Funktionale & Non-funktionale Anforderungen

## Funktionale Anforderungen (Priorität)

### P0 - MVP Core
- **REQ-001**: CSV/TSV-Datei Upload (Drag & Drop + File Picker)
- **REQ-002**: Spaltenauswahl für Reconciliation (welche Spalte matchen)
- **REQ-003**: Wikidata API Query mit Fuzzy Matching
- **REQ-004**: Kandidaten-Anzeige mit Score-Ranking
- **REQ-005**: Manuelle Match-Bestätigung (✓ / ✗)
- **REQ-006**: Export als CSV mit Wikidata-IDs

### P1 - Enhanced Matching
- **REQ-010**: Type-Filter (z.B. nur Personen Q5, Orte Q618123)
- **REQ-011**: Multi-Column Context (z.B. Name + Geburtsjahr für besseren Match)
- **REQ-012**: Language Selection (de/en/fr/es...)
- **REQ-013**: Auto-Match bei Score > 95%

### P2 - UX Improvements
- **REQ-020**: Preview von ersten 100 Rows vor Reconciliation
- **REQ-021**: Progress Indicator (X von Y reconciled)
- **REQ-022**: Undo/Redo für Match-Entscheidungen
- **REQ-023**: Batch-Review (schnelles Durchklicken)
- **REQ-024**: Wikidata Entity Preview (Bild, Beschreibung, Properties)

## Non-funktionale Anforderungen

### Performance
- **NFR-001**: UI bleibt responsive bei 1000+ Rows
- **NFR-002**: Initial Match-Results innerhalb 3s (für 100 Items)
- **NFR-003**: Client-side Processing (keine Server-Calls außer Wikidata-API)

### Usability
- **NFR-010**: Mobile-responsive Design
- **NFR-011**: Keyboard-Navigation für Batch-Review
- **NFR-012**: Zero-Install (pure Web-App)
- **NFR-013**: Klare Fehlermeldungen bei API-Limits

### Security/Privacy
- **NFR-020**: Alle Daten bleiben im Browser (kein Upload zu fremdem Server)
- **NFR-021**: Keine Cookies/Tracking außer LocalStorage für Settings

### Compatibility
- **NFR-030**: Chrome/Firefox/Safari/Edge (latest -1 version)
- **NFR-031**: Funktioniert ohne Internet nach initial Load (PWA)

## Testability

### Akzeptanzkriterien
- **TEST-001**: Upload von 500-Zeilen CSV abschließbar in < 1 Min
- **TEST-002**: Fuzzy Match findet "Einstein" bei Input "Albert Einsteen" (Typo)
- **TEST-003**: Export-CSV enthält alle Original-Spalten + Wikidata-Spalten
- **TEST-004**: Type-Filter reduziert False Positives um > 50%

## Constraints

- **CON-001**: Wikidata API Rate Limit: max 60 req/min (ungated)
- **CON-002**: Browser Memory Limit: max 10.000 Rows
- **CON-003**: Single-Page-App (keine Backend-Infrastruktur)

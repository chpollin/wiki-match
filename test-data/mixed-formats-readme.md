# Test Data Files

## Supported Formats

### ✅ CSV (Comma-Separated Values)
- `names.csv` - Single column, 31 people
- `places.csv` - Multi-column with city/country
- `concepts.csv` - Abstract concepts with domain

### ✅ TSV (Tab-Separated Values)
- `places.tsv` - Geographic features
- `concepts.tsv` - Modern concepts

### ✅ TXT with Semicolon Delimiter
- `organizations.txt` - International organizations

## Quick Test Guide

1. **People** → Use `names.csv` + Entity Type: Person (Q5)
2. **Places** → Use `places.csv` or `places.tsv` + Entity Type: Place (Q618123)
3. **Concepts** → Use `concepts.csv` (no type filter, broader matching)
4. **Organizations** → Use `organizations.txt` + Entity Type: Organization (Q43229)

## Expected Results

- **High confidence (>95%)**: Famous places like Paris, London, concepts like Democracy
- **Review needed (60-95%)**: Less common terms, ambiguous names
- **No match**: Very rare or misspelled entries

# DATA: Datenstrukturen

## Input-Format

### CSV/TSV Upload
```csv
name,birth_year,occupation
Albert Einstein,1879,physicist
Marie Curie,1867,chemist
```

**Anforderungen:**
- Encoding: UTF-8
- Max Size: 10 MB (client-side processing)
- Delimiter: auto-detect (comma, tab, semicolon)

## Wikidata API Response

### Reconciliation Endpoint
`GET https://wikidata.reconci.link/{lang}/api`

**Beispiel Response:**
```json
{
  "q0": {
    "result": [
      {
        "id": "Q937",
        "name": "Albert Einstein",
        "type": [{"id": "Q5", "name": "human"}],
        "score": 100,
        "match": true,
        "description": "German-born physicist (1879-1955)"
      }
    ]
  }
}
```

**Relevante Felder:**
- `id`: Wikidata QID
- `name`: Label (sprachabhängig)
- `score`: Match-Confidence (0-100)
- `match`: Boolean (exakter Match)
- `description`: Kurzbeschreibung
- `type`: Entity-Typ(en)

## Internal Data Model

### ReconciliationItem
```typescript
{
  originalValue: string,
  rowIndex: number,
  candidates: [
    {
      wikidataId: string,
      label: string,
      description: string,
      score: number,
      types: string[],
      url: string
    }
  ],
  selectedCandidate: string | null,
  status: 'pending' | 'matched' | 'rejected' | 'reviewed'
}
```

## Output-Format

### Enhanced CSV
```csv
name,birth_year,occupation,wikidata_id,wikidata_url,match_confidence
Albert Einstein,1879,physicist,Q937,https://www.wikidata.org/wiki/Q937,100
Marie Curie,1867,chemist,Q7186,https://www.wikidata.org/wiki/Q7186,98
```

**Neue Spalten:**
- `wikidata_id`: QID
- `wikidata_url`: Vollständige URL
- `match_confidence`: Score (0-100)

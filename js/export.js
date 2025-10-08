// Export Service
const ExportService = {
    init() {
        const downloadBtn = document.getElementById('downloadCSV');

        downloadBtn.addEventListener('click', () => {
            // Check if TEI or CSV
            const isTEI = Reconciliation.isTEI;
            if (isTEI) {
                this.exportTEI();
            } else {
                this.exportCSV();
            }
        });

        Logger.success('EXPORT', 'Export service initialized');
    },

    prepareExportData(originalData, reconciliationResults) {
        Logger.info('EXPORT', 'Preparing export data');

        const { items } = reconciliationResults;
        const exportRows = [];

        // Add new columns to headers
        const headers = [
            ...originalData.headers,
            'wikidata_id',
            'wikidata_url',
            'match_confidence',
            'match_status'
        ];

        items.forEach(item => {
            const row = { ...item.row };

            if (item.selectedCandidate) {
                row.wikidata_id = item.selectedCandidate.id;
                row.wikidata_url = item.selectedCandidate.url;
                row.match_confidence = item.selectedCandidate.score;
                row.match_status = 'matched';
            } else if (item.status === 'review') {
                row.wikidata_id = '';
                row.wikidata_url = '';
                row.match_confidence = item.candidates[0]?.score || 0;
                row.match_status = 'needs_review';
            } else {
                row.wikidata_id = '';
                row.wikidata_url = '';
                row.match_confidence = 0;
                row.match_status = 'no_match';
            }

            exportRows.push(row);
        });

        return { headers, rows: exportRows };
    },

    exportCSV() {
        Logger.info('EXPORT', 'Starting CSV export');

        try {
            const originalData = CSVParser.parsedData;
            const reconciliationResults = Reconciliation.getResults();

            if (!originalData || !reconciliationResults) {
                Utils.showError('No data to export');
                return;
            }

            const exportData = this.prepareExportData(originalData, reconciliationResults);

            // Convert to CSV using PapaParse
            const csv = Papa.unparse({
                fields: exportData.headers,
                data: exportData.rows
            }, {
                quotes: true,
                header: true
            });

            // Add UTF-8 BOM for Excel compatibility
            const BOM = '\uFEFF';
            const csvWithBOM = BOM + csv;

            // Create download
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const originalFileName = originalData.fileName.replace(/\.[^.]+$/, '');
            const fileName = `reconciled_${originalFileName}_${timestamp}.csv`;

            this.downloadFile(csvWithBOM, fileName, 'text/csv;charset=utf-8;');

            Logger.success('EXPORT', `CSV exported: ${fileName}`, {
                rows: exportData.rows.length,
                columns: exportData.headers.length
            });

        } catch (error) {
            Logger.error('EXPORT', 'Export failed', error);
            Utils.showError('Failed to export CSV. Please try again.');
        }
    },

    exportTEI() {
        Logger.info('EXPORT', 'Starting TEI XML export');

        try {
            const reconciliationResults = Reconciliation.getResults();

            if (!reconciliationResults) {
                Utils.showError('No data to export');
                return;
            }

            // Generate enriched TEI XML
            const enrichedXML = TEIParser.exportEnrichedTEI(reconciliationResults.items);

            // Create download
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `enriched_tei_${timestamp}.xml`;

            this.downloadFile(enrichedXML, fileName, 'application/xml;charset=utf-8;');

            Logger.success('EXPORT', `TEI XML exported: ${fileName}`, {
                items: reconciliationResults.items.length
            });

        } catch (error) {
            Logger.error('EXPORT', 'TEI export failed', error);
            Utils.showError('Failed to export TEI XML. Please try again.');
        }
    },

    downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);

        Logger.info('EXPORT', `File download initiated: ${fileName}`);
    },

    updateExportSummary(stats) {
        document.getElementById('exportMatchedCount').textContent = stats.matched;
        document.getElementById('exportReviewCount').textContent = stats.review;
        document.getElementById('exportNoMatchCount').textContent = stats.noMatch;
    }
};

window.ExportService = ExportService;
Logger.success('EXPORT', 'Export module loaded');

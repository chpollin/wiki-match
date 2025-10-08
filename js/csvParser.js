// CSV Parser Service using PapaParse
const CSVParser = {
    parsedData: null,

    /**
     * Parse CSV file
     * @param {File} file - CSV file to parse
     * @returns {Promise<Object>} Parsed data with headers and rows
     */
    async parse(file) {
        Logger.info('CSV', `Parsing file: ${file.name} (${Utils.formatFileSize(file.size)})`);

        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false,
                encoding: 'UTF-8',
                complete: (results) => {
                    try {
                        const data = this.processResults(results, file.name);
                        this.parsedData = data;
                        Logger.success('CSV', `Parsed ${data.rowCount} rows, ${data.headers.length} columns`, {
                            headers: data.headers,
                            sample: data.rows.slice(0, 3)
                        });
                        resolve(data);
                    } catch (error) {
                        Logger.error('CSV', 'Failed to process parse results', error);
                        reject(error);
                    }
                },
                error: (error) => {
                    Logger.error('CSV', 'Parse error', error);
                    reject(error);
                }
            });
        });
    },

    /**
     * Process PapaParse results
     */
    processResults(results, fileName) {
        if (!results.data || results.data.length === 0) {
            throw new Error('CSV file is empty');
        }

        const headers = results.meta.fields || Object.keys(results.data[0] || {});

        if (headers.length === 0) {
            throw new Error('No columns found in CSV');
        }

        // Filter out completely empty rows
        const rows = results.data.filter(row => {
            return Object.values(row).some(value => value !== null && value !== '');
        });

        if (rows.length === 0) {
            throw new Error('No valid data rows found');
        }

        const data = {
            fileName,
            headers,
            rows,
            rowCount: rows.length,
            columnCount: headers.length,
            errors: results.errors
        };

        if (results.errors.length > 0) {
            Logger.warning('CSV', `${results.errors.length} parse warnings`, results.errors.slice(0, 5));
        }

        return data;
    },

    /**
     * Get preview of data (first N rows)
     */
    getPreview(maxRows = 10) {
        if (!this.parsedData) {
            return null;
        }

        return {
            headers: this.parsedData.headers,
            rows: this.parsedData.rows.slice(0, maxRows),
            totalRows: this.parsedData.rowCount
        };
    },

    /**
     * Get column values for a specific column
     */
    getColumnValues(columnName) {
        if (!this.parsedData) {
            return [];
        }

        return this.parsedData.rows.map(row => row[columnName] || '').filter(val => val.trim() !== '');
    },

    /**
     * Clear parsed data
     */
    clear() {
        this.parsedData = null;
        Logger.info('CSV', 'Parser cleared');
    }
};

// Tests
if (typeof TestRunner !== 'undefined') {
    // Run tests when page loads (only if test data available)
    window.addEventListener('load', () => {
        // Test CSV parsing with mock data
        const testCSV = `name,occupation,birth_year
Albert Einstein,Physicist,1879
Marie Curie,Chemist,1867
Isaac Newton,Mathematician,1643`;

        const blob = new Blob([testCSV], { type: 'text/csv' });
        const file = new File([blob], 'test.csv', { type: 'text/csv' });

        TestRunner.runTests('CSVParser', {
            'Parse valid CSV': async () => {
                const data = await CSVParser.parse(file);
                TestRunner.assertNotNull(data, 'Data should not be null');
                TestRunner.assertEqual(data.rowCount, 3, 'Should have 3 rows');
                TestRunner.assertEqual(data.columnCount, 3, 'Should have 3 columns');
                TestRunner.assertTrue(data.headers.includes('name'), 'Should have "name" column');
            },
            'Get preview': () => {
                const preview = CSVParser.getPreview(2);
                TestRunner.assertNotNull(preview, 'Preview should not be null');
                TestRunner.assertEqual(preview.rows.length, 2, 'Preview should have 2 rows');
            },
            'Get column values': () => {
                const names = CSVParser.getColumnValues('name');
                TestRunner.assertEqual(names.length, 3, 'Should have 3 names');
                TestRunner.assertTrue(names.includes('Albert Einstein'), 'Should include Einstein');
            }
        });
    });
}

window.CSVParser = CSVParser;
Logger.success('CSV', 'CSV Parser module loaded');

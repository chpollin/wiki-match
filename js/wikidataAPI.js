// Wikidata Reconciliation API Service
const WikidataAPI = {
    baseURL: 'https://wikidata.reconci.link/en/api',
    requestQueue: [],
    isProcessing: false,
    rateLimit: { requestsPerMinute: 50, delayMs: 1200 }, // Conservative rate limiting
    cache: new Map(),

    /**
     * Reconcile a single query
     * @param {string} query - Text to search for
     * @param {Object} options - Reconciliation options
     * @returns {Promise<Array>} Array of candidates
     */
    async reconcile(query, options = {}) {
        if (!query || query.trim() === '') {
            return [];
        }

        const cacheKey = this.getCacheKey(query, options);
        if (this.cache.has(cacheKey)) {
            Logger.info('WIKIDATA', `Cache hit: ${Utils.truncate(query)}`);
            return this.cache.get(cacheKey);
        }

        Logger.info('WIKIDATA', `Querying: ${Utils.truncate(query)}`);

        try {
            const payload = this.buildPayload(query, options);

            // Log the payload for debugging
            if (options.types && options.types.length > 0) {
                Logger.info('WIKIDATA', `With type filter: ${options.types.join(', ')}`);
            }

            // Wikidata Reconciliation API expects form-encoded data with 'queries' parameter
            const formData = new URLSearchParams();
            formData.append('queries', JSON.stringify(payload.queries));

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            if (!response.ok) {
                const errorText = await response.text();
                Logger.warning('WIKIDATA', `API returned ${response.status}`, errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Log raw response for debugging
            if (data.q0) {
                if (data.q0.result) {
                    Logger.info('WIKIDATA', `Raw API returned ${data.q0.result.length} results`);
                } else {
                    Logger.warning('WIKIDATA', 'API response missing result field', data.q0);
                }
            } else {
                Logger.warning('WIKIDATA', 'Unexpected API response format', data);
            }

            const candidates = this.parseResults(data, query);

            this.cache.set(cacheKey, candidates);
            Logger.success('WIKIDATA', `Found ${candidates.length} candidates for "${Utils.truncate(query)}"`);

            return candidates;
        } catch (error) {
            Logger.error('WIKIDATA', `Query failed for "${Utils.truncate(query)}"`, error);
            throw error;
        }
    },

    /**
     * Reconcile multiple queries in batch with rate limiting
     * @param {Array} queries - Array of {id, query, options}
     * @param {Function} progressCallback - Called with progress updates
     * @returns {Promise<Map>} Map of id -> candidates
     */
    async reconcileBatch(queries, progressCallback = null) {
        Logger.info('WIKIDATA', `Starting batch reconciliation: ${queries.length} items`);

        const results = new Map();
        const total = queries.length;

        for (let i = 0; i < queries.length; i++) {
            const { id, query, options } = queries[i];

            try {
                const candidates = await this.reconcile(query, options);
                results.set(id, candidates);

                if (progressCallback) {
                    progressCallback({
                        current: i + 1,
                        total,
                        percentage: ((i + 1) / total * 100).toFixed(1),
                        query
                    });
                }

                // Rate limiting delay
                if (i < queries.length - 1) {
                    await Utils.sleep(this.rateLimit.delayMs);
                }

            } catch (error) {
                Logger.error('WIKIDATA', `Failed to reconcile "${Utils.truncate(query)}"`, error);
                results.set(id, []); // Empty results for failed queries
            }
        }

        Logger.success('WIKIDATA', `Batch complete: ${results.size}/${total} processed`);
        return results;
    },

    /**
     * Build reconciliation payload
     */
    buildPayload(query, options = {}) {
        const payload = {
            queries: {
                q0: {
                    query: query,
                    limit: options.limit || 5
                }
            }
        };

        // Add type filter if specified
        // Note: Type filter format for Wikidata reconciliation API
        if (options.types && options.types.length > 0) {
            payload.queries.q0.type = options.types[0]; // API accepts single type as string
            // Alternative: Try without type filter if it fails
        }

        return payload;
    },

    /**
     * Parse API response
     */
    parseResults(data, originalQuery) {
        if (!data.q0 || !data.q0.result) {
            return [];
        }

        return data.q0.result.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || 'No description available',
            score: Math.round(item.score),
            match: item.match || false,
            url: `https://www.wikidata.org/wiki/${item.id}`,
            types: item.type || [],
            originalQuery
        })).sort((a, b) => b.score - a.score); // Sort by score descending
    },

    /**
     * Generate cache key
     */
    getCacheKey(query, options) {
        const types = options.types ? options.types.sort().join(',') : '';
        return `${query.toLowerCase().trim()}|${types}`;
    },

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        Logger.info('WIKIDATA', 'Cache cleared');
    },

    /**
     * Get confidence level from score
     */
    getConfidenceLevel(score) {
        if (score >= 95) return 'high';
        if (score >= 80) return 'medium';
        if (score >= 60) return 'low';
        return 'very-low';
    },

    /**
     * Get confidence color class
     */
    getConfidenceColor(score) {
        if (score >= 95) return 'confidence-high';
        if (score >= 60) return 'confidence-medium';
        return 'confidence-low';
    }
};

// Tests
if (typeof TestRunner !== 'undefined') {
    window.addEventListener('load', async () => {
        await Utils.sleep(100); // Wait for CSV tests to complete

        TestRunner.runTests('WikidataAPI', {
            'Build payload': () => {
                const payload = WikidataAPI.buildPayload('Einstein', { types: ['Q5'] });
                TestRunner.assertNotNull(payload.queries, 'Should have queries');
                TestRunner.assertEqual(payload.queries.q0.query, 'Einstein', 'Should set query');
            },
            'Cache key generation': () => {
                const key1 = WikidataAPI.getCacheKey('Einstein', { types: ['Q5'] });
                const key2 = WikidataAPI.getCacheKey('einstein', { types: ['Q5'] });
                TestRunner.assertEqual(key1, key2, 'Cache keys should be case-insensitive');
            },
            'Confidence levels': () => {
                TestRunner.assertEqual(WikidataAPI.getConfidenceLevel(98), 'high', 'Score 98 = high');
                TestRunner.assertEqual(WikidataAPI.getConfidenceLevel(85), 'medium', 'Score 85 = medium');
                TestRunner.assertEqual(WikidataAPI.getConfidenceLevel(70), 'low', 'Score 70 = low');
                TestRunner.assertEqual(WikidataAPI.getConfidenceLevel(40), 'very-low', 'Score 40 = very-low');
            },
            'Parse results with empty data': () => {
                const result = WikidataAPI.parseResults({ q0: { result: [] } }, 'test');
                TestRunner.assertEqual(result.length, 0, 'Should return empty array');
            }
        });
    });
}

window.WikidataAPI = WikidataAPI;
Logger.success('WIKIDATA', 'Wikidata API module loaded');

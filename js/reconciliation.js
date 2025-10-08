// Reconciliation Component
const Reconciliation = {
    items: [],
    stats: { matched: 0, review: 0, noMatch: 0, pending: 0 },

    init() {
        Logger.success('RECONCILE', 'Reconciliation component initialized');
    },

    async start(data, config) {
        Logger.info('RECONCILE', `Starting reconciliation for ${data.rowCount} rows`);

        // Build reconciliation items
        this.items = data.rows.map((row, index) => ({
            id: `row_${index}`,
            rowIndex: index,
            originalValue: row[config.primaryColumn],
            row: row,
            candidates: [],
            selectedCandidate: null,
            status: 'pending' // pending, matched, review, no-match
        }));

        this.stats = {
            matched: 0,
            review: 0,
            noMatch: 0,
            pending: this.items.length
        };

        this.updateStats();
        this.renderTable();

        // Start batch reconciliation
        const queries = this.items.map(item => ({
            id: item.id,
            query: item.originalValue,
            options: {
                types: config.entityTypes,
                limit: 5
            }
        }));

        try {
            const results = await WikidataAPI.reconcileBatch(queries, (progress) => {
                this.updateProgress(progress);
            });

            // Process results
            this.processResults(results);
            Logger.success('RECONCILE', 'Reconciliation complete');

        } catch (error) {
            Logger.error('RECONCILE', 'Reconciliation failed', error);
            Utils.showError('Reconciliation failed. Please try again.');
        }
    },

    processResults(results) {
        this.items.forEach(item => {
            const candidates = results.get(item.id) || [];
            item.candidates = candidates;

            if (candidates.length === 0) {
                item.status = 'no-match';
                this.stats.noMatch++;
            } else if (candidates.length === 1 && candidates[0].score >= 95 && candidates[0].match) {
                // Auto-match high confidence
                item.status = 'matched';
                item.selectedCandidate = candidates[0];
                this.stats.matched++;
            } else {
                item.status = 'review';
                this.stats.review++;
            }

            this.stats.pending--;
        });

        this.updateStats();
        this.renderTable();
        this.showExportButton();
    },

    renderTable() {
        const container = document.getElementById('reconciliationTable');
        container.innerHTML = '';

        this.items.forEach(item => {
            const rowEl = this.createRowElement(item);
            container.appendChild(rowEl);
        });

        Logger.info('RECONCILE', `Rendered ${this.items.length} rows`);
    },

    createRowElement(item) {
        const div = document.createElement('div');
        div.className = `border rounded-lg p-4 ${this.getRowClass(item.status)}`;
        div.dataset.itemId = item.id;

        const statusBadge = this.getStatusBadge(item.status);

        div.innerHTML = `
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-medium text-gray-500">#${item.rowIndex + 1}</span>
                        ${statusBadge}
                    </div>
                    <p class="text-base font-medium text-gray-900">${this.escapeHtml(item.originalValue)}</p>
                </div>
            </div>
            <div class="candidates-container" id="candidates_${item.id}">
                ${this.renderCandidates(item)}
            </div>
        `;

        return div;
    },

    renderCandidates(item) {
        if (item.status === 'pending') {
            return '<p class="text-sm text-gray-500">Searching...</p>';
        }

        if (item.candidates.length === 0) {
            return `
                <div class="text-sm text-gray-500">
                    <p>No matches found. Try:</p>
                    <ul class="list-disc ml-5 mt-2 text-xs">
                        <li>Check spelling</li>
                        <li>Remove entity type filters</li>
                        <li>Search manually on <a href="https://www.wikidata.org" target="_blank" class="text-primary underline">Wikidata.org</a></li>
                    </ul>
                </div>
            `;
        }

        return item.candidates.map((candidate, idx) => {
            const isSelected = item.selectedCandidate?.id === candidate.id;
            return `
                <div class="candidate-card border rounded-lg p-3 mb-2 ${isSelected ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-medium text-gray-900">${this.escapeHtml(candidate.name)}</span>
                                <a href="${candidate.url}" target="_blank" class="text-primary text-xs hover:underline">
                                    ${candidate.id} ↗
                                </a>
                            </div>
                            <p class="text-sm text-gray-600">${this.escapeHtml(candidate.description)}</p>
                        </div>
                    </div>
                    <div class="mb-2">
                        <div class="flex items-center justify-between text-xs mb-1">
                            <span class="text-gray-600">Confidence</span>
                            <span class="font-semibold">${candidate.score}%</span>
                        </div>
                        <div class="confidence-bar bg-gray-200">
                            <div class="${WikidataAPI.getConfidenceColor(candidate.score)} confidence-fill" style="width: ${candidate.score}%"></div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        ${!isSelected ? `
                            <button onclick="Reconciliation.selectCandidate('${item.id}', ${idx})"
                                class="px-3 py-1 bg-success text-white text-sm rounded hover:bg-green-700 transition">
                                ✓ Select
                            </button>
                        ` : `
                            <span class="px-3 py-1 bg-green-600 text-white text-sm rounded">✓ Selected</span>
                            <button onclick="Reconciliation.unselectCandidate('${item.id}')"
                                class="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition">
                                Unselect
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    },

    selectCandidate(itemId, candidateIndex) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        item.selectedCandidate = item.candidates[candidateIndex];
        item.status = 'matched';

        // Update stats
        if (item.status === 'review') this.stats.review--;
        else if (item.status === 'no-match') this.stats.noMatch--;
        this.stats.matched++;

        this.updateStats();
        this.rerenderRow(item);

        Logger.info('RECONCILE', `Selected: ${item.originalValue} → ${item.selectedCandidate.name} (${item.selectedCandidate.id})`);
    },

    unselectCandidate(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        item.selectedCandidate = null;
        item.status = 'review';

        this.stats.matched--;
        this.stats.review++;

        this.updateStats();
        this.rerenderRow(item);

        Logger.info('RECONCILE', `Unselected: ${item.originalValue}`);
    },

    rerenderRow(item) {
        const container = document.querySelector(`[data-item-id="${item.id}"]`);
        if (container) {
            const newRow = this.createRowElement(item);
            container.replaceWith(newRow);
        }
    },

    updateProgress(progress) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressFill.style.width = `${progress.percentage}%`;
        progressText.textContent = `Processing ${progress.current} of ${progress.total} (${progress.percentage}%)`;
    },

    updateStats() {
        document.getElementById('matchedCount').textContent = this.stats.matched;
        document.getElementById('reviewCount').textContent = this.stats.review;
        document.getElementById('noMatchCount').textContent = this.stats.noMatch;
        document.getElementById('pendingCount').textContent = this.stats.pending;
    },

    showExportButton() {
        document.getElementById('proceedToExport').classList.remove('hidden');
    },

    getRowClass(status) {
        const classes = {
            pending: 'bg-white',
            matched: 'bg-green-50 border-l-4 border-green-500',
            review: 'bg-yellow-50 border-l-4 border-yellow-500',
            'no-match': 'bg-red-50 border-l-4 border-red-500'
        };
        return classes[status] || 'bg-white';
    },

    getStatusBadge(status) {
        const badges = {
            pending: '<span class="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">Pending</span>',
            matched: '<span class="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded">✓ Matched</span>',
            review: '<span class="text-xs px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded">⚠ Review</span>',
            'no-match': '<span class="text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded">✗ No Match</span>'
        };
        return badges[status] || '';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    getResults() {
        return {
            items: this.items,
            stats: this.stats
        };
    }
};

window.Reconciliation = Reconciliation;
Logger.success('RECONCILE', 'Reconciliation module loaded');

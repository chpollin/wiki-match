// Column Configuration Component
const ColumnConfig = {
    config: {
        primaryColumn: null,
        entityTypes: [],
        language: 'en'
    },

    init() {
        const primaryColumnSelect = document.getElementById('primaryColumn');
        const entityTypeCheckboxes = document.querySelectorAll('input[name="entityType"]');
        const languageSelect = document.getElementById('language');
        const startBtn = document.getElementById('startReconciliation');

        // Primary column selection
        primaryColumnSelect.addEventListener('change', (e) => {
            this.config.primaryColumn = e.target.value;
            Logger.info('CONFIG', `Primary column selected: ${e.target.value}`);

            // Update entity type checkboxes for TEI
            if (this.config.isTEI) {
                this.updateEntityTypeCheckboxes(e.target.value);
            }
        });

        // Entity type filters
        entityTypeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.config.entityTypes = Array.from(entityTypeCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);
                Logger.info('CONFIG', `Entity types: ${this.config.entityTypes.join(', ') || 'none'}`);
            });
        });

        // Language selection
        languageSelect.addEventListener('change', (e) => {
            this.config.language = e.target.value;
            Logger.info('CONFIG', `Language: ${e.target.value}`);
        });

        // Start reconciliation
        startBtn.addEventListener('click', () => {
            if (this.validate()) {
                if (window.App && window.App.onReconciliationStart) {
                    window.App.onReconciliationStart(this.config);
                }
            }
        });

        Logger.success('CONFIG', 'Column config component initialized');
    },

    populateColumns(headers) {
        const select = document.getElementById('primaryColumn');
        select.innerHTML = '<option value="">Select a column...</option>';

        headers.forEach(header => {
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            select.appendChild(option);
        });

        this.config.isTEI = false;
        Logger.info('CONFIG', `Populated ${headers.length} columns`);
    },

    populateTEIEntities(entities) {
        const select = document.getElementById('primaryColumn');
        select.innerHTML = '<option value="">Select entity type...</option>';

        const entityOptions = [];
        let totalCount = 0;

        if (entities.persons.length > 0) {
            entityOptions.push({ value: 'person', label: `Persons (${entities.persons.length})` });
            totalCount += entities.persons.length;
        }
        if (entities.places.length > 0) {
            entityOptions.push({ value: 'place', label: `Places (${entities.places.length})` });
            totalCount += entities.places.length;
        }
        if (entities.orgs.length > 0) {
            entityOptions.push({ value: 'org', label: `Organizations (${entities.orgs.length})` });
            totalCount += entities.orgs.length;
        }
        if (entities.concepts && entities.concepts.length > 0) {
            entityOptions.push({ value: 'concept', label: `Concepts (${entities.concepts.length})` });
            totalCount += entities.concepts.length;
        }

        // Add "All" option if multiple types exist
        if (entityOptions.length > 1) {
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = `All entity types (${totalCount})`;
            select.appendChild(allOption);
        }

        entityOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            select.appendChild(option);
        });

        // Auto-select if only one type
        if (entityOptions.length === 1) {
            select.value = entityOptions[0].value;
            this.config.primaryColumn = entityOptions[0].value;
            this.config.entityTypeFilter = entityOptions[0].value;
        }

        this.config.isTEI = true;
        Logger.info('CONFIG', `Populated TEI entities: ${entityOptions.length} types`);
    },

    updateEntityTypeCheckboxes(selectedEntityType) {
        const checkboxes = document.querySelectorAll('input[name="entityType"]');

        // Mapping from TEI entity types to Wikidata type IDs
        const typeMapping = {
            'person': 'Q5',
            'place': 'Q618123',
            'org': 'Q43229',
            'concept': null, // Concepts don't have a single type filter
            'all': 'all'
        };

        const wikidataType = typeMapping[selectedEntityType];

        if (wikidataType === 'all') {
            // Check all checkboxes
            checkboxes.forEach(cb => cb.checked = true);
            this.config.entityTypes = Array.from(checkboxes).map(cb => cb.value);
        } else if (wikidataType) {
            // Check only the matching checkbox
            checkboxes.forEach(cb => {
                cb.checked = (cb.value === wikidataType);
            });
            this.config.entityTypes = [wikidataType];
        } else {
            // For concepts or unknown, uncheck all (no specific filter)
            checkboxes.forEach(cb => cb.checked = false);
            this.config.entityTypes = [];
        }

        Logger.info('CONFIG', `Updated entity type checkboxes for: ${selectedEntityType}`);
    },

    validate() {
        if (!this.config.primaryColumn && !this.config.isTEI) {
            Utils.showError('Please select a column to match');
            return false;
        }

        if (this.config.isTEI && !this.config.primaryColumn) {
            Utils.showError('Please select an entity type');
            return false;
        }

        if (this.config.isTEI) {
            // Store entity type filter for TEI
            this.config.entityTypeFilter = this.config.primaryColumn;
        }

        Logger.success('CONFIG', 'Configuration validated', this.config);
        return true;
    },

    getConfig() {
        return { ...this.config };
    },

    reset() {
        this.config = {
            primaryColumn: null,
            entityTypes: [],
            language: 'en'
        };

        document.getElementById('primaryColumn').value = '';
        document.querySelectorAll('input[name="entityType"]').forEach(cb => cb.checked = false);
        document.getElementById('language').value = 'en';

        Logger.info('CONFIG', 'Configuration reset');
    }
};

window.ColumnConfig = ColumnConfig;
Logger.success('CONFIG', 'Column config module loaded');

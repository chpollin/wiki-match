// Main Application Controller
const App = {
    currentStep: 1,
    parsedData: null,
    config: null,

    init() {
        Logger.info('APP', 'Initializing WikiMatch application');

        // Initialize all components
        FileUpload.init();
        ColumnConfig.init();
        Reconciliation.init();
        ExportService.init();

        // Setup navigation
        this.setupNavigation();

        // Show initial step
        this.showStep(1);

        Logger.success('APP', 'Application initialized successfully');
    },

    setupNavigation() {
        // Step navigation buttons
        document.getElementById('nextToConfig').addEventListener('click', () => {
            this.showStep(2);
        });

        document.getElementById('backToUpload').addEventListener('click', () => {
            this.showStep(1);
        });

        document.getElementById('backToConfig').addEventListener('click', () => {
            this.showStep(2);
        });

        document.getElementById('proceedToExport').addEventListener('click', () => {
            this.showStep(4);
        });

        document.getElementById('backToReconcile').addEventListener('click', () => {
            this.showStep(3);
        });

        Logger.info('APP', 'Navigation setup complete');
    },

    showStep(step) {
        Logger.info('APP', `Navigating to step ${step}`);

        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });

        // Update step indicator
        document.querySelectorAll('.step-item').forEach((item, index) => {
            const stepNum = index + 1;
            const circle = item.querySelector('div div');
            const text = item.querySelector('span');

            if (!circle || !text) return; // Safety check

            if (stepNum < step) {
                // Completed step
                circle.className = 'w-10 h-10 rounded-full bg-success text-white flex items-center justify-center font-semibold mb-2';
                circle.innerHTML = '✓';
                text.className = 'text-sm font-medium text-gray-900';
            } else if (stepNum === step) {
                // Active step
                circle.className = 'w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold mb-2';
                circle.textContent = stepNum;
                text.className = 'text-sm font-medium text-gray-900';
            } else {
                // Pending step
                circle.className = 'w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold mb-2';
                circle.textContent = stepNum;
                text.className = 'text-sm font-medium text-gray-500';
            }
        });

        // Show current section
        const sections = {
            1: 'uploadSection',
            2: 'configSection',
            3: 'reconcileSection',
            4: 'exportSection'
        };

        const sectionId = sections[step];
        if (sectionId) {
            document.getElementById(sectionId).classList.remove('hidden');
        }

        this.currentStep = step;
    },

    // Callbacks from components
    onFileUploaded(data) {
        Logger.info('APP', 'File uploaded callback', { rows: data.rowCount, columns: data.columnCount });

        this.parsedData = data;
        this.isTEI = false;

        // Prepare configuration step
        ColumnConfig.populateColumns(data.headers);
    },

    onTEIUploaded(entities) {
        Logger.info('APP', 'TEI uploaded callback', {
            persons: entities.persons.length,
            places: entities.places.length,
            orgs: entities.orgs.length
        });

        this.teiEntities = entities;
        this.isTEI = true;

        // Prepare configuration step for TEI
        ColumnConfig.populateTEIEntities(entities);
    },

    async onReconciliationStart(config) {
        Logger.info('APP', 'Reconciliation start callback', config);

        this.config = config;
        this.showStep(3);

        // Convert TEI entities to reconciliation format if needed
        let dataToReconcile = this.parsedData;

        if (this.isTEI && this.teiEntities) {
            // Convert TEI entities to CSV-like format
            dataToReconcile = TEIParser.entitiesToReconciliationFormat(
                this.teiEntities,
                config.entityTypeFilter
            );
        }

        // Start reconciliation with slight delay for UI update
        setTimeout(async () => {
            await Reconciliation.start(dataToReconcile, config);

            // Update export summary
            const results = Reconciliation.getResults();
            ExportService.updateExportSummary(results.stats);
        }, 100);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}

window.App = App;

Logger.success('APP', '🚀 WikiMatch ready!');
console.log('%c🎯 WikiMatch - Wikidata Reconciliation Tool', 'color: #2563EB; font-size: 16px; font-weight: bold;');
console.log('%cOpen console to see detailed logging', 'color: #6B7280; font-size: 12px;');

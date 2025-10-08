// File Upload Component
const FileUpload = {
    currentFile: null,

    init() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const removeFileBtn = document.getElementById('removeFile');

        // Click to browse
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        // File selected via input
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragging');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragging');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragging');

            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // Remove file
        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearFile();
        });

        Logger.success('UPLOAD', 'File upload component initialized');
    },

    async handleFile(file) {
        Logger.info('UPLOAD', `File selected: ${file.name}`);

        // Detect file type
        const isTEI = file.name.toLowerCase().endsWith('.xml');

        if (isTEI) {
            await this.handleTEIFile(file);
        } else {
            await this.handleCSVFile(file);
        }
    },

    async handleCSVFile(file) {
        // Validate file
        const validation = Utils.validateCSVFile(file);
        if (!validation.valid) {
            Utils.showError(validation.error);
            return;
        }

        Utils.showLoading('Parsing CSV file...');

        try {
            // Parse CSV
            const data = await CSVParser.parse(file);

            this.currentFile = file;
            this.showFileInfo(file, data);

            // Notify app
            if (window.App && window.App.onFileUploaded) {
                window.App.onFileUploaded(data);
            }

            Logger.success('UPLOAD', 'File processed successfully');
        } catch (error) {
            Utils.showError(`Failed to parse CSV: ${error.message}`);
            Logger.error('UPLOAD', 'File processing failed', error);
        } finally {
            Utils.hideLoading();
        }
    },

    async handleTEIFile(file) {
        Utils.showLoading('Parsing TEI XML file...');

        try {
            // Parse TEI
            const entities = await TEIParser.parse(file);

            this.currentFile = file;
            this.showTEIInfo(file, entities);

            // Notify app
            if (window.App && window.App.onTEIUploaded) {
                window.App.onTEIUploaded(entities);
            }

            Logger.success('UPLOAD', 'TEI file processed successfully');
        } catch (error) {
            Utils.showError(`Failed to parse TEI XML: ${error.message}`);
            Logger.error('UPLOAD', 'TEI processing failed', error);
        } finally {
            Utils.hideLoading();
        }
    },

    showFileInfo(file, data) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileStats = document.getElementById('fileStats');
        const nextBtn = document.getElementById('nextToConfig');

        fileName.textContent = file.name;
        fileStats.textContent = `${data.rowCount.toLocaleString()} rows · ${data.columnCount} columns · ${Utils.formatFileSize(file.size)}`;

        fileInfo.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    },

    showTEIInfo(file, entities) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileStats = document.getElementById('fileStats');
        const nextBtn = document.getElementById('nextToConfig');

        fileName.textContent = file.name;

        const parts = [];
        if (entities.persons.length > 0) parts.push(`${entities.persons.length} persons`);
        if (entities.places.length > 0) parts.push(`${entities.places.length} places`);
        if (entities.orgs.length > 0) parts.push(`${entities.orgs.length} organizations`);
        if (entities.concepts && entities.concepts.length > 0) parts.push(`${entities.concepts.length} concepts`);

        fileStats.textContent = `TEI XML · ${parts.join(', ')} · ${Utils.formatFileSize(file.size)}`;

        fileInfo.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    },

    clearFile() {
        this.currentFile = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfo').classList.add('hidden');
        document.getElementById('nextToConfig').classList.add('hidden');

        CSVParser.clear();
        TEIParser.clear();

        Logger.info('UPLOAD', 'File cleared');
    }
};

window.FileUpload = FileUpload;
Logger.success('UPLOAD', 'File upload module loaded');

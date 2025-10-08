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

    clearFile() {
        this.currentFile = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfo').classList.add('hidden');
        document.getElementById('nextToConfig').classList.add('hidden');

        CSVParser.clear();

        Logger.info('UPLOAD', 'File cleared');
    }
};

window.FileUpload = FileUpload;
Logger.success('UPLOAD', 'File upload module loaded');

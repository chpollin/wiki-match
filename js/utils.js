// Compact logging and testing utility
const Logger = {
    prefix: '🔧',
    colors: {
        info: '#2563EB',
        success: '#16A34A',
        warning: '#EA580C',
        error: '#DC2626',
        test: '#8B5CF6'
    },

    log(level, module, message, data = null) {
        const color = this.colors[level] || this.colors.info;
        const timestamp = new Date().toLocaleTimeString();

        console.log(
            `%c${this.prefix} [${timestamp}] [${module}]%c ${message}`,
            `color: ${color}; font-weight: bold`,
            'color: inherit'
        );

        if (data) {
            console.log(data);
        }
    },

    info(module, message, data) {
        this.log('info', module, message, data);
    },

    success(module, message, data) {
        this.log('success', module, `✓ ${message}`, data);
    },

    warning(module, message, data) {
        this.log('warning', module, `⚠ ${message}`, data);
    },

    error(module, message, error) {
        this.log('error', module, `✗ ${message}`, error);
        if (error?.stack) {
            console.error(error.stack);
        }
    },

    test(module, testName, passed, details) {
        const icon = passed ? '✓' : '✗';
        const color = passed ? this.colors.success : this.colors.error;
        console.log(
            `%c${icon} TEST [${module}]: ${testName}`,
            `color: ${color}; font-weight: bold`
        );
        if (details) {
            console.log(details);
        }
    }
};

// Simple test runner
const TestRunner = {
    results: { passed: 0, failed: 0 },

    assert(condition, message) {
        if (condition) {
            this.results.passed++;
            return true;
        } else {
            this.results.failed++;
            console.error(`Assertion failed: ${message}`);
            return false;
        }
    },

    assertEqual(actual, expected, message) {
        const passed = actual === expected;
        if (!passed) {
            console.error(`Expected: ${expected}, Got: ${actual}`);
        }
        Logger.test('TEST', message, passed, passed ? null : { actual, expected });
        return this.assert(passed, message);
    },

    assertNotNull(value, message) {
        const passed = value !== null && value !== undefined;
        Logger.test('TEST', message, passed);
        return this.assert(passed, message);
    },

    assertTrue(value, message) {
        Logger.test('TEST', message, !!value);
        return this.assert(!!value, message);
    },

    async runTests(moduleName, tests) {
        console.group(`%c🧪 Testing ${moduleName}`, 'color: #8B5CF6; font-weight: bold; font-size: 14px');
        this.results = { passed: 0, failed: 0 };

        for (const [name, testFn] of Object.entries(tests)) {
            try {
                await testFn();
            } catch (error) {
                Logger.error('TEST', `Test "${name}" threw error`, error);
                this.results.failed++;
            }
        }

        const total = this.results.passed + this.results.failed;
        const rate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;

        console.log(
            `%c📊 Results: ${this.results.passed}/${total} passed (${rate}%)`,
            `color: ${this.results.failed === 0 ? '#16A34A' : '#EA580C'}; font-weight: bold`
        );
        console.groupEnd();

        return this.results;
    }
};

// Helper utilities
const Utils = {
    // Sleep for async operations
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Generate unique ID
    generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Truncate string
    truncate(str, length = 50) {
        return str.length > length ? str.substring(0, length) + '...' : str;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show/hide loading overlay
    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = document.getElementById('loadingText');
        if (overlay && text) {
            text.textContent = message;
            overlay.classList.remove('hidden');
        }
        Logger.info('UI', `Loading: ${message}`);
    },

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        Logger.info('UI', 'Loading hidden');
    },

    // Show error toast (simple implementation)
    showError(message) {
        alert(`Error: ${message}`);
        Logger.error('UI', message);
    },

    // Validate CSV file
    validateCSVFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const validTypes = ['text/csv', 'text/tab-separated-values', 'text/plain', 'application/vnd.ms-excel'];
        const validExtensions = ['.csv', '.tsv', '.txt'];

        if (!file) {
            return { valid: false, error: 'No file provided' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: 'File too large (max 10MB)' };
        }

        const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        if (!hasValidExtension && !validTypes.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Please upload CSV or TSV.' };
        }

        return { valid: true };
    }
};

// Export for use in other modules
window.Logger = Logger;
window.TestRunner = TestRunner;
window.Utils = Utils;

Logger.success('UTILS', 'Utilities module loaded');

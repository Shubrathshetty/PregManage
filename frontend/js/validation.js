/**
 * PregManage - Input Validation Utilities
 * Centralizes all regex validation patterns for Indian data formats.
 */

const Validators = {
    patterns: {
        phone:   /^[6-9]\d{9}$/,
        aadhaar: /^[2-9]\d{11}$/,
        pincode: /^[1-9]\d{5}$/,
        email:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    messages: {
        phone:   'Phone must be 10 digits starting with 6-9',
        aadhaar: 'Aadhaar must be 12 digits, cannot start with 0 or 1',
        pincode: 'Pincode must be 6 digits, cannot start with 0',
        email:   'Please enter a valid email address'
    },

    /**
     * Validate a value against a named pattern.
     * @param {string} value - The value to validate
     * @param {string} type  - One of 'phone', 'aadhaar', 'pincode', 'email'
     * @returns {{valid: boolean, message: string}}
     */
    validate: function(value, type) {
        const pattern = this.patterns[type];
        if (!pattern) return { valid: true, message: '' };

        const clean = (value || '').replace(/\s/g, '');
        const valid = pattern.test(clean);
        return {
            valid,
            message: valid ? '' : (this.messages[type] || 'Invalid input')
        };
    },

    /**
     * Validate file upload constraints.
     * @param {File} file
     * @param {Object} opts - { maxSizeMB: number, allowedTypes: string[] }
     * @returns {{valid: boolean, message: string}}
     */
    validateFile: function(file, opts = {}) {
        const maxSize = (opts.maxSizeMB || 5) * 1024 * 1024;
        const allowedTypes = opts.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];

        if (!file) return { valid: false, message: 'No file selected' };
        if (file.size > maxSize) {
            return { valid: false, message: `File too large. Max ${opts.maxSizeMB || 5}MB allowed.` };
        }
        if (!allowedTypes.includes(file.type)) {
            const exts = allowedTypes.map(t => t.split('/')[1]).join(', ');
            return { valid: false, message: `Invalid file type. Allowed: ${exts}` };
        }
        return { valid: true, message: '' };
    }
};

window.Validators = Validators;

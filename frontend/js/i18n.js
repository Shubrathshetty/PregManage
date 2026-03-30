/**
 * PregManage - Internationalization (i18n)
 * Supports EN and Kannada (KN). Stores preference in localStorage.
 * Updates all elements with [data-i18n] attribute.
 */

const I18n = {
    currentLang: localStorage.getItem('pregmanage-lang') || 'en',

    translations: {
        en: {
            'login':            'Login',
            'logout':           'Logout',
            'dashboard':        'Dashboard',
            'patients':         'Patients',
            'register':         'Register Patient',
            'search':           'Search Patients',
            'questionnaire':    'Questionnaire',
            'full_name':        'Full Name',
            'phone':            'Phone Number',
            'aadhaar':          'Aadhaar Number',
            'address':          'Address',
            'blood_group':      'Blood Group',
            'dob':              'Date of Birth',
            'age':              'Age',
            'husband_name':     "Husband's Name",
            'lmp_date':         'LMP Date',
            'edd':              'Expected Delivery Date',
            'pincode':          'Pincode',
            'submit':           'Submit',
            'cancel':           'Cancel',
            'save':             'Save',
            'delete':           'Delete',
            'edit':             'Edit',
            'loading':          'Loading...',
            'no_data':          'No data available',
            'offline_banner':   'You are offline. Some features may not work.',
            'back_online':      'You are back online!'
        },
        kn: {
            'login':            'ಲಾಗಿನ್',
            'logout':           'ಲಾಗ್ಔಟ್',
            'dashboard':        'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            'patients':         'ರೋಗಿಗಳು',
            'register':         'ರೋಗಿಯನ್ನು ನೋಂದಾಯಿಸಿ',
            'search':           'ರೋಗಿಗಳನ್ನು ಹುಡುಕಿ',
            'questionnaire':    'ಪ್ರಶ್ನಾವಳಿ',
            'full_name':        'ಪೂರ್ಣ ಹೆಸರು',
            'phone':            'ಫೋನ್ ಸಂಖ್ಯೆ',
            'aadhaar':          'ಆಧಾರ್ ಸಂಖ್ಯೆ',
            'address':          'ವಿಳಾಸ',
            'blood_group':      'ರಕ್ತದ ಗುಂಪು',
            'dob':              'ಹುಟ್ಟಿದ ದಿನಾಂಕ',
            'age':              'ವಯಸ್ಸು',
            'husband_name':     'ಗಂಡನ ಹೆಸರು',
            'lmp_date':         'ಕೊನೆಯ ಮುಟ್ಟಿನ ದಿನಾಂಕ',
            'edd':              'ನಿರೀಕ್ಷಿತ ಹೆರಿಗೆ ದಿನಾಂಕ',
            'pincode':          'ಪಿನ್ ಕೋಡ್',
            'submit':           'ಸಲ್ಲಿಸಿ',
            'cancel':           'ರದ್ದುಮಾಡಿ',
            'save':             'ಉಳಿಸಿ',
            'delete':           'ಅಳಿಸಿ',
            'edit':             'ಸಂಪಾದಿಸಿ',
            'loading':          'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
            'no_data':          'ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ',
            'offline_banner':   'ನೀವು ಆಫ್‌ಲೈನ್ ಆಗಿದ್ದೀರಿ. ಕೆಲವು ವೈಶಿಷ್ಟ್ಯಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸದಿರಬಹುದು.',
            'back_online':      'ನೀವು ಮತ್ತೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ!'
        }
    },

    /**
     * Get a translated string.
     */
    t: function(key) {
        const dict = this.translations[this.currentLang] || this.translations['en'];
        return dict[key] || this.translations['en'][key] || key;
    },

    /**
     * Set the active language and update DOM.
     */
    setLanguage: function(lang) {
        this.currentLang = lang;
        localStorage.setItem('pregmanage-lang', lang);
        this.updateDOM();
    },

    /**
     * Toggle between EN and KN.
     */
    toggle: function() {
        this.setLanguage(this.currentLang === 'en' ? 'kn' : 'en');
    },

    /**
     * Update all DOM elements with [data-i18n] attribute.
     */
    updateDOM: function() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = this.t(key);
            } else {
                el.textContent = this.t(key);
            }
        });

        // Update toggle button text
        const toggleBtn = document.getElementById('lang-toggle-btn');
        if (toggleBtn) {
            toggleBtn.textContent = this.currentLang === 'en' ? 'ಕನ್ನಡ' : 'English';
        }
    },

    /**
     * Inject a floating language toggle button into the page.
     */
    injectToggle: function() {
        if (document.getElementById('lang-toggle-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'lang-toggle-btn';
        btn.textContent = this.currentLang === 'en' ? 'ಕನ್ನಡ' : 'English';
        btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9998;background:#4C8BF5;color:#fff;border:none;border-radius:24px;padding:8px 16px;font-size:0.85rem;font-weight:600;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
        btn.addEventListener('click', () => this.toggle());
        document.body.appendChild(btn);
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    I18n.injectToggle();
    I18n.updateDOM();
});

window.I18n = I18n;

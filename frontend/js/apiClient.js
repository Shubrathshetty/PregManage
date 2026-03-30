/**
 * Centralized API Client for PregManage
 * Handles:
 * 1. Bearer Token injection
 * 2. try-catch error handling
 * 3. Toast notifications on failure
 */

const apiClient = {
    /**
     * Shows a toast notification.
     * Expected to exist in the DOM or dynamically created by this script.
     */
    showToast: function(message, type = 'error', duration = 3000) {
        let toast = document.getElementById('global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-toast';
            toast.className = 'toast hidden';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        // Basic styling/classes based on type
        toast.className = `toast toast-${type} show`;
        
        setTimeout(() => {
            toast.className = 'toast hidden';
        }, duration);
    },

    /**
     * Standard fetch wrapper.
     * Injects Authorization: Bearer {token}
     * Wraps in try/catch and displays Error Toast for network errors.
     */
    fetch: async function(url, options = {}) {
        try {
            const token = localStorage.getItem('token');
            const headers = { ...options.headers };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Ensure JSON if body is standard object (optional helper)
            // But we'll just inject headers
            
            const response = await fetch(url, { ...options, headers });
            
            // Check for JWT Expiration explicitly
            if (response.status === 401 || response.status === 403) {
                // If it's a verify route, don't show toast immediately, handling might differ
                if (!url.includes('/api/auth/login')) {
                    this.showToast('Session expired or unauthorized. Please login again.', 'error');
                }
            }
            
            return response;
        } catch (error) {
            console.error('[apiClient] Fetch error:', error);
            this.showToast('Network error or server is unreachable. Please try again.', 'error');
            throw error;
        }
    }
};

window.apiClient = apiClient;

/**
 * Centralized API Client for PregManage
 * Handles:
 * 1. Bearer Token injection on ALL fetch calls
 * 2. try-catch error handling with Toast notifications
 * 3. JWT expiration check before every request
 * 4. Offline detection with banner
 */

const apiClient = {
    _offlineBanner: null,
    _requestQueue: [],

    /**
     * Shows a toast notification (creates element dynamically if missing).
     */
    showToast: function(message, type = 'error', duration = 4000) {
        let toast = document.getElementById('global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-toast';
            toast.className = 'toast hidden';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = `toast toast-${type} show`;
        
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => {
            toast.className = 'toast hidden';
        }, duration);
    },

    /**
     * Decode JWT payload without external library.
     */
    _decodeToken: function(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return payload;
        } catch {
            return null;
        }
    },

    /**
     * Check if the stored JWT is expired.
     * Returns true if expired or invalid.
     */
    isTokenExpired: function() {
        const token = localStorage.getItem('token');
        if (!token) return true;

        const payload = this._decodeToken(token);
        if (!payload || !payload.exp) return false; // If no exp, assume valid

        return payload.exp < (Date.now() / 1000);
    },

    /**
     * Redirect to login page based on stored user role.
     */
    _redirectToLogin: function() {
        localStorage.clear();
        const currentPath = window.location.pathname;
        if (currentPath.includes('admin')) {
            window.location.href = '/admin-login.html';
        } else {
            window.location.href = '/worker-login.html';
        }
    },

    /**
     * Show/hide offline banner.
     */
    _showOfflineBanner: function(show) {
        if (show) {
            if (this._offlineBanner) return;
            const banner = document.createElement('div');
            banner.id = 'offline-banner';
            banner.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:#F59E0B;color:#1e293b;text-align:center;padding:8px 16px;font-size:0.85rem;font-weight:600;z-index:10001;';
            banner.textContent = '⚠️ You are offline. Some features may not work.';
            document.body.appendChild(banner);
            this._offlineBanner = banner;
        } else {
            if (this._offlineBanner) {
                this._offlineBanner.remove();
                this._offlineBanner = null;
            }
            this.showToast('You are back online!', 'success', 2000);
            // Retry queued requests
            this._retryQueue();
        }
    },

    /**
     * Queue a failed request for retry when back online.
     */
    _queueRequest: function(url, options) {
        this._requestQueue.push({ url, options, timestamp: Date.now() });
    },

    /**
     * Retry all queued requests.
     */
    _retryQueue: async function() {
        const queue = [...this._requestQueue];
        this._requestQueue = [];
        for (const req of queue) {
            // Only retry requests from last 5 minutes
            if (Date.now() - req.timestamp < 5 * 60 * 1000) {
                try {
                    await this.fetch(req.url, req.options);
                } catch { /* silently fail on retry */ }
            }
        }
    },

    /**
     * Standard fetch wrapper.
     * Injects Authorization: Bearer {token}
     * Checks JWT expiry before every request.
     * Wraps in try/catch and displays error Toast for network errors.
     */
    fetch: async function(url, options = {}) {
        // Check offline
        if (!navigator.onLine) {
            this._showOfflineBanner(true);
            this._queueRequest(url, options);
            throw new Error('Network offline');
        }

        // Check JWT expiry (skip for login/public routes)
        const isAuthRoute = url.includes('/api/auth/') && (url.includes('/login') || url.includes('/verify'));
        if (!isAuthRoute && this.isTokenExpired()) {
            this.showToast('Session expired. Please login again.', 'warning');
            this._redirectToLogin();
            throw new Error('JWT expired');
        }

        try {
            const token = localStorage.getItem('token');
            const headers = { ...options.headers };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, { ...options, headers });
            
            // Handle 401/403
            if (response.status === 401 || response.status === 403) {
                if (!isAuthRoute) {
                    this.showToast('Session expired or unauthorized. Please login again.', 'error');
                    this._redirectToLogin();
                }
            }
            
            return response;
        } catch (error) {
            if (error.message === 'JWT expired' || error.message === 'Network offline') {
                throw error;
            }
            console.error('[apiClient] Fetch error:', error);
            this.showToast('Network error or server is unreachable.', 'error');
            throw error;
        }
    }
};

// Offline/Online event listeners
window.addEventListener('offline', () => apiClient._showOfflineBanner(true));
window.addEventListener('online', () => apiClient._showOfflineBanner(false));

window.apiClient = apiClient;

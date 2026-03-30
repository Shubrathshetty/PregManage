/**
 * PregManage - UI Utilities
 * Loading states, confirm dialogs, and other shared UI helpers.
 */

const UIUtils = {
    /**
     * Toggle loading state on a button.
     * @param {HTMLElement} btn - The button element
     * @param {boolean} loading - true to show loading, false to restore
     * @param {string} [loadingText] - Text to show while loading (default: 'Loading...')
     */
    setLoading: function(btn, loading, loadingText) {
        if (!btn) return;
        if (loading) {
            btn._originalHTML = btn.innerHTML;
            btn._originalDisabled = btn.disabled;
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner-inline"></span> ${loadingText || 'Loading...'}`;
        } else {
            btn.disabled = btn._originalDisabled || false;
            btn.innerHTML = btn._originalHTML || btn.innerHTML;
        }
    },

    /**
     * Show a confirmation dialog.
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onConfirm - Called when user confirms
     * @param {Function} [onCancel] - Called when user cancels
     */
    confirm: function(title, message, onConfirm, onCancel) {
        // Remove existing dialog if any
        const existing = document.getElementById('ui-confirm-dialog');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ui-confirm-dialog';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;padding:16px;';

        const card = document.createElement('div');
        card.style.cssText = 'background:#fff;border-radius:12px;padding:24px;max-width:360px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:slideUp 0.2s ease-out;';

        card.innerHTML = `
            <h3 style="font-size:1.1rem;margin-bottom:8px;color:#1e293b;">${title}</h3>
            <p style="font-size:0.9rem;color:#64748b;margin-bottom:20px;">${message}</p>
            <div style="display:flex;gap:8px;justify-content:flex-end;">
                <button id="ui-confirm-cancel" style="padding:8px 16px;border:1px solid #e2e8f0;background:#fff;border-radius:8px;cursor:pointer;font-size:0.85rem;color:#64748b;">Cancel</button>
                <button id="ui-confirm-ok" style="padding:8px 16px;border:none;background:#EF4444;color:#fff;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;">Confirm</button>
            </div>
        `;

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        document.getElementById('ui-confirm-ok').onclick = () => {
            overlay.remove();
            if (onConfirm) onConfirm();
        };
        document.getElementById('ui-confirm-cancel').onclick = () => {
            overlay.remove();
            if (onCancel) onCancel();
        };
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        });
    }
};

window.UIUtils = UIUtils;

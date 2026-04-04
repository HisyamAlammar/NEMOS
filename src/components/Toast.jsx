/**
 * components/Toast.jsx — Reusable Toast/Snackbar Notification
 *
 * Sprint 6 [P0-NEW-02/03]: Mandatory feedback for all payment actions.
 *
 * Usage:
 *   import Toast, { useToast } from '../components/Toast';
 *
 *   function MyComponent() {
 *     const { toast, showToast } = useToast();
 *     showToast('Berhasil!', 'success');
 *     return <><Toast {...toast} />{...rest}</>
 *   }
 */
import React, { useState, useCallback, useEffect } from 'react';

// ── Toast Icons ──────────────────────────────────────────────
const ICONS = {
    success: (
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: '#fff', strokeWidth: 2.5 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    error: (
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: '#fff', strokeWidth: 2.5 }}>
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    loading: (
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: '#fff', strokeWidth: 2.5, animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: '#fff', strokeWidth: 2.5 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
};

const COLORS = {
    success: 'linear-gradient(135deg, #00C853, #00A040)',
    error: 'linear-gradient(135deg, #F44336, #D32F2F)',
    loading: 'linear-gradient(135deg, #1E3A5F, #2C5282)',
    info: 'linear-gradient(135deg, #2196F3, #1976D2)',
};

// ── Toast Component ──────────────────────────────────────────
export default function Toast({ visible, message, type = 'info', onClose }) {
    useEffect(() => {
        if (visible && type !== 'loading') {
            const timer = setTimeout(() => onClose?.(), 4000);
            return () => clearTimeout(timer);
        }
    }, [visible, type, onClose]);

    if (!visible) return null;

    return (
        <>
            <style>{`
                @keyframes toastSlideIn {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes toastSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(120%); opacity: 0; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div style={{
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                background: COLORS[type] || COLORS.info,
                color: '#fff',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                fontSize: 14,
                fontWeight: 600,
                animation: 'toastSlideIn 0.35s ease',
                maxWidth: 400,
                lineHeight: 1.4,
            }}>
                {ICONS[type]}
                <span>{message}</span>
                {type !== 'loading' && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: '#fff',
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 4,
                            flexShrink: 0,
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>
        </>
    );
}

// ── useToast Hook ────────────────────────────────────────────
export function useToast() {
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

    const showToast = useCallback((message, type = 'info') => {
        setToast({ visible: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }));
    }, []);

    return {
        toast: { ...toast, onClose: hideToast },
        showToast,
        hideToast,
    };
}

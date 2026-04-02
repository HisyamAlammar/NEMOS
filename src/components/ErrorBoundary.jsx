import React from 'react';

/**
 * ErrorBoundary.jsx — [EDGE-P2-02] Prevents white screen of death
 *
 * Catches unhandled React render errors in child components
 * and displays a user-friendly fallback UI instead of a blank page.
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: '#F8FAFF',
                    padding: 32,
                    fontFamily: "'Inter', sans-serif",
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: '48px 40px',
                        maxWidth: 440,
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 4px 24px rgba(30,58,95,0.08)',
                        border: '1px solid #E5E7EB',
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                        <h1 style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#1E3A5F',
                            margin: '0 0 12px',
                        }}>
                            Oops, Terjadi Kesalahan
                        </h1>
                        <p style={{
                            fontSize: 14,
                            color: '#6B7280',
                            lineHeight: 1.6,
                            margin: '0 0 24px',
                        }}>
                            Halaman mengalami masalah teknis. Silakan muat ulang
                            untuk melanjutkan pengalaman Anda di NEMOS.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            style={{
                                background: '#1E3A5F',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                padding: '12px 32px',
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                            Muat Ulang Halaman
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

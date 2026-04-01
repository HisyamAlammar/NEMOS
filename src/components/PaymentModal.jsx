/**
 * components/PaymentModal.jsx — Xendit QRIS Payment Modal
 *
 * Sprint 6 [P0-NEW-02]: Displays QRIS code from Xendit after invest API call.
 * Shows QR string, amount, countdown timer, and status.
 */
import React, { useState, useEffect } from 'react';

const formatRp = (v) => 'Rp ' + Number(v).toLocaleString('id-ID');

export default function PaymentModal({ visible, paymentData, umkmName, onClose }) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!visible || !paymentData?.expiresAt) return;

        const calcTimeLeft = () => {
            const diff = new Date(paymentData.expiresAt).getTime() - Date.now();
            return Math.max(0, Math.floor(diff / 1000));
        };

        setTimeLeft(calcTimeLeft());
        const interval = setInterval(() => {
            const left = calcTimeLeft();
            setTimeLeft(left);
            if (left <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [visible, paymentData]);

    if (!visible || !paymentData) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isExpired = timeLeft <= 0;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9998,
                    animation: 'fadeInBackdrop 0.2s ease',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                background: '#fff',
                borderRadius: 20,
                width: '90%',
                maxWidth: 420,
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                animation: 'modalScaleIn 0.3s ease',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1E3A5F, #2C5282)',
                    padding: '24px 28px 20px',
                    color: '#fff',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>Pembayaran Investasi</div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatRp(paymentData.amount)}</div>
                    <div style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>{umkmName}</div>
                </div>

                {/* QRIS Area */}
                <div style={{ padding: '28px', textAlign: 'center' }}>
                    {/* QR Code Display */}
                    <div style={{
                        background: '#F8FAFC',
                        border: '2px dashed #E2E8F0',
                        borderRadius: 16,
                        padding: '24px',
                        marginBottom: 20,
                    }}>
                        <div style={{
                            width: 200, height: 200,
                            margin: '0 auto',
                            background: '#fff',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #E2E8F0',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* QR Code placeholder — in production this renders the qrString as actual QR */}
                            <div style={{ textAlign: 'center', padding: 16 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 48, height: 48, fill: 'none', stroke: '#1E3A5F', strokeWidth: 1.5, margin: '0 auto 12px', display: 'block' }}>
                                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                                    <rect x="14" y="14" width="3" height="3" /><rect x="18" y="14" width="3" height="3" /><rect x="14" y="18" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
                                </svg>
                                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>QRIS NEMOS</div>
                                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 4, wordBreak: 'break-all', maxWidth: 160 }}>
                                    {paymentData.qrString ? paymentData.qrString.substring(0, 40) + '...' : 'Demo Mode'}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 16, fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                            Scan QRIS di atas dengan aplikasi e-wallet atau m-banking Anda
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        background: isExpired ? '#FEF2F2' : '#FFF8E1',
                        borderRadius: 10,
                        marginBottom: 20,
                    }}>
                        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: isExpired ? '#DC2626' : '#F59E0B', strokeWidth: 2 }}>
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isExpired ? '#DC2626' : '#92400E' }}>
                            {isExpired
                                ? 'QR Code telah kadaluarsa'
                                : `Berlaku ${minutes}:${seconds.toString().padStart(2, '0')} menit`
                            }
                        </span>
                    </div>

                    {/* Status Info */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 16px',
                        background: '#EFF6FF',
                        borderRadius: 8,
                        marginBottom: 20,
                    }}>
                        <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: '#1E3A5F', strokeWidth: 2, flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span style={{ fontSize: 12, color: '#1E3A5F', fontWeight: 500 }}>
                            Status pembayaran akan diperbarui otomatis via webhook Xendit
                        </span>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            height: 48,
                            background: '#F3F4F6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#E5E7EB'}
                        onMouseOut={e => e.currentTarget.style.background = '#F3F4F6'}
                    >
                        Tutup — Saya Sudah Scan
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeInBackdrop {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalScaleIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>
        </>
    );
}

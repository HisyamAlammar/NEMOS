/**
 * components/PaymentModal.jsx — Xendit QRIS Payment Modal
 *
 * Sprint 6 [P0-NEW-02]: Displays QRIS code from Xendit after invest API call.
 * BUG-H8 FIX: Now polls /api/invest/:id/status every 3s to detect payment.
 * Shows QR string, amount, countdown timer, and real-time status.
 */
import React, { useState, useEffect, useRef } from 'react';
import { checkInvestmentStatus } from '../lib/invest.api';
import { useAuthStore } from '../stores/auth.store';
import { apiFetch } from '../lib/api';


const formatRp = (v) => 'Rp ' + Number(v).toLocaleString('id-ID');

export default function PaymentModal({ visible, paymentData, umkmName, investmentId, onClose, onPaymentSuccess, showToast }) {
    const [timeLeft, setTimeLeft] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const pollingRef = useRef(null);
    const countdownRef = useRef(null);
    const refreshUser = useAuthStore((s) => s.refreshUser);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);

    // Reset state when modal visibility changes
    useEffect(() => {
        if (!visible) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            setPaymentStatus('PENDING');
            setTimeLeft(0);
        }
    }, [visible]);

    // Countdown timer
    useEffect(() => {
        if (!visible || !paymentData?.expiresAt) return;

        const calcTimeLeft = () => {
            const diff = new Date(paymentData.expiresAt).getTime() - Date.now();
            return Math.max(0, Math.floor(diff / 1000));
        };

        setTimeLeft(calcTimeLeft());
        countdownRef.current = setInterval(() => {
            const left = calcTimeLeft();
            setTimeLeft(left);
            if (left <= 0) {
                clearInterval(countdownRef.current);
                if (paymentStatus === 'PENDING') setPaymentStatus('EXPIRED');
                if (pollingRef.current) clearInterval(pollingRef.current);
            }
        }, 1000);

        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }, [visible, paymentData]);

    // BUG-H8 FIX: Poll payment status every 3s
    useEffect(() => {
        if (!visible || !investmentId || paymentStatus !== 'PENDING') return;

        pollingRef.current = setInterval(async () => {
            try {
                const data = await checkInvestmentStatus(investmentId);

                if (data.status === 'ACTIVE') {
                    clearInterval(pollingRef.current);
                    setPaymentStatus('SUCCESS');
                    onPaymentSuccess?.();
                    await refreshUser();
                }
                if (data.status === 'FAILED' || data.status === 'CANCELLED') {
                    clearInterval(pollingRef.current);
                    setPaymentStatus('FAILED');
                }
            } catch (err) {
                // Polling failure — don't crash, user can still close manually
                console.warn('[PaymentModal] Status poll failed:', err.message);
            }
        }, 3000);

        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [visible, investmentId, paymentStatus]);
    const handleSimulatePayment = async () => {
        try {
            await apiFetch(`/invest/${investmentId}/simulate-payment`, { method: 'POST' });
            setPaymentStatus('SUCCESS');
            if (pollingRef.current) clearInterval(pollingRef.current);
            showToast?.('Skenario demo berhasil: Pembayaran diverifikasi instan!', 'success');
            await refreshUser();
            onPaymentSuccess?.();
            setTimeout(() => {
                onClose();
            }, 3000);
        } catch (error) {
            showToast?.('Gagal mensimulasikan pembayaran', 'error');
            console.error('Simulate payment failed', error);
        }
    };

    if (!visible || !paymentData) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={paymentStatus === 'PENDING' ? undefined : onClose}
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
                    background: paymentStatus === 'SUCCESS'
                        ? 'linear-gradient(135deg, #059669, #10B981)'
                        : paymentStatus === 'FAILED' || paymentStatus === 'EXPIRED'
                        ? 'linear-gradient(135deg, #DC2626, #EF4444)'
                        : 'linear-gradient(135deg, #1E3A5F, #2C5282)',
                    padding: '24px 28px 20px',
                    color: '#fff',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>
                        {paymentStatus === 'SUCCESS' ? 'Pembayaran Berhasil' :
                         paymentStatus === 'FAILED' ? 'Pembayaran Gagal' :
                         paymentStatus === 'EXPIRED' ? 'QR Kadaluarsa' :
                         'Pembayaran Investasi'}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{formatRp(paymentData.amount)}</div>
                    <div style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>{umkmName}</div>
                </div>

                {/* Body */}
                <div style={{ padding: '28px', textAlign: 'center' }}>

                    {/* ── DEMO HACK: Simulate Payment ── */}
                    {paymentStatus === 'PENDING' && (
                        <div style={{ marginTop: 24, marginBottom: 12 }}>
                             <button 
                                onClick={handleSimulatePayment}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: '#F59E0B',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                             >
                                <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                </svg>
                                Simulasikan Pembayaran Berhasil (Demo)
                             </button>
                             <p style={{ fontSize: 12, color: '#64748B', marginTop: 12 }}>
                                 [Demo Mode] Bypass QRIS Xendit
                             </p>
                        </div>
                    )}

                    {/* ── SUCCESS ── */}
                    {paymentStatus === 'SUCCESS' && (
                        <div style={{ padding: '16px 0' }}>
                            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
                                Pembayaran Berhasil!
                            </div>
                            <div style={{ fontSize: 13, color: '#047857', lineHeight: 1.6 }}>
                                Investasi Anda di {umkmName} telah dikonfirmasi. Portofolio Anda telah diperbarui.
                            </div>
                        </div>
                    )}

                    {/* ── FAILED / EXPIRED ── */}
                    {(paymentStatus === 'FAILED' || paymentStatus === 'EXPIRED') && (
                        <div style={{ padding: '16px 0' }}>
                            <div style={{ fontSize: 56, marginBottom: 12 }}>
                                {paymentStatus === 'EXPIRED' ? '⏰' : '❌'}
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>
                                {paymentStatus === 'EXPIRED' ? 'QR Code Kadaluarsa' : 'Pembayaran Gagal'}
                            </div>
                            <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
                                {paymentStatus === 'EXPIRED'
                                    ? 'Batas waktu pembayaran telah habis. Silakan buat investasi baru.'
                                    : 'Pembayaran tidak dapat diproses. Silakan coba lagi.'}
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            height: 48,
                            background: paymentStatus === 'SUCCESS' ? '#059669' : '#F3F4F6',
                            color: paymentStatus === 'SUCCESS' ? '#fff' : '#374151',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            marginTop: paymentStatus === 'PENDING' ? 0 : 16,
                        }}
                    >
                        {paymentStatus === 'SUCCESS' ? 'Tutup' :
                         paymentStatus === 'PENDING' ? 'Tutup — Saya Sudah Scan' :
                         'Tutup'}
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
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </>
    );
}

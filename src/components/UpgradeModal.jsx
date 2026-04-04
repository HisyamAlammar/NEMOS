/**
 * components/UpgradeModal.jsx — Premium Tier Upgrade Modal
 *
 * Sprint 6 [P0-NEW-03]: Premium upgrade with Xendit QRIS payment.
 * BUG-H6 FIX: No longer upgrades tier instantly. Shows QRIS,
 * tier upgrades only after webhook confirms payment.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { upgradeToPremium } from '../lib/invest.api';
import { useAuthStore } from '../stores/auth.store';
import { apiFetch } from '../lib/api';

const FEATURES = [
    { icon: '🏆', label: 'Akses UMKM Grade A & B' },
    { icon: '🤖', label: 'AI Financial Advisor personal' },
    { icon: '📊', label: 'Analisis portofolio mendalam' },
    { icon: '🔔', label: 'Notifikasi peluang real-time' },
    { icon: '🛡️', label: 'Proteksi investasi tambahan' },
    { icon: '💎', label: 'Badge Premium di komunitas' },
];

const formatRp = (v) => 'Rp ' + Number(v).toLocaleString('id-ID');

export default function UpgradeModal({ visible, onClose, onSuccess, showToast }) {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('IDLE'); // IDLE | PENDING | CONFIRMED | FAILED
    const [timeLeft, setTimeLeft] = useState(0);
    const refreshUser = useAuthStore((s) => s.refreshUser);
    const pollingRef = useRef(null);
    const countdownRef = useRef(null);

    // Cleanup on unmount or close
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);

    // Reset when modal becomes not visible
    useEffect(() => {
        if (!visible) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            setPaymentData(null);
            setPaymentStatus('IDLE');
            setTimeLeft(0);
        }
    }, [visible]);

    // Countdown timer for QRIS expiry
    useEffect(() => {
        if (!paymentData?.expiresAt || paymentStatus !== 'PENDING') return;

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
                setPaymentStatus('FAILED');
                if (pollingRef.current) clearInterval(pollingRef.current);
            }
        }, 1000);

        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }, [paymentData, paymentStatus]);

    // BUG-H8 FIX: Poll for payment status
    useEffect(() => {
        if (paymentStatus !== 'PENDING' || !paymentData?.externalId) return;

        pollingRef.current = setInterval(async () => {
            try {
                // Check if user tier has been upgraded (webhook processed)
                const userData = await apiFetch('/auth/me');
                if (userData?.data?.tier === 'PREMIUM') {
                    clearInterval(pollingRef.current);
                    setPaymentStatus('CONFIRMED');
                    // Refresh auth store
                    await refreshUser();
                    showToast?.('🎉 Pembayaran berhasil! Tier Anda sekarang Premium.', 'success');
                    onSuccess?.({ tier: 'PREMIUM' });
                    setTimeout(() => onClose?.(), 2000);
                }
            } catch (err) {
                console.warn('[UPGRADE] Polling error:', err.message);
            }
        }, 3000);

        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [paymentStatus, paymentData]);

    const handleUpgrade = async () => {
        if (!user) {
            showToast?.('Anda harus login terlebih dahulu.', 'error');
            onClose?.();
            navigate('/login');
            return;
        }

        setIsProcessing(true);
        showToast?.('Memproses upgrade ke Premium...', 'loading');
        try {
            await upgradeToPremium();
            await refreshUser();
            
            showToast?.('🎉 Upgrade ke Premium berhasil!', 'success');
            onSuccess?.({ tier: 'PREMIUM' });
            
            setPaymentStatus('CONFIRMED');
            setTimeout(() => onClose?.(), 2000);
        } catch (err) {
            const msg = err.data?.message || err.message || 'Gagal memproses upgrade';
            showToast?.(msg, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!visible) return null;

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
                maxWidth: 440,
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                animation: 'modalScaleIn 0.3s ease',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    background: paymentStatus === 'CONFIRMED'
                        ? 'linear-gradient(135deg, #059669, #10B981)'
                        : 'linear-gradient(135deg, #FFD700, #FFA500)',
                    padding: '24px 28px 20px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>
                        {paymentStatus === 'CONFIRMED' ? '✅' : '👑'}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                        {paymentStatus === 'CONFIRMED' ? 'Upgrade Berhasil!' : 'NEMOS Premium'}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: 500 }}>
                        {paymentStatus === 'CONFIRMED'
                            ? 'Tier Anda sekarang Premium'
                            : 'Investasi lebih cerdas, akses lebih luas'}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 28px 28px' }}>

                    {/* ── STATE: IDLE (pricing + features) ── */}
                    {paymentStatus === 'IDLE' && (
                        <>
                            {/* Price */}
                            <div style={{
                                textAlign: 'center',
                                padding: '16px 0',
                                marginBottom: 20,
                                borderBottom: '1px solid #F3F4F6',
                            }}>
                                <span style={{ fontSize: 36, fontWeight: 800, color: '#1E3A5F' }}>Rp 49.000</span>
                                <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>/bulan</span>
                            </div>

                            {/* Features */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                                {FEATURES.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#374151', fontWeight: 500 }}>
                                        <span style={{ fontSize: 18 }}>{f.icon}</span>
                                        {f.label}
                                    </div>
                                ))}
                            </div>

                            {/* Upgrade Button */}
                            <button
                                onClick={handleUpgrade}
                                disabled={isProcessing}
                                style={{
                                    width: '100%',
                                    height: 52,
                                    background: isProcessing ? '#D1D5DB' : 'linear-gradient(135deg, #FFD700, #FFA500)',
                                    color: isProcessing ? '#6B7280' : '#fff',
                                    border: 'none',
                                    borderRadius: 14,
                                    fontSize: 16,
                                    fontWeight: 800,
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: isProcessing ? 'none' : '0 4px 16px rgba(255, 165, 0, 0.3)',
                                }}
                            >
                                {isProcessing ? 'Membuat QRIS...' : '✨ Upgrade ke Premium Sekarang'}
                            </button>

                            {/* Cancel */}
                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%', height: 44,
                                    background: 'transparent', color: '#9CA3AF',
                                    border: 'none', fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', marginTop: 8,
                                }}
                            >
                                Nanti saja
                            </button>
                        </>
                    )}

                    {/* ── STATE: PENDING (QRIS displayed) ── */}
                    {paymentStatus === 'PENDING' && paymentData && (
                        <>
                            {/* Amount */}
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#1E3A5F' }}>
                                    {formatRp(paymentData.amount)}
                                </div>
                            </div>

                            {/* QR Code Area */}
                            <div style={{
                                background: '#F8FAFC',
                                border: '2px dashed #E2E8F0',
                                borderRadius: 16,
                                padding: 24,
                                marginBottom: 16,
                                textAlign: 'center',
                            }}>
                                <div style={{
                                    width: 180, height: 180,
                                    margin: '0 auto',
                                    background: '#fff',
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #E2E8F0',
                                }}>
                                    <div style={{ textAlign: 'center', padding: 16 }}>
                                        <svg viewBox="0 0 24 24" style={{ width: 48, height: 48, fill: 'none', stroke: '#1E3A5F', strokeWidth: 1.5, margin: '0 auto 12px', display: 'block' }}>
                                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                                            <rect x="14" y="14" width="3" height="3" /><rect x="18" y="14" width="3" height="3" /><rect x="14" y="18" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
                                        </svg>
                                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>QRIS NEMOS</div>
                                        <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 4, wordBreak: 'break-all', maxWidth: 140 }}>
                                            {paymentData.qrString ? paymentData.qrString.substring(0, 30) + '...' : 'Demo Mode'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 12, fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                                    Scan QRIS di atas dengan e-wallet atau m-banking
                                </div>
                            </div>

                            {/* Timer */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '10px 16px',
                                background: '#FFF8E1',
                                borderRadius: 10,
                                marginBottom: 12,
                            }}>
                                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: '#F59E0B', strokeWidth: 2 }}>
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                                    Berlaku {minutes}:{seconds.toString().padStart(2, '0')} menit
                                </span>
                            </div>

                            {/* Polling status indicator */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 16px',
                                background: '#EFF6FF',
                                borderRadius: 8,
                                marginBottom: 16,
                            }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: '#3B82F6',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }} />
                                <span style={{ fontSize: 12, color: '#1E3A5F', fontWeight: 500 }}>
                                    Menunggu konfirmasi pembayaran... Tier akan otomatis diupgrade.
                                </span>
                            </div>

                            <button
                                onClick={onClose}
                                style={{
                                    width: '100%', height: 44,
                                    background: '#F3F4F6', color: '#374151',
                                    border: 'none', borderRadius: 12,
                                    fontSize: 14, fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Tutup — Saya Sudah Scan
                            </button>
                        </>
                    )}

                    {/* ── STATE: CONFIRMED ── */}
                    {paymentStatus === 'CONFIRMED' && (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
                                Selamat! Anda sekarang Premium.
                            </div>
                            <div style={{ fontSize: 13, color: '#047857', lineHeight: 1.6 }}>
                                Akses UMKM Grade A dan B kini terbuka. Mulai investasi cerdas Anda!
                            </div>
                        </div>
                    )}

                    {/* ── STATE: FAILED / EXPIRED ── */}
                    {paymentStatus === 'FAILED' && (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>⏰</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#DC2626', marginBottom: 8 }}>
                                QR Code Kadaluarsa
                            </div>
                            <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 20 }}>
                                Batas waktu pembayaran telah habis. Silakan coba lagi.
                            </div>
                            <button
                                onClick={() => { setPaymentData(null); setPaymentStatus('IDLE'); }}
                                style={{
                                    width: '100%', height: 48,
                                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                    color: '#fff', border: 'none', borderRadius: 12,
                                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                                }}
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
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

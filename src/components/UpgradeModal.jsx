/**
 * components/UpgradeModal.jsx — Premium Tier Upgrade Modal
 *
 * Sprint 6 [P0-NEW-03]: Premium upgrade with payment simulation.
 * Shows pricing, features, and triggers tier upgrade API.
 */
import React, { useState } from 'react';
import { upgradeToPremium } from '../lib/invest.api';
import { useAuthStore } from '../stores/auth.store';

const FEATURES = [
    { icon: '🏆', label: 'Akses UMKM Grade A & B' },
    { icon: '🤖', label: 'AI Financial Advisor personal' },
    { icon: '📊', label: 'Analisis portofolio mendalam' },
    { icon: '🔔', label: 'Notifikasi peluang real-time' },
    { icon: '🛡️', label: 'Proteksi investasi tambahan' },
    { icon: '💎', label: 'Badge Premium di komunitas' },
];

export default function UpgradeModal({ visible, onClose, onSuccess, showToast }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const refreshUser = useAuthStore((s) => s.refreshUser);

    const handleUpgrade = async () => {
        setIsProcessing(true);
        showToast?.('Memproses upgrade Premium...', 'loading');
        try {
            const response = await upgradeToPremium();
            // Sync Zustand state with updated user
            await refreshUser();
            showToast?.('🎉 Upgrade ke Premium berhasil!', 'success');
            onSuccess?.(response.data);
            setTimeout(() => onClose?.(), 1500);
        } catch (err) {
            const msg = err.data?.message || err.message || 'Gagal mengupgrade tier';
            showToast?.(msg, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!visible) return null;

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
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    padding: '28px 28px 24px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>👑</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>NEMOS Premium</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: 500 }}>
                        Investasi lebih cerdas, akses lebih luas
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 28px 28px' }}>
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
                        {isProcessing ? 'Memproses...' : '✨ Upgrade ke Premium Sekarang'}
                    </button>

                    {/* Cancel */}
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            height: 44,
                            background: 'transparent',
                            color: '#9CA3AF',
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: 8,
                        }}
                    >
                        Nanti saja
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes modalScaleIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>
        </>
    );
}

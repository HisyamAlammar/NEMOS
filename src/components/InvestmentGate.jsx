import React from 'react';
import { useAuthStore } from '../stores/auth.store';

/**
 * InvestmentGate — UX GUARD (BUKAN Security Guard)
 *
 * Komponen ini memblokir akses ke UI investasi berdasarkan learningProgress
 * yang disimpan di Zustand store (localStorage).
 *
 * ⚠️ PENTING: Gate ini bisa di-bypass dengan manipulasi localStorage.
 * Ini adalah perilaku yang DISENGAJA karena:
 *   1. Backend middleware investmentGateMiddleware melakukan pengecekan
 *      independen di database sebelum memproses request investasi.
 *   2. Bypass di frontend hanya memperlihatkan UI — API tetap akan menolak
 *      request dari user yang learningProgress < 100 di database.
 *
 * Security ada di: backend/src/middleware/investmentGate.middleware.ts
 * Komponen ini hanya untuk UX — mencegah user yang belum selesai belajar
 * dari "melihat" form investasi sebelum waktunya.
 */
export default function InvestmentGate({ children }) {
    const user = useAuthStore((state) => state.user);
    const learningProgress = user?.learningProgress ?? 0;

    if (learningProgress < 100) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: 400, textAlign: 'center',
                padding: '40px 24px',
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: '#FFF8E1', border: '2px solid #FFE082',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                }}>
                    <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: 'none', stroke: '#F59E0B', strokeWidth: 2 }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>

                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 8 }}>
                    Selesaikan Modul Edukasi
                </h2>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 360, marginBottom: 16 }}>
                    Anda perlu menyelesaikan semua modul edukasi sebelum dapat berinvestasi.
                    Ini untuk memastikan Anda memahami risiko investasi di UMKM.
                </p>

                <div style={{
                    width: '100%', maxWidth: 280, height: 8,
                    background: 'var(--color-border)', borderRadius: 4,
                    overflow: 'hidden', marginBottom: 8,
                }}>
                    <div style={{
                        width: `${learningProgress}%`, height: '100%',
                        background: '#F59E0B', borderRadius: 4,
                        transition: 'width 0.3s',
                    }} />
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>
                    Progress: {learningProgress}%
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getUmkmImage } from '../constants/umkmImages';
import { useAuthStore } from '../stores/auth.store';
import { apiFetch } from '../lib/api';

// ── Shared module data (single source of truth with LearnHub) ──
const LEARNING_MODULES = [
    { id: 1, title: 'Dasar Investasi RBF', duration: '12 menit', xp: 250 },
    { id: 2, title: 'Memitigasi Risiko UMKM', duration: '15 menit', xp: 250 },
    { id: 3, title: 'Analisis Laporan Keuangan', duration: '20 menit', xp: 250 },
    { id: 4, title: 'Menilai Karakter UMKM', duration: '18 menit', xp: 250 },
    { id: 5, title: 'Revenue-Based Financing Lanjutan', duration: '25 menit', xp: 250 },
    { id: 6, title: 'Diversifikasi Portofolio', duration: '20 menit', xp: 250 },
    { id: 7, title: 'Strategi Exit & Reinvestasi', duration: '15 menit', xp: 250 },
];

export default function Dashboard() {
    const user = useAuthStore((s) => s.user);
    const userName = user?.name || 'Investor';

    // AM-01 + CTO-04: Derive learning progress from auth store (synced with LearnHub)
    const learningProgress = user?.learningProgress ?? 0;
    const totalModules = LEARNING_MODULES.length;
    const completedModules = Math.floor((learningProgress / 100) * totalModules);
    const activeModuleIndex = Math.min(completedModules, totalModules - 1);
    const activeModule = LEARNING_MODULES[activeModuleIndex];
    const totalXP = completedModules * 250;
    const modulesRemaining = totalModules - completedModules;

    const [portfolioData, setPortfolioData] = useState({ data: [], totalObject: 0 });

    useEffect(() => { 
        window.scrollTo(0, 0); 
        const fetchPortfolio = async () => {
            try {
                const res = await apiFetch('/invest/portfolio');
                setPortfolioData(res);
            } catch (err) {
                console.error("Gagal mengambil portofolio:", err);
            }
        };
        fetchPortfolio();
    }, []);

    return (
        <div className="view" style={{ background: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 'var(--space-3xl)' }}>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-2xl) var(--space-xl)' }}>

                {/* 2. Page Header & Portfolio Summary */}
                <div
                    className="mobile-stack"
                    style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}
                >
                    <div className="mobile-full-width">
                        <h1 className="page-title" style={{ marginBottom: 4 }}>Selamat datang, {userName}</h1>
                        <p className="text-muted" style={{ fontSize: '14px' }}>Rabu, 04 Maret 2026</p>
                    </div>

                    <div
                        className="mobile-full-width"
                        style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', flex: 1 }}
                    >
                        <div className="label-uppercase text-muted" style={{ marginBottom: 8 }}>Total Portofolio</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                            <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-text-pri)', lineHeight: 1 }}>Rp {(portfolioData.totalObject || 0).toLocaleString('id-ID')}</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: portfolioData.totalObject > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>{portfolioData.totalObject > 0 ? '+0,0% bulan ini' : 'Belum ada data'}</div>
                        </div>

                        <div style={{ height: 6, width: '100%', borderRadius: 3, background: 'var(--color-border)', display: 'flex', overflow: 'hidden', position: 'relative', marginBottom: 8 }}>
                            <div style={{ width: '60%', height: '100%', background: 'var(--color-accent)' }}></div>
                            <div style={{ width: '30%', height: '100%', background: 'var(--color-warning)' }}></div>
                            <div style={{ width: '10%', height: '100%', background: 'var(--color-danger)' }}></div>
                            {/* Indicator dot at 72% */}
                            <div style={{ position: 'absolute', top: '50%', left: '72%', transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: '50%', background: '#fff', border: '2px solid var(--color-text-pri)', boxShadow: '0 0 0 2px #fff' }}></div>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-sec)' }}>{portfolioData.totalObject > 0 ? 'Kesehatan Portofolio: Baik' : 'Kesehatan Portofolio: Belum Ada Investasi'}</div>
                    </div>
                </div>

                {/* 3. Main Content (60% / 40%) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xl)' }}>

                    {/* LEFT COLUMN */}
                    <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

                        {/* Card 1 — AI Learning Progress */}
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className="card-title">Progres Pembelajaran</h2>
                                <span className="pill" style={{ background: 'var(--color-primary)', color: '#fff' }}>Level {Math.max(1, Math.ceil(completedModules / 2))} — {learningProgress >= 100 ? 'Expert' : learningProgress >= 60 ? 'Konservatif' : 'Pemula'}</span>
                            </div>

                            <div style={{ padding: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
                                {/* Circular Progress Ring */}
                                <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg style={{ position: 'absolute', top: 0, left: 0, width: 120, height: 120, transform: 'rotate(-90deg)' }}>
                                        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                                        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray={2 * Math.PI * 54} strokeDashoffset={(2 * Math.PI * 54) * (1 - learningProgress / 100)} strokeLinecap="round" />
                                    </svg>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                                        <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.2 }}>{learningProgress}%</span>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{completedModules} dari {totalModules} modul</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="label-uppercase text-muted" style={{ marginBottom: 4 }}>{learningProgress >= 100 ? 'Semua Selesai' : 'Sedang Dipelajari'}</div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 8 }}>{activeModule.title}</h3>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)' }}>{totalXP.toLocaleString('id-ID')} XP terkumpul</div>
                                </div>
                            </div>

                            {/* Motivation bar */}
                            <div style={{ background: 'var(--color-amber-tint)', padding: '16px var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'var(--color-warning)', strokeWidth: 2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#B45309' }}>{learningProgress >= 100 ? '🎉 Semua modul selesai! Akses investasi terbuka.' : `${modulesRemaining} modul lagi untuk membuka akses investasi penuh`}</span>
                                </div>
                                <NavLink to="/learn" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>Lanjutkan Belajar →</NavLink>
                            </div>
                        </div>

                        {/* Card 2 — Smart Contract Repayment Tracker */}
                        <div className="card mobile-padding-sm" style={{ padding: 0 }}>
                            <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className="card-title">Smart Contract Repayment Tracker</h2>
                                <div className="badge badge-trust-blockchain">
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                                    On-Chain Verified
                                </div>
                            </div>

                            {/* Celebration Banner */}
                            <div style={{ background: 'var(--color-green-tint)', padding: '12px var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'var(--color-accent)', strokeWidth: 2 }}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1B5E20' }}>Semua pembayaran bulan ini telah dikonfirmasi</span>
                                </div>
                                <button style={{ color: '#1B5E20', opacity: 0.6 }}><svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                            </div>

                            {/* Table */}
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '16px var(--space-lg)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--color-border)' }}>Tanggal</th>
                                            <th style={{ padding: '16px var(--space-lg)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--color-border)' }}>UMKM</th>
                                            <th style={{ padding: '16px var(--space-lg)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--color-border)' }}>Jumlah</th>
                                            <th style={{ padding: '16px var(--space-lg)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--color-border)' }}>TX Hash</th>
                                            <th style={{ padding: '16px var(--space-lg)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--color-border)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portfolioData.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '16px var(--space-lg)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Belum ada portofolio investasi aktif.</td>
                                            </tr>
                                        ) : (
                                            portfolioData.data.map((inv, i) => (
                                                <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                    <td style={{ padding: '16px var(--space-lg)', fontSize: '14px', color: 'var(--color-text-sec)' }}>
                                                        {new Date(inv.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td style={{ padding: '16px var(--space-lg)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <img src={getUmkmImage(inv.umkmName, 100, 100)} alt={inv.umkmName} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                                            <div>
                                                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-pri)' }}>{inv.umkmName}</div>
                                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>RBF {inv.rbfRate}%/bln</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px var(--space-lg)', fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)' }}>Rp {inv.amount.toLocaleString('id-ID')}</td>
                                                    <td style={{ padding: '16px var(--space-lg)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                                                            0xA1b2...C3d4
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px var(--space-lg)' }}><span className="pill pill-confirmed">Active</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ flex: '1 1 35%', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

                        {/* Card 3 — UMKM Pilihan */}
                        <div className="card mobile-padding-sm">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                                <div>
                                    <h2 className="card-title">UMKM Rekomendasi</h2>
                                    <p className="text-muted" style={{ fontSize: '12px', marginTop: 4 }}>Sesuai profil risiko konservatif Anda</p>
                                </div>
                                <NavLink to="/arena" className="btn btn-secondary btn-sm" style={{ padding: '8px 16px', height: 'auto' }}>Lihat Arena</NavLink>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                {/* Compact Row 1 */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <img src={getUmkmImage('Kedai Kopi Senja', 100, 100)} alt="Kedai Kopi Senja" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Kedai Kopi Senja</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 2 }}>Yogyakarta</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="badge badge-grade-a">Grade A</span>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)', marginTop: 4 }}>95% cocok</div>
                                    </div>
                                </div>

                                {/* Compact Row 2 */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <img src={getUmkmImage('Tani Makmur Organik', 100, 100)} alt="Tani Makmur Organik" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Tani Makmur Organik</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 2 }}>Malang</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="badge badge-grade-a">Grade A</span>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)', marginTop: 4 }}>88% cocok</div>
                                    </div>
                                </div>

                                {/* Compact Row 3 */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <img src={getUmkmImage('Batik Cempaka', 100, 100)} alt="Batik Cempaka" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Batik Cempaka</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 2 }}>Solo</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="badge badge-grade-b">Grade B</span>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)', marginTop: 4 }}>82% cocok</div>
                                    </div>
                                </div>

                                {/* Compact Row 4 */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <img src={getUmkmImage('Dapur Nusantara', 100, 100)} alt="Dapur Nusantara" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Dapur Nusantara</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 2 }}>Bandung</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="badge badge-grade-a">Grade A</span>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)', marginTop: 4 }}>91% cocok</div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
}

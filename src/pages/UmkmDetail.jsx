import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { fetchUmkmDetail } from '../lib/umkm.api';
import { createInvestment } from '../lib/invest.api';
import { useAuthStore } from '../stores/auth.store';
import Toast, { useToast } from '../components/Toast';
import PaymentModal from '../components/PaymentModal';

// ── Polygon Amoy Explorer Base URL ────────────────────────────
const POLYGONSCAN_BASE = 'https://amoy.polygonscan.com';
const NEMOS_CONTRACT = '0x1aa24060c4Cc855b8437DBA3b592647C43c87012';

// ── DEMO_UMKM_DATA (fallback when DB is empty) ───────────────
const DEMO_UMKM_DATA = {
    0: {
        name: 'Kedai Kopi Senja', location: 'Yogyakarta', grade: 'A', risk: 'Low Risk',
        owner: 'Bapak Ilham', ownerYears: 5,
        ownerImg: 'https://i.pravatar.cc/150?u=ilham',
        heroImg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200',
        story: '"Berkat pendanaan investor NEMOS, saya dapat membeli mesin roasting baru dan tidak lagi bergantung pada jasa sangrai pihak ketiga. Ini meningkatkan margin profit kami 15% sekaligus menjaga kualitas rasa kopi lebih konsisten."',
        target: 40000000, current: 35200000, rbf: 5, returnEst: '14% — 17%',
        alloc: [{ label: 'Mesin Roasting', pct: 60 }, { label: 'Biji Kopi', pct: 25 }, { label: 'Operasional', pct: 15 }],
        bars: [40, 45, 38, 55, 60, 58], vals: [1600000, 1800000, 1520000, 2200000, 2400000, 2320000],
    },
    1: {
        name: 'Tani Makmur Organik', location: 'Malang', grade: 'A', risk: 'Low Risk',
        owner: 'Ibu Listia', ownerYears: 3,
        ownerImg: 'https://i.pravatar.cc/150?img=47',
        heroImg: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1200',
        story: '"Dengan dukungan NEMOS, kami bisa membeli pupuk organik berkualitas dan memperluas lahan tanam 40%. Hasil panen meningkat drastis dan pasar organik kami semakin luas."',
        target: 75000000, current: 48750000, rbf: 5, returnEst: '12% — 16%',
        alloc: [{ label: 'Pupuk Organik', pct: 45 }, { label: 'Perluasan Lahan', pct: 35 }, { label: 'Distribusi', pct: 20 }],
        bars: [30, 35, 42, 48, 55, 50], vals: [1200000, 1400000, 1680000, 1920000, 2200000, 2000000],
    },
    2: {
        name: 'Batik Cempaka', location: 'Solo', grade: 'B', risk: 'Moderate Risk',
        owner: 'Ibu Ratna', ownerYears: 8,
        ownerImg: 'https://i.pravatar.cc/150?img=32',
        heroImg: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1200',
        story: '"NEMOS membantu kami membeli peralatan cap batik modern sehingga produksi meningkat 3x lipat tanpa mengorbankan kualitas motif tradisional."',
        target: 120000000, current: 48000000, rbf: 4, returnEst: '10% — 14%',
        alloc: [{ label: 'Peralatan Produksi', pct: 50 }, { label: 'Bahan Baku', pct: 30 }, { label: 'Pemasaran', pct: 20 }],
        bars: [25, 30, 28, 35, 40, 38], vals: [1000000, 1200000, 1120000, 1400000, 1600000, 1520000],
    },
    3: {
        name: 'Warung Maju Bersama', location: 'Surabaya', grade: 'C', risk: 'Higher Risk',
        owner: 'Bapak Hasan', ownerYears: 2,
        ownerImg: 'https://i.pravatar.cc/150?img=60',
        heroImg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
        story: '"Pendanaan dari investor NEMOS memungkinkan saya merenovasi warung dan menambah menu. Pendapatan harian naik 60% dalam tiga bulan pertama."',
        target: 15000000, current: 4500000, rbf: 6, returnEst: '15% — 20%',
        alloc: [{ label: 'Renovasi', pct: 55 }, { label: 'Bahan Makanan', pct: 30 }, { label: 'Peralatan', pct: 15 }],
        bars: [20, 25, 22, 30, 35, 32], vals: [600000, 750000, 660000, 900000, 1050000, 960000],
    },
    4: {
        name: 'Tenun Karya Nusantara', location: 'NTT', grade: 'C', risk: 'Higher Risk',
        owner: 'Ibu Yanti', ownerYears: 4,
        ownerImg: 'https://i.pravatar.cc/150?img=44',
        heroImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200',
        story: '"Berkat NEMOS, kelompok penenun kami yang terdiri dari 15 perempuan desa kini bisa berproduksi rutin dan menjual ke pasar nasional."',
        target: 10000000, current: 1800000, rbf: 6, returnEst: '14% — 19%',
        alloc: [{ label: 'Benang & Pewarna', pct: 40 }, { label: 'Alat Tenun', pct: 35 }, { label: 'Logistik', pct: 25 }],
        bars: [15, 18, 20, 22, 25, 28], vals: [300000, 360000, 400000, 440000, 500000, 560000],
    },
    'dapur-nusantara': {
        name: 'Dapur Nusantara', location: 'Bandung, Jawa Barat', grade: 'A', risk: 'Low Risk',
        owner: 'Bu Sari', ownerYears: 3,
        ownerImg: 'https://i.pravatar.cc/150?img=9',
        heroImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200',
        story: '"Dengan pendanaan ini kami bisa memperluas kapasitas produksi dan menjangkau lebih banyak pelanggan di seluruh Bandung."',
        target: 50000000, current: 37500000, rbf: 5, returnEst: '13% — 16%',
        alloc: [
            { label: 'Peralatan Dapur', pct: 50 },
            { label: 'Bahan Baku', pct: 30 },
            { label: 'Operasional', pct: 20 }
        ],
        bars: [72, 80, 75, 93, 86, 100],
        vals: [3200000, 3500000, 3300000, 4100000, 3800000, 4400000],
    },
};

const MONTHS = ['Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb'];
const Y_LABELS = ['Rp 3Jt', 'Rp 2Jt', 'Rp 1Jt', 'Rp 0'];
const ALLOC_COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-warning)'];
const GRADE_BADGE = { A: 'badge-grade-a', B: 'badge-grade-b', C: 'badge-grade-c' };

// ── Bar Chart ─────────────────────────────────────────────
function BarChart({ bars, vals }) {
    const [hovered, setHovered] = useState(null);
    const maxVal = Math.max(...vals);
    // Normalize bar heights to max 90%
    const heights = bars.map(b => b);

    return (
        <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 240, paddingBottom: 8, flexShrink: 0 }}>
                {Y_LABELS.map(l => <span key={l} style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1, whiteSpace: 'nowrap' }}>{l}</span>)}
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, paddingBottom: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                    {Y_LABELS.map(l => <div key={l} style={{ width: '100%', height: 1, background: '#F3F4F6' }} />)}
                </div>
                <div style={{ width: '100%', height: 240, display: 'flex', alignItems: 'flex-end', gap: 4, borderBottom: '1px solid var(--color-border)', paddingBottom: 8, position: 'relative', zIndex: 1 }}>
                    {heights.map((h, i) => (
                        <div key={i}
                            style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {hovered === i && (
                                <div style={{ position: 'absolute', bottom: `${h}%`, left: '50%', transform: 'translateX(-50%) translateY(-8px)', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 11px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', zIndex: 20, fontSize: 12, fontWeight: 600, color: '#1E3A5F', pointerEvents: 'none' }}>
                                    {MONTHS[i]} 2026 — Rp {vals[i].toLocaleString('id-ID')}
                                </div>
                            )}
                            <div style={{ width: '100%', background: hovered === i ? '#2563EB' : 'var(--color-primary)', height: `${h}%`, borderRadius: '4px 4px 0 0', transition: 'all 0.2s', opacity: i === heights.length - 1 ? 1 : 0.7, cursor: 'pointer' }} />
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {MONTHS.map(m => <span key={m}>{m}</span>)}
                </div>
            </div>
        </div>
    );
}

// ── Helpers ────────────────────────────────────────────────
const formatRp = (v) => 'Rp ' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pct = (cur, tgt) => Math.round((cur / tgt) * 100);

export default function UmkmDetail() {
    const { id } = useParams();
    const [investValue, setInvestValue] = useState(1000000);
    const [d, setD] = useState(DEMO_UMKM_DATA[id] || DEMO_UMKM_DATA[0]);
    const [isInvesting, setIsInvesting] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { toast, showToast } = useToast();
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => !!s.token);

    // ── Handle Konfirmasi Pendanaan → Xendit QRIS ──────
    const handleInvest = async () => {
        if (!isAuthenticated) {
            showToast('Silakan login terlebih dahulu', 'error');
            return;
        }
        if (investValue < 100000) {
            showToast('Minimum investasi Rp 100.000', 'error');
            return;
        }
        setIsInvesting(true);
        showToast('Memproses pembayaran...', 'loading');
        try {
            const response = await createInvestment(d.id || id, investValue);
            setPaymentData(response.data.payment);
            setShowPaymentModal(true);
            showToast('QRIS berhasil dibuat! Silakan scan.', 'success');
        } catch (err) {
            const msg = err.data?.message || err.message || 'Gagal memproses investasi';
            showToast(msg, 'error');
        } finally {
            setIsInvesting(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        // Try to fetch real data from API, merge with demo enrichment
        fetchUmkmDetail(id).then((response) => {
            if (response && response.data) {
                const api = response.data;
                const demoFallback = DEMO_UMKM_DATA[id] || DEMO_UMKM_DATA[0];
                // Merge: API fields override, demo fields fill gaps
                setD({
                    ...demoFallback,
                    name: api.name || demoFallback.name,
                    location: api.location || demoFallback.location,
                    grade: api.grade || demoFallback.grade,
                    target: api.target || demoFallback.target,
                    current: api.current || demoFallback.current,
                    rbf: api.rbfRate || demoFallback.rbf,
                    owner: api.ownerName || demoFallback.owner,
                    ownerYears: api.ownerYears || demoFallback.ownerYears,
                    latestTxHash: api.latestTxHash || null,
                });
            }
        });
    }, [id]);

    const funded = pct(d.current, d.target);
    const est = { total: investValue + investValue * 0.16, profit: investValue * 0.16 };

    // Conic gradient for alloc chart
    let conicParts = [], cum = 0;
    d.alloc.forEach((a, i) => {
        conicParts.push(`${ALLOC_COLORS[i]} ${cum}% ${cum + a.pct}%`);
        cum += a.pct;
    });

    return (
        <div className="view" style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 100 }}>

            {/* Breadcrumb */}
            <div style={{ padding: 'var(--space-md) var(--space-xl)', background: '#fff' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', fontSize: '13px', fontWeight: 500 }}>
                    <NavLink to="/arena" style={{ color: 'var(--color-text-muted)' }}>Kembali</NavLink>
                    <span style={{ margin: '0 8px', color: 'var(--color-border)' }}>/</span>
                    <span style={{ color: 'var(--color-primary)' }}>{d.name}</span>
                </div>
            </div>

            {/* 1. Hero Section */}
            <div style={{ position: 'relative', width: '100%', height: 400, background: '#000' }}>
                <img src={d.heroImg} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                    onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg, #1a472a, #2d6a4f)'; }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, transparent 60%)' }}></div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-2xl) var(--space-xl)' }}>
                    <div
                        className="mobile-stack"
                        style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-md)' }}
                    >
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '6px 12px 6px 6px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.3)', marginBottom: 'var(--space-md)' }}>
                                <img src={d.ownerImg} alt={d.owner} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}>Pemilik: {d.owner}, {d.ownerYears} tahun</span>
                            </div>
                            <h1 className="hero-title-responsive" style={{ color: '#fff', fontSize: '36px', fontWeight: 800, lineHeight: 1.1, marginBottom: 8, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{d.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 500 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                {d.location}
                            </div>
                        </div>
                        <div className="mobile-full-width" style={{ textAlign: 'right' }}>
                            <div className={`badge ${GRADE_BADGE[d.grade] || ''}`} style={{ display: 'inline-block', fontSize: '14px', padding: '6px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', background: d.grade === 'A' ? '#1E3A5F' : d.grade === 'B' ? '#6366F1' : '#FF9800', color: '#fff', borderRadius: 999 }}>
                                Grade {d.grade} — {d.risk}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Trust Badges */}
            <div style={{ background: '#fff', padding: '16px var(--space-xl)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-primary)', fontWeight: 600, fontSize: '13px' }}>
                        <div style={{ padding: 6, background: 'var(--color-blue-tint)', borderRadius: 6 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /></svg>
                        </div>
                        AI Graded
                    </div>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-border)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-accent)', fontWeight: 600, fontSize: '13px' }}>
                        <div style={{ padding: 6, background: 'var(--color-green-tint)', borderRadius: 6 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        </div>
                        Verified by Blockchain
                    </div>
                    {/* Blockchain TX proof — links to real Polygonscan Amoy */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#00C853', fontWeight: 500 }}>
                        <span style={{ color: '#6B7280' }}>Contract: {NEMOS_CONTRACT.slice(0, 6)}...{NEMOS_CONTRACT.slice(-4)}</span>
                        <a href={`${POLYGONSCAN_BASE}/address/${NEMOS_CONTRACT}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#00C853', textDecoration: 'underline', fontWeight: 600, fontSize: '12px' }}>
                            Lihat di Polygonscan
                            <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        </a>
                    </div>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-border)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00838F', fontWeight: 600, fontSize: '13px' }}>
                        <div style={{ padding: 6, background: '#E0F7FA', borderRadius: 6 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        OJK Compliant Partner
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-2xl) var(--space-xl)' }}>

                {/* 3. Owner Story */}
                <div style={{ background: 'var(--color-blue-tint)', borderLeft: '4px solid var(--color-primary)', borderRadius: '0 var(--radius) var(--radius) 0', padding: 'var(--space-lg) var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
                    <p style={{ fontStyle: 'italic', fontSize: '15px', color: 'var(--color-text-pri)', lineHeight: 1.6, marginBottom: 12 }}>{d.story}</p>
                    <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--color-text-sec)', fontWeight: 500 }}>— {d.owner}, Pemilik {d.name}</div>
                </div>

                {/* 4. Two Columns */}
                <div
                    className="detail-stack-responsive"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xl)' }}
                >

                    {/* LEFT */}
                    <div className="mobile-full-width" style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', minWidth: 0 }}>

                        {/* RBF Contract */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-lg)' }}>
                                <h2 className="card-title">Skema Smart Contract (RBF)</h2>
                                <span title="Revenue-Based Financing: bagi hasil dari omzet bulanan, bukan bunga tetap" style={{ cursor: 'help' }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'var(--color-text-muted)', strokeWidth: 2 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px dashed var(--color-border)' }}>
                                    <span style={{ fontSize: 14, color: 'var(--color-text-sec)' }}>Target Pendanaan</span>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{formatRp(d.target)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px dashed var(--color-border)' }}>
                                    <span style={{ fontSize: 14, color: 'var(--color-text-sec)' }}>Potongan RBF Otomatis</span>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{d.rbf}% / bulan</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px dashed var(--color-border)' }}>
                                    <span style={{ fontSize: 14, color: 'var(--color-text-sec)' }}>Estimasi Total Return</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>{d.returnEst}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                    <span style={{ fontSize: 14, color: 'var(--color-text-sec)' }}>Terkumpul</span>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{funded}% — {formatRp(d.current)}</span>
                                </div>
                            </div>
                            <div style={{ height: 10, background: 'var(--color-border)', borderRadius: 5, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${funded}%`, background: 'var(--color-accent)', borderRadius: 5 }}></div>
                            </div>
                        </div>

                        {/* Blockchain Timeline */}
                        <div className="card" style={{ overflow: 'hidden' }}>
                            <h2 className="card-title" style={{ marginBottom: 4 }}>Alur Perlindungan Dana</h2>
                            <p className="text-muted" style={{ fontSize: '13px', marginBottom: 'var(--space-xl)' }}>Setiap tahap tercatat permanen di blockchain</p>
                            <div style={{ display: 'flex', position: 'relative', overflowX: 'auto', paddingBottom: 16 }}>
                                <div style={{ position: 'absolute', top: 16, left: 30, right: 30, height: 2, background: 'var(--color-border)', zIndex: 0 }}></div>
                                <div style={{ position: 'absolute', top: 16, left: 30, width: '60%', height: 2, background: 'var(--color-accent)', zIndex: 0 }}></div>
                                {[
                                    { label: 'Omzet Direkam', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>, bg: 'var(--color-accent)', fw: 600 },
                                    { label: 'Diverifikasi', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>, bg: 'var(--color-accent)', fw: 600 },
                                    { label: 'Masuk Blockchain', icon: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>, bg: 'var(--color-accent)', fw: 600 },
                                    { label: 'Smart Contract Aktif', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>, bg: 'var(--color-primary)', fw: 700 },
                                    { label: 'Payout Otomatis', icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>, bg: 'var(--color-border)', fw: 500 },
                                ].map((s, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 100, zIndex: 1, position: 'relative' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.bg, color: s.bg === 'var(--color-border)' ? 'var(--color-text-muted)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(i === 3 ? { boxShadow: '0 0 0 6px rgba(30,58,95,0.15)' } : {}) }}>
                                            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>{s.icon}</svg>
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: s.fw, color: s.fw === 500 ? 'var(--color-text-muted)' : 'var(--color-text-pri)', textAlign: 'center' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Calculator */}
                        <div className="card">
                            <h2 className="card-title" style={{ marginBottom: 4 }}>Kalkulator Investasi</h2>
                            <p className="text-muted" style={{ fontSize: '13px', marginBottom: 'var(--space-xl)' }}>Simulasikan potensi return berdasarkan histori omzet terverifikasi</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'var(--space-xl)' }}>
                                <input type="range" min="500000" max="10000000" step="100000" value={investValue} onChange={e => setInvestValue(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--color-primary)' }} />
                                <input type="text" value={formatRp(investValue)} readOnly style={{ width: 150, height: 44, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, textAlign: 'right', outline: 'none', background: 'var(--color-bg)' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                                <div style={{ background: 'var(--color-bg)', padding: 16, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                                    <div className="label-uppercase text-muted" style={{ marginBottom: 8 }}>Estimasi Pengembalian (12 Bln)</div>
                                    <div style={{ fontSize: 24, fontWeight: 700 }}>{formatRp(Math.round(est.total))}</div>
                                </div>
                                <div style={{ background: 'var(--color-green-tint)', padding: 16, borderRadius: 'var(--radius)', border: '1px solid #A5D6A7' }}>
                                    <div className="label-uppercase" style={{ color: '#2E7D32', marginBottom: 8 }}>Estimasi Profit Bersih</div>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1B5E20' }}>{formatRp(Math.round(est.profit))}</div>
                                </div>
                            </div>
                            <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--color-text-muted)' }}>*Estimasi berdasarkan histori omzet terverifikasi. Bukan jaminan return.</p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="mobile-full-width" style={{ flex: '1 1 35%', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', minWidth: 0 }}>
                        <div className="card" style={{ overflowX: 'auto' }}>
                            <h2 className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>Histori Omzet (6 Bulan)</h2>
                            <BarChart bars={d.bars} vals={d.vals} />
                        </div>
                        <div className="card">
                            <h2 className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>Alokasi Dana</h2>
                            <div
                                className="mobile-stack"
                                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}
                            >
                                <div style={{ position: 'relative', width: 120, height: 120, borderRadius: '50%', background: `conic-gradient(${conicParts.join(', ')})` }}>
                                    <div style={{ position: 'absolute', inset: 20, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>100%</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {d.alloc.map((a, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
                                            <span style={{ width: 12, height: 12, borderRadius: 3, background: ALLOC_COLORS[i] }}></span>
                                            {a.label} ({a.pct}%)
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom CTA */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid var(--color-border)', padding: '16px var(--space-xl)', boxShadow: '0 -4px 16px rgba(0,0,0,0.05)', zIndex: 50 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>Nilai Investasi:</div>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{formatRp(investValue)}</div>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: 240, height: 48, fontSize: 15, opacity: isInvesting ? 0.7 : 1, cursor: isInvesting ? 'not-allowed' : 'pointer' }}
                        onClick={handleInvest}
                        disabled={isInvesting}
                    >
                        {isInvesting ? 'Memproses...' : 'Konfirmasi Pendanaan'}
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            <Toast {...toast} />

            {/* Xendit QRIS Payment Modal */}
            <PaymentModal
                visible={showPaymentModal}
                paymentData={paymentData}
                umkmName={d.name}
                onClose={() => setShowPaymentModal(false)}
            />
        </div>
    );
}

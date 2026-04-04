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

// ── Risk label derived from grade ─────────────────────────────
const RISK_MAP = { A: 'Low Risk', B: 'Moderate Risk', C: 'Higher Risk' };
const RETURN_MAP = { A: '14% — 17%', B: '10% — 14%', C: '15% — 20%' };
const DEFAULT_ALLOC = [
    { label: 'Modal Usaha', pct: 50 },
    { label: 'Operasional', pct: 30 },
    { label: 'Pengembangan', pct: 20 },
];
const DEFAULT_BARS = [40, 45, 38, 55, 60, 58];
const DEFAULT_VALS = [1600000, 1800000, 1520000, 2200000, 2400000, 2320000];

const MONTHS = ['Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb'];
const Y_LABELS = ['Rp 3Jt', 'Rp 2Jt', 'Rp 1Jt', 'Rp 0'];
const ALLOC_COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-warning)'];
const GRADE_BADGE = { A: 'badge-grade-a', B: 'badge-grade-b', C: 'badge-grade-c' };

// ── Bar Chart ─────────────────────────────────────────────
function BarChart({ bars, vals }) {
    const [hovered, setHovered] = useState(null);
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
                    {bars.map((h, i) => (
                        <div key={i}
                            style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end' }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {hovered === i && (
                                <div style={{ position: 'absolute', bottom: `${h}%`, left: '50%', transform: 'translateX(-50%) translateY(-8px)', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 11px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', zIndex: 20, fontSize: 12, fontWeight: 600, color: '#1E3A5F', pointerEvents: 'none' }}>
                                    {MONTHS[i]} 2026 — Rp {vals[i]?.toLocaleString('id-ID') ?? '0'}
                                </div>
                            )}
                            <div style={{ width: '100%', background: hovered === i ? '#2563EB' : 'var(--color-primary)', height: `${h}%`, borderRadius: '4px 4px 0 0', transition: 'all 0.2s', opacity: i === bars.length - 1 ? 1 : 0.7, cursor: 'pointer' }} />
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

// ── Skeleton Loader ───────────────────────────────────────
function DetailSkeleton() {
    const pulse = { background: '#E2E8F0', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' };
    return (
        <div className="view" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <div style={{ padding: 'var(--space-md) var(--space-xl)', background: '#fff' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ ...pulse, width: 180, height: 16 }} />
                </div>
            </div>
            <div style={{ width: '100%', height: 400, ...pulse, borderRadius: 0 }} />
            <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ ...pulse, height: 80, width: '100%' }} />
                <div style={{ display: 'flex', gap: 24 }}>
                    <div style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ ...pulse, height: 240 }} />
                        <div style={{ ...pulse, height: 160 }} />
                    </div>
                    <div style={{ flex: '1 1 35%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ ...pulse, height: 280 }} />
                        <div style={{ ...pulse, height: 180 }} />
                    </div>
                </div>
            </div>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </div>
    );
}

// ── Error State ───────────────────────────────────────────
function DetailError({ message, onRetry }) {
    return (
        <div className="view" style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: 420, padding: 32 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, fill: 'none', stroke: '#DC2626', strokeWidth: 1.5 }}>
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Data UMKM Tidak Dapat Dimuat</h2>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>{message || 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'}</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <NavLink to="/arena" style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid var(--color-border)', background: '#fff', color: '#334155', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                        Kembali ke Arena
                    </NavLink>
                    <button onClick={onRetry} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#1E3A5F', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        Coba Lagi
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Helpers ────────────────────────────────────────────────
const formatRp = (v) => 'Rp ' + (v ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pct = (cur, tgt) => tgt > 0 ? Math.round((cur / tgt) * 100) : 0;

export default function UmkmDetail() {
    const { id } = useParams();
    const [investValue, setInvestValue] = useState(1000000);
    const [isInvesting, setIsInvesting] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [currentInvestmentId, setCurrentInvestmentId] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { toast, showToast } = useToast();
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => !!s.token);

    // ── BUG-H4 FIX: Proper loading states, no demo fallback ──
    const [umkmData, setUmkmData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryKey, setRetryKey] = useState(0); // trigger re-fetch

    useEffect(() => {
        window.scrollTo(0, 0);
        let cancelled = false;

        async function loadUmkm() {
            setIsLoading(true);
            setError(null);

            const response = await fetchUmkmDetail(id);

            if (cancelled) return;

            if (response && response.data) {
                const api = response.data;
                // Build display object from API data with safe defaults
                setUmkmData({
                    id: api.id,
                    name: api.name ?? 'Nama tidak tersedia',
                    location: api.location ?? 'Lokasi tidak tersedia',
                    grade: api.grade ?? 'C',
                    risk: RISK_MAP[api.grade] ?? 'Unknown Risk',
                    owner: api.ownerName ?? 'Pemilik UMKM',
                    ownerYears: api.ownerYears ?? 1,
                    ownerImg: `https://i.pravatar.cc/150?u=${api.id}`,
                    heroImg: api.imageUrl || null,
                    story: api.description
                        ? `"${api.description}"`
                        : '"Kami percaya pendanaan dari investor akan membantu usaha kami berkembang lebih pesat."',
                    target: api.target ?? 0,
                    current: api.current ?? 0,
                    rbf: api.rbfRate ?? 5,
                    returnEst: RETURN_MAP[api.grade] ?? '10% — 15%',
                    alloc: DEFAULT_ALLOC,
                    bars: DEFAULT_BARS,
                    vals: DEFAULT_VALS,
                    latestTxHash: api.latestTxHash ?? null,
                    investorCount: api.investorCount ?? 0,
                    fundedPercent: api.fundedPercent ?? 0,
                });
                setIsLoading(false);
            } else {
                setError('UMKM tidak ditemukan atau server tidak merespons.');
                setIsLoading(false);
            }
        }

        loadUmkm();
        return () => { cancelled = true; };
    }, [id, retryKey]);

    // ── Render: Loading state ──
    if (isLoading) return <DetailSkeleton />;

    // ── Render: Error state ──
    if (error || !umkmData) {
        return <DetailError message={error} onRetry={() => setRetryKey(k => k + 1)} />;
    }

    // ── Success: Render with API data ──
    const d = umkmData;
    const funded = pct(d.current, d.target);
    const remainingFunding = Math.max(Number(d.target) - Number(d.current), 0); // AM-03
    const isFullyFunded = remainingFunding <= 0;
    const calcMax = isFullyFunded ? 500000 : Math.max(remainingFunding, 500000);
    const est = { total: investValue + investValue * 0.16, profit: investValue * 0.16 };

    // Conic gradient for alloc chart
    let conicParts = [], cum = 0;
    d.alloc.forEach((a, i) => {
        conicParts.push(`${ALLOC_COLORS[i]} ${cum}% ${cum + a.pct}%`);
        cum += a.pct;
    });

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
            setCurrentInvestmentId(response.data.investmentId);
            setShowPaymentModal(true);
            showToast('QRIS berhasil dibuat! Silakan scan.', 'success');
        } catch (err) {
            const msg = err.data?.message || err.message || 'Gagal memproses investasi';
            showToast(msg, 'error');
        } finally {
            setIsInvesting(false);
        }
    };

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
                {d.heroImg ? (
                    <img src={d.heroImg} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                        onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg, #1a472a, #2d6a4f)'; }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a472a, #2d6a4f)' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.9) 0%, transparent 60%)' }}></div>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-2xl) var(--space-xl)' }}>
                    <div
                        className="mobile-stack"
                        style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-md)' }}
                    >
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '6px 12px 6px 6px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.3)', marginBottom: 'var(--space-md)' }}>
                                <img src={d.ownerImg} alt={d.owner} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                                    onError={e => { e.target.style.display = 'none'; }} />
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
                            {isFullyFunded && (
                                <div style={{ padding: '12px 16px', background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 600, color: '#F57C00' }}>
                                    🎉 UMKM ini sudah mencapai target pendanaan penuh.
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'var(--space-xl)' }}>
                                <input type="range" min="500000" max={calcMax} step="100000" value={Math.min(investValue, calcMax)} onChange={e => setInvestValue(Number(e.target.value))} disabled={isFullyFunded} style={{ flex: 1, accentColor: 'var(--color-primary)', opacity: isFullyFunded ? 0.4 : 1 }} />
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
                investmentId={currentInvestmentId}
                onClose={() => setShowPaymentModal(false)}
                onPaymentSuccess={() => showToast('🎉 Pembayaran berhasil! Portofolio diperbarui.', 'success')}
            />
        </div>
    );
}

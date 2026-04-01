import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUmkmImage } from '../constants/umkmImages';
import { fetchUmkmList } from '../lib/umkm.api';

// ── RISK MAP ─────────────────────────────────────────────────
const GRADE_RISK = { A: 'Low Risk', B: 'Moderate Risk', C: 'Higher Risk' };

// Grade C cards are accessible on Free Tier. Grade A/B are Premium-only.
const LOCKED_GRADES = ['A', 'B'];

// ── DEMO FALLBACK DATA (used when DB is empty) ──────────────
const DEMO_UMKM_LIST = [
    { id: 0, name: 'Kedai Kopi Senja', location: 'Yogyakarta', grade: 'A', risk: 'Low Risk', match: 95, funded: 88, target: '40.000.000', current: '35.200.000', impact: 'Memberdayakan 6 pemuda desa', min: '1.000.000', img: getUmkmImage('Kedai Kopi Senja', 600, 338), owner: 'Bapak Ilham', ownerImg: 'https://i.pravatar.cc/150?u=ilham' },
    { id: 1, name: 'Tani Makmur Organik', location: 'Malang', grade: 'A', risk: 'Low Risk', match: 88, funded: 65, target: '75.000.000', current: '48.750.000', impact: 'Pertanian bebas pestisida kimia', min: '2.500.000', img: getUmkmImage('Tani Makmur Organik', 600, 338), owner: 'Ibu Listia', ownerImg: 'https://i.pravatar.cc/150?img=47' },
    { id: 2, name: 'Batik Cempaka', location: 'Solo', grade: 'B', risk: 'Moderate Risk', match: 82, funded: 40, target: '120.000.000', current: '48.000.000', impact: 'Melestarikan motif klasik Jawa', min: '5.000.000', img: getUmkmImage('Batik Cempaka', 600, 338), owner: 'Ibu Ratna', ownerImg: 'https://i.pravatar.cc/150?img=32' },
    { id: 'dapur-nusantara', name: 'Dapur Nusantara', location: 'Bandung, Jawa Barat', grade: 'A', risk: 'Low Risk', match: 91, funded: 75, target: '50.000.000', current: '37.500.000', impact: 'Memberdayakan ibu rumah tangga lokal', min: '1.000.000', img: getUmkmImage('Dapur Nusantara', 600, 338), owner: 'Bu Sari', ownerImg: 'https://i.pravatar.cc/150?img=9' },
    { id: 3, name: 'Warung Maju Bersama', location: 'Surabaya', grade: 'C', risk: 'Higher Risk', match: 74, funded: 30, target: '15.000.000', current: '4.500.000', impact: 'Lapangan kerja warga sekitar', min: '100.000', img: getUmkmImage('Warung Maju Bersama', 600, 338), owner: 'Bapak Hasan', ownerImg: 'https://i.pravatar.cc/150?img=60' },
    { id: 4, name: 'Tenun Karya Nusantara', location: 'NTT', grade: 'C', risk: 'Higher Risk', match: 70, funded: 18, target: '10.000.000', current: '1.800.000', impact: 'Pemberdayaan pengrajin perempuan', min: '100.000', img: getUmkmImage('Tenun Karya Nusantara', 600, 338), owner: 'Ibu Yanti', ownerImg: 'https://i.pravatar.cc/150?img=44' },
];

// ── Badge colors per grade ──────────────────────────────────
const GRADE_STYLE = {
    A: { bg: '#1E3A5F', color: '#fff' },
    B: { bg: '#6366F1', color: '#fff' },
    C: { bg: '#FF9800', color: '#fff' },
};

// ── Lock icon SVG ─────────────────────────────────────────────
const LockIcon = ({ size = 32, color = '#fff' }) => (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, fill: 'none', stroke: color, strokeWidth: 2.5 }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

// ── Locked Card Wrapper ───────────────────────────────────────
function LockedCardWrapper({ children, umkm }) {
    const [showTip, setShowTip] = useState(false);

    return (
        <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
        >
            {children}

            {/* Tooltip */}
            {showTip && (
                <div style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1E3A5F', color: '#fff',
                    fontSize: 12, fontWeight: 500, lineHeight: 1.5,
                    padding: '8px 12px', borderRadius: 8,
                    width: 240, textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    zIndex: 50, pointerEvents: 'none',
                }}>
                    Upgrade ke Premium untuk berinvestasi di UMKM Grade A dan B. Mulai dari Rp 49.000/bulan.
                    {/* Arrow */}
                    <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 12, height: 6, overflow: 'hidden' }}>
                        <div style={{ width: 10, height: 10, background: '#1E3A5F', transform: 'rotate(45deg) translateY(-7px)', margin: '0 auto' }} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Single UMKM Card ──────────────────────────────────────────
function UmkmCard({ umkm, navigate, userTier }) {
    const isLocked = userTier !== 'premium' && LOCKED_GRADES.includes(umkm.grade);
    const isFree = !LOCKED_GRADES.includes(umkm.grade);
    const g = GRADE_STYLE[umkm.grade] || GRADE_STYLE.C;

    const card = (
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: isLocked ? 'not-allowed' : 'pointer' }}
            onMouseOver={e => { if (!isLocked) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.12)'; } }}
            onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                <img src={umkm.img} alt={umkm.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isLocked ? 'brightness(0.55)' : 'none', transition: 'filter 0.2s' }}
                    onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg, #1a472a, #2d6a4f)'; }} />

                {/* Locked overlay */}
                {
                    isLocked && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LockIcon size={32} color="#fff" />
                        </div>
                    )
                }

                {/* Match Badge */}
                <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: 'var(--color-accent)', color: '#fff',
                    padding: '4px 10px', borderRadius: 999,
                    fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: isLocked ? 0.5 : 1,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                    {umkm.match}% Cocok
                </div>

                {/* Grade Badge */}
                <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: g.bg, color: g.color,
                    padding: '4px 10px', borderRadius: 999,
                    fontSize: 11, fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}>
                    Grade {umkm.grade} — {umkm.risk}
                </div>
            </div >

            {/* Card Body */}
            < div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }
            }>

                {/* Owner row */}
                < div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <img src={umkm.ownerImg} alt={umkm.owner} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #E5E7EB' }} />
                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Dimiliki oleh {umkm.owner}</span>
                </div >

                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1E3A5F', marginBottom: 4 }}>{umkm.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6B7280', fontSize: 13, marginBottom: 12 }}>
                    <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {umkm.location}
                </div>

                {/* Impact tag */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#F0FDF4', borderRadius: 999, color: '#166534', fontSize: 12, fontWeight: 500, marginBottom: 14, alignSelf: 'flex-start' }}>
                    <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>
                    {umkm.impact}
                </div>

                {/* Free tier badge */}
                {
                    isFree && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E8F5E9', color: '#00C853', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, alignSelf: 'flex-start', marginBottom: 12, letterSpacing: '0.03em' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, fill: 'none', stroke: 'currentColor', strokeWidth: 3 }}><polyline points="20 6 9 17 4 12" /></svg>
                            Tersedia untuk Free
                        </div>
                    )
                }

                <div style={{ height: 1, background: '#F3F4F6', margin: '0 0 14px' }} />

                {/* Progress */}
                <div style={{ marginBottom: 14 }}>
                    <div
                        className="mobile-stack"
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 5, gap: 4 }}
                    >
                        <span>Terdanai {umkm.funded}%</span>
                        <span style={{ color: '#1E3A5F', fontWeight: 700 }}>Rp {umkm.current} <span className="hide-on-mobile" style={{ color: '#9CA3AF', fontWeight: 500 }}>/ Rp {umkm.target}</span></span>
                    </div>
                    <div style={{ height: 7, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${umkm.funded}%`, background: '#00C853', borderRadius: 4 }} />
                    </div>
                </div>

                {/* Min + blockchain row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Min. Rp {umkm.min}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00C853', fontSize: 11, fontWeight: 700 }}>
                        <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        Blockchain
                    </div>
                </div>

                {/* CTA */}
                <div style={{ marginTop: 'auto' }}>
                    {isLocked ? (
                        <button
                            disabled
                            style={{ width: '100%', height: 44, background: '#FFF8E1', color: '#F59E0B', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <LockIcon size={15} color="#F59E0B" />
                            Khusus Premium
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate(`/detail/${umkm.id}`)}
                            style={{ width: '100%', height: 44, background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                            Lihat Detail
                        </button>
                    )}
                </div>
            </div >
        </div >
    );

    return isLocked
        ? <LockedCardWrapper umkm={umkm}>{card}</LockedCardWrapper>
        : card;
}

export default function UmkmArena({ userTier = 'premium' }) {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('Semua');
    const [search, setSearch] = useState('');
    const [umkms, setUmkms] = useState(DEMO_UMKM_LIST);
    const [dataSource, setDataSource] = useState('demo'); // 'api' | 'demo'

    useEffect(() => {
        window.scrollTo(0, 0);
        // Fetch from backend API, fallback to demo data
        fetchUmkmList().then((response) => {
            if (response && response.data && response.data.length > 0) {
                // Transform backend data to Arena card format
                const apiData = response.data.map((u) => ({
                    id: u.id,
                    name: u.name,
                    location: u.location,
                    grade: u.grade,
                    risk: GRADE_RISK[u.grade] || 'Unknown',
                    match: Math.round(70 + Math.random() * 25), // AI-generated match score
                    funded: u.fundedPercent,
                    target: Number(u.target).toLocaleString('id-ID'),
                    current: Number(u.current).toLocaleString('id-ID'),
                    impact: u.description || 'Memberdayakan UMKM Indonesia',
                    min: u.grade === 'C' ? '100.000' : '1.000.000',
                    img: u.imageUrl || getUmkmImage(u.name, 600, 338),
                    owner: u.ownerName,
                    ownerImg: `https://i.pravatar.cc/150?u=${u.id}`,
                    category: u.category,
                }));
                setUmkms(apiData);
                setDataSource('api');
            }
        });
    }, []);

    const filteredUmkms = umkms.filter(umkm => {
        const matchesFilter = (filter === 'Semua') ||
            (filter === 'Grade A' && umkm.grade === 'A') ||
            (filter === 'Grade B' && umkm.grade === 'B') ||
            (filter === 'Grade C' && umkm.grade === 'C') ||
            (umkm.category === filter);

        const matchesSearch = umkm.name.toLowerCase().includes(search.toLowerCase()) ||
            umkm.location.toLowerCase().includes(search.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    return (
        <div className="view" style={{ minHeight: '100vh', paddingBottom: 'var(--space-3xl)' }}>

            {/* Header Section */}
            <div style={{ background: '#fff', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-lg) var(--space-xl) var(--space-md)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)', marginBottom: 16 }}>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: 4 }}>UMKM Arena</h1>
                            <p className="text-muted" style={{ fontSize: '14px', maxWidth: 400 }}>UMKM terverifikasi yang sesuai dengan profil investasi Anda</p>
                        </div>
                        <div className="pill pill-pending" style={{ padding: '6px 16px', fontSize: '13px', flexShrink: 0 }}>
                            Status AI: Konservatif — Budi Santoso
                        </div>
                    </div>

                    {/* Tier banner — only shown to free users */}
                    {userTier !== 'premium' && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
                            background: '#FFF8E1', border: '1px solid #FF9800',
                            borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: '#F59E0B', strokeWidth: 2.5, flexShrink: 0 }}>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <span style={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>
                                    Anda menggunakan <strong>Free Tier</strong>. Upgrade ke Premium untuk akses Grade A dan B.
                                </span>
                            </div>
                            <button
                                onClick={() => navigate('/register')}
                                style={{ fontSize: 13, fontWeight: 700, color: '#FF9800', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', padding: 0 }}
                            >
                                Upgrade Sekarang →
                            </button>
                        </div>
                    )}
                    {/* Premium status indicator */}
                    {userTier === 'premium' && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: '#F0FDF4', border: '1px solid #A7F3D0',
                            borderRadius: 8, padding: '10px 16px', marginBottom: 16,
                        }}>
                            <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, fill: 'currentColor', color: '#00C853', flexShrink: 0 }}><path d="M2 20 L6 10 L12 14 L18 4 L22 20 Z" /></svg>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>Akses Premium Aktif — Semua grade UMKM tersedia untuk Anda.</span>
                        </div>
                    )}

                    {/* Search and Filters Row */}
                    <div
                        className="mobile-stack"
                        style={{ marginBottom: 'var(--space-xl)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <div className="mobile-full-width" style={{ position: 'relative', flex: 1, minWidth: 280 }}>
                            <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, fill: 'none', stroke: '#6B7280', strokeWidth: 2 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input
                                type="text"
                                placeholder="Cari nama UMKM, kota, atau kategori"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: '100%', height: 48, background: '#F3F4F6', border: '1px solid transparent', borderRadius: 12, padding: '0 16px 0 44px', fontSize: 14, transition: 'all 0.2s', outline: 'none' }}
                            />
                        </div>

                        <div className="mobile-full-width" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {['Semua', 'Grade A', 'Grade B', 'Grade C', 'Kuliner', 'Agrikultur', 'Kerajinan', 'Terfavorit'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '10px 18px',
                                        borderRadius: 99,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: filter === f ? 'var(--color-primary)' : '#fff',
                                        color: filter === f ? '#fff' : 'var(--color-text-sec)',
                                        boxShadow: filter === f ? '0 4px 12px rgba(30, 58, 95, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                                        border: filter === f ? 'none' : '1px solid var(--color-border)'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Education Gate Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#EEF4FF', borderLeft: '3px solid #1E3A5F', borderRadius: '0 8px 8px 0', padding: '10px 16px', marginBottom: 12 }}>
                        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: '#1E3A5F', strokeWidth: 2, flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        <span style={{ fontSize: '12px', color: '#1E3A5F', fontWeight: 500, flex: 1 }}>Akses UMKM Grade B dan C hanya tersedia setelah menyelesaikan modul edukasi yang relevan.</span>
                        <a href="#" style={{ fontSize: '12px', color: '#1E3A5F', fontWeight: 700, textDecoration: 'underline', whiteSpace: 'nowrap', flexShrink: 0 }}>Lihat kurikulum saya</a>
                    </div>

                </div>
            </div>

            {/* Card Grid */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-2xl) var(--space-xl)', paddingBottom: 80 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {filteredUmkms.map(umkm => (
                        <UmkmCard key={umkm.id} umkm={umkm} navigate={navigate} userTier={userTier} />
                    ))}
                </div>
            </div>
        </div>
    );
}

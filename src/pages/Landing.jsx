import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
    const observerRef = useRef(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        const observer = observerRef.current;
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="view">
            <div className="landing-hero" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '80px 5% 80px 5%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #F4F6F9 0%, #ffffff 100%)' }}>
                {/* Background blobs */}
                <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,58,95,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-15%', left: '5%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,83,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Label */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(30,58,95,0.07)', color: '#1E3A5F', fontSize: '13px', fontWeight: 600, padding: '6px 14px', borderRadius: '999px', width: 'fit-content', letterSpacing: '0.02em' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            Platform Terdepan di Indonesia
                        </div>

                        {/* Headline — one full line */}
                        <h1 style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.025em', color: '#1E3A5F', margin: 0, whiteSpace: 'nowrap' }}>
                            Ubah Literasi Keuangan Menjadi Dampak Nyata
                        </h1>

                        {/* Sub-headline */}
                        <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.6, margin: 0, maxWidth: 500 }}>
                            Belajar keuangan dengan AI personal, lalu danai UMKM lokal terverifikasi.
                            Transparan, terukur, dan berdampak nyata.
                        </p>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#1E3A5F', color: '#ffffff', fontWeight: 700, fontSize: '15px', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', transition: 'opacity 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                                onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                                Mulai Sekarang
                            </Link>
                            <Link to="/learn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1E3A5F', color: '#1E3A5F', fontWeight: 700, fontSize: '15px', padding: '12px 26px', borderRadius: '8px', textDecoration: 'none', background: 'transparent', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(30,58,95,0.05)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                Pelajari Lebih
                            </Link>
                        </div>

                        {/* Stats */}
                        <div style={{ paddingTop: '20px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>Proyeksi Tahun Pertama</div>
                            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                                <div style={{ position: 'relative', cursor: 'pointer' }} className="projection-trigger">
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E3A5F', lineHeight: 1.2 }}>12.500+</div>
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px', fontWeight: 500 }}>Pengguna</div>
                                    {/* Financial Projection Tooltip */}
                                    <div className="projection-card" style={{ position: 'absolute', bottom: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)', width: 260, background: '#1E3A5F', borderRadius: 8, padding: '16px 18px', boxShadow: '0 12px 32px rgba(0,0,0,0.25)', zIndex: 50, opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFD700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Proyeksi Tahun Pertama</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                            {[['GMV Target', 'Rp 1,25 Miliar'], ['Komisi 2%', 'Rp 25 Juta'], ['Langganan UMKM', 'Rp 90 Juta'], ['Total Revenue', 'Rp 115 Juta']].map(([l, v], i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}><span style={{ color: 'rgba(255,255,255,0.7)' }}>{l}</span><span style={{ color: '#fff', fontWeight: 700 }}>{v}</span></div>
                                            ))}
                                        </div>
                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '10px 0' }} />
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#6EE7B7' }}>Break-even: Tahun ke-2 (tim 4 orang)</div>
                                        <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 12, height: 12, background: '#1E3A5F' }} />
                                    </div>
                                </div>
                                <div style={{ width: 1, background: '#E5E7EB' }} />
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E3A5F', lineHeight: 1.2 }}>Rp 8,2M</div>
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px', fontWeight: 500 }}>Dana</div>
                                </div>
                                <div style={{ width: 1, background: '#E5E7EB' }} />
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E3A5F', lineHeight: 1.2 }}>340+</div>
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px', fontWeight: 500 }}>UMKM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible', paddingTop: '36px', paddingBottom: '36px', paddingLeft: '28px' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>

                            {/* Main dashboard card */}
                            <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(30,58,95,0.14), 0 4px 16px rgba(0,0,0,0.06)', padding: '24px', position: 'relative', zIndex: 2 }}>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, marginBottom: '2px' }}>Selamat datang,</div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B2A', whiteSpace: 'nowrap' }}>Budi Santoso</div>
                                    </div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', color: '#1E3A5F', fontSize: '11px', fontWeight: 700, padding: '5px 10px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1E3A5F', flexShrink: 0 }} />
                                        Level 4 Konservatif
                                    </div>
                                </div>

                                {/* Portfolio total */}
                                <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5284 100%)', borderRadius: '12px', padding: '18px 20px', marginBottom: '18px' }}>
                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '6px' }}>Total Portofolio</div>
                                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>Rp 15.750.000</div>
                                    <div style={{ fontSize: '12px', color: '#6EE7B7', fontWeight: 600, marginTop: '4px' }}>+3,2% bulan ini</div>
                                </div>

                                {/* UMKM mini list */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>UMKM Portofolio</div>

                                    {[
                                        { name: 'Kedai Kopi Senja', location: 'Yogyakarta', grade: 'A', gradeColor: '#16A34A', gradeBg: '#DCFCE7', pct: '95%' },
                                        { name: 'Tani Makmur Organik', location: 'Malang', grade: 'A', gradeColor: '#16A34A', gradeBg: '#DCFCE7', pct: '88%' },
                                        { name: 'Batik Cempaka', location: 'Solo', grade: 'B', gradeColor: '#1E3A5F', gradeBg: '#DBEAFE', pct: '82%' },
                                    ].map((u, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F9FAFB', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: '#374151' }}>{u.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B2A' }}>{u.name}</div>
                                                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>{u.location}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>{u.pct} cocok</div>
                                                <div style={{ background: u.gradeBg, color: u.gradeColor, fontWeight: 800, fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }}>Grade {u.grade}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Floating badge — top right: Verified Business */}
                            <div style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#ffffff', padding: '10px 16px', borderRadius: '999px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 3 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C853' }} />
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B2A' }}>Verified Business</div>
                            </div>

                            {/* Floating card — bottom left: growth */}
                            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', background: '#ffffff', padding: '14px 18px', borderRadius: '14px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 3 }}>
                                <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: '#16A34A', strokeWidth: 2.5 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>Pertumbuhan Omzet</div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#16A34A', lineHeight: 1.2 }}>+24.5%</div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Social Proof Bar */}
            <div style={{ background: '#fff', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '20px 5%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex' }}>
                            {['#1E3A5F', '#6366F1', '#00C853', '#F59E0B', '#EC4899'].map((c, i) => (
                                <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>{['BS', 'RW', 'DK', 'NF', 'AH'][i]}</div>
                            ))}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E3A5F' }}>Bergabung bersama 12.500+ investor Gen Z</span>
                    </div>
                    <div style={{ width: 1, height: 24, background: '#E2E8F0' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}><strong style={{ color: '#1E3A5F' }}>127</strong> UMKM aktif dari 17 kota di Indonesia</span>
                    <div style={{ width: 1, height: 24, background: '#E2E8F0' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}><strong style={{ color: '#1E3A5F' }}>Rp 8,2M</strong> tersalurkan sejak 2025</span>
                </div>
            </div>

            {/* Tooltip hover CSS */}
            <style>{`.projection-trigger:hover .projection-card { opacity: 1 !important; pointer-events: auto !important; }`}</style>

            <div style={{ padding: '80px 5%', background: '#fff' }}>
                {/* Section header */}
                <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 52px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1E3A5F', marginBottom: '14px', letterSpacing: '-0.02em' }}>Tiga Pilar Utama</h2>
                    <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.6, margin: 0 }}>Ekosistem terintegrasi yang menghubungkan edukasi, teknologi, dan dampak sosial dalam satu platform.</p>
                </div>

                {/* Three-column card grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: 1100, margin: '0 auto' }}>

                    {/* Card 1 — Pembelajaran AI Personal */}
                    <div
                        style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px 24px', transition: 'box-shadow 0.2s ease', boxShadow: 'none', cursor: 'default' }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 26, height: 26, fill: 'none', stroke: '#6366F1', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                        </div>
                        <div style={{ width: 32, height: 3, background: '#6366F1', borderRadius: 2, marginBottom: '12px' }} />
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1E3A5F', marginBottom: '10px', lineHeight: 1.3 }}>Pembelajaran AI Personal</h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>Kurikulum keuangan yang disesuaikan dengan profil risiko dan tingkat pemahaman Anda. Belajar lewat jalur interaktif bergaya gamifikasi dengan panduan AI.</p>
                    </div>

                    {/* Card 2 — Data Terverifikasi Transparan */}
                    <div
                        style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px 24px', transition: 'box-shadow 0.2s ease', boxShadow: 'none', cursor: 'default' }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 26, height: 26, fill: 'none', stroke: '#00C853', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <polyline points="9 12 11 14 15 10" />
                            </svg>
                        </div>
                        <div style={{ width: 32, height: 3, background: '#00C853', borderRadius: 2, marginBottom: '12px' }} />
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1E3A5F', marginBottom: '10px', lineHeight: 1.3 }}>Data Terverifikasi Transparan</h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>Seluruh data keuangan UMKM diverifikasi untuk transparansi penuh. Tidak ada manipulasi — hanya data akurat yang membangun kepercayaan investor.</p>
                    </div>

                    {/* Card 3 — Pendanaan Dampak UMKM */}
                    <div
                        style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px 24px', transition: 'box-shadow 0.2s ease', boxShadow: 'none', cursor: 'default' }}
                        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8EAF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 26, height: 26, fill: 'none', stroke: '#1E3A5F', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                <polyline points="17 6 23 6 23 12" />
                            </svg>
                        </div>
                        <div style={{ width: 32, height: 3, background: '#1E3A5F', borderRadius: 2, marginBottom: '12px' }} />
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1E3A5F', marginBottom: '10px', lineHeight: 1.3 }}>Pendanaan Dampak UMKM</h3>
                        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>Danai bisnis nyata di sekitar kita. Dapatkan potensi imbal hasil menarik via Revenue-Based Financing yang adil, terukur, dan berkelanjutan.</p>
                    </div>

                </div>
            </div>

            <div style={{ padding: 'var(--space-3xl) var(--space-2xl)', textAlign: 'center', background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-light) 100%)', color: '#000000ff' }}>
                <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, marginBottom: 'var(--space-md)' }}>Siap Memulai Perjalanan Finansialmu?</h2>
                <p style={{ fontSize: 'var(--font-lg)', opacity: 0.7, marginBottom: 'var(--space-xl)', maxWidth: 500, marginInline: 'auto' }}>Bergabung dengan 12.500+ pengguna yang telah meningkatkan literasi keuangan dan mendanai UMKM lokal.</p>
                <Link to="/dashboard" className="btn btn-primary btn-lg">Buat Akun Gratis</Link>
            </div>

            <style>{`
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: var(--space-xl) !important; }
        }
      `}</style>
        </div>
    );
}

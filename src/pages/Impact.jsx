import React, { useEffect } from 'react';
import nemosLogo from '../assets/NEMOS LOGO.png';

export default function Impact() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="view" style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 'var(--space-3xl)' }}>

            {/* 1. Header Section */}
            <div style={{ background: 'var(--color-primary)', color: '#fff', padding: 'var(--space-2xl) var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
                    <h1 className="page-title" style={{ color: '#fff', fontSize: '28px', marginBottom: 8 }}>Laporan Dampak Investasi</h1>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Kontribusi nyata Anda terhadap ekonomi lokal Indonesia</p>
                </div>
            </div>

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 var(--space-xl)' }}>

                {/* 2. Impact Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-accent)', lineHeight: 1, marginBottom: 8 }}>Rp 15,75<span style={{ fontSize: '20px' }}> Juta</span></div>
                        <div className="label-uppercase text-muted">Total Diinvestasikan</div>
                    </div>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: 8 }}>4 UMKM</div>
                        <div className="label-uppercase text-muted">Bisnis Didukung</div>
                    </div>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: 8 }}>12 Orang</div>
                        <div className="label-uppercase text-muted">Karyawan Lokal Terdampak</div>
                    </div>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-accent)', lineHeight: 1, marginBottom: 8 }}>Rp 369.500</div>
                        <div className="label-uppercase text-muted">Total Return Diterima</div>
                    </div>
                </div>

                {/* 3. SDG Tags Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', justifyContent: 'center', marginBottom: 'var(--space-3xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', background: '#fff', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-pri)' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-primary)' }}></div>
                        SDG 8: Pekerjaan Layak dan Pertumbuhan Ekonomi
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', background: '#fff', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-pri)' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-accent)' }}></div>
                        SDG 11: Kota dan Komunitas Berkelanjutan
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', background: '#fff', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-pri)' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--color-warning)' }}></div>
                        SDG 10: Berkurangnya Kesenjangan
                    </div>
                </div>

                {/* 4. Two Column Layout for Detail & Share */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2xl)' }}>

                    {/* LEFT: Per-UMKM Impact */}
                    <div style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                        <h2 className="section-title">Dampak per Portofolio</h2>

                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ position: 'relative', height: 160 }}>
                                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800" alt="Kedai Kopi" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg, #1a472a, #2d6a4f)'; }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.8), transparent)' }}></div>
                                <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 700 }}>Kedai Kopi Senja</div>
                                    <div style={{ fontSize: '13px', fontWeight: 500, opacity: 0.9 }}>Yogyakarta</div>
                                </div>
                            </div>
                            <div style={{ padding: 'var(--space-xl)' }}>
                                <p style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--color-text-pri)', paddingLeft: 16, borderLeft: '3px solid var(--color-primary)', marginBottom: 20 }}>
                                    "Pembelian mesin roasting membuat kami merekrut 2 pemuda desa tambahan untuk operasional harian."
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: 'var(--color-text-sec)' }}>Kontribusi Anda:</span>
                                        <span style={{ fontWeight: 600, color: 'var(--color-text-pri)' }}>Rp 5.000.000 (10% total)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: 'var(--color-text-sec)' }}>Return Diterima:</span>
                                        <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>Rp 87.500</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ position: 'relative', height: 160 }}>
                                <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800" alt="Tani Makmur" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg, #1a472a, #2d6a4f)'; }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,42,0.8), transparent)' }}></div>
                                <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 700 }}>Tani Makmur Organik</div>
                                    <div style={{ fontSize: '13px', fontWeight: 500, opacity: 0.9 }}>Malang</div>
                                </div>
                            </div>
                            <div style={{ padding: 'var(--space-xl)' }}>
                                <p style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--color-text-pri)', paddingLeft: 16, borderLeft: '3px solid var(--color-primary)', marginBottom: 20 }}>
                                    "Transisi ke pupuk non-kimia berhasil menyelamatkan ekosistem air di perairan desa kami."
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: 'var(--color-text-sec)' }}>Kontribusi Anda:</span>
                                        <span style={{ fontWeight: 600, color: 'var(--color-text-pri)' }}>Rp 1.500.000 (2% total)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: 'var(--color-text-sec)' }}>Return Diterima:</span>
                                        <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>Rp 12.000</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: Share Section */}
                    <div style={{ flex: '1 1 40%' }}>
                        <h2 className="section-title" style={{ marginBottom: 8 }}>Bagikan Laporan Dampak Anda</h2>
                        <p className="text-muted" style={{ fontSize: '14px', marginBottom: 'var(--space-xl)' }}>Ajak lebih banyak orang berinvestasi dengan dampak nyata</p>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {/* IG Story Card (390×844 ratio, displayed at 280×606) */}
                            <div style={{
                                position: 'relative', width: 280, height: 606,
                                borderRadius: 24, overflow: 'hidden',
                                background: 'linear-gradient(180deg, #1E3A5F 0%, #16305A 100%)',
                                boxShadow: '0 28px 56px rgba(30,58,95,0.45)',
                                marginBottom: 'var(--space-xl)',
                                display: 'flex', flexDirection: 'column',
                            }}>
                                {/* Dot texture */}
                                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                    <defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.03)" /></pattern></defs>
                                    <rect width="100%" height="100%" fill="url(#dots)" />
                                </svg>

                                {/* Content */}
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '32px 22px 26px' }}>

                                    {/* Header */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                <img src={nemosLogo} alt="NEMOS Logo" style={{ height: 20, width: 'auto', objectFit: 'contain' }} />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff, #A7F3D0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEMOS ID</span>
                                            </div>
                                        </div>
                                        <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.3)' }} />
                                    </div>

                                    {/* Headline */}
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.3, textAlign: 'center', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
                                        Saya telah mendanai 4 UMKM lokal Indonesia
                                    </h3>

                                    {/* Stats card */}
                                    <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: 16 }}>
                                        {/* Row 1 */}
                                        <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UMKM DIBANTU</span>
                                                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>4 Bisnis</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <div style={{ width: 40, height: 3, background: '#00C853', borderRadius: 2 }} />
                                            </div>
                                        </div>
                                        {/* Row 2 */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: 12 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KARYAWAN</span>
                                            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>12 Orang</span>
                                        </div>
                                        {/* Row 3 */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL RETURN</span>
                                            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Rp 369K</span>
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }} />

                                    {/* Footer */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>BS</div>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>@BudiSantoso</span>
                                        </div>
                                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.3px' }}>Mulai dampakkmu di nemos.id</span>
                                    </div>

                                </div>
                            </div>

                            <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <button className="btn btn-primary btn-block" style={{ height: 48, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                                    Bagikan ke Instagram Story
                                </button>
                                <button className="btn btn-secondary btn-block" style={{ height: 48, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    Simpan sebagai Gambar
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

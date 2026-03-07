import React, { useEffect } from 'react';

export default function Protection() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="view" style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 'var(--space-3xl)' }}>

            {/* 1. Header Section */}
            <div style={{ background: 'var(--color-primary)', color: '#fff', padding: 'var(--space-2xl) var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                    <h1 className="page-title" style={{ color: '#fff', fontSize: '28px', marginBottom: 8 }}>Transparansi dan Perlindungan Investasi</h1>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Komitmen NEMOS kepada setiap investor</p>
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 var(--space-xl)' }}>

                {/* 2. Trust Score Card */}
                <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
                    <div className="label-uppercase text-muted" style={{ marginBottom: 'var(--space-md)', letterSpacing: 1 }}>PLATFORM TRUST SCORE</div>
                    <div style={{ fontSize: '64px', fontWeight: 800, color: '#00C853', lineHeight: 1, marginBottom: 8 }}>98,2%</div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-pri)', fontWeight: 500, marginBottom: 'var(--space-md)' }}>tingkat pembayaran tepat waktu (2025—2026)</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Data real-time dari blockchain ledger</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, textAlign: 'left', maxWidth: 360, margin: '16px auto 0' }}>
                        {[
                            '3 UMKM terlambat 1 bulan — sudah terselesaikan',
                            '0 UMKM terlambat lebih dari 2 bulan',
                            '0 UMKM dalam proses mediasi',
                        ].map((t, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: '#00C853', strokeWidth: 2.5, flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                {t}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. UMKM Selection Process */}
                <div style={{ marginBottom: 'var(--space-3xl)' }}>
                    <h2 className="section-title" style={{ marginBottom: 'var(--space-xl)' }}>Proses Seleksi UMKM</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)' }}>

                        <div className="card" style={{ borderTop: '3px solid var(--color-primary)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '48px', fontWeight: 800, color: 'rgba(30,58,95,0.05)', lineHeight: 0.8, zIndex: 0 }}>01</div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'var(--color-primary)', strokeWidth: 2, marginBottom: 'var(--space-md)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 8 }}>Seleksi Ketat</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Hanya 12% pendaftar yang lolos berdasarkan histori kas dan prospek bisnis yang terverifikasi.</p>
                            </div>
                        </div>

                        <div className="card" style={{ borderTop: '3px solid #00C853', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '48px', fontWeight: 800, color: 'rgba(0,200,83,0.05)', lineHeight: 0.8, zIndex: 0 }}>02</div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: '#00C853', strokeWidth: 2, marginBottom: 'var(--space-md)' }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 8 }}>Verifikasi Blockchain</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Histori omzet 6 bulan diverifikasi dan dikunci on-chain. Data tidak dapat dimanipulasi pihak manapun.</p>
                            </div>
                        </div>

                        <div className="card" style={{ borderTop: '3px solid var(--color-warning)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 16, right: 16, fontSize: '48px', fontWeight: 800, color: 'rgba(245,124,0,0.05)', lineHeight: 0.8, zIndex: 0 }}>03</div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'var(--color-warning)', strokeWidth: 2, marginBottom: 'var(--space-md)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 8 }}>Smart Contract Aktif</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Pembayaran bagi hasil diproses otomatis tanpa intervensi manusia. Setiap transaksi tercatat di blockchain.</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 4. Default Scenarios Timeline */}
                <div style={{ marginBottom: 'var(--space-3xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-xl)' }}>
                        <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'var(--color-warning)', strokeWidth: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        <h2 className="section-title" style={{ margin: 0 }}>Prosedur Penanganan Keterlambatan</h2>
                    </div>

                    <div style={{ position: 'relative', paddingLeft: 32 }}>
                        <div style={{ position: 'absolute', top: 24, bottom: 24, left: 16, width: 2, background: 'var(--color-border)', transform: 'translateX(-50%)', zIndex: 0 }}></div>

                        <div style={{ display: 'flex', gap: 'var(--space-lg)', position: 'relative', zIndex: 1, marginBottom: 'var(--space-xl)' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, flexShrink: 0, marginLeft: -16, boxShadow: '0 0 0 4px var(--color-bg)' }}>1</div>
                            <div className="card" style={{ flex: 1, borderLeft: '3px solid var(--color-warning)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div className="label-uppercase text-muted" style={{ color: '#F57C00' }}>TERLAMBAT 1 BULAN</div>
                                    <div className="pill" style={{ background: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2', fontSize: '11px', padding: '4px 10px' }}>Amber — Monitor</div>
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 8 }}>Notifikasi Otomatis</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>Smart contract mendeteksi kegagalan dan mengirim notifikasi otomatis. Investor mendapat pembaruan status real-time di dashboard.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-lg)', position: 'relative', zIndex: 1, marginBottom: 'var(--space-xl)' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EF6C00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, flexShrink: 0, marginLeft: -16, boxShadow: '0 0 0 4px var(--color-bg)' }}>2</div>
                            <div className="card" style={{ flex: 1, borderLeft: '3px solid #EF6C00' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div className="label-uppercase text-muted" style={{ color: '#EF6C00' }}>TERLAMBAT 2 BULAN</div>
                                    <div className="pill" style={{ background: '#FFF3E0', color: '#E65100', border: '1px solid #FFE0B2', fontSize: '11px', padding: '4px 10px' }}>Orange — Intervensi</div>
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 8 }}>Tim NEMOS Turun Tangan</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>Tim lapangan NEMOS menghubungi dan mendatangi UMKM secara langsung untuk asesmen situasi bisnis dan penyusunan rencana pembayaran darurat.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-lg)', position: 'relative', zIndex: 1 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, flexShrink: 0, marginLeft: -16, boxShadow: '0 0 0 4px var(--color-bg)' }}>3</div>
                            <div className="card" style={{ flex: 1, borderLeft: '3px solid var(--color-red)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div className="label-uppercase text-muted" style={{ color: 'var(--color-red)' }}>TERLAMBAT 3+ BULAN</div>
                                    <div className="pill" style={{ background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', fontSize: '11px', padding: '4px 10px' }}>Red — Eskalasi</div>
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 8 }}>Proses Mediasi dan Restrukturisasi</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>NEMOS memfasilitasi mediasi legal antara UMKM dan kolektif investor. Opsi restrukturisasi atau perpanjangan tenor ditawarkan sebagai solusi sebelum eskalasi lebih lanjut.</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 5. Risk Disclaimer */}
                <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '8px', padding: 'var(--space-lg)', marginBottom: 'var(--space-3xl)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: '#F57C00', strokeWidth: 2, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F57C00', marginBottom: 8 }}>Yang Perlu Anda Ketahui</h3>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-pri)', lineHeight: 1.6, marginBottom: 12 }}>Investasi di NEMOS mengandung risiko. NEMOS bukan lembaga penyimpan dana (bank) dan tidak menjamin return pasti. Investasikan hanya dana yang Anda siapkan untuk jangka waktu tertentu.</p>
                        <a href="#" style={{ fontSize: '14px', color: '#F57C00', fontWeight: 600, textDecoration: 'underline' }}>Pelajari lebih lanjut tentang risiko</a>
                    </div>
                </div>

                {/* 6. Platform Stats */}
                <div>
                    <h2 className="section-title" style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>Dampak Berkelanjutan NEMOS</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>

                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4 }}>127 UMKM</div>
                            <div className="label-uppercase text-muted">Aktif Terdanai</div>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4 }}>Rp 8,2 M</div>
                            <div className="label-uppercase text-muted">Total Dana Tersalurkan</div>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#00C853', marginBottom: 4 }}>98,2%</div>
                            <div className="label-uppercase text-muted">Tingkat Bayar Tepat Waktu</div>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4 }}>340+</div>
                            <div className="label-uppercase text-muted">Investor Aktif</div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

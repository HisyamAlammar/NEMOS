import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import nemosLogo from '../assets/NEMOS LOGO.png';

export default function UmkmDashboard() {
    const navigate = useNavigate();
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="view" style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingBottom: 'var(--space-3xl)' }}>

            {/* 1. Header Section */}
            <div style={{ background: 'linear-gradient(90deg, #00C853 0%, #00A040 100%)', padding: '12px var(--space-xl)', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <div style={{ width: 36, height: 36, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <img src={nemosLogo} alt="NEMOS Logo" style={{ height: 24, width: 'auto', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #fff, #A7F3D0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEMOS</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--color-warning)', borderRadius: '50%', border: '2px solid #00A040' }}></div>
                        </button>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', color: '#00A040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', border: '2px solid rgba(255,255,255,0.5)' }}>S</div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-2xl) var(--space-xl)' }}>

                {/* 2. Hero Section */}
                <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                        <div style={{ position: 'relative' }}>
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150" alt="Ibu Sari" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, background: 'var(--color-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: '#00C853', stroke: 'none' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 2 }}>Selamat datang, Bu Sari</h1>
                            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: 6 }}>Dapur Nusantara</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '13px', color: 'var(--color-text-sec)', fontWeight: 500 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                Bandung, Jawa Barat
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2xl)' }}>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-pri)' }}>127</div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Investor</div>
                        </div>
                        <div style={{ width: 1, background: 'var(--color-border)' }}></div>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#00C853' }}>75%</div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Terkumpul</div>
                        </div>
                        <div style={{ width: 1, background: 'var(--color-border)' }}></div>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-pri)' }}>3 Bln</div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Aktif</div>
                        </div>
                    </div>
                </div>

                {/* 3. Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>

                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>

                        {/* Funding Status */}
                        <div className="card">
                            <div className="label-uppercase text-muted" style={{ letterSpacing: 1, marginBottom: 'var(--space-xl)' }}>STATUS PENDANAAN AKTIF</div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ position: 'relative', width: 160, height: 160, borderRadius: '50%', background: 'conic-gradient(#00C853 0% 75%, var(--color-border) 75% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: 136, height: 136, background: '#fff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-pri)', lineHeight: 1 }}>75%</div>
                                        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: 4 }}>Terkumpul</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-pri)' }}>Rp 37.500.000</div>
                                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>dari Rp 50.000.000</div>
                            </div>

                            <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ width: '75%', height: '100%', background: '#00C853', borderRadius: 4 }}></div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                                <div style={{ display: 'flex' }}>
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-border)', border: '2px solid #fff', marginLeft: i > 1 ? -10 : 0, zIndex: 10 - i, overflow: 'hidden' }}>
                                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Investor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-bg)', border: '2px solid #fff', marginLeft: -10, zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                        +121
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Mendukung Anda</div>
                            </div>
                        </div>

                        {/* Investor Community Card */}
                        <div className="card" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px' }}>
                            <div style={{ fontSize: '48px', fontWeight: 800, color: '#00C853', lineHeight: 1, marginBottom: 8 }}>127</div>
                            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-pri)', marginBottom: 'var(--space-xl)' }}>investor mempercayai usaha Anda</div>

                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #F0FDF4', marginLeft: i > 1 ? -12 : 0, zIndex: 10 - i, overflow: 'hidden' }}>
                                        <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="Investor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>

                            <p style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: 300 }}>
                                "Mereka percaya pada visi Anda. Terus pertahankan kinerja terbaik."
                            </p>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>

                        {/* 1. Omzet Terdeteksi Otomatis */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <h2 className="card-title" style={{ margin: 0 }}>Transaksi Bulan Ini</h2>
                                <div className="pill" style={{ background: '#E8F5E9', color: '#1B5E20', border: '1px solid #A5D6A7' }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                    Terdeteksi via Payment Gateway
                                </div>
                            </div>

                            {/* Automation sub-header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: '#00C853', strokeWidth: 2.5 }}><polyline points="20 6 9 17 4 12" /></svg>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#00C853' }}>Terdeteksi Otomatis — Tidak Perlu Input Manual</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'var(--space-xl)' }}>
                                {/* Row 1 */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-pri)' }}>QRIS — Pelanggan</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>15 Mar 2026</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Rp 850.000</div>
                                        <div className="label-uppercase font-bold" style={{ background: '#E8F5E9', color: '#00C853', padding: '4px 8px', borderRadius: 4 }}>Terverifikasi</div>
                                    </div>
                                </div>
                                {/* Row 2 */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-pri)' }}>Transfer Bank — Reseller</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>12 Mar 2026</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Rp 2.400.000</div>
                                        <div className="label-uppercase font-bold" style={{ background: '#E8F5E9', color: '#00C853', padding: '4px 8px', borderRadius: 4 }}>Terverifikasi</div>
                                    </div>
                                </div>
                                {/* Row 3 */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-pri)' }}>QRIS — Pelanggan</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>08 Mar 2026</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Rp 650.000</div>
                                        <div className="label-uppercase font-bold" style={{ background: '#E8F5E9', color: '#00C853', padding: '4px 8px', borderRadius: 4 }}>Terverifikasi</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#F0FDF4', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: '#00C853', strokeWidth: 2 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#00C853' }}>Total Terdeteksi: Rp 4.400.000</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E3A5F', marginBottom: 8 }}>
                                Potongan RBF bulan ini: Rp 220.000 (5%)
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                Data dikunci ke blockchain 31 Maret 2026
                            </div>
                        </div>

                        {/* 2. Rekonsiliasi Transaksi Cash */}
                        <div className="card">
                            <h2 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Transaksi Tunai Belum Tercatat</h2>

                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-xl)' }}>
                                <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: '#F57C00', strokeWidth: 2, flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                <div style={{ fontSize: '13px', color: '#E65100', lineHeight: 1.5, fontWeight: 500 }}>
                                    Transaksi cash tidak terdeteksi otomatis. Input di bawah akan diverifikasi silang dengan laporan penjualan sebelum dikunci.
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-xl)' }}>
                                <div style={{ flex: 1 }}>
                                    <select style={{ width: '100%', height: 44, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-pri)', outline: 'none' }}>
                                        <option value="">Kategori Transaksi</option>
                                        <option value="langsung">Penjualan Langsung</option>
                                        <option value="event">Event/Bazar</option>
                                        <option value="khusus">Pesanan Khusus</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Rp</div>
                                    <input type="text" placeholder="0" style={{ width: '100%', height: 44, padding: '0 16px 0 48px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text-pri)', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '0 12px', fontSize: '14px' }}>Simpan Draft</button>
                                <button className="btn" style={{ flex: 1, padding: '0 12px', fontSize: '14px', background: '#1E3A5F', color: '#fff', border: 'none' }}>Ajukan untuk Diverifikasi</button>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                Tim NEMOS akan memverifikasi data cash dalam 1x24 jam sebelum dikunci ke blockchain.
                            </div>
                        </div>

                        {/* 3. TOTAL OMZET SECTION */}
                        <div className="card" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                            <div className="label-uppercase text-muted" style={{ marginBottom: 4 }}>TOTAL OMZET BULAN INI (ESTIMASI)</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-pri)' }}>Rp 4.400.000+</div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>Akan difinalisasi setelah verifikasi cash selesai</div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid rgba(0,200,83,0.2)' }}>
                                <span style={{ fontSize: '15px', color: '#1B5E20', fontWeight: 500 }}>Potongan RBF (estimasi):</span>
                                <span style={{ fontSize: '18px', fontWeight: 700, color: '#00C853' }}>Rp 220.000 <span style={{ fontSize: '14px', fontWeight: 600 }}>(5%)</span></span>
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="card">
                            <h2 className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>Histori Pembayaran</h2>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {[
                                    { month: 'Feb 2026', amount: 'Rp 2.400.000' },
                                    { month: 'Jan 2026', amount: 'Rp 2.150.000' },
                                    { month: 'Des 2025', amount: 'Rp 1.950.000' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-pri)' }}>{item.month}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>{item.amount}</span>
                                            <div className="pill pill-confirmed" style={{ padding: '4px 10px', fontSize: '11px' }}>Confirmed</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

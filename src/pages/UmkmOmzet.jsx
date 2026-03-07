import React, { useState, useEffect } from 'react';

const transactions = [
    { id: 1, method: 'qris', label: 'QRIS — Pelanggan', date: '15 Mar 2026', amount: 850000 },
    { id: 2, method: 'bank', label: 'Transfer Bank — Reseller', date: '12 Mar 2026', amount: 2400000 },
    { id: 3, method: 'qris', label: 'QRIS — Pelanggan', date: '08 Mar 2026', amount: 650000 },
    { id: 4, method: 'bank', label: 'Transfer Bank — Grosir', date: '03 Mar 2026', amount: 500000 },
];

const totalDigital = transactions.reduce((s, t) => s + t.amount, 0);
const rbf = Math.round(totalDigital * 0.05);

function formatRp(n) {
    return 'Rp ' + n.toLocaleString('id-ID');
}

function QrisIcon() {
    return (
        <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: '#00C853', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        </div>
    );
}

function BankIcon() {
    return (
        <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: '#6366F1', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <polyline points="3 6 12 2 21 6" />
                <path d="M3 6v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6" />
                <line x1="12" y1="6" x2="12" y2="21" />
                <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
        </div>
    );
}

export default function UmkmOmzet() {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const [cashAmount, setCashAmount] = useState('');
    const [cashCategory, setCashCategory] = useState('');

    return (
        <div style={{ background: '#F4F6F9', minHeight: '100vh', paddingBottom: 60 }}>

            {/* ── Page Header ── */}
            <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '28px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1E3A5F', margin: 0, lineHeight: 1.2 }}>Omzet Saya</h1>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: '6px 0 0' }}>Rekap omzet terverifikasi dan rekonsiliasi transaksi tunai</p>
                </div>
                <select defaultValue="maret-2026" style={{ height: 40, padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#1E3A5F', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                    <option value="maret-2026">Maret 2026</option>
                    <option value="februari-2026">Februari 2026</option>
                    <option value="januari-2026">Januari 2026</option>
                </select>
            </div>

            <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* ── SECTION 1: Ringkasan Bulan Ini ── */}
                <section>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '14px' }}>Ringkasan Bulan Ini</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>

                        {/* Card 1 */}
                        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px 24px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Omzet Digital</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#00C853', lineHeight: 1.2, marginBottom: '4px' }}>{formatRp(totalDigital)}</div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>Terdeteksi otomatis</div>
                        </div>

                        {/* Card 2 */}
                        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px 24px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Omzet Cash</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FF9800', lineHeight: 1.2, marginBottom: '4px' }}>Rp 0</div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>Menunggu verifikasi</div>
                        </div>

                        {/* Card 3 */}
                        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px 24px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Potongan RBF Bulan Ini</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E3A5F', lineHeight: 1.2, marginBottom: '4px' }}>{formatRp(rbf)} <span style={{ fontSize: '14px', fontWeight: 600 }}>(5%)</span></div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>Otomatis dipotong akhir bulan</div>
                        </div>

                    </div>
                </section>

                {/* ── SECTION 2: Transaksi Terdeteksi ── */}
                <section style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>

                    {/* Section header */}
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A5F', margin: 0 }}>Transaksi Terdeteksi Otomatis</h2>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #00C853', color: '#00C853', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }}>
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            Terdeteksi via Payment Gateway
                        </div>
                    </div>

                    {/* Transaction list */}
                    <div style={{ padding: '0 8px' }}>
                        {transactions.map((tx, i) => (
                            <div
                                key={tx.id}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < transactions.length - 1 ? '1px solid #F3F4F6' : 'none', gap: 12 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    {tx.method === 'qris' ? <QrisIcon /> : <BankIcon />}
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0D1B2A' }}>{tx.label}</div>
                                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{tx.date}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0D1B2A' }}>{formatRp(tx.amount)}</div>
                                    <div style={{ background: '#E8F5E9', color: '#16A34A', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.04em' }}>TERVERIFIKASI</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Section footer */}
                    <div style={{ background: '#F0FDF4', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#00C853' }}>Total Terdeteksi: {formatRp(totalDigital)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: '#9CA3AF', strokeWidth: 2 }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Dikunci ke blockchain akhir bulan
                        </div>
                    </div>

                </section>

                {/* ── Verification Timeline ── */}
                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 28px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Alur Verifikasi Omzet</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {[
                            { icon: <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>, label: 'Payment Gateway', done: true },
                            { icon: <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, label: 'NEMOS Escrow', done: true },
                            { icon: <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, label: 'Blockchain Lock', done: false, active: true },
                            { icon: <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>, label: 'RBF Deduction', done: false },
                        ].map((step, i, arr) => (
                            <React.Fragment key={i}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: step.done ? '#E8F5E9' : step.active ? '#E8F5E9' : '#F3F4F6',
                                        color: step.done ? '#00C853' : step.active ? '#00C853' : '#9CA3AF',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: step.active ? '2px solid #00C853' : '1px solid transparent',
                                        animation: step.active ? 'pulse 2s infinite' : 'none',
                                    }}>{step.icon}</div>
                                    <span style={{ fontSize: '10px', fontWeight: 700, color: step.done || step.active ? '#1E3A5F' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', maxWidth: 80 }}>{step.label}</span>
                                </div>
                                {i < arr.length - 1 && (
                                    <div style={{ flex: 1, height: 2, background: step.done ? '#00C853' : '#E5E7EB', margin: '0 4px', marginBottom: 20, borderRadius: 1 }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,200,83,0.3)} 50%{box-shadow:0 0 0 6px rgba(0,200,83,0)} }`}</style>
                </div>

                {/* ── SECTION 3: Rekonsiliasi Cash ── */}
                <section style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>

                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A5F', margin: 0 }}>Rekonsiliasi Cash</h2>
                        <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0' }}>Transaksi Tunai Belum Tercatat</p>
                    </div>

                    <div style={{ padding: '24px' }}>

                        {/* Warning banner */}
                        <div style={{ background: '#FFF8E1', borderLeft: '4px solid #FF9800', borderRadius: '0 8px 8px 0', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: '#F59E0B', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0, marginTop: 1 }}>
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <p style={{ fontSize: '13px', color: '#92400E', margin: 0, lineHeight: 1.6 }}>
                                Transaksi cash tidak terdeteksi otomatis. Input di bawah akan diverifikasi silang dengan laporan penjualan sebelum dikunci.
                            </p>
                        </div>

                        {/* Form — two columns */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Kategori Transaksi</label>
                                <select
                                    value={cashCategory}
                                    onChange={e => setCashCategory(e.target.value)}
                                    style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: cashCategory ? '#0D1B2A' : '#9CA3AF', background: '#fff', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="" disabled>Pilih kategori...</option>
                                    <option value="penjualan-langsung">Penjualan Langsung</option>
                                    <option value="bazar">Bazar / Event</option>
                                    <option value="grosir">Penjualan Grosir</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Jumlah Transaksi</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9CA3AF', fontWeight: 500, pointerEvents: 'none' }}>Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={cashAmount}
                                        onChange={e => setCashAmount(e.target.value)}
                                        style={{ width: '100%', height: '44px', padding: '0 14px 0 36px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#0D1B2A', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            <button
                                style={{ height: 44, padding: '0 24px', border: '2px solid #00C853', color: '#00C853', background: 'transparent', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,200,83,0.05)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                                Simpan Draft
                            </button>
                            <button
                                style={{ height: 44, padding: '0 24px', border: 'none', color: '#fff', background: '#1E3A5F', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                                onMouseOut={e => e.currentTarget.style.opacity = '1'}
                            >
                                Ajukan untuk Diverifikasi
                            </button>
                        </div>

                        {/* Disclaimer note */}
                        <p style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                            Tim NEMOS akan memverifikasi data cash dalam 1x24 jam sebelum dikunci ke blockchain.
                        </p>

                    </div>
                </section>

            </div>
        </div>
    );
}

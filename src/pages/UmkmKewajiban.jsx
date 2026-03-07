import React, { useEffect, useState } from 'react';

const histori = [
    { periode: 'Feb 2026', omzet: 2400000, potongan: 120000, status: 'Confirmed', hash: '0xA1b2...C3d4' },
    { periode: 'Jan 2026', omzet: 2150000, potongan: 107500, status: 'Confirmed', hash: '0xB2c3...D4e5' },
    { periode: 'Des 2025', omzet: 1950000, potongan: 97500, status: 'Confirmed', hash: '0xC3d4...E5f6' },
];

function formatRp(n) {
    return 'Rp ' + n.toLocaleString('id-ID');
}

// Simple SVG donut chart
function DonutChart({ pct = 75, size = 96, stroke = 10 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const filled = (pct / 100) * circ;
    const cx = size / 2;
    const cy = size / 2;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
            <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke="#00C853"
                strokeWidth={stroke}
                strokeDasharray={`${filled} ${circ}`}
                strokeLinecap="round"
            />
        </svg>
    );
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button
            onClick={handleCopy}
            title="Salin TX Hash"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: copied ? '#00C853' : '#9CA3AF', display: 'inline-flex', alignItems: 'center', transition: 'color 0.15s' }}
        >
            {copied ? (
                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }}><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            )}
        </button>
    );
}

export default function UmkmKewajiban() {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const isPending = true; // bulan ini masih pending

    return (
        <div style={{ background: '#F4F6F9', minHeight: '100vh', paddingBottom: 60 }}>

            {/* ── Page Header ── */}
            <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '28px 32px 22px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1E3A5F', margin: 0, lineHeight: 1.2 }}>Kewajiban Pembayaran</h1>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '6px 0 0' }}>Jadwal dan histori pembayaran RBF kepada investor</p>
            </div>

            <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* ── SECTION 1: Status Pembayaran Bulan Ini ── */}
                <section>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>Status Pembayaran Bulan Ini</h2>

                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>

                        {/* Main card — two-column */}
                        <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'center' }}>

                            {/* Left column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Jatuh Tempo</div>
                                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#0D1B2A', letterSpacing: '-0.01em' }}>31 Maret 2026</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Estimasi Potongan RBF</div>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#00C853' }}>Rp 220.000</div>
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: 3 }}>5% dari Rp 4.400.000 omzet terdeteksi bulan ini</div>
                                </div>
                            </div>

                            {/* Right column — donut */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                <div style={{ position: 'relative' }}>
                                    <DonutChart pct={75} size={96} stroke={9} />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#1E3A5F', lineHeight: 1 }}>75%</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>75% bulan berjalan</div>
                                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: 2 }}>Berdasarkan omzet terdeteksi</div>
                                </div>
                            </div>
                        </div>

                        {/* Status banner */}
                        <div style={{
                            padding: '12px 32px',
                            background: isPending ? '#FFF8E1' : '#E8F5E9',
                            borderTop: '1px solid #E5E7EB',
                            display: 'flex', alignItems: 'center', gap: 10
                        }}>
                            {isPending ? (
                                <>
                                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: '#F59E0B', strokeWidth: 2, flexShrink: 0 }}>
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400E' }}>Menunggu finalisasi omzet — potongan akan dikunci 31 Maret 2026</span>
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: '#16A34A', strokeWidth: 2.5, flexShrink: 0 }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>Pembayaran bulan ini lunas</span>
                                </>
                            )}
                        </div>

                    </div>
                </section>

                {/* ── Platform Stats Bar ── */}
                <div style={{ background: '#1E3A5F', borderRadius: 10, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: '#fff', strokeWidth: 2, flexShrink: 0 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>98,2% tingkat pembayaran tepat waktu di seluruh platform NEMOS</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>Dapur Nusantara: 3/3 bulan tepat waktu</div>
                    </div>
                </div>

                {/* ── SECTION 2: Histori Pembayaran ── */}
                <section>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>Histori Pembayaran</h2>

                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>

                        {/* Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                        {['Periode', 'Omzet', 'Potongan RBF', 'Status', 'TX Hash'].map(col => (
                                            <th key={col} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {histori.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: i < histori.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.15s' }}
                                            onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '16px 20px', fontWeight: 600, color: '#0D1B2A', whiteSpace: 'nowrap' }}>{row.periode}</td>
                                            <td style={{ padding: '16px 20px', color: '#374151' }}>{formatRp(row.omzet)}</td>
                                            <td style={{ padding: '16px 20px', fontWeight: 600, color: '#1E3A5F' }}>{formatRp(row.potongan)}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                                                    Confirmed
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <code style={{ fontSize: '12px', color: '#6366F1', fontFamily: 'monospace', background: '#EEF2FF', padding: '3px 8px', borderRadius: '5px' }}>{row.hash}</code>
                                                    <CopyButton text={row.hash} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Table note */}
                        <div style={{ padding: '14px 20px', borderTop: '1px solid #F3F4F6', background: '#FAFAFA' }}>
                            <p style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                                Semua pembayaran tercatat permanen di blockchain dan tidak dapat diubah oleh pihak manapun.
                            </p>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    );
}

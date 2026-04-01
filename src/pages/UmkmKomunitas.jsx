import React, { useEffect, useState } from 'react';
import Toast, { useToast } from '../components/Toast';

const investors = [
    { initials: 'BS', name: '@BudiSantoso', label: 'Investor Aktif', amount: 1500000, date: '12 Jan 2026', color: '#1E3A5F' },
    { initials: 'RW', name: '@RahmaW', label: 'Investor Pemula', amount: 750000, date: '18 Jan 2026', color: '#6366F1' },
    { initials: 'DK', name: '@DimasDK', label: 'Investor Aktif', amount: 2000000, date: '05 Feb 2026', color: '#0D5F2E' },
    { initials: 'NF', name: '@NurFadhilah', label: 'Investor Pemula', amount: 500000, date: '14 Feb 2026', color: '#7C3AED' },
    { initials: 'AH', name: '@AnggaHutama', label: 'Investor Aktif', amount: 1250000, date: '27 Feb 2026', color: '#B45309' },
];

// Placeholder avatar colors for the overlap row
const overlapColors = ['#1E3A5F', '#6366F1', '#00C853', '#7C3AED', '#F59E0B', '#374151'];
const overlapInitials = ['BS', 'RW', 'DK', 'NF', 'AH', 'SR'];

function formatRp(n) {
    return 'Rp ' + n.toLocaleString('id-ID');
}

export default function UmkmKomunitas() {
    useEffect(() => { window.scrollTo(0, 0); }, []);
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [sentMessages, setSentMessages] = useState([]);
    const { toast, showToast } = useToast();

    const handleSend = () => {
        if (!message.trim()) return;
        const newMsg = {
            text: message.trim(),
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            views: Math.floor(80 + Math.random() * 47),
        };
        setSentMessages(prev => [newMsg, ...prev]);
        setSent(true);
        setMessage('');
        showToast(`Update berhasil dikirim ke 127 investor!`, 'success');
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <div style={{ background: '#F4F6F9', minHeight: '100vh', paddingBottom: 60 }}>

            {/* ── Page Header ── */}
            <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '28px 32px 22px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1E3A5F', margin: 0, lineHeight: 1.2 }}>Komunitas Investor Anda</h1>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '6px 0 0' }}>127 investor mempercayai Dapur Nusantara</p>
            </div>

            <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* ── SECTION 1: Ringkasan Dukungan ── */}
                <section>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>Ringkasan Dukungan</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>

                        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E3A5F', lineHeight: 1.2, marginBottom: 4 }}>127</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Total Pendukung</div>
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#00C853', lineHeight: 1.2, marginBottom: 4 }}>75%</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Pendanaan Terkumpul</div>
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E3A5F', lineHeight: 1.2, marginBottom: 4 }}>Rp 37.500.000</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>dari target Rp 50.000.000</div>
                        </div>

                    </div>
                </section>

                {/* ── SECTION 2: Daftar Investor ── */}
                <section>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>Daftar Investor</h2>
                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                        {investors.map((inv, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 20px',
                                    borderBottom: i < investors.length - 1 ? '1px solid #F3F4F6' : 'none',
                                    gap: 12, transition: 'background 0.15s',
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#FAFAFA'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Left: avatar + name + badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        background: inv.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                                    }}>
                                        {inv.initials}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A' }}>{inv.name}</span>
                                            <span style={{
                                                fontSize: 11, fontWeight: 600, color: '#6B7280',
                                                background: '#F3F4F6', padding: '2px 8px', borderRadius: 999,
                                            }}>{inv.label}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Bergabung {inv.date}</div>
                                    </div>
                                </div>

                                {/* Right: amount */}
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#1E3A5F', flexShrink: 0 }}>
                                    {formatRp(inv.amount)}
                                </div>
                            </div>
                        ))}

                        {/* Show more note */}
                        <div style={{ padding: '12px 20px', background: '#FAFAFA', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
                            <span style={{ fontSize: 13, color: '#9CA3AF' }}>+122 investor lainnya tidak ditampilkan</span>
                        </div>
                    </div>
                </section>

                {/* ── SECTION 3: Pesan Motivasi ── */}
                <section>
                    <div style={{
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderLeft: '4px solid #00C853',
                        borderRadius: '0 12px 12px 0',
                        padding: '24px 28px',
                    }}>
                        <p style={{ fontSize: '15px', fontStyle: 'italic', color: '#166534', lineHeight: 1.7, margin: '0 0 18px', fontWeight: 500 }}>
                            "Mereka percaya pada visi Anda. Terus pertahankan kinerja terbaik."
                        </p>

                        {/* Overlapping avatar row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'flex' }}>
                                {overlapColors.map((color, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: color,
                                            border: '2px solid #F0FDF4',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: 9, fontWeight: 700,
                                            marginLeft: i === 0 ? 0 : -8,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {overlapInitials[i]}
                                    </div>
                                ))}
                            </div>
                            <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>+121 investor lainnya</span>
                        </div>
                    </div>
                </section>

                {/* ── SECTION 4: Broadcast Pesan ── */}
                <section>
                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '24px 28px' }}>
                        <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#1E3A5F', marginBottom: 12 }}>
                            Kirim Update ke Investor
                        </label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Bagikan perkembangan usaha Anda..."
                            rows={4}
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                padding: '12px 14px',
                                border: '1px solid #E5E7EB',
                                borderRadius: 8,
                                fontSize: 14, color: '#0D1B2A',
                                resize: 'vertical', outline: 'none',
                                lineHeight: 1.6, fontFamily: 'inherit',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = '#00C853'}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                            <button
                                onClick={handleSend}
                                style={{
                                    height: 44, padding: '0 28px',
                                    background: sent ? '#22C55E' : '#00C853',
                                    color: '#fff', border: 'none',
                                    borderRadius: 8, fontSize: 14, fontWeight: 700,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseOver={e => { if (!sent) e.currentTarget.style.opacity = '0.88'; }}
                                onMouseOut={e => e.currentTarget.style.opacity = '1'}
                            >
                                {sent ? 'Update Terkirim!' : 'Kirim Update'}
                            </button>
                            {sent && (
                                <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>
                                    Pesan Anda berhasil dikirim ke semua investor.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Newly Sent Updates [P2-NEW-02] */}
                    {sentMessages.map((msg, i) => (
                        <div key={i} style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '20px 24px', marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A5F' }}>Update — {msg.date} {msg.time}</span>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#00C853', background: '#E8F5E9', padding: '3px 10px', borderRadius: 6 }}>Baru Terkirim</span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: '0 0 14px' }}>{msg.text}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#9CA3AF' }}>
                                <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                Dilihat oleh {msg.views} investor
                            </div>
                        </div>
                    ))}

                    {/* Previous Update Card */}
                    <div style={{ background: '#F8FAFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px', marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A5F' }}>Update terakhir — 28 Feb 2026</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#00C853', background: '#E8F5E9', padding: '3px 10px', borderRadius: 6 }}>Terkirim</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: '0 0 14px' }}>
                            Alhamdulillah omzet Februari meningkat karena launching menu baru. Terima kasih atas kepercayaan 127 investor!
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#9CA3AF' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            Dilihat oleh 89 investor
                        </div>
                    </div>
                </section>

            </div>

            {/* Toast Notification */}
            <Toast {...toast} />
        </div>
    );
}

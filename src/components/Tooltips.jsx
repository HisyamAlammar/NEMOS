import React, { useState } from 'react';

export const RBFTooltip = () => {
    const [open, setOpen] = useState(false);

    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'var(--color-text-sec)', fill: 'none', strokeWidth: 2, cursor: 'help' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>

            {open && (
                <div style={{
                    position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
                    width: 260, background: 'var(--color-primary)', color: '#fff',
                    padding: 'var(--space-md)', borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)', zIndex: 100, fontSize: 'var(--font-xs)',
                    pointerEvents: 'none'
                }}>
                    <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: 'var(--font-sm)' }}>Apa itu Revenue-Based Financing?</div>
                    <ul style={{ paddingLeft: '16px', margin: 0, listStyle: 'disc' }}>
                        <li style={{ marginBottom: 4 }}>Bagi hasil diambil sekian % dari omzet bulanan kotor.</li>
                        <li style={{ marginBottom: 4 }}>Bukan bunga tetap (ribawi), sehingga lebih adil untuk UMKM.</li>
                        <li>Saat omzet turun, setoran turun. Saat omzet naik, peluang return lebih cepat.</li>
                    </ul>
                    <div style={{ color: 'var(--color-accent)', fontWeight: 600, marginTop: '8px' }}>Pelajari lebih lanjut di AI Learn Hub →</div>

                    <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 12, height: 12, background: 'var(--color-primary)' }}></div>
                </div>
            )}
        </div>
    );
};

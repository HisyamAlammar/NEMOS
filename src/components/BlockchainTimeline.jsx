import React from 'react';

export const BlockchainTimeline = () => {
    const steps = [
        { label: 'Omzet Direkam', status: 'completed', icon: <path d="M18 20V10M12 20V4M6 20v-4" /> },
        { label: 'Diverifikasi', status: 'completed', icon: <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" /> },
        { label: 'Masuk Blockchain', status: 'completed', icon: <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /> },
        { label: 'Smart Contract Aktif', status: 'current', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
        { label: 'Payout Otomatis', status: 'future', icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> }
    ];

    return (
        <div className="card" style={{ background: 'var(--color-card)', padding: 'var(--space-lg)', overflowX: 'auto' }}>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
                Bagaimana Uangmu Dilindungi
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', minWidth: 500, paddingTop: '10px' }}>
                {steps.map((step, index) => {
                    const isCompleted = step.status === 'completed';
                    const isCurrent = step.status === 'current';
                    const isFuture = step.status === 'future';

                    return (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1 }}>

                            {/* Connecting Line */}
                            {index < steps.length - 1 && (
                                <div style={{ position: 'absolute', top: 16, left: '50%', width: '100%', borderTop: `2px ${isCompleted ? 'solid' : 'dashed'} ${isCompleted ? 'var(--color-accent)' : 'var(--color-border)'}`, zIndex: 0 }}></div>
                            )}

                            {/* Step Circle */}
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1,
                                background: isCompleted ? 'var(--color-accent)' : isCurrent ? 'var(--color-primary)' : '#fff',
                                color: isCompleted || isCurrent ? '#fff' : 'var(--color-text-sec)',
                                border: isFuture ? '2px solid var(--color-border)' : 'none',
                                boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none'
                            }}>
                                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>{step.icon}</svg>
                            </div>

                            {/* Label */}
                            <div style={{ textAlign: 'center', marginTop: '12px', width: '80px', fontSize: '11px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-sec)' }}>
                                {step.label}
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

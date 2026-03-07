import React from 'react';

export const TrustBadge = ({ type }) => {
    if (type === 'blockchain') {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', background: '#fff', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)', fontSize: 'var(--font-xs)', fontWeight: 600,
                color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)'
            }}>
                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'var(--color-accent)', fill: 'none', strokeWidth: 2 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                Verified by Blockchain
            </span>
        );
    }

    if (type === 'ai') {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', background: '#fff', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)', fontSize: 'var(--font-xs)', fontWeight: 600,
                color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)'
            }}>
                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'var(--color-primary)', fill: 'none', strokeWidth: 2 }}><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>
                AI Graded
            </span>
        );
    }

    if (type === 'ojk') {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', background: '#fff', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)', fontSize: 'var(--font-xs)', fontWeight: 600,
                color: 'var(--color-primary)', boxShadow: 'var(--shadow-sm)'
            }}>
                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'var(--color-primary)', fill: 'none', strokeWidth: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                OJK Compliant Partner
            </span>
        );
    }

    return null;
};

export const GradeBadge = ({ grade }) => {
    let style = { background: 'var(--color-bg)', color: 'var(--color-text-sec)', label: 'Unknown' };

    if (grade === 'A') {
        style = { background: 'var(--color-green-tint)', color: 'var(--color-accent)', label: 'A — Low Risk' };
    } else if (grade === 'B') {
        style = { background: 'var(--color-amber-tint)', color: 'var(--color-warning)', label: 'B — Moderate Risk' };
    } else if (grade === 'C') {
        style = { background: 'var(--color-red-tint)', color: 'var(--color-danger)', label: 'C — High Risk' };
    }

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', background: style.background, color: style.color,
            borderRadius: 'var(--radius-full)', fontSize: 'var(--font-xs)', fontWeight: 700
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
            {style.label}
        </span>
    );
};

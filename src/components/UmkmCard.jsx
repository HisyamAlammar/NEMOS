import React from 'react';
import { GradeBadge } from './Badges';

export const UmkmCard = ({ data, variant = 'full', onClick }) => {
    const { name, location, image, ownerName, ownerAvatar, grade, socialImpact, fundingPct, fundedAmt, targetAmt, minInvest, category } = data;

    // Placeholder for missing images
    const renderImage = () => {
        if (image) {
            return <div style={{ width: '100%', height: '100%', backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform var(--transition-slow)' }} className="card-img-bg" />
        }

        // Gradient placeholder driven by category
        const getCategoryIcon = () => {
            if (category === 'Kuliner') return <svg viewBox="0 0 24 24" style={{ width: 48, height: 48, stroke: 'var(--color-primary)', fill: 'none', opacity: 0.15, strokeWidth: 1.5 }}><path d="M12 2v20 M17 5v14 M7 5c0 3 2.5 5 5 5 M7 5v14" /></svg>;
            if (category === 'Agrikultur') return <svg viewBox="0 0 24 24" style={{ width: 48, height: 48, stroke: 'var(--color-primary)', fill: 'none', opacity: 0.15, strokeWidth: 1.5 }}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
            return <svg viewBox="0 0 24 24" style={{ width: 48, height: 48, stroke: 'var(--color-primary)', fill: 'none', opacity: 0.15, strokeWidth: 1.5 }}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>;
        };

        return (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #E8F4FF 0%, #D1E8FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getCategoryIcon()}
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-card)', borderRadius: 'var(--radius)', cursor: 'pointer', border: '1px solid var(--color-border)', transition: 'all var(--transition)' }} className="umkm-compact-card">
                <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    {renderImage()}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>{name}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-sec)', marginTop: 2 }}>📍 {location}</div>
                </div>
                <GradeBadge grade={grade} />
            </div>
        );
    }

    // Full Variant
    return (
        <div className="card umkm-card" onClick={onClick} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all var(--transition-slow)', display: 'flex', flexDirection: 'column' }}>

            {/* 1. Hero Image */}
            <div style={{ width: '100%', height: 180, position: 'relative', overflow: 'hidden' }}>
                {renderImage()}

                {/* Top Left Match Pill */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--color-accent)', color: '#fff', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--shadow-sm)' }}>
                    <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, stroke: 'currentColor', fill: 'none', strokeWidth: 3 }}><polyline points="20 6 9 17 4 12" /></svg>
                    95% Cocok
                </div>

                {/* Top Right Grade Badge (Custom styling for overlay) */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', boxShadow: 'var(--shadow-sm)' }}>
                    <GradeBadge grade={grade} />
                </div>
            </div>

            {/* 2. Card Body */}
            <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', flex: 1 }}>

                {/* Owner & Humanizing Element */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                    <img src={ownerAvatar || `https://ui-avatars.com/api/?name=${ownerName}&background=E5E7EB&color=1A1A2E`} alt={ownerName} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-divider)' }} />
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-sec)', fontWeight: 500 }}>Dimiliki oleh {ownerName}</span>
                </div>

                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>{name}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-sec)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {location}
                </div>

                {/* Social Impact Tag */}
                <div style={{ marginTop: '12px', background: 'var(--color-green-tint)', color: 'var(--color-accent)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-xs)', fontWeight: 600, display: 'inline-block', alignSelf: 'flex-start' }}>
                    {socialImpact}
                </div>

                <div style={{ height: '1px', background: 'var(--color-border)', margin: '16px 0' }}></div>

                {/* Funding Progress */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--color-text-sec)', marginBottom: 6 }}>
                        <span>Terdanai {fundingPct}%</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{fundedAmt} / {targetAmt}</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'var(--color-divider)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${fundingPct}%`, height: '100%', background: 'var(--color-accent)', borderRadius: 'var(--radius-full)' }}></div>
                    </div>
                </div>

                {/* Info Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-sec)' }}>Min. Pendanaan: <strong style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{minInvest}</strong></div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: 'var(--color-accent)', background: 'var(--color-green-tint)', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}>
                        <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        Blockchain
                    </span>
                </div>

                {/* 3. CTA */}
                <div style={{ marginTop: 'auto' }}>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius)' }}>Lihat Detail</button>
                </div>

            </div>
            <style>{`
        .umkm-compact-card:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
        .umkm-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: transparent; }
        .umkm-card:hover .card-img-bg { transform: scale(1.05); }
      `}</style>
        </div>
    );
};

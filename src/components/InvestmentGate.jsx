/**
 * components/InvestmentGate.jsx — Investment Gate UI
 *
 * Magic Moment 1: Blocks investment UI until learningProgress >= 100.
 * This mirrors the backend middleware `investmentGateMiddleware`.
 *
 * Usage:
 *   <InvestmentGate>
 *     <InvestButton amount={2000000} />
 *   </InvestmentGate>
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export default function InvestmentGate({ children }) {
  const learningProgress = useAuthStore((s) => s.learningProgress);
  const canInvest = learningProgress >= 100;

  if (canInvest) return children;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
      border: '1px solid #FDE68A',
      borderRadius: 16,
      padding: '24px 28px',
      textAlign: 'center',
    }}>
      {/* Lock Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#FFFBEB', border: '2px solid #FDE68A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: 'none', stroke: '#D97706', strokeWidth: 2 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#92400E', marginBottom: 6 }}>
        Investment Gate — Belum Terbuka
      </h3>
      <p style={{ fontSize: 14, color: '#B45309', lineHeight: 1.6, marginBottom: 16, maxWidth: 400, margin: '0 auto 16px' }}>
        Selesaikan semua modul literasi keuangan sebelum bisa berinvestasi.
        Ini melindungi Anda sebagai investor.
      </p>

      {/* Progress */}
      <div style={{ maxWidth: 300, margin: '0 auto 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
          <span style={{ color: '#92400E' }}>Progress Belajar</span>
          <span style={{ color: '#D97706' }}>{learningProgress}%</span>
        </div>
        <div style={{ height: 8, background: '#FDE68A', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            width: `${learningProgress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #F59E0B, #D97706)',
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      <NavLink
        to="/learn"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#F59E0B', color: '#fff',
          padding: '10px 24px', borderRadius: 10,
          fontSize: 14, fontWeight: 700,
          textDecoration: 'none',
          transition: 'background 0.2s',
        }}
      >
        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        Mulai Belajar Sekarang
      </NavLink>
    </div>
  );
}

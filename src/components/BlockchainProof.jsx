/**
 * components/BlockchainProof.jsx — On-chain Verification Badge
 *
 * Magic Moment 3: Shows real Polygon Amoy TX hash
 * that juri can click and verify on Polygonscan.
 *
 * Usage:
 *   <BlockchainProof txHash="0xe347..." label="Merkle Root" />
 *   <BlockchainProof contractAddress="0x1aa2..." />
 */
import React, { useState, useEffect } from 'react';
import { getPolygonscanTxUrl, getPolygonscanContractUrl, getBlockchainStats } from '../lib/blockchain.api';

// ── VERIFIED BADGE ────────────────────────────────────────
export function BlockchainBadge({ txHash, label = 'Verified on Polygon' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!txHash || txHash === 'already-recorded') return null;

  const shortHash = `${txHash.slice(0, 8)}...${txHash.slice(-6)}`;
  const url = getPolygonscanTxUrl(txHash);

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
      border: '1px solid #BAE6FD',
      borderRadius: 10, padding: '8px 14px',
      fontSize: 12, fontWeight: 600,
      transition: 'all 0.2s',
    }}>
      {/* Polygon Icon */}
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: '#7B3FE4', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: '#fff' }}>
          <path d="M17.2 8.6c-.4-.2-.8-.2-1.2 0l-2.8 1.6-1.9 1.1-2.8 1.6c-.4.2-.8.2-1.2 0l-2.2-1.3c-.4-.2-.6-.6-.6-1.1V8.2c0-.4.2-.9.6-1.1l2.2-1.2c.4-.2.8-.2 1.2 0l2.2 1.2c.4.2.6.6.6 1.1v1.6l1.9-1.1V7.1c0-.4-.2-.9-.6-1.1l-4-2.3c-.4-.2-.8-.2-1.2 0l-4.1 2.4c-.4.2-.6.6-.6 1v4.6c0 .4.2.9.6 1.1l4.1 2.3c.4.2.8.2 1.2 0l2.8-1.6 1.9-1.1 2.8-1.6c.4-.2.8-.2 1.2 0l2.2 1.3c.4.2.6.6.6 1.1v2.3c0 .4-.2.9-.6 1.1l-2.1 1.3c-.4.2-.8.2-1.2 0l-2.2-1.3c-.4-.2-.6-.6-.6-1.1v-1.6l-1.9 1.1v1.6c0 .4.2.9.6 1.1l4.1 2.3c.4.2.8.2 1.2 0l4.1-2.3c.4-.2.6-.6.6-1.1v-4.6c0-.4-.2-.9-.6-1.1l-4.2-2.4Z" />
        </svg>
      </div>

      {/* Label + Hash */}
      <div>
        <div style={{ color: '#0369A1', fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#0C4A6E', textDecoration: 'none',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 12, fontWeight: 700,
            borderBottom: '1px dashed #93C5FD',
          }}
          title={`View on Polygonscan: ${txHash}`}
        >
          {shortHash}
        </a>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        title="Copy TX Hash"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: copied ? '#059669' : '#64748B', padding: 2,
          display: 'flex', alignItems: 'center',
          transition: 'color 0.2s',
        }}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>

      {/* External link arrow */}
      <a href={url} target="_blank" rel="noopener noreferrer"
        style={{ color: '#0284C7', display: 'flex' }}>
        <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  );
}

// ── CONTRACT INFO CARD ────────────────────────────────────
export function ContractInfo({ contractAddress = '0x1aa24060c4Cc855b8437DBA3b592647C43c87012' }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlockchainStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const contractUrl = getPolygonscanContractUrl(contractAddress);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
      borderRadius: 16, padding: '20px 24px',
      color: '#fff', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.15)',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(139, 92, 246, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: '#A78BFA', strokeWidth: 2 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>NemosEscrowLedger</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Polygon Amoy Testnet</div>
        </div>
      </div>

      {/* Contract Address */}
      <a
        href={contractUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '6px 12px',
          fontSize: 11, color: '#C4B5FD',
          textDecoration: 'none',
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 14,
          transition: 'background 0.2s',
        }}
      >
        {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
        <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>

      {/* Stats Row */}
      {!loading && stats && (
        <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#A78BFA' }}>{stats.totalDays}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Merkle Roots</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#34D399' }}>{stats.totalDisbursements}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Disbursements</div>
          </div>
        </div>
      )}
      {loading && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Loading on-chain data...</div>
      )}
    </div>
  );
}

export default BlockchainBadge;

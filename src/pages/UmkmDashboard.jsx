import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import nemosLogo from '../assets/NEMOS LOGO.png';
import { useAuthStore } from '../stores/auth.store';
import Toast, { useToast } from '../components/Toast';
import { apiFetch } from '../lib/api';

export default function UmkmDashboard() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const ownerName = user?.name || 'Pengusaha';


    // ── Wizard of Oz Video Verification State [GEM-03] ──────
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [verificationStep, setVerificationStep] = useState(0);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = useRef(null);
    const { toast, showToast } = useToast();

    // ── Cash Reconciliation Form State [P2-NEW-01] ───────
    const [cashCategory, setCashCategory] = useState('');
    const [cashAmount, setCashAmount] = useState('');
    const [cashTransactions, setCashTransactions] = useState([]);

    // ── Dashboard Data State ──────────────────────────────
    const [umkmData, setUmkmData] = useState(null);
    const [isUploadingOCR, setIsUploadingOCR] = useState(false);
    
    useEffect(() => { 
        window.scrollTo(0, 0); 
        const fetchDashboardData = async () => {
            try {
                const res = await apiFetch('/umkm/me');
                if (res && res.data) {
                    setUmkmData(res.data);
                }
            } catch (err) {
                console.error("Gagal load umkm dashboard data:", err);
            }
        };
        fetchDashboardData();
    }, []);

    const handleUploadReceipt = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingOCR(true);
        showToast('Mengupload dan Menganalisis Bukti Transaksi (AI Vision)...', 'info');
        
        try {
            // Mock API Form Data 
            const formData = new FormData();
            formData.append("file", file);

            // Mock fetch to FastAPI backend proxy
            // const res = await fetch('/api/ocr/verify-receipt', { method: 'POST', body: formData }).then(r=>r.json());
            
            // Simulating API latency and JSON response for demo
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockResponse = {
                total: 2450000,
                merchant: "NEMOS B2B Cash",
                confidence: 0.98,
            };

            setCashAmount(String(mockResponse.total));
            setCashCategory('khusus'); // Pre-fill category
            showToast(`AI Berhasil Membaca Nominal: Rp ${mockResponse.total.toLocaleString('id-ID')}`, 'success');

        } catch (err) {
            console.error(err);
            showToast('Gagal memproses struk via AI', 'error');
        } finally {
            setIsUploadingOCR(false);
            e.target.value = ''; // reset
        }
    };

    // ── Camera lifecycle ───────────────────────────────────
    useEffect(() => {
        if (!showVideoModal) return;

        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(stream => {
                setCameraStream(stream);
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(() => {
                setCameraError('Kamera tidak dapat diakses. Verifikasi tetap berjalan tanpa kamera.');
            });

        return () => {
            // Cleanup: matikan kamera saat modal ditutup
            setCameraStream(prev => {
                if (prev) prev.getTracks().forEach(track => track.stop());
                return null;
            });
        };
    }, [showVideoModal]);

    // Assign stream to video element when stream changes
    useEffect(() => {
        if (videoRef.current && cameraStream) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream]);

    const startVerification = () => {
        setVerificationStep(1);
        setTimeout(() => setVerificationStep(2), 1500);
        setTimeout(() => setVerificationStep(3), 3000);
        setTimeout(() => {
            setVerificationStep(4);
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        }, 4500);
    };

    const closeModal = () => {
        setShowVideoModal(false);
        setVerificationStep(0);
        setCameraError(null);
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    // ── Verification step labels ───────────────────────────
    const STEP_LABELS = [
        { text: 'Siapkan wajah Anda di depan kamera...', icon: '📷' },
        { text: 'Menganalisis wajah pemilik UMKM...', icon: '🔍' },
        { text: 'Mengekstrak timestamp dan mencocokkan Proof of Delivery...', icon: '⏱️' },
        { text: 'Memvalidasi objek dengan Rencana Anggaran Biaya (RAB)...', icon: '📦' },
    ];

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
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150" alt={ownerName} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, background: 'var(--color-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: '#00C853', stroke: 'none' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 2 }}>Selamat datang, {ownerName}</h1>
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
                                <div style={{ position: 'relative', width: 160, height: 160, borderRadius: '50%', background: `conic-gradient(#00C853 0% ${umkmData ? Math.round((umkmData.current / umkmData.target) * 100) : 75}%, var(--color-border) ${umkmData ? Math.round((umkmData.current / umkmData.target) * 100) : 75}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: 136, height: 136, background: '#fff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-pri)', lineHeight: 1 }}>{umkmData ? Math.round((umkmData.current / umkmData.target) * 100) : 75}%</div>
                                        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginTop: 4 }}>Terkumpul</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-pri)' }}>Rp {umkmData ? umkmData.current.toLocaleString('id-ID') : '37.500.000'}</div>
                                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>dari Rp {umkmData ? umkmData.target.toLocaleString('id-ID') : '50.000.000'}</div>
                            </div>

                            <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ width: `${umkmData ? Math.round((umkmData.current / umkmData.target) * 100) : 75}%`, height: '100%', background: '#00C853', borderRadius: 4 }}></div>
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

                            {/* ── VIDEO VERIFICATION TRIGGER [GEM-03] ────────── */}
                            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 20, paddingTop: 16 }}>
                                <button
                                    onClick={() => setShowVideoModal(true)}
                                    style={{
                                        width: '100%', height: 48, border: '2px dashed #00C853',
                                        borderRadius: 10, background: '#F0FDF4', color: '#1B5E20',
                                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.background = '#DCFCE7'; e.currentTarget.style.borderColor = '#16A34A'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#00C853'; }}
                                >
                                    📹 Upload Video Unboxing &amp; Wajah
                                    <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280' }}>(Wajib untuk pencairan &gt; Rp 10 Juta)</span>
                                </button>
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
                                    Transaksi cash tidak terdeteksi otomatis. Input manual atau upload struk (AI Vision OCR) untuk menarik data otomatis dari /ocr.
                                </div>
                            </div>

                            {/* OCR Upload Area */}
                            <div style={{ marginBottom: 'var(--space-xl)' }}>
                                <label style={{ display: 'block', padding: '24px', border: '2px dashed var(--color-border)', borderRadius: 8, textAlign: 'center', cursor: 'pointer', background: '#F9FAFB' }}>
                                    <input type="file" accept="image/*" onChange={handleUploadReceipt} style={{ display: 'none' }} disabled={isUploadingOCR} />
                                    {isUploadingOCR ? (
                                        <div style={{ color: '#00A040', fontWeight: 'bold' }}>Sedang mengekstraksi data (AI Vision)...</div>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: 24, marginBottom: 8 }}>📷</div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-pri)' }}>Ambil / Upload Struk Cash</div>
                                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Data (Nominal & Kategori) akan diisi otomatis</div>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-xl)' }}>
                                <div style={{ flex: 1 }}>
                                    <select
                                        value={cashCategory}
                                        onChange={e => setCashCategory(e.target.value)}
                                        style={{ width: '100%', height: 44, padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-pri)', outline: 'none' }}>
                                        <option value="">Kategori Transaksi</option>
                                        <option value="langsung">Penjualan Langsung</option>
                                        <option value="event">Event/Bazar</option>
                                        <option value="khusus">Pesanan Khusus</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Rp</div>
                                    <input
                                        type="text"
                                        placeholder="0"
                                        value={cashAmount}
                                        onChange={e => setCashAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                        style={{ width: '100%', height: 44, padding: '0 16px 0 48px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text-pri)', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '0 12px', fontSize: '14px' }}
                                    onClick={() => {
                                        if (!cashAmount) { showToast('Masukkan nominal transaksi', 'error'); return; }
                                        showToast('Draft transaksi tersimpan', 'success');
                                    }}
                                >Simpan Draft</button>
                                <button className="btn" style={{ flex: 1, padding: '0 12px', fontSize: '14px', background: '#1E3A5F', color: '#fff', border: 'none' }}
                                    onClick={() => {
                                        if (!cashCategory || !cashAmount) { showToast('Lengkapi kategori dan nominal', 'error'); return; }
                                        const amt = Number(cashAmount);
                                        setCashTransactions(prev => [...prev, { category: cashCategory, amount: amt, date: new Date().toLocaleDateString('id-ID'), status: 'Menunggu Verifikasi' }]);
                                        setCashCategory(''); setCashAmount('');
                                        showToast(`Transaksi Rp ${amt.toLocaleString('id-ID')} berhasil diajukan!`, 'success');
                                    }}
                                >Ajukan untuk Diverifikasi</button>
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

            {/* ══════════════════════════════════════════════════════════
                VIDEO VERIFICATION MODAL [GEM-03 — Wizard of Oz]
                
                Ini MURNI simulasi UI — tidak ada API call, tidak ada video
                yang dikirim ke server. Untuk demo ke juri.
            ══════════════════════════════════════════════════════════ */}
            {showVideoModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20,
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
                        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
                        overflow: 'hidden', position: 'relative',
                        animation: 'fadeInScale 0.25s ease-out',
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            background: 'linear-gradient(90deg, #1E3A5F, #2D5F8B)',
                            padding: '16px 24px', color: '#fff',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: '#A7F3D0', strokeWidth: 2 }}>
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span style={{ fontSize: 16, fontWeight: 700 }}>Verifikasi Video Unboxing</span>
                            </div>
                            <button onClick={closeModal} style={{
                                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                                width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, fontWeight: 700,
                            }}>✕</button>
                        </div>

                        {/* Camera Preview */}
                        {verificationStep < 4 && (
                            <div style={{
                                background: '#0D1B2A', position: 'relative',
                                height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {cameraError ? (
                                    <div style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>
                                        <svg viewBox="0 0 24 24" style={{ width: 40, height: 40, fill: 'none', stroke: '#6B7280', strokeWidth: 1.5, marginBottom: 8 }}>
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                                        </svg>
                                        <div style={{ fontSize: 13 }}>{cameraError}</div>
                                    </div>
                                ) : (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        style={{
                                            width: '100%', height: '100%', objectFit: 'cover',
                                            transform: 'scaleX(-1)',
                                        }}
                                    />
                                )}

                                {/* Scan overlay animation when verifying */}
                                {verificationStep > 0 && verificationStep < 4 && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        border: '3px solid #00C853',
                                        borderRadius: 0,
                                        animation: 'pulseGlow 1.5s infinite',
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0,
                                            height: 3, background: '#00C853',
                                            animation: 'scanLine 2s linear infinite',
                                        }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Success State (Step 4) */}
                        {verificationStep === 4 && (
                            <div style={{
                                padding: '40px 24px', textAlign: 'center',
                                background: 'linear-gradient(180deg, #F0FDF4, #fff)',
                            }}>
                                <div style={{
                                    width: 72, height: 72, borderRadius: '50%',
                                    background: '#DCFCE7', border: '3px solid #00C853',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    animation: 'bounceIn 0.5s ease-out',
                                }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 36, height: 36, fill: 'none', stroke: '#00C853', strokeWidth: 3 }}>
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1B5E20', marginBottom: 8 }}>
                                    Verifikasi Valid!
                                </h2>
                                <div style={{
                                    fontSize: 32, fontWeight: 800, color: '#00C853',
                                    marginBottom: 16,
                                }}>
                                    Skor Kepercayaan: 98%
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                                    {[
                                        '✅ Identitas pemilik UMKM terverifikasi',
                                        '✅ Proof of Delivery tervalidasi',
                                        '✅ Tranche siap dicairkan',
                                    ].map((line, i) => (
                                        <div key={i} style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{line}</div>
                                    ))}
                                </div>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: '#1E3A5F', color: '#A7F3D0',
                                    padding: '8px 20px', borderRadius: 999,
                                    fontSize: 13, fontWeight: 700,
                                    marginBottom: 20,
                                }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                    Verified On-Chain
                                </div>
                            </div>
                        )}

                        {/* Status + Actions */}
                        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid #F3F4F6' }}>
                            {/* Step progress indicator */}
                            {verificationStep > 0 && verificationStep < 4 && (
                                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                                    {[1, 2, 3].map(s => (
                                        <div key={s} style={{
                                            flex: 1, height: 4, borderRadius: 2,
                                            background: verificationStep >= s ? '#00C853' : '#E5E7EB',
                                            transition: 'background 0.3s',
                                        }} />
                                    ))}
                                </div>
                            )}

                            {/* Step label */}
                            {verificationStep < 4 && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    fontSize: 14, fontWeight: 600, color: '#374151',
                                    minHeight: 24, marginBottom: 16,
                                }}>
                                    {verificationStep > 0 && verificationStep < 4 && (
                                        <div style={{
                                            width: 20, height: 20, border: '3px solid #00C853',
                                            borderTopColor: 'transparent', borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite', flexShrink: 0,
                                        }} />
                                    )}
                                    <span>{STEP_LABELS[verificationStep]?.icon} {STEP_LABELS[verificationStep]?.text}</span>
                                </div>
                            )}

                            {/* Action buttons */}
                            {verificationStep === 0 && (
                                <button
                                    onClick={startVerification}
                                    style={{
                                        width: '100%', height: 48, background: '#00C853', color: '#fff',
                                        border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                                        cursor: 'pointer', transition: 'opacity 0.2s',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                                >
                                    🎥 Mulai Verifikasi
                                </button>
                            )}

                            {verificationStep === 4 && (
                                <button
                                    onClick={closeModal}
                                    style={{
                                        width: '100%', height: 48, background: '#1E3A5F', color: '#fff',
                                        border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                                        cursor: 'pointer', transition: 'opacity 0.2s',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                                >
                                    Tutup
                                </button>
                            )}

                            {/* Privacy disclaimer */}
                            <div style={{
                                fontSize: 11, color: '#9CA3AF', textAlign: 'center',
                                marginTop: 12, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 4,
                            }}>
                                🔒 Video tidak direkam atau dikirim ke server. Verifikasi dilakukan secara lokal.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submitted Cash Transactions [P2-NEW-01] */}
            {cashTransactions.length > 0 && (
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 var(--space-xl) var(--space-xl)' }}>
                    <div className="card">
                        <h2 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Transaksi Cash Diajukan</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {cashTransactions.map((tx, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#FFFDE7', border: '1px solid #FFE082', borderRadius: 8 }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E3A5F', textTransform: 'capitalize' }}>{tx.category}</div>
                                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{tx.date}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 15, fontWeight: 700 }}>Rp {tx.amount.toLocaleString('id-ID')}</span>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#F59E0B', background: '#FFF8E1', padding: '3px 8px', borderRadius: 4 }}>{tx.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            <Toast {...toast} />

            {/* Modal animations */}
            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulseGlow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
                @keyframes scanLine {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(317px); }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}


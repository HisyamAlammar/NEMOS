import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import nemosLogo from '../assets/NEMOS LOGO.png';

export default function Onboarding() {
    const navigate = useNavigate();
    // step 0: intro, 1-5: questions, 6: processing, 7: result
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});

    useEffect(() => { window.scrollTo(0, 0); }, [step]);

    // Simulate Processing Delay
    useEffect(() => {
        if (step === 6) {
            const timer = setTimeout(() => {
                setStep(7);
            }, 3000); // 3 seconds total for 3 fake steps
            return () => clearTimeout(timer);
        }
    }, [step]);

    const questions = [
        {
            id: 1,
            q: "Jika nilai investasi Anda turun 20% dalam satu bulan, apa yang Anda lakukan?",
            opts: [
                "Jual semua aset, ambil modal yang tersisa",
                "Jual sebagian untuk mengurangi eksposur",
                "Tahan posisi, tunggu pemulihan pasar",
                "Tambah posisi, manfaatkan harga lebih rendah"
            ]
        },
        {
            id: 2,
            q: "Berapa lama Anda bersedia tidak menyentuh dana investasi?",
            opts: [
                "Kurang dari 6 bulan",
                "6 bulan — 1 tahun",
                "1 tahun — 3 tahun",
                "Lebih dari 3 tahun"
            ]
        },
        {
            id: 3,
            q: "Dari mana Anda biasanya mempelajari tentang investasi?",
            opts: [
                "Teman atau keluarga",
                "Media sosial (Tiktok/IG)",
                "Buku dan kursus terstruktur",
                "Laporan keuangan dan riset emiten"
            ]
        },
        {
            id: 4,
            q: "Berapa persen penghasilan bulanan yang Anda siapkan untuk investasi?",
            opts: [
                "1% — 5%",
                "5% — 10%",
                "10% — 25%",
                "Lebih dari 25%"
            ]
        },
        {
            id: 5,
            q: "Apa tujuan utama investasi Anda saat ini?",
            opts: [
                "Melindungi dana dari inflasi (Dana Darurat)",
                "Mengumpulkan dana pendidikan / pernikahan pendek",
                "Passive income reguler (Misal: per bulan)",
                "Pertumbuhan nilai kapital jangka panjang"
            ]
        }
    ];

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleSelect = (qId, optionIdx) => {
        setAnswers({ ...answers, [qId]: optionIdx });
    };

    // Intro Screen (Step 0)
    if (step === 0) {
        return (
            <div className="view" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #F4F6F9, #EEF4FF)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: '#ffffff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <img src={nemosLogo} alt="NEMOS Logo" style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #1B7A8B, #00C853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEMOS</span>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 var(--space-xl)', maxWidth: 600, margin: '0 auto', width: '100%' }}>

                    {/* Abstract Geometric Illustration */}
                    <div style={{ width: '100%', height: 260, position: 'relative', marginBottom: 'var(--space-xl)' }}>
                        <svg viewBox="0 0 400 260" style={{ width: '100%', height: '100%' }}>
                            <defs>
                                <linearGradient id="badPath" x1="0" y1="1" x2="0" y2="0">
                                    <stop offset="0%" stopColor="#CBD5E1" />
                                    <stop offset="100%" stopColor="#94A3B8" />
                                </linearGradient>
                                <linearGradient id="goodPath" x1="0" y1="1" x2="0" y2="0">
                                    <stop offset="0%" stopColor="#00C853" />
                                    <stop offset="100%" stopColor="#00A040" />
                                </linearGradient>
                            </defs>
                            <rect x="50" y="160" width="80" height="40" fill="url(#badPath)" rx="4" transform="skewX(-20)" />
                            <rect x="70" y="110" width="80" height="40" fill="url(#badPath)" rx="4" transform="skewX(-20)" />
                            <rect x="90" y="60" width="80" height="40" fill="url(#badPath)" rx="4" transform="skewX(-20)" />

                            <rect x="180" y="160" width="200" height="20" fill="url(#goodPath)" rx="10" transform="rotate(-15, 180, 160)" />

                            <text x="60" y="220" fontSize="12" fill="#64748B" fontWeight="600">Investasi Tanpa Pemahaman</text>
                            <text x="210" y="130" fontSize="12" fill="#00C853" fontWeight="600">Investasi Terencana</text>
                        </svg>
                    </div>

                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-pri)', marginBottom: 12, textAlign: 'center' }}>Kenali Profil Risiko Anda</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2xl)', textAlign: 'center', maxWidth: 400 }}>
                        Sebelum berinvestasi, AI NEMOS akan membuat profil risiko personal Anda dalam 5 pertanyaan singkat.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 'var(--space-3xl)', width: '100%', maxWidth: 400 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '15px', color: 'var(--color-text-pri)', fontWeight: 500 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'var(--color-primary)', strokeWidth: 2 }}><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>
                            Dipersonalisasi oleh AI
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '15px', color: 'var(--color-text-pri)', fontWeight: 500 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'var(--color-primary)', strokeWidth: 2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            Data Anda aman dan terenkripsi
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '15px', color: 'var(--color-text-pri)', fontWeight: 500 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'var(--color-primary)', strokeWidth: 2 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            Selesai dalam 3 menit
                        </div>
                    </div>

                    <button onClick={handleNext} className="btn btn-accent btn-block" style={{ height: 56, fontSize: '16px', maxWidth: 400, marginBottom: 'var(--space-md)' }}>Mulai Asesmen</button>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '14px', cursor: 'pointer', marginBottom: 'var(--space-xl)' }}>Lewati untuk saat ini</button>

                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Langkah 1 dari 5</div>
                </div>
            </div>
        );
    }

    // Question Screens (Steps 1-5)
    if (step >= 1 && step <= 5) {
        const qIndex = step - 1;
        const qData = questions[qIndex];
        const progressPct = (step / 5) * 100;

        return (
            <div className="view" style={{ minHeight: '100vh', background: '#F8FAFF', display: 'flex', flexDirection: 'column' }}>

                {/* Progress header map */}
                <div style={{ background: '#fff', padding: '16px var(--space-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
                    <button onClick={() => setStep(prev => prev - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'var(--color-text-pri)', strokeWidth: 2 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    </button>
                    <div style={{ flex: 1, margin: '0 24px' }}>
                        <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 2, transition: 'width 0.3s ease' }}></div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Pertanyaan {step} / 5</div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'var(--space-2xl) var(--space-xl)', maxWidth: 600, margin: '0 auto', width: '100%' }}>

                    <div style={{ fontSize: '64px', fontWeight: 800, color: '#EEF4FF', lineHeight: 1, marginBottom: 8 }}>0{step}</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-pri)', marginBottom: 'var(--space-3xl)', lineHeight: 1.4, maxWidth: 560 }}>
                        {qData.q}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 'var(--space-3xl)' }}>
                        {qData.opts.map((opt, idx) => {
                            const isSelected = answers[qData.id] === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(qData.id, idx)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        padding: '16px 20px',
                                        background: isSelected ? '#EEF4FF' : '#fff',
                                        border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        color: 'var(--color-text-pri)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = '#F8FAFF'; }}
                                    onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = '#fff'; }}
                                >
                                    {opt}
                                    {isSelected && (
                                        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'var(--color-primary)', strokeWidth: 2, flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)' }}>
                        <button
                            onClick={handleNext}
                            disabled={answers[qData.id] === undefined}
                            className={`btn btn-block ${answers[qData.id] !== undefined ? 'btn-primary' : ''}`}
                            style={{
                                height: 48,
                                fontSize: '16px',
                                background: answers[qData.id] === undefined ? 'var(--color-border)' : 'var(--color-primary)',
                                color: answers[qData.id] === undefined ? 'var(--color-text-muted)' : '#fff',
                                cursor: answers[qData.id] === undefined ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Selanjutnya
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    // Processing Screen (Step 6)
    if (step === 6) {
        return (
            <div className="view" style={{ minHeight: '100vh', background: '#F4F6F9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-3xl)' }}>
                    <div style={{ width: 36, height: 36, background: '#ffffff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <img src={nemosLogo} alt="NEMOS Logo" style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #1B7A8B, #00C853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEMOS</span>
                </div>

                {/* Concentric rings pure CSS loading animation */}
                <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 'var(--space-2xl)' }}>
                    <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(30,58,95,0.1)', borderRadius: '50%', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
                    <div style={{ position: 'absolute', inset: 16, border: '4px solid rgba(0,200,83,0.1)', borderRadius: '50%', borderTopColor: 'var(--color-accent)', animation: 'spin 1.5s linear infinite reverse' }}></div>
                    <div style={{ position: 'absolute', inset: 32, border: '4px solid rgba(30,58,95,0.1)', borderRadius: '50%', borderTopColor: 'var(--color-blue-tint)', animation: 'spin 0.8s linear infinite' }}></div>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-pri)', marginBottom: 'var(--space-2xl)' }}>AI sedang menganalisis profil Anda</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 320 }}>
                    {/* Animated appearance via state isn't strictly necessary if it just waits 3s, but let's fake it with pure CSS delay animations */}
                    <style>{`
            @keyframes fadeInRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-pri)', fontWeight: 500, animation: 'fadeInRight 0.5s ease forwards' }}>
                        <span>Menganalisis toleransi risiko...</span>
                        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'var(--color-accent)', strokeWidth: 2, opacity: 0, animation: 'fadeInRight 0.3s ease 0.8s forwards' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-pri)', fontWeight: 500, opacity: 0, animation: 'fadeInRight 0.5s ease 1s forwards' }}>
                        <span>Mencocokkan dengan UMKM terbaik...</span>
                        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'var(--color-accent)', strokeWidth: 2, opacity: 0, animation: 'fadeInRight 0.3s ease 1.6s forwards' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-pri)', fontWeight: 500, opacity: 0, animation: 'fadeInRight 0.5s ease 2s forwards' }}>
                        <span>Menyusun kurikulum personal...</span>
                        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'var(--color-accent)', strokeWidth: 2, opacity: 0, animation: 'fadeInRight 0.3s ease 2.6s forwards' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                </div>
            </div>
        );
    }

    // Result Screen (Step 7)
    if (step === 7) {
        return (
            <div className="view" style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 'var(--space-xl)', textAlign: 'center', background: '#fff' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: '#ffffff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <img src={nemosLogo} alt="NEMOS Logo" style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
                        </div>
                        <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '22px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>NEMOS</span>
                    </div>
                </div>

                <div style={{ flex: 1, padding: 'var(--space-3xl) var(--space-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 800, margin: '0 auto', width: '100%' }}>

                    <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 'var(--space-md)', boxShadow: '0 12px 24px rgba(30,58,95,0.2)' }}>
                        <svg viewBox="0 0 24 24" style={{ width: 56, height: 56, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <div className="label-uppercase" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-xl)', letterSpacing: 2 }}>KONSERVATIF</div>

                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-pri)', marginBottom: 16, textAlign: 'center' }}>Profil Risiko Anda: Konservatif</h2>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6, textAlign: 'center', maxWidth: 500, marginBottom: 'var(--space-3xl)' }}>
                        Anda lebih nyaman dengan investasi yang stabil dan terukur. NEMOS akan memulai perjalanan Anda dengan UMKM Grade A yang memiliki rekam jejak omzet paling konsisten.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', width: '100%', gap: 'var(--space-lg)', marginBottom: 'var(--space-3xl)' }}>

                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-blue-tint)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>7 Modul Kurikulum Personal</div>
                        </div>

                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-green-tint)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Akses UMKM Grade A</div>
                        </div>

                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-blue-tint)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Perlindungan Risiko Maksimal</div>
                        </div>

                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 400, marginTop: 'auto' }}>
                        <button onClick={() => navigate('/learn')} className="btn btn-accent btn-block" style={{ height: 56, fontSize: '16px' }}>Mulai Belajar Sekarang</button>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-block" style={{ height: 56, fontSize: '16px' }}>Lihat UMKM Pilihan Saya</button>
                    </div>

                </div>
            </div >
        );
    }

    return null;
}

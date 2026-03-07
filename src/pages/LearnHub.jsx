import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const LESSONS = [
    {
        id: 1,
        title: "Dasar Investasi Revenue-Based Financing (RBF)",
        duration: "12 menit",
        status: "active", // active, completed, locked
        progress: 13, // percentage
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
        description: "Memahami konsep bagi hasil dan cara kerja investasi Revenue-Based Financing di NEMOS."
    },
    {
        id: 2,
        title: "Membaca Profil dan Grade UMKM",
        duration: "15 menit",
        status: "locked",
        progress: 0,
        videoUrl: "",
        description: "Langkah-langkah membaca parameter UMKM (Grade A, B, C) untuk investasi yang lebih cerdas."
    },
    {
        id: 3,
        title: "Peran Blockchain dalam Verifikasi Omzet",
        duration: "10 menit",
        status: "locked",
        progress: 0,
        videoUrl: "",
        description: "Pelajari bagaimana data penjualan UMKM divalidasi dan dikunci dalam blockchain demi transparansi."
    },
    {
        id: 4,
        title: "Diversifikasi Portofolio UMKM",
        duration: "20 menit",
        status: "locked",
        progress: 0,
        videoUrl: "",
        description: "Menghindari risiko tinggi dengan menanamkan modal pada berbagai UMKM beda sektor."
    },
    {
        id: 5,
        title: "Analisis Laporan Keuangan Mikro",
        duration: "18 menit",
        status: "locked",
        progress: 0,
        videoUrl: "",
        description: "Memahami arus kas sederhana UMKM dan cara mengukur kesehatan keuangannya."
    },
    {
        id: 6,
        title: "Mitigasi Risiko Gagal Bayar UMKM",
        duration: "14 menit",
        status: "locked",
        progress: 0,
        videoUrl: "",
        description: "Belajar membaca sinyal keterlambatan dan bagaimana sistem Escrow NEMOS mengamankan modal Anda."
    },
    {
        id: 7,
        title: "Memanfaatkan Budi (AI Financial Advisor)",
        duration: "10 menit",
        status: "locked",
        progress: 0,
        videoUrl: "",
        description: "Cara jitu memanfaatkan AI untuk menganalisa dan memilih rekomendasi UMKM harian Anda."
    }
];

export default function LearnHub({ userTier = 'premium' }) {
    const [activeLessonId, setActiveLessonId] = useState(1);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const activeLesson = LESSONS.find(l => l.id === activeLessonId) || LESSONS[0];
    const completedCount = LESSONS.filter(l => l.status === 'completed').length;
    const totalLessons = LESSONS.length;

    // Simulate Premium Lock
    const isPremiumUnlockingRequired = userTier !== 'premium';

    return (
        <div className="view" style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>

            {/* 1. Sticky Header Header - Matches standard layout */}
            <div style={{ background: '#1E3A5F', position: 'sticky', top: 56, zIndex: 10, padding: '16px 5%', color: '#fff' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: '#fff', strokeWidth: 2 }}><path d="M12 2v20zM17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>NEMOS Learning Academy</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Tingkatkan literasi, maksimalkan return</div>
                        </div>
                    </div>

                    {isPremiumUnlockingRequired && (
                        <NavLink to="/dashboard" style={{
                            background: '#F59E0B', color: '#1E3A5F', padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6
                        }}>
                            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            Upgrade Premium
                        </NavLink>
                    )}
                </div>
            </div>

            {/* 2. Main Layout Container: 2 Columns */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 5%', display: 'flex', gap: 32, width: '100%', flex: 1, alignItems: 'flex-start' }}>

                {/* LEFT COLUMN: VIDEO PLAYER */}
                <div style={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>

                    {/* Video Container */}
                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#0F172A', borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        {activeLesson.status === 'locked' ? (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 24, textAlign: 'center' }}>
                                <svg viewBox="0 0 24 24" style={{ width: 48, height: 48, fill: 'none', stroke: '#64748B', strokeWidth: 1.5, marginBottom: 16 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Lesson Locked</h3>
                                <p style={{ color: '#94A3B8', maxWidth: 400 }}>Selesaikan modul sebelumnya atau upgrade ke Premium untuk membuka materi ini.</p>
                            </div>
                        ) : (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Placeholder for YouTube iframe, currently a visual dummy like screenshot */}
                                <div style={{ position: 'absolute', inset: 0, background: '#1E293B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s' }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                    >
                                        <svg viewBox="0 0 24 24" style={{ width: 36, height: 36, fill: '#fff' }}><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Video Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0E7FF', color: '#4338CA', padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4338CA' }} />
                                Lesson {activeLesson.id} of {totalLessons}
                            </div>
                            {activeLesson.status === 'active' && activeLesson.progress > 0 && (
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>{activeLesson.progress}% Complete</div>
                            )}
                            {activeLesson.status === 'completed' && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: 13, fontWeight: 600 }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><polyline points="20 6 9 17 4 12" /></svg>
                                    Completed
                                </div>
                            )}
                        </div>

                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                            {activeLesson.title}
                        </h1>

                        <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, maxWidth: 800 }}>
                            {activeLesson.description}
                        </p>
                    </div>

                </div>

                {/* RIGHT COLUMN: SYLLABUS LIST */}
                <div style={{ flex: '1 1 35%', minWidth: 320, background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'sticky', top: 148, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>

                    {/* Syllabus Header */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Modul Level 4: Pengetahuan Konservatif
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748B', background: '#E2E8F0', padding: '4px 10px', borderRadius: 6 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            {totalLessons} Lessons
                        </div>
                    </div>

                    {/* List Container */}
                    <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {LESSONS.map((lesson) => {
                                const isActive = lesson.id === activeLessonId;
                                const isLocked = lesson.status === 'locked' && isPremiumUnlockingRequired;

                                return (
                                    <div
                                        key={lesson.id}
                                        onClick={() => { if (!isLocked) setActiveLessonId(lesson.id); }}
                                        style={{
                                            padding: '16px',
                                            borderRadius: 12,
                                            background: isActive ? '#EFF6FF' : '#fff',
                                            border: `1px solid ${isActive ? '#BFDBFE' : '#F1F5F9'}`,
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 16,
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            opacity: isLocked ? 0.6 : 1,
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onMouseOver={e => { if (!isActive && !isLocked) e.currentTarget.style.background = '#F8FAFC'; }}
                                        onMouseOut={e => { if (!isActive && !isLocked) e.currentTarget.style.background = '#fff'; }}
                                    >
                                        {isActive && (
                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#3B82F6' }} />
                                        )}

                                        {/* Number/Icon */}
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isActive ? '#3B82F6' : (lesson.status === 'completed' ? '#10B981' : '#F1F5F9'),
                                            color: isActive || lesson.status === 'completed' ? '#fff' : '#64748B',
                                            fontWeight: 700, fontSize: 13
                                        }}>
                                            {isLocked ? (
                                                <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                            ) : lesson.status === 'completed' ? (
                                                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><polyline points="20 6 9 17 4 12" /></svg>
                                            ) : (
                                                lesson.id
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? '#1E3A5F' : '#334155', lineHeight: 1.4 }}>
                                                {lesson.title}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
                                                <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                {lesson.duration}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

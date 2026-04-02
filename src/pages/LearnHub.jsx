import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { updateLearningProgress } from '../lib/api';

const INITIAL_LESSONS = [
    {
        id: 1,
        title: "Dasar Investasi Revenue-Based Financing (RBF)",
        duration: "12 menit",
        description: "Memahami konsep bagi hasil dan cara kerja investasi Revenue-Based Financing di NEMOS."
    },
    {
        id: 2,
        title: "Membaca Profil dan Grade UMKM",
        duration: "15 menit",
        description: "Langkah-langkah membaca parameter UMKM (Grade A, B, C) untuk investasi yang lebih cerdas."
    },
    {
        id: 3,
        title: "Peran Blockchain dalam Verifikasi Omzet",
        duration: "10 menit",
        description: "Pelajari bagaimana data penjualan UMKM divalidasi dan dikunci dalam blockchain demi transparansi."
    },
    {
        id: 4,
        title: "Diversifikasi Portofolio UMKM",
        duration: "20 menit",
        description: "Menghindari risiko tinggi dengan menanamkan modal pada berbagai UMKM beda sektor."
    },
    {
        id: 5,
        title: "Analisis Laporan Keuangan Mikro",
        duration: "18 menit",
        description: "Memahami arus kas sederhana UMKM dan cara mengukur kesehatan keuangannya."
    },
    {
        id: 6,
        title: "Mitigasi Risiko Gagal Bayar UMKM",
        duration: "14 menit",
        description: "Belajar membaca sinyal keterlambatan dan bagaimana sistem Escrow NEMOS mengamankan modal Anda."
    },
    {
        id: 7,
        title: "Memanfaatkan Budi (AI Financial Advisor)",
        duration: "10 menit",
        description: "Cara jitu memanfaatkan AI untuk menganalisa dan memilih rekomendasi UMKM harian Anda."
    }
];

const TOTAL_LESSONS = INITIAL_LESSONS.length;

/**
 * Derive lesson statuses from the number of completed modules.
 * Completed count is derived from auth store learningProgress.
 */
function buildLessons(completedCount) {
    return INITIAL_LESSONS.map((lesson, idx) => {
        let status;
        if (idx < completedCount) {
            status = 'completed';
        } else if (idx === completedCount) {
            status = 'active';
        } else {
            status = 'locked';
        }
        return { ...lesson, status };
    });
}

export default function LearnHub() {
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = !!token;

    // Derive completed count from auth store (persisted to DB)
    const storedProgress = user?.learningProgress ?? 0;
    const initialCompletedCount = Math.round((storedProgress / 100) * TOTAL_LESSONS);

    const [completedCount, setCompletedCount] = useState(initialCompletedCount);
    const [lessons, setLessons] = useState(() => buildLessons(initialCompletedCount));
    const [activeLessonId, setActiveLessonId] = useState(() => {
        // Start from the first non-completed lesson
        const firstActive = initialCompletedCount + 1;
        return firstActive <= TOTAL_LESSONS ? firstActive : TOTAL_LESSONS;
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const [toastMsg, setToastMsg] = useState(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Sync lessons when completedCount changes
    useEffect(() => {
        setLessons(buildLessons(completedCount));
    }, [completedCount]);

    // Auto-dismiss toast
    useEffect(() => {
        if (toastMsg) {
            const t = setTimeout(() => setToastMsg(null), 4000);
            return () => clearTimeout(t);
        }
    }, [toastMsg]);

    const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];

    const overallProgress = Math.round((completedCount / TOTAL_LESSONS) * 100);
    const allCompleted = completedCount >= TOTAL_LESSONS;

    // ── Complete module handler ──
    const handleCompleteModule = async () => {
        if (activeLesson.status !== 'active') return;

        const newCompletedCount = completedCount + 1;
        const newProgress = Math.round((newCompletedCount / TOTAL_LESSONS) * 100);

        // 1. Optimistic local update (Zustand + component state)
        setCompletedCount(newCompletedCount);
        useAuthStore.getState().updateLearningProgress(newProgress);

        // Auto-advance to next module
        if (newCompletedCount < TOTAL_LESSONS) {
            setActiveLessonId(newCompletedCount + 1);
        }

        setToastMsg({
            type: 'success',
            text: newCompletedCount >= TOTAL_LESSONS
                ? '🎉 Semua modul selesai! Investment Gate terbuka.'
                : `✅ Modul ${activeLesson.id} selesai! Progress: ${newProgress}%`
        });

        // 2. Persist to backend (fire-and-forget with error handling)
        if (isAuthenticated) {
            setIsSyncing(true);
            try {
                const response = await updateLearningProgress(newProgress);
                // Update auth store with fresh user data + token from server
                if (response?.data) {
                    useAuthStore.setState({
                        user: response.data.user,
                        token: response.data.token,
                    });
                }
            } catch (err) {
                console.warn('[LearnHub] Failed to sync progress to backend:', err.message);
                setToastMsg({
                    type: 'warning',
                    text: `Progress disimpan lokal. Sinkronisasi ke server gagal: ${err.message}`
                });
                // Local progress preserved — graceful degradation
            } finally {
                setIsSyncing(false);
            }
        }
    };

    return (
        <div className="view" style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>

            {/* Toast */}
            {toastMsg && (
                <div style={{
                    position: 'fixed', top: 80, right: 20, zIndex: 9999,
                    padding: '12px 20px', borderRadius: 10,
                    background: toastMsg.type === 'success' ? '#059669' : '#F59E0B',
                    color: '#fff', fontSize: 14, fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    animation: 'slideIn 0.3s ease-out',
                    maxWidth: 400,
                }}>
                    {toastMsg.text}
                </div>
            )}

            {/* 1. Sticky Header */}
            <div style={{ background: '#1E3A5F', position: 'sticky', top: 56, zIndex: 10, padding: '16px 5%', color: '#fff' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: '#fff', strokeWidth: 2 }}><path d="M12 2v20zM17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>NEMOS Learning Academy</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Tingkatkan literasi, maksimalkan return</div>
                        </div>
                    </div>

                    {/* Overall progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
                        <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{
                                width: `${overallProgress}%`, height: '100%',
                                background: allCompleted ? '#00C853' : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                                borderRadius: 999, transition: 'width 0.5s ease',
                            }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: allCompleted ? '#A7F3D0' : '#fff', whiteSpace: 'nowrap' }}>
                            {overallProgress}%
                        </span>
                    </div>
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
                                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Modul Terkunci</h3>
                                <p style={{ color: '#94A3B8', maxWidth: 400 }}>Selesaikan modul sebelumnya untuk membuka materi ini.</p>
                            </div>
                        ) : activeLesson.status === 'completed' ? (
                            <div style={{ position: 'absolute', inset: 0, background: '#1E293B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                <svg viewBox="0 0 24 24" style={{ width: 64, height: 64, fill: 'none', stroke: '#10B981', strokeWidth: 2, marginBottom: 16 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Modul Selesai ✓</h3>
                                <p style={{ color: '#94A3B8', fontSize: 14 }}>Anda sudah menyelesaikan materi ini.</p>
                            </div>
                        ) : (
                            <div style={{ position: 'absolute', inset: 0, background: '#1E293B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s, background 0.2s' }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                >
                                    <svg viewBox="0 0 24 24" style={{ width: 36, height: 36, fill: '#fff' }}><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Video Metadata + Complete Button */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E0E7FF', color: '#4338CA', padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4338CA' }} />
                                Lesson {activeLesson.id} of {TOTAL_LESSONS}
                            </div>
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

                        {/* ── Complete Module Button ── */}
                        {activeLesson.status === 'active' && (
                            <button
                                onClick={handleCompleteModule}
                                disabled={isSyncing}
                                style={{
                                    alignSelf: 'flex-start',
                                    padding: '14px 32px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: isSyncing
                                        ? '#94A3B8'
                                        : 'linear-gradient(135deg, #059669, #10B981)',
                                    color: '#fff',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    cursor: isSyncing ? 'wait' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginTop: 8,
                                }}
                                onMouseOver={e => { if (!isSyncing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {isSyncing ? (
                                    <>
                                        <svg style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><polyline points="20 6 9 17 4 12" /></svg>
                                        Selesaikan Modul {activeLesson.id}
                                    </>
                                )}
                            </button>
                        )}

                        {/* All completed celebration */}
                        {allCompleted && (
                            <div style={{
                                marginTop: 12, padding: '16px 20px', borderRadius: 12,
                                background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                                border: '1px solid #A7F3D0',
                                display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <div style={{ fontSize: 28 }}>🎓</div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#065F46' }}>
                                        Selamat! Semua modul selesai.
                                    </div>
                                    <div style={{ fontSize: 13, color: '#047857', marginTop: 2 }}>
                                        Investment Gate terbuka — Anda sekarang bisa berinvestasi di UMKM Arena.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT COLUMN: SYLLABUS LIST */}
                <div style={{ flex: '1 1 35%', minWidth: 320, background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'sticky', top: 148, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>

                    {/* Syllabus Header */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Kurikulum Literasi Keuangan
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748B', background: '#E2E8F0', padding: '4px 10px', borderRadius: 6 }}>
                            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            {completedCount}/{TOTAL_LESSONS}
                        </div>
                    </div>

                    {/* List Container */}
                    <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {lessons.map((lesson) => {
                                const isActive = lesson.id === activeLessonId;
                                const isLocked = lesson.status === 'locked';

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

            {/* Animation keyframes */}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

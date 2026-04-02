import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import nemosLogo from '../assets/NEMOS LOGO.png';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Local-only role selector for login form UX (visual guide, not app state)
    const [selectedRole, setSelectedRole] = useState('investor');
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Email dan password wajib diisi');
            return;
        }

        setIsLoading(true);
        try {
            await login({ email: email.trim(), password });
            const user = useAuthStore.getState().user;
            if (user?.role === 'UMKM_OWNER') {
                navigate('/umkm-dashboard');
            } else {
                navigate('/arena');
            }
        } catch (err) {
            setError(err.message || 'Login gagal. Periksa email dan password Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        if (error) setError('');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 999, background: 'var(--color-bg)' }}>

            {/* LEFT PANEL - Navy Background */}
            <div style={{ flex: 1, background: 'var(--color-primary)', color: '#fff', padding: 'var(--space-2xl) var(--space-3xl)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(255,255,255,0.1)' }}>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'var(--space-2xl)' }}>
                        <div style={{ width: 44, height: 44, background: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                            <img src={nemosLogo} alt="NEMOS Logo" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #fff, #A7F3D0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEMOS</div>
                    </div>

                    <h1 className="page-title" style={{ color: '#fff', fontSize: '32px', lineHeight: 1.2, maxWidth: 500, marginBottom: 'var(--space-2xl)' }}>
                        Platform Investasi UMKM Terverifikasi Indonesia
                    </h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-btn)' }}>
                                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'var(--color-login-accent)', strokeWidth: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 600, marginTop: 2 }}>Data omzet UMKM diverifikasi blockchain</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-btn)' }}>
                                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'var(--color-login-accent)', strokeWidth: 2 }}><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 600, marginTop: 2 }}>Profil risiko dipersonalisasi AI</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-btn)' }}>
                                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'var(--color-login-accent)', strokeWidth: 2 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 600, marginTop: 2 }}>Return otomatis via smart contract</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 'var(--space-md)', marginTop: 'var(--space-2xl)' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>12.500 Investor Aktif</span>
                    <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }}></span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Rp 8,2M Dana Tersalurkan</span>
                    <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }}></span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>340 UMKM Didanai</span>
                </div>
            </div>

            {/* RIGHT PANEL - White Form */}
            <div style={{ flex: 1, background: 'var(--color-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}>
                <div style={{ width: '100%', maxWidth: 420 }}>

                    <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
                        <h2 className="section-title" style={{ fontSize: '22px', marginBottom: '4px' }}>Selamat Datang Kembali</h2>
                        <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>Masuk untuk melanjutkan perjalanan finansial Anda.</p>
                    </div>

                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <div className="label-uppercase text-muted" style={{ marginBottom: '8px' }}>Masuk sebagai:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                            {/* Role: Investor */}
                            <div
                                onClick={() => setSelectedRole('investor')}
                                style={{
                                    border: selectedRole === 'investor' ? '2px solid #1E3A5F' : '1px solid var(--color-border)',
                                    background: selectedRole === 'investor' ? '#EEF4FF' : '#fff',
                                    borderRadius: '10px', padding: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px'
                                }}
                            >
                                <div style={{ padding: '8px', background: selectedRole === 'investor' ? '#fff' : 'var(--color-bg)', borderRadius: '8px' }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: selectedRole === 'investor' ? '#1E3A5F' : 'var(--color-text-sec)', strokeWidth: 2 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Investor</div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-sec)', marginTop: '2px', lineHeight: 1.3 }}>Pantau portofolio dan return</div>
                                </div>
                            </div>

                            {/* Role: UMKM */}
                            <div
                                onClick={() => setSelectedRole('umkm_owner')}
                                style={{
                                    border: selectedRole === 'umkm_owner' ? '2px solid #00C853' : '1px solid var(--color-border)',
                                    background: selectedRole === 'umkm_owner' ? '#F0FDF4' : '#fff',
                                    borderRadius: '10px', padding: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px'
                                }}
                            >
                                <div style={{ padding: '8px', background: selectedRole === 'umkm_owner' ? '#fff' : 'var(--color-bg)', borderRadius: '8px' }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: selectedRole === 'umkm_owner' ? '#00C853' : 'var(--color-text-sec)', strokeWidth: 2 }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-pri)' }}>Pengusaha UMKM</div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-sec)', marginTop: '2px', lineHeight: 1.3 }}>Kelola pendanaan usaha</div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-pri)', marginBottom: '4px' }}>Alamat Email</label>
                            <input type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} placeholder="Masukkan email Anda" style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', outline: 'none' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-pri)', marginBottom: '4px' }}>Kata Sandi</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} placeholder="Masukkan kata sandi" style={{ width: '100%', height: '40px', padding: '0 36px 0 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', outline: 'none' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                </button>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '4px' }}>
                                <a href="#" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)' }}>Lupa kata sandi?</a>
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: '#DC2626', lineHeight: 1.4 }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} style={{ width: '100%', height: 44, border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 700, color: '#fff', background: selectedRole === 'umkm_owner' ? '#00C853' : '#1E3A5F', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s', marginTop: 4 }} onMouseOver={e => { if (!isLoading) e.currentTarget.style.opacity = '0.9'; }} onMouseOut={e => { if (!isLoading) e.currentTarget.style.opacity = '1'; }}>{isLoading ? 'Memproses...' : 'Masuk'}</button>
                        <div style={{ textAlign: 'center', marginTop: 4 }}>
                            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{selectedRole === 'umkm_owner' ? 'Masuk ke Panel Usaha Anda' : 'Masuk ke Pusat Kendali Investasi'}</span>
                        </div>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}></div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500 }}>atau</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}></div>
                    </div>

                    <button type="button" style={{ width: '100%', height: 44, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 700, background: '#fff', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => navigate('/register')} onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>Daftar Akun Baru</button>

                </div>
            </div>

            {/* Hide Sidebar & Mobile Header when Login is active for demo purposes */}
            <style>{`
        .sidebar, .mobile-header { display: none !important; }
        .main-content { margin-left: 0 !important; padding: 0 !important; }
      `}</style>
        </div>
    );
}

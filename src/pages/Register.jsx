import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import nemosLogo from '../assets/NEMOS LOGO.png';

// ── Shared Input Style ───────────────────────────────────────
const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    height: 38, padding: '0 12px',
    border: '1px solid #E5E7EB', borderRadius: 8,
    fontSize: 13, color: '#0D1B2A',
    outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
};
const labelStyle = {
    display: 'block', fontSize: 12,
    fontWeight: 600, color: '#374151', marginBottom: 4,
};
const fieldGap = { display: 'flex', flexDirection: 'column', gap: 2 };

function Field({ label, children }) {
    return <div style={fieldGap}><label style={labelStyle}>{label}</label>{children}</div>;
}

function TextInput({ type = 'text', placeholder, value, onChange, autoComplete }) {
    return (
        <input
            type={type} placeholder={placeholder}
            value={value} onChange={onChange}
            autoComplete={autoComplete}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#1E3A5F'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
    );
}

function SelectInput({ value, onChange, children }) {
    return (
        <select value={value} onChange={onChange}
            style={{ ...inputStyle, cursor: 'pointer', background: '#fff' }}
            onFocus={e => e.target.style.borderColor = '#1E3A5F'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        >
            {children}
        </select>
    );
}

function PasswordInput({ placeholder, value, onChange, autoComplete }) {
    const [show, setShow] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <input
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                value={value} onChange={onChange}
                autoComplete={autoComplete}
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = '#1E3A5F'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
            <button type="button" onClick={() => setShow(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
                {show ? (
                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
            </button>
        </div>
    );
}

// ── Upload Area ──────────────────────────────────────────────
function UploadArea({ label, sub, accent }) {
    const [hov, setHov] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    return (
        <label
            onMouseOver={() => setHov(true)}
            onMouseOut={() => setHov(false)}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '20px 16px',
                border: `2px dashed ${uploaded ? accent : '#D1D5DB'}`,
                borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                background: uploaded ? '#F0FDF4' : hov ? '#F9FAFB' : '#fff',
                transition: 'all 0.15s',
            }}
        >
            <input type="file" style={{ display: 'none' }} onChange={() => setUploaded(true)} />
            {uploaded ? (
                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: accent, strokeWidth: 2.5 }}><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
                <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: '#9CA3AF', strokeWidth: 2 }}>
                    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: uploaded ? accent : '#374151' }}>{uploaded ? 'Dokumen diunggah' : label}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{sub}</div>
        </label>
    );
}

// ── Step Indicator ───────────────────────────────────────────
function StepIndicator({ current }) {
    const steps = ['Data Diri', 'Data Usaha', 'KYC'];
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            {steps.map((s, i) => {
                const num = i + 1;
                const done = num < current;
                const active = num === current;
                return (
                    <React.Fragment key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, flexShrink: 0,
                                background: done ? '#00C853' : active ? '#1E3A5F' : 'transparent',
                                color: (done || active) ? '#fff' : '#9CA3AF',
                                border: (done || active) ? 'none' : '2px solid #D1D5DB',
                            }}>
                                {done ? (
                                    <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: '#fff', strokeWidth: 3 }}><polyline points="20 6 9 17 4 12" /></svg>
                                ) : num}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#1E3A5F' : done ? '#00C853' : '#9CA3AF' }}>{s}</span>
                        </div>
                        {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: done ? '#00C853' : '#E5E7EB', margin: '0 10px' }} />}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ── Left Panel ───────────────────────────────────────────────
function LeftPanel({ role }) {
    const isUmkm = role === 'umkm';
    const bg = isUmkm ? '#00C853' : '#1E3A5F';
    const headline = isUmkm ? 'Dapatkan Pendanaan untuk Usaha Anda' : 'Mulai Perjalanan Investasi Anda';
    const features = isUmkm
        ? ['Pendanaan Revenue-Based Financing yang adil', 'Data omzet diverifikasi secara transparan', 'Komunitas 127+ investor yang siap mendukung']
        : ['Portofolio UMKM terverifikasi dan terkurasi', 'Return otomatis via smart contract', 'Lacak dampak investasi secara real-time'];

    return (
        <div style={{ background: bg, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh', transition: 'background 0.3s' }}>
            <div>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                    <div style={{ width: 40, height: 40, background: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                        <img src={nemosLogo} alt="NEMOS Logo" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #fff, #A7F3D0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEMOS</span>
                </div>

                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 24, letterSpacing: '-0.02em' }}>{headline}</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, fill: 'none', stroke: '#fff', strokeWidth: 3 }}><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 24, marginTop: 48 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    Sudah punya akun?{' '}
                    <Link to="/login" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>Masuk di sini</Link>
                </p>
            </div>
        </div>
    );
}

// ── INVESTOR FORM ─────────────────────────────────────────────
function InvestorForm({ onSubmit, isLoading, submitError }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [validationError, setValidationError] = useState('');

    const handleSubmit = () => {
        setValidationError('');
        if (password !== confirmPassword) {
            setValidationError('Kata sandi dan konfirmasi tidak cocok');
            return;
        }
        if (!termsAccepted) {
            setValidationError('Anda harus menyetujui Syarat & Ketentuan');
            return;
        }
        onSubmit({ name, email, password, role: 'INVESTOR', phone: phone ? `+62${phone}` : undefined });
    };

    const displayError = validationError || submitError;

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Nama Lengkap"><TextInput placeholder="Contoh: Budi Santoso" value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></Field>
            <Field label="Alamat Email"><TextInput type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></Field>
            <Field label="Nomor HP">
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ height: 38, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', fontSize: 13, color: '#374151', fontWeight: 600, flexShrink: 0 }}>+62</div>
                    <input type="tel" placeholder="812-3456-7890" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" style={{ ...inputStyle, flex: 1 }}
                        onFocus={e => e.target.style.borderColor = '#1E3A5F'}
                        onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
            </Field>
            <Field label="Kata Sandi"><PasswordInput placeholder="Minimal 8 karakter" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></Field>
            <Field label="Konfirmasi Kata Sandi"><PasswordInput placeholder="Ulangi kata sandi" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" /></Field>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ marginTop: 2, accentColor: '#1E3A5F', width: 15, height: 15, flexShrink: 0 }} />
                <span>Saya telah membaca dan menyetujui <span style={{ color: '#1E3A5F', fontWeight: 600 }}>Syarat &amp; Ketentuan</span> NEMOS</span>
            </label>

            {displayError && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 13, color: '#DC2626', lineHeight: 1.4 }}>
                    {displayError}
                </div>
            )}

            <button type="submit" disabled={isLoading}
                style={{ width: '100%', height: 40, background: '#1E3A5F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, marginTop: 4, transition: 'opacity 0.2s' }}
                onMouseOver={e => { if (!isLoading) e.currentTarget.style.opacity = '0.88'; }}
                onMouseOut={e => { if (!isLoading) e.currentTarget.style.opacity = '1'; }}
            >
                {isLoading ? 'Mendaftarkan...' : 'Buat Akun Investor'}
            </button>
        </form>
    );
}

// ── UMKM FORM ─────────────────────────────────────────────────
const PAYMENT_METHODS = ['QRIS', 'Transfer Bank', 'Tunai', 'E-commerce', 'Lainnya'];

function UmkmForm({ onSubmit, isLoading, submitError }) {
    const [step, setStep] = useState(1);
    const [payMethods, setPayMethods] = useState([]);

    // Step 1: Personal data
    const [ownerName, setOwnerName] = useState('');
    const [nik, setNik] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 2: Business data
    const [businessName, setBusinessName] = useState('');
    const [category, setCategory] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [duration, setDuration] = useState('');
    const [revenue, setRevenue] = useState('');

    // Validation
    const [validationError, setValidationError] = useState('');

    const togglePay = (m) => setPayMethods(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

    const handleFinalSubmit = () => {
        setValidationError('');
        if (password !== confirmPassword) {
            setValidationError('Kata sandi dan konfirmasi tidak cocok');
            return;
        }
        onSubmit({ name: ownerName, email, password, role: 'UMKM_OWNER', phone: phone ? `+62${phone}` : undefined });
    };

    const displayError = validationError || submitError;

    const greenBtn = (label, onClick, disabled = false) => (
        <button type={disabled !== false ? 'submit' : 'button'} onClick={disabled !== false ? undefined : onClick} disabled={disabled}
            style={{ width: '100%', height: 40, background: '#00C853', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.7 : 1, marginTop: 4, transition: 'opacity 0.2s' }}
            onMouseOver={e => { if (!disabled) e.currentTarget.style.opacity = '0.88'; }}
            onMouseOut={e => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
        >{label}</button>
    );

    return (
        <div>
            <StepIndicator current={step} />

            {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Field label="Nama Lengkap Pemilik"><TextInput placeholder="Sesuai KTP" value={ownerName} onChange={e => setOwnerName(e.target.value)} autoComplete="name" /></Field>
                    <Field label="NIK (16 Digit)"><TextInput type="number" placeholder="3271xxxxxxxxxxxx" value={nik} onChange={e => setNik(e.target.value)} /></Field>
                    <Field label="Alamat Email"><TextInput type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></Field>
                    <Field label="Nomor HP">
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ height: 38, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', fontSize: 13, color: '#374151', fontWeight: 600, flexShrink: 0 }}>+62</div>
                            <input type="tel" placeholder="812-3456-7890" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" style={{ ...inputStyle, flex: 1 }}
                                onFocus={e => e.target.style.borderColor = '#00C853'}
                                onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                        </div>
                    </Field>
                    <Field label="Kata Sandi"><PasswordInput placeholder="Minimal 8 karakter" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" /></Field>
                    <Field label="Konfirmasi Kata Sandi"><PasswordInput placeholder="Ulangi kata sandi" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" /></Field>
                    {greenBtn('Lanjut ke Data Usaha →', () => setStep(2))}
                </form>
            )}

            {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Field label="Nama Usaha"><TextInput placeholder="Contoh: Dapur Nusantara" value={businessName} onChange={e => setBusinessName(e.target.value)} /></Field>
                    <Field label="Kategori Usaha">
                        <SelectInput value={category} onChange={e => setCategory(e.target.value)}><option value="">Pilih kategori...</option>{['Kuliner', 'Kerajinan', 'Agrikultur', 'Retail', 'Jasa', 'Lainnya'].map(c => <option key={c}>{c}</option>)}</SelectInput>
                    </Field>
                    <Field label="Alamat Usaha Lengkap">
                        <textarea placeholder="Jl. contoh no. 1, RT/RW..." rows={2} value={address} onChange={e => setAddress(e.target.value)}
                            style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'vertical', lineHeight: 1.5 }}
                            onFocus={e => e.target.style.borderColor = '#00C853'}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                    </Field>
                    <Field label="Kota / Kabupaten"><TextInput placeholder="Contoh: Bandung" value={city} onChange={e => setCity(e.target.value)} /></Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Lama Usaha Berjalan">
                            <SelectInput value={duration} onChange={e => setDuration(e.target.value)}><option value="">Pilih...</option>{['6-12 bulan', '1-2 tahun', '2-5 tahun', '5 tahun ke atas'].map(o => <option key={o}>{o}</option>)}</SelectInput>
                        </Field>
                        <Field label="Rata-rata Omzet Bulanan">
                            <SelectInput value={revenue} onChange={e => setRevenue(e.target.value)}><option value="">Pilih...</option>{['< Rp 5 juta', 'Rp 5-20 juta', 'Rp 20-50 juta', '> Rp 50 juta'].map(o => <option key={o}>{o}</option>)}</SelectInput>
                        </Field>
                    </div>
                    <Field label="Metode Pembayaran yang Digunakan">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
                            {PAYMENT_METHODS.map(m => (
                                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: payMethods.includes(m) ? '#00C853' : '#374151' }}>
                                    <input type="checkbox" checked={payMethods.includes(m)} onChange={() => togglePay(m)} style={{ accentColor: '#00C853', width: 15, height: 15 }} />{m}
                                </label>
                            ))}
                        </div>
                    </Field>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setStep(1)} style={{ flex: 1, height: 40, background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Kembali</button>
                        <button onClick={() => setStep(3)}
                            style={{ flex: 2, height: 40, background: '#00C853', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                            onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >Lanjut ke Verifikasi KYC →</button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <form onSubmit={(e) => { e.preventDefault(); handleFinalSubmit(); }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1E3A5F', marginBottom: 4 }}>Verifikasi Identitas &amp; Usaha</div>
                        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>Dokumen diperlukan untuk memvalidasi usaha sebelum bisa mengajukan pendanaan</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <UploadArea label="Foto KTP Pemilik" sub="JPG, PNG maks 5MB" accent="#00C853" />
                        <UploadArea label="Foto Usaha / Tempat Berjualan" sub="JPG, PNG maks 5MB" accent="#00C853" />
                        <UploadArea label="Bukti Transaksi Digital 3 Bulan" sub="Screenshot QRIS / mutasi bank, PDF atau JPG" accent="#00C853" />
                        <UploadArea label="Surat Keterangan Usaha (opsional)" sub="PDF maks 10MB, opsional" accent="#00C853" />
                    </div>

                    {/* Info banner */}
                    <div style={{ background: '#EFF6FF', borderLeft: '4px solid #1E3A5F', borderRadius: '0 8px 8px 0', padding: '14px 16px', display: 'flex', gap: 12 }}>
                        <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'none', stroke: '#1E3A5F', strokeWidth: 2, flexShrink: 0, marginTop: 1 }}>
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p style={{ fontSize: 13, color: '#1E3A5F', margin: 0, lineHeight: 1.6 }}>
                            Data KYC Anda akan diverifikasi tim NEMOS dalam <strong>3-5 hari kerja</strong>. Hanya 12% pendaftar yang lolos seleksi ketat kami — ini menjamin kualitas UMKM di platform.
                        </p>
                    </div>

                    {displayError && (
                        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 13, color: '#DC2626', lineHeight: 1.4 }}>
                            {displayError}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => setStep(2)} style={{ flex: 1, height: 40, background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Kembali</button>
                        <button type="submit" disabled={isLoading}
                            style={{ flex: 2, height: 40, background: '#00C853', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                            onMouseOver={e => { if (!isLoading) e.currentTarget.style.opacity = '0.88'; }}
                            onMouseOut={e => { if (!isLoading) e.currentTarget.style.opacity = '1'; }}
                        >{isLoading ? 'Mendaftarkan...' : 'Kirim Pendaftaran'}</button>
                    </div>

                    <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                        Dengan mendaftar, Anda menyetujui <span style={{ color: '#1E3A5F', fontWeight: 600 }}>Syarat &amp; Ketentuan</span> dan <span style={{ color: '#1E3A5F', fontWeight: 600 }}>Kebijakan Privasi</span> NEMOS.
                    </p>
                </form>
            )}
        </div>
    );
}

// ── MAIN REGISTER COMPONENT ───────────────────────────────────
export default function Register() {
    const [role, setRole] = useState('investor');
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const navigate = useNavigate();
    const register = useAuthStore((state) => state.register);

    const handleSubmit = async (data) => {
        setSubmitError('');
        setIsLoading(true);
        try {
            await register(data);
            const user = useAuthStore.getState().user;
            if (user?.role === 'UMKM_OWNER') {
                navigate('/umkm-dashboard');
            } else {
                navigate('/onboarding');
            }
        } catch (err) {
            setSubmitError(err.message || 'Pendaftaran gagal. Coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const accentColor = role === 'umkm' ? '#00C853' : '#1E3A5F';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', fontFamily: "'Inter', sans-serif", position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999, background: '#fff' }}>

            {/* Left panel */}
            <LeftPanel role={role} />

            {/* Right panel — form */}
            <div style={{ background: '#fff', overflowY: 'auto', maxHeight: '100vh', scrollbarWidth: 'thin', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', padding: '24px 32px' }}>

                    {/* Form header */}
                    <div style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0D1B2A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Buat Akun Baru</h2>
                        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Bergabung dengan komunitas NEMOS Indonesia</p>
                    </div>

                    {/* Role toggle */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Daftar Sebagai:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {[
                                { id: 'investor', icon: <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, label: 'Investor', sub: 'Mulai berinvestasi' },
                                { id: 'umkm', icon: <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>, label: 'Pengusaha UMKM', sub: 'Dapatkan pendanaan' },
                            ].map(({ id, icon, label, sub }) => {
                                const sel = role === id;
                                return (
                                    <button key={id} onClick={() => setRole(id)}
                                        style={{
                                            padding: '10px', border: `2px solid ${sel ? '#00C853' : '#E5E7EB'}`,
                                            borderRadius: 10, background: sel ? '#F0FDF4' : '#fff',
                                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                                            display: 'flex', alignItems: 'center', gap: 8,
                                        }}>
                                        <div style={{ color: sel ? '#00C853' : '#6B7280', flexShrink: 0 }}>{icon}</div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: sel ? '#0D1B2A' : '#374151' }}>{label}</div>
                                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{sub}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form body */}
                    {role === 'investor'
                        ? <InvestorForm onSubmit={handleSubmit} isLoading={isLoading} submitError={submitError} />
                        : <UmkmForm onSubmit={handleSubmit} isLoading={isLoading} submitError={submitError} />}

                    {/* Login link */}
                    <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 16 }}>
                        Sudah punya akun?{' '}
                        <Link to="/login" style={{ color: accentColor, fontWeight: 700, textDecoration: 'none' }}>Masuk</Link>
                    </p>

                </div>
            </div>

            {/* Hide nav/sidebar on register page + responsive */}
            <style>{`
        .investor-header, .sidebar, .mobile-header { display: none !important; }
        .main-content { margin-left: 0 !important; padding: 0 !important; }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="'1fr 1fr'"] > div:first-child {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
}

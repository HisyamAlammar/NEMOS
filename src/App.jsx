import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import nemosLogo from './assets/NEMOS LOGO.png';
import { useAuthStore } from './stores/auth.store';

// Layout & Navigation CSS locally for the App shell
import './index.css';

// Import Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LearnHub from './pages/LearnHub';
import UmkmArena from './pages/UmkmArena';
import UmkmDetail from './pages/UmkmDetail';
import Onboarding from './pages/Onboarding';
import Protection from './pages/Protection';
import UmkmDashboard from './pages/UmkmDashboard';
import UmkmOmzet from './pages/UmkmOmzet';
import UmkmKewajiban from './pages/UmkmKewajiban';
import UmkmKomunitas from './pages/UmkmKomunitas';
import Impact from './pages/Impact';
import Login from './pages/Login';
import Register from './pages/Register';

// ==========================================
// INVESTOR TOP NAVIGATION
// ==========================================
function InvestorTopNav({ userTier, setUserTier }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const displayName = user?.name || 'Investor';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="investor-header" style={{ background: '#fff', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, padding: '0 var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div style={{ width: 44, height: 44, background: '#ffffff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <img src={nemosLogo} alt="NEMOS Logo" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
            </div>
            <div className="brand-text" style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #1B7A8B, #00C853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEMOS</div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 'var(--space-xl)', height: '100%' }} className="hide-on-mobile">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Beranda</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Portofolio</NavLink>
          <NavLink to="/learn" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>AI Learn Hub</NavLink>
          <NavLink to="/arena" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>UMKM Arena</NavLink>
          <NavLink to="/impact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Laporan Dampak</NavLink>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ textAlign: 'right' }} className="hide-on-mobile">
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-pri)' }}>{displayName}</div>
            <div style={{ marginTop: 3, position: 'relative' }} className="premium-badge-wrap">
              <span
                onClick={() => setUserTier(userTier === 'premium' ? 'free' : 'premium')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: userTier === 'premium' ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#E5E7EB', color: userTier === 'premium' ? '#fff' : '#6B7280', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 6px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s' }}>
                {userTier === 'premium' && <svg viewBox="0 0 24 24" style={{ width: 9, height: 9, fill: 'currentColor' }}><path d="M2 20 L6 10 L12 14 L18 4 L22 20 Z" /></svg>}
                {userTier === 'premium' ? 'PREMIUM' : 'REGULAR'}
              </span>
            </div>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', padding: 8, color: 'var(--color-text-pri)', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }}>
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hide-on-mobile" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-blue-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary)' }}>{displayInitial}</div>

          <button onClick={() => { logout(); navigate('/login'); }} className="hide-on-mobile" style={{ color: 'var(--color-text-muted)', marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Log Out">
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown" style={{ position: 'absolute', top: 72, left: 0, right: 0, background: '#fff', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 99 }}>
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Beranda</NavLink>
            <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Portofolio</NavLink>
            <NavLink to="/learn" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">AI Learn Hub</NavLink>
            <NavLink to="/arena" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">UMKM Arena</NavLink>
            <NavLink to="/impact" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Laporan Dampak</NavLink>
            <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-blue-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{displayInitial}</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{displayName}</div>
              </div>
              <button onClick={() => { logout(); navigate('/login'); setMobileMenuOpen(false); }} style={{ color: 'var(--color-danger)', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Logout</button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .nav-link { color: var(--color-text-sec); font-weight: 500; text-decoration: none; display: flex; align-items: center; border-bottom: 3px solid transparent; transition: all 0.2s; height: 100%; }
        .nav-link:hover { color: var(--color-primary); }
        .nav-link.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 600; }
        .mobile-nav-link { color: var(--color-text-pri); font-weight: 600; text-decoration: none; padding: 12px; border-radius: 8px; font-size: 15px; }
        .mobile-nav-link.active { background: var(--color-blue-tint); color: var(--color-primary); }
        
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .brand-text { font-size: 20px !important; }
          .investor-header { height: auto !important; }
        }
      `}</style>
    </header>
  );
}

// ==========================================
// UMKM SIDEBAR NAVIGATION
// ==========================================
function UmkmSidebar({ sidebarOpen, setSidebarOpen }) {
  const closeSidebar = () => setSidebarOpen(false);

  const menuItems = [
    {
      label: 'Panel Usaha',
      to: '/umkm-dashboard',
      icon: (
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
        </svg>
      ),
    },
    {
      label: 'Omzet Saya',
      to: '/umkm-omzet',
      icon: (
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: 'Kewajiban Pembayaran',
      to: '/umkm-kewajiban',
      icon: (
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      label: 'Komunitas Investor',
      to: '/umkm-komunitas',
      icon: (
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        onClick={closeSidebar}
        style={{
          display: sidebarOpen ? 'block' : 'none',
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 99,
        }}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: 240, background: '#00C853', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100 }}>

        {/* ── Header ── */}
        <div style={{ padding: '24px 24px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 40, height: 40, background: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <img src={nemosLogo} alt="NEMOS Logo" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #fff, #A7F3D0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEMOS</div>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(({ label, to, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) => isActive ? 'umkm-nav-item active' : 'umkm-nav-item'}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', transition: 'all 0.18s ease' }}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 16px' }} />

        {/* ── Footer ── */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Avatar with online dot */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150"
                alt="Ibu Sari"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid #00C853' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Ibu Sari</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Dapur Nusantara</div>
            </div>
          </div>

          {/* Logout icon */}
          <NavLink
            to="/login"
            onClick={closeSidebar}
            title="Keluar"
            style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', textDecoration: 'none', borderRadius: '6px', transition: 'color 0.15s' }}
            onMouseOver={e => e.currentTarget.style.color = '#fff'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </NavLink>
        </div>

        {/* Scoped styles for nav item states */}
        <style>{`
          .umkm-nav-item {
            color: rgba(255,255,255,0.7);
            font-weight: 500;
            border-left: 3px solid transparent;
          }
          .umkm-nav-item:hover {
            background: rgba(255,255,255,0.2);
            color: #fff;
            border-left: 3px solid #fff;
          }
          .umkm-nav-item.active {
            background: rgba(255,255,255,0.2);
            color: #fff;
            font-weight: 600;
            border-left: 3px solid #fff;
          }
        `}</style>

      </aside>
    </>
  );
}

function MobileHeader({ setSidebarOpen }) {
  return (
    <header className="mobile-header" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: 'var(--color-primary)', zIndex: 101, alignItems: 'center', padding: '0 var(--space-md)', gap: 'var(--space-md)' }}>
      <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, stroke: 'currentColor', strokeWidth: 2, fill: 'none' }}>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <span style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: '#fff' }}><span style={{ letterSpacing: "0.05em" }}>NEMOS</span></span>
      <style>{`
        @media (min-width: 769px) { .mobile-header { display: none !important; } }
      `}</style>
    </header>
  );
}

// Floating Switcher — hidden on auth pages
function RoleSwitcher({ userRole, setUserRole }) {
  const loc = useLocation();
  if (loc.pathname === '/login' || loc.pathname === '/register') return null;
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, background: '#fff', padding: 8, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', gap: 8, border: '1px solid var(--color-border)' }}>
      <button onClick={() => setUserRole('investor')} style={{ padding: '8px 16px', borderRadius: 8, background: userRole === 'investor' ? '#1E3A5F' : 'transparent', color: userRole === 'investor' ? '#fff' : '#1E3A5F', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>Investor</button>
      <button onClick={() => setUserRole('umkm_owner')} style={{ padding: '8px 16px', borderRadius: 8, background: userRole === 'umkm_owner' ? '#00C853' : 'transparent', color: userRole === 'umkm_owner' ? '#fff' : '#00C853', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>Pengusaha UMKM</button>
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState('investor'); // 'investor' | 'umkm_owner'
  const [userTier, setUserTier] = useState('premium'); // 'premium' | 'free'

  return (
    <BrowserRouter>
      <RoleSwitcher userRole={userRole} setUserRole={setUserRole} />
      <div className={`app-shell ${userRole === 'investor' ? 'theme-investor' : 'theme-umkm'}`}>

        {userRole === 'investor' ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
            <InvestorTopNav userTier={userTier} setUserTier={setUserTier} />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/learn" element={<LearnHub />} />
                <Route path="/arena" element={<UmkmArena userTier={userTier} />} />
                <Route path="/detail/:id" element={<UmkmDetail userTier={userTier} />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/protection" element={<Protection />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/login" element={<Login userRole={userRole} setUserRole={setUserRole} />} />
                <Route path="/register" element={<Register />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        ) : (
          <div style={{ width: '100%', background: 'var(--color-bg)' }}>
            <MobileHeader setSidebarOpen={setSidebarOpen} />
            <UmkmSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="main-content">
              <Routes>
                <Route path="/umkm-dashboard" element={<UmkmDashboard />} />
                <Route path="/umkm-omzet" element={<UmkmOmzet />} />
                <Route path="/umkm-kewajiban" element={<UmkmKewajiban />} />
                <Route path="/umkm-komunitas" element={<UmkmKomunitas />} />
                <Route path="/login" element={<Login userRole={userRole} setUserRole={setUserRole} />} />
                <Route path="/register" element={<Register />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/umkm-dashboard" replace />} />
              </Routes>
            </main>
          </div>
        )}

      </div>
    </BrowserRouter>
  );
}

export default App;

import React, { useState } from 'react';
import type { User, Role } from '../db/schema';
import db from '../db/dbClient';
import { 
  ShieldCheck, PiggyBank, HandCoins, Key, Lock, Mail
} from 'lucide-react';

interface BerandaProps {
  onLoginSuccess: (user: User, role: Role) => void;
}

export const Beranda: React.FC<BerandaProps> = ({ onLoginSuccess }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Login Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setErrorMessage('Username harus diisi.');
      return;
    }

    // Authenticate user in simulation
    // Joko Widodo (joko123 / anggota123), Admin (admin / admin123), Petugas (petugas1 / petugas123)
    const user = db.users.find(u => u.username === username);
    if (!user) {
      setErrorMessage('Username tidak ditemukan.');
      return;
    }

    // Simple default password match check
    const expectedPassword = user.id_role === 1 ? 'admin123' : user.id_role === 2 ? 'petugas123' : 'anggota123';
    if (password && password !== expectedPassword) {
      setErrorMessage('Password salah.');
      return;
    }

    const role = db.roles.find(r => r.id_role === user.id_role);
    if (role) {
      onLoginSuccess(user, role);
    }
  };

  const handleQuickLogin = (roleName: 'Admin' | 'Petugas' | 'Anggota') => {
    const role = db.roles.find(r => r.nama_role === roleName);
    const user = db.users.find(u => u.id_role === role?.id_role);
    if (user && role) {
      onLoginSuccess(user, role);
    }
  };

  return (
    <div className="landing-container animate-fade-in">
      {/* Navbar */}
      <header className="landing-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--primary), var(--warning))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800
          }}>
            KI
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>Kop Infolahta Seskoad</span>
        </div>
        
        <nav style={{ display: 'flex', gap: 24, fontSize: '0.9rem', fontWeight: 600 }} className="no-print">
          <a href="#simpanan" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Program Simpanan</a>
          <a href="#pinjaman" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Program Pinjaman</a>
        </nav>

        <button 
          className="btn btn-primary"
          onClick={() => setShowLoginModal(true)}
        >
          Masuk Portal
        </button>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)', padding: 14, borderRadius: '50%',
            color: 'var(--warning)', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <ShieldCheck size={48} />
          </div>
        </div>
        <h1 className="landing-hero-title">Koperasi Infolahta Seskoad</h1>
        <p className="landing-hero-sub">
          Layanan keuangan digital terintegrasi untuk pengolahan data simpanan dan pembiayaan pinjaman 
          mandiri bagi anggota Sekolah Staf dan Komando Angkatan Darat.
        </p>
        <button 
          className="btn btn-primary btn-lg"
          style={{ background: 'var(--warning)', color: 'var(--bg-primary)', border: 'none', padding: '12px 28px', fontSize: '1rem' }}
          onClick={() => setShowLoginModal(true)}
        >
          Mulai Akses Anggota
        </button>
      </section>

      {/* Program Simpanan */}
      <section id="simpanan" className="landing-section">
        <h2 className="landing-section-title">Program Simpanan Anggota</h2>
        <div className="grid-cols-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <PiggyBank size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Simpanan Pokok</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Uang pangkal keanggotaan sebesar **Rp100.000** yang dibayarkan satu kali saat mendaftar sebagai anggota koperasi.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <PiggyBank size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Simpanan Wajib</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Iuran rutin bulanan sebesar **Rp50.000** wajib dibayarkan oleh seluruh anggota demi memperkuat permodalan bersama.
            </p>
          </div>

          <div className="card">
            <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <PiggyBank size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Simpanan Sukarela</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Simpanan bebas tanpa batas minimal yang dapat disetor dan diambil kapan saja untuk kebutuhan finansial darurat anggota.
            </p>
          </div>
        </div>
      </section>

      {/* Program Pinjaman */}
      <section id="pinjaman" className="landing-section" style={{ borderTop: '1px solid var(--border)' }}>
        <h2 className="landing-section-title">Program Pinjaman Usaha</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '32px' }}>
            <div style={{ 
              width: 54, height: 54, borderRadius: '50%', background: 'var(--primary-light)', 
              color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 
            }}>
              <HandCoins size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>Pembiayaan Kredit Bunga Flat</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Dapatkan pembiayaan modal usaha bagi anggota dengan suku bunga bersaing flat **12% per tahun (1% per bulan)**. 
              Persetujuan cepat dan transparan diproses oleh petugas administrasi.
            </p>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div><strong>Bunga Bulanan:</strong> 1% Flat</div>
              <div><strong>Bunga Tahunan:</strong> 12%</div>
              <div><strong>Tenor Pilihan:</strong> s.d. 24 Bulan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>&copy; 2026 Koperasi Infolahta Seskoad. All Rights Reserved.</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Sistem Simpan Pinjam Digital Mandiri Terintegrasi</div>
      </footer>

      {/* --- LOGIN MODAL --- */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={18} /> Portal Login Seskoad
              </h3>
              <button className="action-btn" onClick={() => { setShowLoginModal(false); setErrorMessage(''); }}>&times;</button>
            </div>
            
            {errorMessage && (
              <div style={{ 
                padding: '10px', background: 'var(--danger-light)', color: 'var(--danger)', 
                fontSize: '0.8rem', borderRadius: '6px', marginBottom: 14, fontWeight: 600
              }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>
                    <Mail size={16} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Contoh: admin / petugas1 / joko123" 
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>
                    <Key size={16} />
                  </span>
                  <input 
                    type="password" 
                    placeholder="Password default" 
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Gunakan password default (misal: admin123, petugas123, anggota123)
                </span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 10 }}
              >
                Log In
              </button>

              <div className="divider" style={{ margin: '20px 0' }} />
              
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Quick Access Demo</span>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => handleQuickLogin('Admin')}
                  >
                    Admin
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => handleQuickLogin('Petugas')}
                  >
                    Petugas
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => handleQuickLogin('Anggota')}
                  >
                    Anggota
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Beranda;

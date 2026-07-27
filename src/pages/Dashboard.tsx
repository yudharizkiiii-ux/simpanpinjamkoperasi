import React from 'react';
import { 
  PiggyBank, HandCoins, Users, 
  Calendar, ArrowUpRight, ArrowDownRight, AlertTriangle, Coins
} from 'lucide-react';
import type { User, Role } from '../db/schema';
import db from '../db/dbClient';

interface DashboardProps {
  currentUser: User;
  currentRole: Role;
  setActiveTab: (tab: string) => void;
  triggerRefresh?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  currentUser, 
  currentRole, 
  setActiveTab
}) => {
  const isAnggota = currentRole.nama_role === 'Anggota';
  
  const members = db.anggota;
  const savings = db.simpanan;
  const loans = db.pinjaman;
  const installments = db.angsuran;
  const cashBook = db.kas;

  // --- ANGGOTA PERSONAL STATS ---
  const memberObj = isAnggota ? members.find(m => m.id_user === currentUser.id_user) : null;
  const mySavings = memberObj ? savings.filter(s => s.id_anggota === memberObj.id_anggota) : [];
  const myLoans = memberObj ? loans.filter(l => l.id_anggota === memberObj.id_anggota) : [];

  let myPokok = 0;
  let myWajib = 0;
  let mySukarela = 0;

  mySavings.forEach(s => {
    if (s.jenis_simpanan === 'Pokok') myPokok += s.nominal;
    else if (s.jenis_simpanan === 'Wajib') myWajib += s.nominal;
    else if (s.jenis_simpanan === 'Sukarela') mySukarela += s.nominal;
  });

  const myTotalSavings = myPokok + myWajib + mySukarela;
  const myActiveLoans = myLoans.filter(l => l.status === 'disetujui');
  const myTotalActiveLoansVal = myActiveLoans.reduce((sum, l) => sum + l.jumlah, 0);

  // --- ADMIN/PETUGAS SUMMARY STATS ---
  const totalSimpanan = savings.reduce((sum, s) => sum + s.nominal, 0);
  const totalPinjaman = loans.filter(l => l.status === 'disetujui').reduce((sum, l) => sum + l.jumlah, 0);
  const totalAngsuran = installments.reduce((sum, a) => sum + a.nominal, 0);
  const totalMembers = members.length;

  // Calculate interest income (approx 1% of total paid installments in mock)
  let pendapatanBunga = 0;
  installments.forEach(a => {
    const loan = loans.find(l => l.id === a.id_pinjaman);
    if (loan) {
      // Monthly flat interest = Principal * (annual rate / 12) / 100
      const monthlyBunga = loan.jumlah * (loan.bunga / 12) / 100;
      pendapatanBunga += monthlyBunga;
    }
  });

  // Calculate mock "Pinjaman Macet" (loans whose status is 'disetujui' and date is older than 6 months with minimal repayments)
  const pinjamanMacet = loans
    .filter(l => l.status === 'disetujui' && new Date(l.tanggal).getTime() < new Date('2026-03-01').getTime())
    .reduce((sum, l) => sum + l.jumlah, 0);

  // SVG Chart data
  const getMonthlyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const monthlyTotals = [150000, 100000, 1100000, 1300000, 1100000, 0, 50000];
    const max = Math.max(...monthlyTotals, 1500000);
    return months.map((m, idx) => ({
      label: m,
      value: monthlyTotals[idx],
      height: `${(monthlyTotals[idx] / max) * 100}%`
    }));
  };

  const recentTransactions = [...cashBook]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div className="content-body animate-fade-in">
      {isAnggota ? (
        // ==================== ANGGOTA VIEW ====================
        <>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Halo, {memberObj?.nama}!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Nomor Anggota: {memberObj?.nomor_anggota} | Selamat datang di panel Anggota.</p>
          </div>

          <div className="grid-cols-4">
            <div className="card">
              <div className="metric-card">
                <div>
                  <div className="metric-label">Simpanan Saya</div>
                  <div className="metric-value">Rp {myTotalSavings.toLocaleString('id-ID')}</div>
                </div>
                <div className="metric-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <PiggyBank size={24} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="metric-card">
                <div>
                  <div className="metric-label">Pinjaman Aktif Saya</div>
                  <div className="metric-value">Rp {myTotalActiveLoansVal.toLocaleString('id-ID')}</div>
                </div>
                <div className="metric-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                  <HandCoins size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Rincian Tabungan Saya</h3>
              <div className="detail-grid">
                <span className="detail-label">Simpanan Pokok:</span>
                <span className="detail-value">Rp {myPokok.toLocaleString('id-ID')}</span>
                
                <span className="detail-label">Simpanan Wajib:</span>
                <span className="detail-value">Rp {myWajib.toLocaleString('id-ID')}</span>
                
                <span className="detail-label">Simpanan Sukarela:</span>
                <span className="detail-value">Rp {mySukarela.toLocaleString('id-ID')}</span>
              </div>
              <div className="divider" />
              <div className="flex-between">
                <span style={{ fontWeight: 700 }}>Total Simpanan</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>Rp {myTotalSavings.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Pengajuan Modal</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Gunakan simulasi pembiayaan flat bunga 12% per tahun untuk mengajukan modal pinjaman baru.
                </p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('anggota_pinjaman')}
              >
                Ajukan Pinjaman Baru
              </button>
            </div>
          </div>
        </>
      ) : (
        // ==================== ADMIN & PETUGAS VIEW ====================
        <>
          {/* Main 6 KPIs */}
          <div className="grid-cols-4">
            <div className="card">
              <div className="metric-card">
                <div>
                  <div className="metric-label">Jumlah Anggota</div>
                  <div className="metric-value">{totalMembers} Orang</div>
                </div>
                <div className="metric-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="metric-card">
                <div>
                  <div className="metric-label">Total Simpanan</div>
                  <div className="metric-value" style={{ color: 'var(--success)' }}>
                    Rp {totalSimpanan.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="metric-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <PiggyBank size={24} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="metric-card">
                <div>
                  <div className="metric-label">Total Pinjaman</div>
                  <div className="metric-value">Rp {totalPinjaman.toLocaleString('id-ID')}</div>
                </div>
                <div className="metric-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                  <HandCoins size={24} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="metric-card">
                <div>
                  <div className="metric-label">Total Angsuran</div>
                  <div className="metric-value">Rp {totalAngsuran.toLocaleString('id-ID')}</div>
                </div>
                <div className="metric-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                  <Calendar size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid-cols-4" style={{ marginTop: '-12px' }}>
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="metric-card">
                <div>
                  <div className="metric-label">Pinjaman Macet</div>
                  <div className="metric-value" style={{ color: 'var(--danger)' }}>
                    Rp {pinjamanMacet.toLocaleString('id-ID')}
                  </div>
                  <div className="metric-trend text-muted" style={{ marginTop: 6 }}>
                    Outstanding kredit tertunggak &gt; 90 Hari
                  </div>
                </div>
                <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <AlertTriangle size={24} />
                </div>
              </div>
            </div>

            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="metric-card">
                <div>
                  <div className="metric-label">Pendapatan Bunga</div>
                  <div className="metric-value" style={{ color: 'var(--primary)' }}>
                    Rp {pendapatanBunga.toLocaleString('id-ID')}
                  </div>
                  <div className="metric-trend text-muted" style={{ marginTop: 6 }}>
                    Akumulasi pendapatan jasa bunga (Flat 1%)
                  </div>
                </div>
                <div className="metric-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Coins size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid-cols-2">
            {/* SVG Interactive Chart */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Grafik Transaksi Bulanan 2026</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>Dana setoran angsuran & simpanan masuk per bulan (IDR)</p>
              
              <div className="chart-container">
                {getMonthlyChartData().map((bar, idx) => (
                  <div key={idx} className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: bar.height }}>
                      <div className="chart-tooltip">Rp {bar.value.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="chart-label">{bar.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Cash Flow Ledger */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Jurnal Alur Kas</h3>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('laporan')}
                >
                  Lihat Buku Kas
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex-between" 
                    style={{ 
                      paddingBottom: 10, 
                      borderBottom: '1px solid var(--border)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{tx.sumber}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{tx.tanggal}</div>
                    </div>
                    <div 
                      style={{ 
                        fontWeight: 700,
                        color: tx.jenis === 'Masuk' ? 'var(--success)' : 'var(--danger)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      {tx.jenis === 'Masuk' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      Rp {tx.nominal.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default Dashboard;

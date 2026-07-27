import React, { useState } from 'react';
import type { User, Role } from '../db/schema';
import db from '../db/dbClient';
import { Search, CalendarDays } from 'lucide-react';

interface AngsuranPageProps {
  currentUser: User;
  currentRole: Role;
  triggerRefresh: () => void;
}

export const AngsuranPage: React.FC<AngsuranPageProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const installments = db.angsuran;
  const loans = db.pinjaman;
  const members = db.anggota;

  const getMemberName = (loanId: number) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return 'Anggota';
    return members.find(m => m.id_anggota === loan.id_anggota)?.nama || 'Anggota';
  };

  const filtered = installments.filter(a => {
    const mName = getMemberName(a.id_pinjaman).toLowerCase();
    const query = searchQuery.toLowerCase();
    return mName.includes(query) || `PJ-${a.id_pinjaman}`.toLowerCase().includes(query);
  });

  return (
    <div className="content-body animate-fade-in">
      <div className="flex-between mb-4">
        {/* Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Cari angsuran (Nama, No Pinjaman)..."
            className="form-control"
            style={{ paddingLeft: '40px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ margin: 0, border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>ID Pembayaran</th>
                <th>No. Pinjaman</th>
                <th>Nama Anggota</th>
                <th>Angsuran Ke</th>
                <th>Nominal Setoran</th>
                <th>Tanggal Bayar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Belum ada setoran angsuran terekam
                  </td>
                </tr>
              ) : (
                [...filtered].reverse().map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>TX-ANG-{a.id.toString().padStart(4, '0')}</td>
                    <td style={{ fontWeight: 600 }}>PJ-{a.id_pinjaman.toString().padStart(3, '0')}</td>
                    <td>{getMemberName(a.id_pinjaman)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CalendarDays size={14} style={{ color: 'var(--primary)' }} />
                        <span>Pembayaran Ke-{a.angsuran_ke}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                      Rp {a.nominal.toLocaleString('id-ID')}
                    </td>
                    <td>{a.tanggal}</td>
                    <td>
                      <span className="badge badge-success">BERHASIL</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AngsuranPage;

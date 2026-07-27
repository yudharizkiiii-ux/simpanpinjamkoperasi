import React, { useState } from 'react';
import type { User, Role, Simpanan } from '../db/schema';
import db from '../db/dbClient';
import { Search, Plus, Eye, Receipt } from 'lucide-react';

interface SimpananPageProps {
  currentUser: User;
  currentRole: Role;
  refreshFlag?: number;
  triggerRefresh: () => void;
}

export const SimpananPage: React.FC<SimpananPageProps> = ({ 
  currentUser, 
  currentRole, 
  triggerRefresh 
}) => {
  const isAnggota = currentRole.nama_role === 'Anggota';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Simpanan | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Form states
  const [idAnggota, setIdAnggota] = useState<number>(0);
  const [jenisSimpanan, setJenisSimpanan] = useState<'Pokok' | 'Wajib' | 'Sukarela'>('Wajib');
  const [nominal, setNominal] = useState<number>(50000);

  const members = db.anggota;

  const getTransactions = (): Simpanan[] => {
    if (isAnggota) {
      const memberObj = members.find(m => m.id_user === currentUser.id_user);
      if (!memberObj) return [];
      return db.simpanan.filter(s => s.id_anggota === memberObj.id_anggota);
    } else {
      return db.simpanan;
    }
  };

  const transactions = getTransactions();

  const handleCreateDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idAnggota === 0) {
      alert('Pilih anggota terlebih dahulu.');
      return;
    }
    if (nominal <= 0) {
      alert('Masukkan nominal setoran.');
      return;
    }

    db.createSimpanan(idAnggota, jenisSimpanan, nominal);

    // Reset
    setIdAnggota(0);
    setJenisSimpanan('Wajib');
    setNominal(50000);

    setShowAddModal(false);
    triggerRefresh();
  };

  const getMemberName = (id: number) => members.find(m => m.id_anggota === id)?.nama || 'Anggota';
  const getMemberNumber = (id: number) => members.find(m => m.id_anggota === id)?.nomor_anggota || '-';

  const filteredTransactions = transactions.filter(tx => {
    const mName = getMemberName(tx.id_anggota).toLowerCase();
    const query = searchQuery.toLowerCase();
    return mName.includes(query) || tx.jenis_simpanan.toLowerCase().includes(query);
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
            placeholder={isAnggota ? "Cari jenis simpanan..." : "Cari setoran (Nama, Jenis)..."}
            className="form-control"
            style={{ paddingLeft: '40px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Add Button */}
        {!isAnggota && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Setor Dana Simpanan
          </button>
        )}
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ margin: 0, border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                {!isAnggota && <th>Anggota</th>}
                <th>Jenis Simpanan</th>
                <th>Nominal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={isAnggota ? 4 : 5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Belum ada transaksi simpanan tercatat
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 600 }}>TX-SIM-{tx.id.toString().padStart(4, '0')}</td>
                    <td>{tx.tanggal}</td>
                    {!isAnggota && <td>{getMemberName(tx.id_anggota)}</td>}
                    <td>
                      <span className={`badge ${
                        tx.jenis_simpanan === 'Pokok' ? 'badge-info' : 
                        tx.jenis_simpanan === 'Wajib' ? 'badge-warning' : 'badge-success'
                      }`}>
                        Simpanan {tx.jenis_simpanan}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>Rp {tx.nominal.toLocaleString('id-ID')}</td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setSelectedTx(tx); setShowReceiptModal(true); }}
                      >
                        <Eye size={14} /> Kwitansi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD DEPOSIT MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Penerimaan Setoran Simpanan</h3>
              <button className="action-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateDeposit}>
              <div className="form-group">
                <label className="form-label">Pilih Anggota *</label>
                <select className="form-control" value={idAnggota} onChange={e => setIdAnggota(parseInt(e.target.value))} required>
                  <option value={0}>-- Pilih Anggota --</option>
                  {members.map(m => (
                    <option key={m.id_anggota} value={m.id_anggota}>{m.nama} ({m.nomor_anggota})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Simpanan *</label>
                <select className="form-control" value={jenisSimpanan} onChange={e => setJenisSimpanan(e.target.value as any)}>
                  <option value="Pokok">Simpanan Pokok (Awal)</option>
                  <option value="Wajib">Simpanan Wajib (Bulanan)</option>
                  <option value="Sukarela">Simpanan Sukarela</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nominal Rupiah (IDR) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={nominal} 
                  onChange={e => setNominal(parseInt(e.target.value) || 0)} 
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {showReceiptModal && selectedTx && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Receipt size={20} /> Bukti Kwitansi Setor
              </h3>
              <button className="action-btn" onClick={() => { setSelectedTx(null); setShowReceiptModal(false); }}>&times;</button>
            </div>
            
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ref Transaksi</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>TX-SIM-{selectedTx.id.toString().padStart(4, '0')}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tanggal: {selectedTx.tanggal}</div>
            </div>

            <div className="divider" />

            <div className="detail-grid" style={{ gap: '8px 12px' }}>
              <span className="detail-label">Penyetor:</span>
              <span className="detail-value" style={{ fontWeight: 600 }}>{getMemberName(selectedTx.id_anggota)}</span>

              <span className="detail-label">No. Anggota:</span>
              <span className="detail-value">{getMemberNumber(selectedTx.id_anggota)}</span>

              <span className="detail-label">Jenis Simpanan:</span>
              <span className="detail-value" style={{ fontWeight: 600 }}>Simpanan {selectedTx.jenis_simpanan}</span>
            </div>

            <div className="divider" />

            <div className="flex-between" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              <span>NOMINAL SETORAN</span>
              <span style={{ color: 'var(--success)' }}>Rp {selectedTx.nominal.toLocaleString('id-ID')}</span>
            </div>

            <div className="divider" />
            
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Dana telah diterima dan dicatat ke dalam buku kas koperasi.
            </p>

            <div className="modal-footer" style={{ marginTop: 24 }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => { setSelectedTx(null); setShowReceiptModal(false); }}
              >
                Tutup Kwitansi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SimpananPage;

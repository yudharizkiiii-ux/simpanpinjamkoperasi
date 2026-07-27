import React, { useState } from 'react';
import type { User, Anggota as AnggotaType } from '../db/schema';
import db from '../db/dbClient';
import { Search, Plus, Eye } from 'lucide-react';

interface AnggotaProps {
  currentUser: User;
  refreshFlag?: number;
  triggerRefresh: () => void;
}

export const Anggota: React.FC<AnggotaProps> = ({ triggerRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnggota, setSelectedAnggota] = useState<AnggotaType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form states
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');

  const listAnggota = db.anggota;

  const handleAddAnggota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !alamat || !telepon) {
      alert('Mohon isi semua field wajib.');
      return;
    }

    db.addAnggota(nama, alamat, telepon);

    // Reset Form
    setNama('');
    setAlamat('');
    setTelepon('');

    setShowAddModal(false);
    triggerRefresh();
  };

  const filteredList = listAnggota.filter(a => 
    a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.nomor_anggota && a.nomor_anggota.toLowerCase().includes(searchQuery.toLowerCase())) ||
    a.telepon.includes(searchQuery)
  );

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
            placeholder="Cari anggota (Nama, No. Anggota, Telepon)..."
            className="form-control"
            style={{ paddingLeft: '40px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Add Button */}
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Registrasi Anggota
        </button>
      </div>

      {/* Members Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ margin: 0, border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>No. Anggota</th>
                <th>Nama Lengkap</th>
                <th>Telepon</th>
                <th>Alamat</th>
                <th>Tanggal Daftar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Tidak ada data anggota ditemukan
                  </td>
                </tr>
              ) : (
                filteredList.map((a) => (
                  <tr key={a.id_anggota}>
                    <td style={{ fontWeight: 600 }}>{a.nomor_anggota || `ANG-${a.id_anggota}`}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img 
                          src={a.foto} 
                          alt={a.nama} 
                          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                          }}
                        />
                        <span>{a.nama}</span>
                      </div>
                    </td>
                    <td>{a.telepon}</td>
                    <td>{a.alamat}</td>
                    <td>{a.tanggal_daftar}</td>
                    <td>
                      <span className={`badge badge-success`}>Aktif</span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => { setSelectedAnggota(a); setShowDetailModal(true); }}
                        title="Lihat Detail"
                      >
                        <Eye size={14} /> Profil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Registrasi Anggota Baru</h3>
              <button className="action-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddAnggota}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input type="text" className="form-control" value={nama} onChange={e => setNama(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Telepon / HP *</label>
                <input type="text" className="form-control" value={telepon} onChange={e => setTelepon(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Lengkap *</label>
                <textarea className="form-control" rows={3} value={alamat} onChange={e => setAlamat(e.target.value)} required></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Registrasikan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DETAIL MODAL --- */}
      {showDetailModal && selectedAnggota && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Profil Detail Anggota</h3>
              <button className="action-btn" onClick={() => { setSelectedAnggota(null); setShowDetailModal(false); }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
              <img 
                src={selectedAnggota.foto} 
                alt={selectedAnggota.nama} 
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                }}
              />
              <div>
                <h4 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>{selectedAnggota.nama}</h4>
                <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{selectedAnggota.nomor_anggota}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mendaftar pada: {selectedAnggota.tanggal_daftar}</div>
              </div>
            </div>

            <div className="detail-grid">
              <span className="detail-label">Telepon / HP</span>
              <span className="detail-value">{selectedAnggota.telepon}</span>

              <span className="detail-label">Alamat Tinggal</span>
              <span className="detail-value">{selectedAnggota.alamat}</span>

              <span className="detail-label">Status Anggota</span>
              <span className="detail-value">
                <span className="badge badge-success">Aktif</span>
              </span>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => { setSelectedAnggota(null); setShowDetailModal(false); }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Anggota;

import React, { useState } from 'react';
import type { User, Role, Pinjaman } from '../db/schema';
import db from '../db/dbClient';
import { Search, Plus, Eye, CheckCircle2, XCircle } from 'lucide-react';

interface PinjamanPageProps {
  currentUser: User;
  currentRole: Role;
  refreshFlag?: number;
  triggerRefresh: () => void;
}

export const PinjamanPage: React.FC<PinjamanPageProps> = ({ 
  currentUser, 
  currentRole, 
  triggerRefresh 
}) => {
  const isAnggota = currentRole.nama_role === 'Anggota';

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Pinjaman | null>(null);
  const [showInstallmentsModal, setShowInstallmentsModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Apply Form states
  const [jumlah, setJumlah] = useState<number>(10000000);
  const [tenor, setTenor] = useState<number>(10);
  const [bungaTahunan, setBungaTahunan] = useState<number>(12); // Default 12% per year
  const [idAnggota, setIdAnggota] = useState<number>(0);

  // Repayment states
  const [paymentMetode, setPaymentMetode] = useState<'Tunai' | 'Transfer' | 'QRIS'>('Tunai');

  // Fetch db items
  const members = db.anggota;
  const listAngsuran = db.angsuran;

  // Filter loans
  const getLoans = (): Pinjaman[] => {
    if (isAnggota) {
      const memberObj = members.find(m => m.id_user === currentUser.id_user);
      if (!memberObj) return [];
      return db.pinjaman.filter(l => l.id_anggota === memberObj.id_anggota);
    } else {
      return db.pinjaman;
    }
  };

  const loans = getLoans();

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetAnggotaId = 0;
    if (isAnggota) {
      const m = members.find(m => m.id_user === currentUser.id_user);
      if (!m) return;
      targetAnggotaId = m.id_anggota;
    } else {
      if (idAnggota === 0) {
        alert('Pilih anggota terlebih dahulu.');
        return;
      }
      targetAnggotaId = idAnggota;
    }

    db.createPinjaman(
      targetAnggotaId,
      jumlah,
      bungaTahunan,
      tenor
    );

    // Reset
    setJumlah(10000000);
    setTenor(10);
    setBungaTahunan(12);
    setIdAnggota(0);

    setShowApplyModal(false);
    triggerRefresh();
  };

  const handleApprove = (id: number) => {
    db.approvePinjaman(id);
    triggerRefresh();
  };

  const handleReject = (id: number) => {
    db.rejectPinjaman(id);
    triggerRefresh();
  };

  // Repayment calculation
  const getRepaymentAmounts = (loan: Pinjaman) => {
    const bungaPerBulan = (loan.bunga / 12) / 100;
    const nominalBunga = loan.jumlah * bungaPerBulan;
    const nominalPokok = loan.jumlah / loan.lama;
    const totalAngsuran = nominalPokok + nominalBunga;
    return {
      pokok: nominalPokok,
      bunga: nominalBunga,
      total: totalAngsuran
    };
  };

  const handleRepayInstallment = () => {
    if (!selectedLoan) return;

    // Determine the next installment number
    const paidList = listAngsuran.filter(a => a.id_pinjaman === selectedLoan.id);
    const nextKe = paidList.length + 1;
    const amounts = getRepaymentAmounts(selectedLoan);

    db.createAngsuran(selectedLoan.id, nextKe, amounts.total);

    setShowPayModal(false);

    // Refresh selected loan info
    const updated = db.pinjaman.find(l => l.id === selectedLoan.id);
    if (updated) setSelectedLoan(updated);

    triggerRefresh();
  };

  // Helper values
  const getMemberName = (id: number) => members.find(m => m.id_anggota === id)?.nama || 'Anggota';

  const filteredLoans = loans.filter(l => {
    const name = getMemberName(l.id_anggota).toLowerCase();
    const num = `PJ-${l.id}`;
    return name.includes(searchQuery.toLowerCase()) || num.toLowerCase().includes(searchQuery.toLowerCase());
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
            placeholder="Cari pinjaman (Nama, No. Pinjaman)..."
            className="form-control"
            style={{ paddingLeft: '40px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Action button */}
        <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
          <Plus size={18} /> {isAnggota ? 'Ajukan Pinjaman' : 'Buat Pinjaman Baru'}
        </button>
      </div>

      {/* Loans list */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ margin: 0, border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>No. Pinjaman</th>
                <th>Tanggal Pengajuan</th>
                {!isAnggota && <th>Anggota</th>}
                <th>Jumlah Pokok</th>
                <th>Tenor</th>
                <th>Bunga Flat / Thn</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={isAnggota ? 7 : 8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    Tidak ada transaksi pinjaman aktif
                  </td>
                </tr>
              ) : (
                filteredLoans.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>PJ-{l.id.toString().padStart(3, '0')}</td>
                    <td>{l.tanggal}</td>
                    {!isAnggota && <td>{getMemberName(l.id_anggota)}</td>}
                    <td style={{ fontWeight: 600 }}>Rp {l.jumlah.toLocaleString('id-ID')}</td>
                    <td>{l.lama} Bulan</td>
                    <td>{l.bunga}% Flat</td>
                    <td>
                      <span className={`badge ${
                        l.status === 'disetujui' ? 'badge-info' : 
                        l.status === 'lunas' ? 'badge-success' : 
                        l.status === 'ditolak' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {l.status === 'disetujui' || l.status === 'lunas' ? (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setSelectedLoan(l); setShowInstallmentsModal(true); }}
                            title="Detail Riwayat Angsuran"
                          >
                            <Eye size={14} /> Riwayat
                          </button>
                        ) : null}

                        {!isAnggota && l.status === 'pengajuan' ? (
                          <>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApprove(l.id)}
                              title="Setujui"
                            >
                              <CheckCircle2 size={14} /> Setujui
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(l.id)}
                              title="Tolak"
                            >
                              <XCircle size={14} /> Tolak
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- APPLY MODAL --- */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Pengajuan Pembiayaan Pinjaman</h3>
              <button className="action-btn" onClick={() => setShowApplyModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleApplyLoan}>
              {!isAnggota && (
                <div className="form-group">
                  <label className="form-label">Pilih Anggota *</label>
                  <select className="form-control" value={idAnggota} onChange={e => setIdAnggota(parseInt(e.target.value))} required>
                    <option value={0}>-- Pilih Anggota --</option>
                    {members.map(m => (
                      <option key={m.id_anggota} value={m.id_anggota}>{m.nama} ({m.nomor_anggota})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Jumlah Kredit (Nominal Pokok) *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={jumlah} 
                  onChange={e => setJumlah(parseInt(e.target.value) || 0)} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tenor Kredit (Bulan) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={tenor} 
                    onChange={e => setTenor(parseInt(e.target.value) || 0)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bunga Flat (% Per Tahun) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={bungaTahunan} 
                    onChange={e => setBungaTahunan(parseInt(e.target.value) || 0)} 
                    required 
                  />
                </div>
              </div>

              {/* Real-time Flat Calculation Review */}
              <div className="card" style={{ background: 'var(--bg-secondary)', marginTop: 12, padding: 16 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>Simulasi Angsuran Bulanan:</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Pokok Bulanan:</span>
                  <span>Rp {(jumlah / (tenor || 1)).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: 4 }}>
                  <span>Bunga Bulanan ({bungaTahunan / 12}%):</span>
                  <span>Rp {(jumlah * (bungaTahunan / 12 / 100)).toLocaleString('id-ID')}</span>
                </div>
                <div className="divider" style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                  <span>Estimasi Angsuran:</span>
                  <span style={{ color: 'var(--primary)' }}>
                    Rp {((jumlah / (tenor || 1)) + (jumlah * (bungaTahunan / 12 / 100))).toLocaleString('id-ID')} / Bulan
                  </span>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Kirim Pengajuan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- HISTORY INSTALLMENTS MODAL --- */}
      {showInstallmentsModal && selectedLoan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Riwayat Pembayaran Kredit</h3>
              <button className="action-btn" onClick={() => { setSelectedLoan(null); setShowInstallmentsModal(false); }}>&times;</button>
            </div>

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div><strong>Anggota:</strong> {getMemberName(selectedLoan.id_anggota)}</div>
              <div><strong>Pokok:</strong> Rp {selectedLoan.jumlah.toLocaleString('id-ID')}</div>
              <div><strong>Bunga Flat:</strong> {selectedLoan.bunga}% / Tahun ({selectedLoan.lama} Bln)</div>
            </div>

            <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Angsuran Ke</th>
                    <th>Nominal Bayar</th>
                    <th>Tanggal Bayar</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: selectedLoan.lama }).map((_, idx) => {
                    const ke = idx + 1;
                    const paid = listAngsuran.find(a => a.id_pinjaman === selectedLoan.id && a.angsuran_ke === ke);
                    const amounts = getRepaymentAmounts(selectedLoan);

                    return (
                      <tr key={ke}>
                        <td style={{ fontWeight: 600 }}>Angsuran Ke-{ke}</td>
                        <td>Rp {amounts.total.toLocaleString('id-ID')}</td>
                        <td>{paid ? paid.tanggal : '-'}</td>
                        <td>
                          <span className={`badge ${paid ? 'badge-success' : 'badge-warning'}`}>
                            {paid ? 'LUNAS' : 'BELUM'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              {!isAnggota && selectedLoan.status !== 'lunas' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowPayModal(true)}
                >
                  Bayar Angsuran Berikutnya
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => { setSelectedLoan(null); setShowInstallmentsModal(false); }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAYMENT MODAL --- */}
      {showPayModal && selectedLoan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Konfirmasi Setoran Angsuran</h3>
              <button className="action-btn" onClick={() => setShowPayModal(false)}>&times;</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleRepayInstallment(); }}>
              <div className="detail-grid" style={{ marginBottom: 16 }}>
                <span className="detail-label">Metode Bunga:</span>
                <span className="detail-value">Flat 12% Per Tahun</span>
                <span className="detail-label">Angsuran Ke:</span>
                <span className="detail-value" style={{ fontWeight: 700 }}>
                  {listAngsuran.filter(a => a.id_pinjaman === selectedLoan.id).length + 1} dari {selectedLoan.lama}
                </span>
                <span className="detail-label">Total Tagihan:</span>
                <span className="detail-value" style={{ fontWeight: 800, color: 'var(--primary)' }}>
                  Rp {getRepaymentAmounts(selectedLoan).total.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Metode Pembayaran</label>
                <select className="form-control" value={paymentMetode} onChange={e => setPaymentMetode(e.target.value as any)}>
                  <option value="Tunai">Tunai / Cash</option>
                  <option value="Transfer">Bank Transfer</option>
                  <option value="QRIS">QRIS Code</option>
                </select>
              </div>

              {paymentMetode === 'QRIS' && (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <div className="qris-box">
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#111', marginBottom: 4 }}>QRIS KAS KOPERASI</div>
                    <div className="qris-code" />
                    <div style={{ fontSize: '0.65rem', color: '#666', marginTop: 4 }}>NMID: ID10202607270</div>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Konfirmasi Bayar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PinjamanPage;

import React, { useState } from 'react';
import type { User } from '../db/schema';
import db from '../db/dbClient';
import { Printer, FileSpreadsheet } from 'lucide-react';

interface LaporanProps {
  currentUser: User;
  refreshFlag?: number;
}

export const Laporan: React.FC<LaporanProps> = () => {
  const [activeReport, setActiveReport] = useState<'simpanan' | 'pinjaman' | 'angsuran' | 'kas' | 'neraca'>('simpanan');

  const members = db.anggota;
  const savings = db.simpanan;
  const loans = db.pinjaman;
  const installments = db.angsuran;
  const kasLedger = db.kas;

  const getMemberName = (id: number) => members.find(m => m.id_anggota === id)?.nama || 'Anggota';

  // Calculations for Neraca Sederhana
  const totalSimpanan = savings.reduce((sum, s) => sum + s.nominal, 0);
  
  // Outstanding Loan principal (jumlah pinjaman disetujui - paid nominal)
  const approvedLoans = loans.filter(l => l.status === 'disetujui');
  const totalDisbursed = approvedLoans.reduce((sum, l) => sum + l.jumlah, 0);
  const totalRepaidInstallments = installments.reduce((sum, a) => sum + a.nominal, 0);
  
  // Approximate interest portion vs principal portion.
  // In our mock, each installment has: Pokok = jumlah/lama, Bunga = (jumlah * 0.01).
  // Let's calculate accumulated interest portion:
  let accumulatedBungaIncome = 0;
  installments.forEach(a => {
    const loan = loans.find(l => l.id === a.id_pinjaman);
    if (loan) {
      const monthlyBunga = loan.jumlah * (loan.bunga / 12) / 100;
      accumulatedBungaIncome += monthlyBunga;
    }
  });

  const accumulatedPokokRepaid = totalRepaidInstallments - accumulatedBungaIncome;
  const outstandingPiutang = Math.max(0, totalDisbursed - accumulatedPokokRepaid);

  const totalAktiva = db.currentKasSaldo + outstandingPiutang;
  const modalAwal = 50000000;
  const totalPasiva = totalSimpanan + modalAwal + accumulatedBungaIncome;

  // Cetak PDF (Browser print trigger)
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel (CSV Simulation)
  const handleExportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeReport === 'simpanan') {
      csvContent += "ID,Nama Anggota,Jenis Simpanan,Nominal,Tanggal\n";
      savings.forEach(s => {
        csvContent += `${s.id},"${getMemberName(s.id_anggota)}",${s.jenis_simpanan},${s.nominal},${s.tanggal}\n`;
      });
    } else if (activeReport === 'pinjaman') {
      csvContent += "ID,Nama Anggota,Jumlah Pokok,Tenor (Bulan),Bunga (%),Tanggal,Status\n";
      loans.forEach(l => {
        csvContent += `${l.id},"${getMemberName(l.id_anggota)}",${l.jumlah},${l.lama},${l.bunga},${l.tanggal},${l.status}\n`;
      });
    } else if (activeReport === 'angsuran') {
      csvContent += "ID,ID Pinjaman,Angsuran Ke,Nominal Bayar,Tanggal\n";
      installments.forEach(a => {
        csvContent += `${a.id},${a.id_pinjaman},${a.angsuran_ke},${a.nominal},${a.tanggal}\n`;
      });
    } else if (activeReport === 'kas') {
      csvContent += "ID,Tanggal,Jenis,Sumber,Nominal,Saldo Running\n";
      kasLedger.forEach(k => {
        csvContent += `${k.id},${k.tanggal},${k.jenis},"${k.sumber}",${k.nominal},${k.saldo}\n`;
      });
    } else {
      csvContent += "NERACA SEDERHANA KOPERASI\n\n";
      csvContent += "AKTIVA,,PASIVA,\n";
      csvContent += `Kas Koperasi,Rp ${db.currentKasSaldo},Simpanan Anggota,Rp ${totalSimpanan}\n`;
      csvContent += `Piutang Kredit Anggota,Rp ${outstandingPiutang},Modal Awal Koperasi,Rp ${modalAwal}\n`;
      csvContent += `,,Pendapatan Bunga,Rp ${accumulatedBungaIncome}\n`;
      csvContent += `TOTAL AKTIVA,Rp ${totalAktiva},TOTAL PASIVA,Rp ${totalPasiva}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Koperasi_${activeReport}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="content-body animate-fade-in print-area">
      <div className="flex-between mb-4 no-print">
        {/* Navigation Selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className={`btn ${activeReport === 'simpanan' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveReport('simpanan')}
          >
            Laporan Simpanan
          </button>
          <button 
            className={`btn ${activeReport === 'pinjaman' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveReport('pinjaman')}
          >
            Laporan Pinjaman
          </button>
          <button 
            className={`btn ${activeReport === 'angsuran' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveReport('angsuran')}
          >
            Laporan Angsuran
          </button>
          <button 
            className={`btn ${activeReport === 'kas' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveReport('kas')}
          >
            Laporan Kas Ledger
          </button>
          <button 
            className={`btn ${activeReport === 'neraca' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveReport('neraca')}
          >
            Neraca Sederhana
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handlePrint} title="Cetak Laporan PDF">
            <Printer size={16} /> Cetak PDF
          </button>
          <button className="btn btn-secondary" onClick={handleExportExcel} title="Ekspor ke Excel CSV">
            <FileSpreadsheet size={16} /> Ekspor Excel
          </button>
        </div>
      </div>

      {/* Report Header for Prints */}
      <div className="print-header" style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800 }}>KOPERASI SIMPAN PINJAM MANDIRI</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Laporan Keuangan Periodik Real-time | Tanggal Cetak: {new Date().toISOString().substring(0, 10)}</p>
        <div className="divider" />
      </div>

      {/* --- REPORT TABLES CONTENT --- */}
      {activeReport === 'simpanan' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Anggota</th>
                  <th>Jenis Simpanan</th>
                  <th>Nominal Setoran</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {savings.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{getMemberName(s.id_anggota)}</td>
                    <td>
                      <span className={`badge ${
                        s.jenis_simpanan === 'Pokok' ? 'badge-info' : 
                        s.jenis_simpanan === 'Wajib' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {s.jenis_simpanan}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>Rp {s.nominal.toLocaleString('id-ID')}</td>
                    <td>{s.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'pinjaman' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>ID Pinjaman</th>
                  <th>Nama Anggota</th>
                  <th>Jumlah Pokok</th>
                  <th>Tenor</th>
                  <th>Bunga (Flat)</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>PJ-{l.id.toString().padStart(3, '0')}</td>
                    <td>{getMemberName(l.id_anggota)}</td>
                    <td style={{ fontWeight: 700 }}>Rp {l.jumlah.toLocaleString('id-ID')}</td>
                    <td>{l.lama} Bulan</td>
                    <td>{l.bunga}% / Tahun</td>
                    <td>{l.tanggal}</td>
                    <td>
                      <span className={`badge ${
                        l.status === 'disetujui' ? 'badge-info' : 
                        l.status === 'lunas' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'angsuran' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>No. Pinjaman</th>
                  <th>Anggota</th>
                  <th>Angsuran Ke</th>
                  <th>Nominal Bayar</th>
                  <th>Tanggal Bayar</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((a) => {
                  const loan = loans.find(l => l.id === a.id_pinjaman);
                  return (
                    <tr key={a.id}>
                      <td>#{a.id}</td>
                      <td style={{ fontWeight: 600 }}>PJ-{a.id_pinjaman.toString().padStart(3, '0')}</td>
                      <td>{loan ? getMemberName(loan.id_anggota) : '-'}</td>
                      <td>Ke-{a.angsuran_ke}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>Rp {a.nominal.toLocaleString('id-ID')}</td>
                      <td>{a.tanggal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'kas' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>ID Kas</th>
                  <th>Tanggal</th>
                  <th>Jenis</th>
                  <th>Sumber / Keperluan</th>
                  <th>Nominal</th>
                  <th>Saldo Buku</th>
                </tr>
              </thead>
              <tbody>
                {kasLedger.map((k) => (
                  <tr key={k.id}>
                    <td>#{k.id}</td>
                    <td>{k.tanggal}</td>
                    <td>
                      <span className={`badge ${k.jenis === 'Masuk' ? 'badge-success' : 'badge-danger'}`}>
                        {k.jenis}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{k.sumber}</td>
                    <td style={{ color: k.jenis === 'Masuk' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                      Rp {k.nominal.toLocaleString('id-ID')}
                    </td>
                    <td style={{ fontWeight: 700 }}>Rp {k.saldo.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'neraca' && (
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700 }}>NERACA SALDO SEDERHANA</h3>
          <div className="grid-cols-2">
            <div>
              <h4 style={{ borderBottom: '2px solid var(--primary)', paddingBottom: 6, fontWeight: 700 }}>AKTIVA (ASET)</h4>
              <div className="detail-grid mt-4">
                <span className="detail-label">Kas Koperasi:</span>
                <span className="detail-value">Rp {db.currentKasSaldo.toLocaleString('id-ID')}</span>
                
                <span className="detail-label">Piutang Pinjaman:</span>
                <span className="detail-value">Rp {outstandingPiutang.toLocaleString('id-ID')}</span>
              </div>
              <div className="divider" />
              <div className="flex-between" style={{ fontWeight: 700 }}>
                <span>TOTAL AKTIVA:</span>
                <span>Rp {totalAktiva.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div>
              <h4 style={{ borderBottom: '2px solid var(--success)', paddingBottom: 6, fontWeight: 700 }}>PASIVA (KEWAJIBAN & EKUITAS)</h4>
              <div className="detail-grid mt-4">
                <span className="detail-label">Dana Simpanan Anggota:</span>
                <span className="detail-value">Rp {totalSimpanan.toLocaleString('id-ID')}</span>
                
                <span className="detail-label">Modal Awal Koperasi:</span>
                <span className="detail-value">Rp {modalAwal.toLocaleString('id-ID')}</span>

                <span className="detail-label">Akumulasi Bunga:</span>
                <span className="detail-value">Rp {accumulatedBungaIncome.toLocaleString('id-ID')}</span>
              </div>
              <div className="divider" />
              <div className="flex-between" style={{ fontWeight: 700 }}>
                <span>TOTAL PASIVA:</span>
                <span>Rp {totalPasiva.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Laporan;

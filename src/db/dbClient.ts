import type { Role, User, Anggota, Simpanan, Pinjaman, Angsuran, Kas } from './schema';
import * as seeds from './mockData';

class DatabaseClient {
  private getTable<T>(key: string, initialData: T[]): T[] {
    const data = localStorage.getItem(`koperasi_db_simple_${key}`);
    if (!data) {
      localStorage.setItem(`koperasi_db_simple_${key}`, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  }

  private saveTable<T>(key: string, data: T[]): void {
    localStorage.setItem(`koperasi_db_simple_${key}`, JSON.stringify(data));
  }

  // --- Core Tables ---
  get roles(): Role[] { return this.getTable('roles', seeds.mockRoles); }
  set roles(val: Role[]) { this.saveTable('roles', val); }

  get users(): User[] { return this.getTable('users', seeds.mockUsers); }
  set users(val: User[]) { this.saveTable('users', val); }

  get anggota(): Anggota[] { return this.getTable('anggota', seeds.mockAnggota); }
  set anggota(val: Anggota[]) { this.saveTable('anggota', val); }

  get simpanan(): Simpanan[] { return this.getTable('simpanan', seeds.mockSimpanan); }
  set simpanan(val: Simpanan[]) { this.saveTable('simpanan', val); }

  get pinjaman(): Pinjaman[] { return this.getTable('pinjaman', seeds.mockPinjaman); }
  set pinjaman(val: Pinjaman[]) { this.saveTable('pinjaman', val); }

  get angsuran(): Angsuran[] { return this.getTable('angsuran', seeds.mockAngsuran); }
  set angsuran(val: Angsuran[]) { this.saveTable('angsuran', val); }

  get kas(): Kas[] { return this.getTable('kas', seeds.mockKas); }
  set kas(val: Kas[]) { this.saveTable('kas', val); }

  // --- Ledger Actions ---
  get currentKasSaldo(): number {
    const list = this.kas;
    if (list.length === 0) return 0;
    return list[list.length - 1].saldo;
  }

  addKasEntry(type: 'Masuk' | 'Keluar', source: string, amount: number) {
    const current = this.currentKasSaldo;
    const nextSaldo = type === 'Masuk' ? current + amount : current - amount;
    const list = this.kas;
    const newEntry: Kas = {
      id: list.length > 0 ? Math.max(...list.map(k => k.id)) + 1 : 1,
      tanggal: new Date().toISOString().substring(0, 10),
      jenis: type,
      sumber: source,
      nominal: amount,
      saldo: nextSaldo
    };
    this.kas = [...list, newEntry];
  }

  // --- Transactions ---

  // 1. Simpanan (Pokok, Wajib, Sukarela)
  createSimpanan(idAnggota: number, jenis: 'Pokok' | 'Wajib' | 'Sukarela', nominal: number) {
    const list = this.simpanan;
    const newId = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 1;
    const date = new Date().toISOString().substring(0, 10);

    const newSimpanan: Simpanan = {
      id: newId,
      id_anggota: idAnggota,
      jenis_simpanan: jenis,
      nominal,
      tanggal: date
    };
    this.simpanan = [...list, newSimpanan];

    // Ledger Kas Masuk
    const memberName = this.anggota.find(a => a.id_anggota === idAnggota)?.nama || 'Anggota';
    this.addKasEntry('Masuk', `Simpanan ${jenis} - ${memberName}`, nominal);

    return newSimpanan;
  }

  // 2. Pinjaman (Flat Amortization)
  createPinjaman(idAnggota: number, jumlah: number, bungaTahunan: number, lamaBulan: number) {
    const list = this.pinjaman;
    const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;

    const newLoan: Pinjaman = {
      id: newId,
      id_anggota: idAnggota,
      jumlah,
      bunga: bungaTahunan,
      lama: lamaBulan,
      tanggal: new Date().toISOString().substring(0, 10),
      status: 'pengajuan'
    };
    this.pinjaman = [...list, newLoan];
    return newLoan;
  }

  approvePinjaman(idPinjaman: number) {
    const list = this.pinjaman;
    const idx = list.findIndex(p => p.id === idPinjaman);
    if (idx === -1) return;

    const loan = list[idx];
    if (loan.status !== 'pengajuan') return;

    loan.status = 'disetujui';
    this.pinjaman = [...list];

    // Ledger Kas Keluar (Cairkan Dana)
    const memberName = this.anggota.find(a => a.id_anggota === loan.id_anggota)?.nama || 'Anggota';
    this.addKasEntry('Keluar', `Pencairan Kredit Pinjaman #${loan.id} - ${memberName}`, loan.jumlah);
  }

  rejectPinjaman(idPinjaman: number) {
    const list = this.pinjaman;
    const idx = list.findIndex(p => p.id === idPinjaman);
    if (idx === -1) return;

    list[idx].status = 'ditolak';
    this.pinjaman = [...list];
  }

  // 3. Angsuran Pembayaran
  createAngsuran(idPinjaman: number, angsuranKe: number, nominal: number) {
    const list = this.angsuran;
    const newId = list.length > 0 ? Math.max(...list.map(a => a.id)) + 1 : 1;

    const newPay: Angsuran = {
      id: newId,
      id_pinjaman: idPinjaman,
      angsuran_ke: angsuranKe,
      nominal,
      tanggal: new Date().toISOString().substring(0, 10)
    };
    this.angsuran = [...list, newPay];

    // Check if fully paid (if paid installments equals tenor/lama)
    const loanList = this.pinjaman;
    const loanIdx = loanList.findIndex(l => l.id === idPinjaman);
    if (loanIdx !== -1) {
      const loan = loanList[loanIdx];
      const countPaid = this.angsuran.filter(a => a.id_pinjaman === idPinjaman).length;
      if (countPaid >= loan.lama) {
        loan.status = 'lunas';
        this.pinjaman = [...loanList];
      }
    }

    // Ledger Kas Masuk (Receive Installment)
    const loan = this.pinjaman.find(l => l.id === idPinjaman);
    const memberName = loan ? (this.anggota.find(a => a.id_anggota === loan.id_anggota)?.nama || 'Anggota') : 'Anggota';
    this.addKasEntry('Masuk', `Angsuran Ke-${angsuranKe} Pinjaman #${idPinjaman} - ${memberName}`, nominal);

    return newPay;
  }

  // 4. Anggota CRUD
  addAnggota(nama: string, alamat: string, telepon: string) {
    const members = this.anggota;
    const usersTable = this.users;

    const nextAnggotaId = members.length > 0 ? Math.max(...members.map(a => a.id_anggota)) + 1 : 1;
    const nextUserId = usersTable.length > 0 ? Math.max(...usersTable.map(u => u.id_user)) + 1 : 1;
    const serial = nextAnggotaId.toString().padStart(4, '0');
    const nomorAnggota = `ANG-${new Date().getFullYear()}01${serial}`;
    const email = `${nama.toLowerCase().replace(/\s+/g, '')}@koperasi.com`;

    // Create User account
    const newUser: User = {
      id_user: nextUserId,
      id_role: 3, // Anggota
      username: nama.toLowerCase().replace(/\s+/g, ''),
      email,
      status: 'aktif'
    };
    this.users = [...usersTable, newUser];

    const newAnggota: Anggota = {
      id_anggota: nextAnggotaId,
      nama,
      alamat,
      telepon,
      tanggal_daftar: new Date().toISOString().substring(0, 10),
      id_user: nextUserId,
      nomor_anggota: nomorAnggota,
      foto: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      status_keanggotaan: 'aktif'
    };
    this.anggota = [...members, newAnggota];
    return newAnggota;
  }
}

export const db = new DatabaseClient();
export default db;

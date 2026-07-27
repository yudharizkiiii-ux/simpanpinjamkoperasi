import type { Role, User, Anggota, Simpanan, Pinjaman, Angsuran, Kas } from './schema';

export const mockRoles: Role[] = [
  { id_role: 1, nama_role: 'Admin' },
  { id_role: 2, nama_role: 'Petugas' },
  { id_role: 3, nama_role: 'Anggota' }
];

export const mockUsers: User[] = [
  { id_user: 1, id_role: 1, username: 'admin', email: 'admin@koperasi.com', status: 'aktif' },
  { id_user: 2, id_role: 2, username: 'petugas1', email: 'petugas@koperasi.com', status: 'aktif' },
  { id_user: 3, id_role: 3, username: 'joko123', email: 'joko@gmail.com', status: 'aktif' },
  { id_user: 4, id_role: 3, username: 'siti456', email: 'siti@gmail.com', status: 'aktif' }
];

export const mockAnggota: Anggota[] = [
  {
    id_anggota: 1,
    nama: 'Joko Widodo',
    alamat: 'Jl. Merdeka Barat No. 12, Surakarta',
    telepon: '085678901234',
    tanggal_daftar: '2026-01-05',
    id_user: 3,
    nomor_anggota: 'ANG-2026010001',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status_keanggotaan: 'aktif'
  },
  {
    id_anggota: 2,
    nama: 'Siti Aminah',
    alamat: 'Jl. Malioboro No. 90, Yogyakarta',
    telepon: '089876543210',
    tanggal_daftar: '2026-01-10',
    id_user: 4,
    nomor_anggota: 'ANG-2026010002',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status_keanggotaan: 'aktif'
  }
];

export const mockSimpanan: Simpanan[] = [
  { id: 1, id_anggota: 1, jenis_simpanan: 'Pokok', nominal: 100000, tanggal: '2026-01-05' },
  { id: 2, id_anggota: 1, jenis_simpanan: 'Wajib', nominal: 50000, tanggal: '2026-01-05' },
  { id: 3, id_anggota: 1, jenis_simpanan: 'Wajib', nominal: 50000, tanggal: '2026-02-05' },
  { id: 4, id_anggota: 1, jenis_simpanan: 'Wajib', nominal: 50000, tanggal: '2026-03-05' },
  { id: 5, id_anggota: 1, jenis_simpanan: 'Sukarela', nominal: 200000, tanggal: '2026-04-10' },
  
  { id: 6, id_anggota: 2, jenis_simpanan: 'Pokok', nominal: 100000, tanggal: '2026-01-10' },
  { id: 7, id_anggota: 2, jenis_simpanan: 'Wajib', nominal: 50000, tanggal: '2026-01-10' },
  { id: 8, id_anggota: 2, jenis_simpanan: 'Wajib', nominal: 50000, tanggal: '2026-02-10' }
];

export const mockPinjaman: Pinjaman[] = [
  {
    id: 1,
    id_anggota: 1,
    jumlah: 10000000,
    bunga: 12, // 12% per year = 1% per month flat
    lama: 10,  // 10 months
    tanggal: '2026-02-01',
    status: 'disetujui'
  },
  {
    id: 2,
    id_anggota: 2,
    jumlah: 5000000,
    bunga: 12,
    lama: 6,
    tanggal: '2026-07-20',
    status: 'pengajuan'
  }
];

export const mockAngsuran: Angsuran[] = [
  // Joko's paid installments (Lama 10. Angsuran is 1,100,000 per month. Paid 3 installments so far)
  { id: 1, id_pinjaman: 1, angsuran_ke: 1, nominal: 1100000, tanggal: '2026-03-01' },
  { id: 2, id_pinjaman: 1, angsuran_ke: 2, nominal: 1100000, tanggal: '2026-04-01' },
  { id: 3, id_pinjaman: 1, angsuran_ke: 3, nominal: 1100000, tanggal: '2026-05-01' }
];

export const mockKas: Kas[] = [
  { id: 1, tanggal: '2026-01-01', jenis: 'Masuk', sumber: 'Modal Awal', nominal: 50000000, saldo: 50000000 },
  
  // Member pendaftarans
  { id: 2, tanggal: '2026-01-05', jenis: 'Masuk', sumber: 'Simpanan Pokok Joko Widodo', nominal: 100000, saldo: 50100000 },
  { id: 3, tanggal: '2026-01-05', jenis: 'Masuk', sumber: 'Simpanan Wajib Joko Widodo', nominal: 50000, saldo: 50150000 },
  { id: 4, tanggal: '2026-01-10', jenis: 'Masuk', sumber: 'Simpanan Pokok Siti Aminah', nominal: 100000, saldo: 50250000 },
  { id: 5, tanggal: '2026-01-10', jenis: 'Masuk', sumber: 'Simpanan Wajib Siti Aminah', nominal: 50000, saldo: 50300000 },
  
  // Loan disbursement
  { id: 6, tanggal: '2026-02-02', jenis: 'Keluar', sumber: 'Pencairan Pinjaman Joko Widodo (PJ-1)', nominal: 10000000, saldo: 40300000 },
  
  // Monthly wajib and sukarela
  { id: 7, tanggal: '2026-02-05', jenis: 'Masuk', sumber: 'Simpanan Wajib Joko Widodo', nominal: 50000, saldo: 40350000 },
  { id: 8, tanggal: '2026-02-10', jenis: 'Masuk', sumber: 'Simpanan Wajib Siti Aminah', nominal: 50000, saldo: 40400000 },
  { id: 9, tanggal: '2026-03-05', jenis: 'Masuk', sumber: 'Simpanan Wajib Joko Widodo', nominal: 50000, saldo: 40450000 },
  
  // Installments paid
  { id: 10, tanggal: '2026-03-01', jenis: 'Masuk', sumber: 'Angsuran Joko Widodo Ke-1', nominal: 1100000, saldo: 41550000 },
  { id: 11, tanggal: '2026-04-01', jenis: 'Masuk', sumber: 'Angsuran Joko Widodo Ke-2', nominal: 1100000, saldo: 42650000 },
  { id: 12, tanggal: '2026-04-10', jenis: 'Masuk', sumber: 'Simpanan Sukarela Joko Widodo', nominal: 200000, saldo: 42850000 },
  { id: 13, tanggal: '2026-05-01', jenis: 'Masuk', sumber: 'Angsuran Joko Widodo Ke-3', nominal: 1100000, saldo: 43950000 }
];

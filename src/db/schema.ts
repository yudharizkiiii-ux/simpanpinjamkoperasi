export interface Role {
  id_role: number;
  nama_role: 'Admin' | 'Petugas' | 'Anggota';
}

export interface User {
  id_user: number;
  id_role: number;
  username: string;
  email: string;
  status: 'aktif' | 'nonaktif';
}

// 1. Tabel Anggota
export interface Anggota {
  id_anggota: number;
  nama: string;
  alamat: string;
  telepon: string;
  tanggal_daftar: string;
  
  // Auxiliary fields for UI demo (connected via id_user to simulate user dashboard)
  id_user?: number;
  nomor_anggota?: string; 
  foto?: string;
  status_keanggotaan?: 'aktif' | 'keluar';
}

// 2. Tabel Simpanan
export interface Simpanan {
  id: number;
  id_anggota: number;
  jenis_simpanan: 'Pokok' | 'Wajib' | 'Sukarela';
  nominal: number;
  tanggal: string;
}

// 3. Tabel Pinjaman
export interface Pinjaman {
  id: number;
  id_anggota: number;
  jumlah: number;
  bunga: number; // Annual interest percentage (e.g. 12)
  lama: number; // Tenor in months
  tanggal: string;
  status: 'pengajuan' | 'disetujui' | 'ditolak' | 'lunas';
}

// 4. Tabel Angsuran
export interface Angsuran {
  id: number;
  id_pinjaman: number;
  angsuran_ke: number;
  nominal: number;
  tanggal: string;
}

// Kas entry for Laporan Kas
export interface Kas {
  id: number;
  tanggal: string;
  jenis: 'Masuk' | 'Keluar';
  sumber: string;
  nominal: number;
  saldo: number;
}

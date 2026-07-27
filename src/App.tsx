import { useState, useEffect } from 'react';
import db from './db/dbClient';
import type { User, Role } from './db/schema';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Anggota from './pages/Anggota';
import SimpananPage from './pages/SimpananPage';
import PinjamanPage from './pages/PinjamanPage';
import AngsuranPage from './pages/AngsuranPage';
import Laporan from './pages/Laporan';
import Beranda from './pages/Beranda';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(db.users[0]);
  const [currentRole, setCurrentRole] = useState<Role>(db.roles[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);
  const [refreshFlag, setRefreshFlag] = useState<number>(0);

  // Apply body dark theme class on theme state change
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkTheme]);

  const triggerRefresh = () => {
    setRefreshFlag(prev => prev + 1);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return currentRole.nama_role === 'Anggota' ? 'Dashboard Anggota' : 'Dashboard Ringkasan';
      case 'anggota':
        return 'Data Keanggotaan';
      case 'simpanan':
      case 'anggota_simpanan':
        return 'Transaksi Simpanan Koperasi';
      case 'pinjaman':
      case 'anggota_pinjaman':
        return 'Transaksi Pembiayaan Pinjaman';
      case 'angsuran':
        return 'Pembayaran Angsuran';
      case 'laporan':
        return 'Laporan & Buku Kas Koperasi';
      default:
        return 'Simpan Pinjam Koperasi';
    }
  };

  const renderActiveView = () => {
    const validTabsForRole = {
      Admin: ['dashboard', 'anggota', 'simpanan', 'pinjaman', 'angsuran', 'laporan'],
      Petugas: ['dashboard', 'anggota', 'simpanan', 'pinjaman', 'angsuran', 'laporan'],
      Anggota: ['dashboard', 'anggota_simpanan', 'anggota_pinjaman']
    };
    
    const allowed = validTabsForRole[currentRole.nama_role] || [];
    const currentTab = allowed.includes(activeTab) ? activeTab : 'dashboard';

    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            currentUser={currentUser} 
            currentRole={currentRole} 
            setActiveTab={setActiveTab}
          />
        );
      case 'anggota':
        return (
          <Anggota 
            currentUser={currentUser} 
            triggerRefresh={triggerRefresh}
          />
        );
      case 'simpanan':
      case 'anggota_simpanan':
        return (
          <SimpananPage 
            currentUser={currentUser} 
            currentRole={currentRole} 
            triggerRefresh={triggerRefresh}
          />
        );
      case 'pinjaman':
      case 'anggota_pinjaman':
        return (
          <PinjamanPage 
            currentUser={currentUser} 
            currentRole={currentRole} 
            triggerRefresh={triggerRefresh}
          />
        );
      case 'angsuran':
        return (
          <AngsuranPage 
            currentUser={currentUser} 
            currentRole={currentRole} 
            triggerRefresh={triggerRefresh}
          />
        );
      case 'laporan':
        return (
          <Laporan 
            currentUser={currentUser} 
            refreshFlag={refreshFlag}
          />
        );
      default:
        return <div>Halaman tidak ditemukan.</div>;
    }
  };

  // If not logged in, render the public landing page (Beranda)
  if (!isLoggedIn) {
    return (
      <Beranda 
        onLoginSuccess={(user, role) => {
          setCurrentUser(user);
          setCurrentRole(role);
          setIsLoggedIn(true);
          // Set default tabs based on role
          setActiveTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        isDarkTheme={isDarkTheme}
        setIsDarkTheme={setIsDarkTheme}
        onLogout={() => setIsLoggedIn(false)}
      />
      
      <div className="main-wrapper">
        <TopBar 
          title={getPageTitle()} 
          currentUser={currentUser}
          triggerRefresh={triggerRefresh}
        />
        <main style={{ flex: 1 }}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;

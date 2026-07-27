import React from 'react';
import { 
  LayoutDashboard, Users, PiggyBank, HandCoins, 
  CalendarRange, FileText, Sun, Moon, LogOut
} from 'lucide-react';
import type { User, Role } from '../db/schema';
import db from '../db/dbClient';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  isDarkTheme: boolean;
  setIsDarkTheme: (dark: boolean) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  currentRole,
  setCurrentRole,
  isDarkTheme,
  setIsDarkTheme,
  onLogout,
}) => {
  // Navigation structure based on role
  const getNavItems = () => {
    switch (currentRole.nama_role) {
      case 'Admin':
      case 'Petugas':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'anggota', label: 'Data Anggota', icon: Users },
          { id: 'simpanan', label: 'Simpanan', icon: PiggyBank },
          { id: 'pinjaman', label: 'Pinjaman', icon: HandCoins },
          { id: 'angsuran', label: 'Angsuran', icon: CalendarRange },
          { id: 'laporan', label: 'Laporan Koperasi', icon: FileText },
        ];
      case 'Anggota':
        return [
          { id: 'dashboard', label: 'Dashboard Saya', icon: LayoutDashboard },
          { id: 'anggota_simpanan', label: 'Simpanan Saya', icon: PiggyBank },
          { id: 'anggota_pinjaman', label: 'Pinjaman & Angsuran', icon: HandCoins },
        ];
      default:
        return [];
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = parseInt(e.target.value);
    const selectedRole = db.roles.find(r => r.id_role === roleId);
    if (!selectedRole) return;

    let selectedUser = db.users.find(u => u.id_role === roleId);
    if (!selectedUser) return;

    setCurrentRole(selectedRole);
    setCurrentUser(selectedUser);
    setActiveTab('dashboard');
  };

  const navItems = getNavItems();

  const getUserDisplayName = () => {
    if (currentRole.nama_role === 'Admin') return 'Administrator Koperasi';
    if (currentRole.nama_role === 'Petugas') return 'Petugas Koperasi';
    if (currentRole.nama_role === 'Anggota') {
      const a = db.anggota.find(a => a.id_user === currentUser.id_user);
      return a ? a.nama : 'Anggota Koperasi';
    }
    return currentUser.username;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{
          width: 36, height: 36, borderRadius: '8px', 
          background: 'linear-gradient(135deg, var(--primary), var(--warning))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800
        }}>
          KI
        </div>
        <span className="sidebar-logo" style={{ fontSize: '1.1rem' }}>Kop Infolahta</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <IconComponent size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="form-group" style={{ marginBottom: 4 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Demo Role Mode</label>
          <select 
            value={currentRole.id_role} 
            onChange={handleRoleChange} 
            className="form-control"
            style={{ padding: '6px 10px', fontSize: '0.85rem', height: 'auto' }}
          >
            {db.roles.map(r => (
              <option key={r.id_role} value={r.id_role}>{r.nama_role}</option>
            ))}
          </select>
        </div>

        <div className="user-widget">
          <div className="user-avatar">
            {getUserDisplayName().charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{getUserDisplayName()}</div>
            <div className="user-role">
              <span className={`role-badge role-${currentRole.nama_role.toLowerCase()}`}>
                {currentRole.nama_role}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-between" style={{ padding: '0 4px' }}>
          <button 
            className="action-btn"
            style={{ width: 36, height: 36 }}
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            title="Toggle Theme"
          >
            {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {onLogout && (
            <button 
              className="action-btn"
              style={{ width: 36, height: 36, color: 'var(--danger)' }}
              onClick={onLogout}
              title="Keluar Portal"
            >
              <LogOut size={18} />
            </button>
          )}

          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>v2.0.0 Stable</span>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;

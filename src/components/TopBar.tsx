import React from 'react';
import type { User } from '../db/schema';

interface TopBarProps {
  title: string;
  currentUser: User;
  triggerRefresh: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title }) => {
  return (
    <header className="top-bar">
      <h1 className="page-title">{title}</h1>
      <div className="top-bar-actions">
        {/* Simplified Header Actions */}
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Koperasi Simpan Pinjam Mandiri
        </span>
      </div>
    </header>
  );
};
export default TopBar;

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header style={{
      height: 'var(--header-height)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 var(--space-8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background-color var(--transition-base), border-color var(--transition-base)',
    }}>
      <div>
        {title && <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{title}</h2>}
        {subtitle && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Theme Toggle Button */}
        <ThemeToggle showLabel={true} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--accent-blue)',
          fontWeight: 600,
        }}>
          <ShieldCheck size={14} />
          <span>{user?.role === 'admin' ? 'Administrator' : 'User Access'}</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)',
        }}>
          <span>Organization: <strong>All Enterprise</strong></span>
        </div>
      </div>
    </header>
  );
};

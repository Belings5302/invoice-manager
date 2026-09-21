import React from 'react';
import { ShieldCheck, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onToggleNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onToggleNav }) => {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-nav-toggle"
          onClick={onToggleNav}
          aria-label="Toggle Navigation Menu"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-box">
          {title && <h2 className="header-title">{title}</h2>}
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        {/* Theme Toggle Button */}
        <ThemeToggle showLabel={true} />

        <div className="header-shield">
          <ShieldCheck size={14} />
          <span>{user?.role === 'admin' ? 'Administrator' : 'User Access'}</span>
        </div>

        <div className="header-org">
          <span>Organization: <strong>All Enterprise</strong></span>
        </div>
      </div>
    </header>
  );
};

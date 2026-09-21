import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Briefcase,
  BarChart3,
  LogOut,
  Receipt,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout, isAdmin } = useAuth();

  const navItems = isAdmin
    ? [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/invoices', label: 'Invoices & Billing', icon: FileText },
        { to: '/clients', label: 'Clients & Flow', icon: Users },
        { to: '/expenses', label: 'Expenses', icon: CreditCard },
        { to: '/jobs', label: 'Jobs Tracker', icon: Briefcase },
        { to: '/reports', label: 'Reports & P&L', icon: BarChart3 },
        { to: '/users', label: 'User & Role Access', icon: UserCheck },
      ]
    : [
        { to: '/', label: 'My Dashboard', icon: LayoutDashboard },
        { to: '/invoices', label: 'My Invoices', icon: FileText },
        { to: '/jobs', label: 'My Jobs', icon: Briefcase },
      ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
          <div className="sidebar-logo-icon">
            <Receipt size={22} color="white" />
          </div>
          <div>
            <h2>Flow<span>Bill</span></h2>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Financial & Billing OS</div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          className="sidebar-mobile-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
              onClick={handleLinkClick}
            >
              <Icon className="sidebar-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{isAdmin ? 'Administrator' : 'Client Account'}</div>
          </div>
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            title="Sign out"
            style={{ padding: '6px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

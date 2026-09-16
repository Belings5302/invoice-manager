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
  Layers,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/invoices', label: 'Invoices & Billing', icon: FileText },
    { to: '/clients', label: 'Clients & Flow', icon: Users },
    { to: '/expenses', label: 'Expenses', icon: CreditCard },
    { to: '/jobs', label: 'Jobs Tracker', icon: Briefcase },
    { to: '/reports', label: 'Reports & P&L', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Receipt size={22} color="white" />
        </div>
        <div>
          <h2>Flow<span>Bill</span></h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Financial & Billing OS</div>
        </div>
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
            <div className="sidebar-user-role">{user?.role || 'Member'}</div>
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

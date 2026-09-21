import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import {
  ShieldCheck,
  User,
  Search,
  RefreshCw,
  Crown,
  Users as UsersIcon,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  Link2,
  Unlink,
  Clock,
} from 'lucide-react';

interface ManagedUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  client_id?: number | null;
  client_name?: string;
  client_company?: string;
  created_at?: string;
}

interface ClientOption {
  id: number;
  name: string;
  company?: string | null;
  email?: string | null;
}

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [linkingUserId, setLinkingUserId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, clientData] = await Promise.all([
        api.get<ManagedUser[]>('/users'),
        api.get<ClientOption[]>('/clients'),
      ]);
      setUsers(userData);
      setClients(clientData);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch registered users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRoleChange = async (targetUser: ManagedUser, newRole: 'admin' | 'user') => {
    const actionName = newRole === 'admin' ? 'grant Administrator access to' : 'revoke Administrator access from';
    if (!window.confirm(`Are you sure you want to ${actionName} "${targetUser.name || targetUser.email}"?`)) return;
    setUpdatingId(targetUser.id);
    setStatusMessage(null);
    try {
      await api.patch(`/users/${targetUser.id}/role`, { role: newRole });
      setStatusMessage({ type: 'success', text: `Role updated for ${targetUser.name || targetUser.email} to ${newRole.toUpperCase()}.` });
      await loadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update user role.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLinkClient = async (userId: number, clientId: number | null) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const clientName = clientId ? clients.find(c => c.id === clientId)?.name || 'selected client' : null;
    const confirmMsg = clientId
      ? `Link "${targetUser.name}" to client "${clientName}"? This will activate their portal access.`
      : `Remove client link from "${targetUser.name}"? Their portal access will be suspended.`;
    if (!window.confirm(confirmMsg)) return;
    setUpdatingId(userId);
    setStatusMessage(null);
    try {
      await api.patch(`/users/${userId}/client`, { client_id: clientId });
      setStatusMessage({
        type: 'success',
        text: clientId ? `Client linked. ${targetUser.name} can now access their portal.` : `Client link removed from ${targetUser.name}.`,
      });
      setLinkingUserId(null);
      setSelectedClientId('');
      await loadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update client link.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      (u.client_company && u.client_company.toLowerCase().includes(term)) ||
      (u.client_name && u.client_name.toLowerCase().includes(term))
    );
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;
  const pendingCount = users.filter(u => u.role === 'user' && !u.client_id).length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>User & Role Access Management</h1>
            <p>Superadmin control — review accounts, grant admin access, or link users to client profiles</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={loadData} className="btn btn-secondary btn-sm" title="Refresh user list">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={statusMessage.type === 'success' ? 'toast success' : 'auth-error'}
          style={{ position: 'relative', top: 'auto', right: 'auto', marginBottom: 'var(--space-5)', maxWidth: '100%' }}
        >
          {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card blue">
          <div className="kpi-card-header">
            <div><div className="kpi-card-label">Total Accounts</div><div className="kpi-card-value">{users.length}</div></div>
            <div className="kpi-card-icon"><UsersIcon size={20} /></div>
          </div>
          <div className="kpi-card-sub">All registered platform users</div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-card-header">
            <div><div className="kpi-card-label">Administrators</div><div className="kpi-card-value">{adminCount}</div></div>
            <div className="kpi-card-icon"><ShieldCheck size={20} /></div>
          </div>
          <div className="kpi-card-sub">Full administrative privileges</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-card-header">
            <div><div className="kpi-card-label">Active Clients</div><div className="kpi-card-value">{userCount - pendingCount}</div></div>
            <div className="kpi-card-icon"><User size={20} /></div>
          </div>
          <div className="kpi-card-sub">Portal access enabled</div>
        </div>
        <div className="kpi-card" style={{ borderColor: pendingCount > 0 ? 'rgba(245,158,11,0.35)' : 'var(--border-color)' }}>
          <div className="kpi-card-header">
            <div><div className="kpi-card-label">Pending Activation</div><div className="kpi-card-value" style={{ color: pendingCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{pendingCount}</div></div>
            <div className="kpi-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}><Clock size={20} /></div>
          </div>
          <div className="kpi-card-sub">Awaiting client profile link</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div className="filter-bar">
          <div className="search-input">
            <Search />
            <input type="text" placeholder="Search by name, email, company or role..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User Account</th>
              <th>System Role</th>
              <th>Client Profile</th>
              <th>Registered</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>No user accounts found.</td></tr>
            ) : filteredUsers.map((u) => {
              const isSuperadmin = u.id === 1;
              const isSelf = currentUser?.id === u.id;
              const isUpdating = updatingId === u.id;
              const isPending = u.role === 'user' && !u.client_id;
              const isLinkingThis = linkingUserId === u.id;
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className="sidebar-avatar" style={{ background: u.role === 'admin' ? 'var(--gradient-blue)' : isPending ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'var(--gradient-purple)', fontSize: '13px' }}>
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{u.name || 'Unnamed User'}</strong>
                          {isSuperadmin && <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontSize: '10px', padding: '1px 6px' }}><Crown size={10} /> Superadmin</span>}
                          {isSelf && <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', fontSize: '10px', padding: '1px 6px' }}>You</span>}
                          {isPending && <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', fontSize: '10px', padding: '1px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={9} /> Pending</span>}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ fontSize: '12px', padding: '3px 8px', background: u.role === 'admin' ? 'var(--accent-blue-glow)' : 'var(--bg-glass)', color: u.role === 'admin' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: '1px solid', borderColor: u.role === 'admin' ? 'rgba(59,130,246,0.3)' : 'var(--border-color)' }}>
                      <span className="badge-dot" style={{ background: u.role === 'admin' ? 'var(--accent-blue)' : 'var(--text-muted)' }}></span>
                      {u.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                  </td>
                  <td>
                    {u.role === 'admin' ? (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>Administrative Account</span>
                    ) : (u.client_company || u.client_name) ? (
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Building2 size={13} color="var(--success)" /> {u.client_company || u.client_name}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Client #{u.client_id?.toString().padStart(4, '0')} · Active</div>
                      </div>
                    ) : isLinkingThis ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <select className="filter-select" style={{ fontSize: '12px', padding: '4px 28px 4px 8px', minWidth: 150 }} value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                          <option value="">— select client —</option>
                          {clients.map(c => <option key={c.id} value={String(c.id)}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
                        </select>
                        <button onClick={() => selectedClientId && handleLinkClient(u.id, Number(selectedClientId))} disabled={!selectedClientId || isUpdating} className="btn btn-primary btn-sm" style={{ fontSize: '11px', padding: '4px 10px' }}>{isUpdating ? '...' : 'Link'}</button>
                        <button onClick={() => { setLinkingUserId(null); setSelectedClientId(''); }} className="btn btn-ghost btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>✕</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={() => { setLinkingUserId(u.id); setSelectedClientId(''); }} title="Click to assign a client profile">
                        <Clock size={12} /> Not linked — click to assign
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="var(--text-muted)" />
                      {u.created_at ? formatDate(u.created_at.split('T')[0]) : '—'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                      {u.role === 'user' && !isLinkingThis && (
                        u.client_id ? (
                          <button onClick={() => handleLinkClient(u.id, null)} disabled={isUpdating} className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--danger)' }} title="Remove client link"><Unlink size={12} /> Unlink</button>
                        ) : (
                          <button onClick={() => { setLinkingUserId(u.id); setSelectedClientId(''); }} disabled={isUpdating} className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--accent-blue)' }} title="Link to a client"><Link2 size={12} /> Link Client</button>
                        )
                      )}
                      {isSuperadmin ? (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>Primary Superadmin</span>
                      ) : u.role === 'user' ? (
                        <button onClick={() => handleRoleChange(u, 'admin')} disabled={isUpdating} className="btn btn-primary btn-sm" style={{ background: 'var(--gradient-blue)', fontSize: '12px', padding: '6px 12px' }} title="Promote to Administrator"><ShieldCheck size={14} />{isUpdating ? 'Updating...' : 'Grant Admin'}</button>
                      ) : (
                        <button onClick={() => handleRoleChange(u, 'user')} disabled={isUpdating} className="btn btn-secondary btn-sm" style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--warning)' }} title="Revoke Admin access"><User size={14} />{isUpdating ? 'Updating...' : 'Change to User'}</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UsersPage;

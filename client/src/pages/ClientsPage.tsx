import React, { useEffect, useState } from 'react';
import { Client } from '../types';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ClientModal } from '../components/clients/ClientModal';
import { ClientDetailDrawer } from '../components/clients/ClientDetailDrawer';
import { InvoiceDetailModal } from '../components/invoices/InvoiceDetailModal';
import { Plus, Search, Eye, Edit2, Trash2, RefreshCw, TrendingUp } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailInvoiceId, setDetailInvoiceId] = useState<number | null>(null);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await api.get<Client[]>('/clients');
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    try {
      await api.delete(`/clients/${id}`);
      loadClients();
    } catch (err: any) {
      alert(err.message || 'Failed to delete client');
    }
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Clients & Cash Flow Tracking</h1>
            <p>Monitor per-client billing volumes, cash inflows, and outstanding receivables</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={loadClients} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Add Client
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div className="search-input">
          <Search />
          <input
            type="text"
            placeholder="Search clients by person name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Client / Company</th>
              <th>Contact Info</th>
              <th style={{ textAlign: 'right' }}>Total Invoiced</th>
              <th style={{ textAlign: 'right' }}>Total Collected</th>
              <th style={{ textAlign: 'right' }}>Outstanding Balance</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  No clients found.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const outstanding = client.outstanding || 0;
                return (
                  <tr key={client.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{client.name}</div>
                      {client.company && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                          {client.company}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--font-size-xs)' }}>{client.email || '—'}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{client.phone || '—'}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(client.total_invoiced)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                      {formatCurrency(client.total_paid)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      <span style={{ color: outstanding > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                        {formatCurrency(outstanding)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="btn btn-secondary btn-sm"
                          title="View Money Flow"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          <TrendingUp size={14} /> Flow
                        </button>
                        <button
                          onClick={() => setEditingClient(client)}
                          className="btn btn-ghost btn-sm"
                          title="Edit"
                          style={{ padding: '6px' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="btn btn-ghost btn-sm"
                          title="Delete"
                          style={{ padding: '6px', color: 'var(--danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {(showAddModal || editingClient) && (
        <ClientModal
          client={editingClient}
          onClose={() => {
            setShowAddModal(false);
            setEditingClient(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingClient(null);
            loadClients();
          }}
        />
      )}

      {selectedClient && (
        <ClientDetailDrawer
          clientId={selectedClient.id}
          onClose={() => setSelectedClient(null)}
          onOpenInvoice={(id) => setDetailInvoiceId(id)}
        />
      )}

      {detailInvoiceId && (
        <InvoiceDetailModal
          invoiceId={detailInvoiceId}
          onClose={() => setDetailInvoiceId(null)}
          onRecordPayment={() => {}}
        />
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Invoice, Client } from '../types';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate, getStatusBadgeClass, formatStatusLabel } from '../utils/formatters';
import { InvoiceModal } from '../components/invoices/InvoiceModal';
import { PaymentModal } from '../components/invoices/PaymentModal';
import { InvoiceDetailModal } from '../components/invoices/InvoiceDetailModal';
import { Plus, Search, Filter, CreditCard, Eye, Trash2, RefreshCw } from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [detailInvoiceId, setDetailInvoiceId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [invs, cls] = await Promise.all([
          api.get<Invoice[]>('/invoices'),
          api.get<Client[]>('/clients'),
        ]);
        setInvoices(invs);
        setClients(cls);
      } else {
        const invs = await api.get<Invoice[]>('/invoices');
        setInvoices(invs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (searchParams.get('new') === '1') {
      setShowCreateModal(true);
      // Clean query param
      setSearchParams({});
    }
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete invoice');
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.client_name && inv.client_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>{isAdmin ? 'Invoices & Billing System' : 'My Invoices'}</h1>
            <p>{isAdmin ? 'Generate invoices, record partial payments, and track client receivables' : 'View your invoices, check outstanding balances, and download invoice copies'}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={loadData} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            {isAdmin && (
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Create Invoice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div className="filter-bar">
          <div className="search-input">
            <Search />
            <input
              type="text"
              placeholder="Search by invoice number (e.g. INV-001) or client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Invoices ({invoices.length})</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Fully Paid</option>
            <option value="overdue">Overdue</option>
            <option value="sent">Sent (Unpaid)</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th style={{ textAlign: 'right' }}>Total Amount</th>
              <th style={{ textAlign: 'right' }}>Amount Paid</th>
              <th style={{ textAlign: 'right' }}>Balance Due</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                </td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  No invoices found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const balanceDue = inv.total_amount - inv.amount_paid;
                const percentPaid = inv.total_amount > 0 ? Math.round((inv.amount_paid / inv.total_amount) * 100) : 0;

                return (
                  <tr key={inv.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{inv.invoice_number}</strong>
                    </td>
                    <td>
                      <div>{inv.client_name}</div>
                      {inv.client_company && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          {inv.client_company}
                        </div>
                      )}
                    </td>
                    <td>{formatDate(inv.issue_date)}</td>
                    <td>
                      <span style={{ color: inv.status === 'overdue' ? 'var(--danger)' : 'inherit' }}>
                        {formatDate(inv.due_date)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="text-success" style={{ fontWeight: 600 }}>
                        {formatCurrency(inv.amount_paid)}
                      </div>
                      <div style={{ width: '80px', margin: '4px 0 0 auto' }}>
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill green"
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: balanceDue > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                        {formatCurrency(balanceDue)}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${getStatusBadgeClass(inv.status)}`}>
                        <span className="badge-dot"></span>
                        {formatStatusLabel(inv.status)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        {isAdmin && balanceDue > 0 && (
                          <button
                            onClick={() => setPaymentInvoice(inv)}
                            className="btn btn-secondary btn-sm"
                            title="Record Payment"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          >
                            <CreditCard size={14} /> Pay
                          </button>
                        )}
                        <button
                          onClick={() => setDetailInvoiceId(inv.id)}
                          className="btn btn-ghost btn-sm"
                          title="View / Print"
                          style={{ padding: '6px' }}
                        >
                          <Eye size={16} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="btn btn-ghost btn-sm"
                            title="Delete Invoice"
                            style={{ padding: '6px', color: 'var(--danger)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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
      {showCreateModal && (
        <InvoiceModal
          clients={clients}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {paymentInvoice && (
        <PaymentModal
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => {
            setPaymentInvoice(null);
            loadData();
          }}
        />
      )}

      {detailInvoiceId && (
        <InvoiceDetailModal
          invoiceId={detailInvoiceId}
          onClose={() => setDetailInvoiceId(null)}
          onRecordPayment={(inv) => setPaymentInvoice(inv)}
        />
      )}
    </div>
  );
};

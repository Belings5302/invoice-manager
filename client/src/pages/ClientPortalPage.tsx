import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientSummary, Invoice } from '../types';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate, getStatusBadgeClass, formatStatusLabel } from '../utils/formatters';
import { InvoiceDetailModal } from '../components/invoices/InvoiceDetailModal';
import {
  FileText,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Eye,
  Building2,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const ClientPortalPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ClientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const data = await api.get<ClientSummary>('/reports/my-summary');
      setSummary(data);
    } catch (err: any) {
      console.error(err);
      setErrorCode(err.code || null);
      setError(err.message || 'Failed to load your client account summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Pending activation — user exists but admin hasn't linked them to a client yet
  if (errorCode === 'PENDING_ACTIVATION' || (!summary && !error && !loading)) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 'var(--space-6)' }}>
        <div className="card" style={{
          padding: 'var(--space-10) var(--space-8)',
          textAlign: 'center',
          maxWidth: 560,
          width: '100%',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.07) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-2xl)',
        }}>
          {/* Animated hourglass icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            border: '2px solid rgba(59,130,246,0.25)',
          }}>
            <Clock size={32} color="var(--accent-blue)" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>
            Account Activation Pending
          </h2>

          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)', lineHeight: 1.7 }}>
            Your account has been created successfully. An administrator needs to link your account to a client profile before you can access your portal.
          </p>

          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
            Once activated, you'll be able to view your invoices, payment history, and project deliverables here.
          </p>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              What happens next?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', textAlign: 'left' }}>
              {[
                { icon: '✅', text: 'Your account has been registered' },
                { icon: '⏳', text: 'Administrator review in progress' },
                { icon: '🔗', text: 'Client profile will be linked to your account' },
                { icon: '🚀', text: 'You\'ll gain full portal access' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: i === 0 ? 'var(--success)' : i === 1 ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                  <span style={{ fontSize: '16px' }}>{step.icon}</span>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={loadSummary} className="btn btn-secondary btn-sm" style={{ margin: '0 auto' }}>
            <RefreshCw size={14} /> Check activation status
          </button>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
        <AlertCircle size={48} color="var(--warning)" style={{ margin: '0 auto var(--space-4)' }} />
        <h2>Something went wrong</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          {error || 'Failed to load your client account summary.'}
        </p>
        <button onClick={loadSummary} className="btn btn-secondary btn-sm" style={{ margin: '0 auto' }}>
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    );
  }


  const { client, totals, recentInvoices, recentPayments, jobs, totalInvoicesCount, totalJobsCount, activeJobsCount } = summary;
  const isSettled = totals.total_outstanding <= 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          padding: 'var(--space-6)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-1)' }}>
              <span className="badge badge-info" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Sparkles size={12} /> Client Portal
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Account #{client.id.toString().padStart(4, '0')}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>
              Welcome, {user?.name || client.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={15} color="var(--accent-blue)" /> {client.company || client.name}
              </span>
              {client.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color="var(--text-muted)" /> {client.email}
                </span>
              )}
              {client.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} color="var(--text-muted)" /> {client.phone}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button onClick={() => navigate('/invoices')} className="btn btn-secondary btn-sm">
              <FileText size={14} /> My Invoices ({totalInvoicesCount})
            </button>
            <button onClick={() => navigate('/jobs')} className="btn btn-secondary btn-sm">
              <Briefcase size={14} /> My Deliverables ({totalJobsCount})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="kpi-grid">
        {/* Total Invoiced */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Invoiced</span>
            <div className="kpi-icon blue">
              <FileText size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(totals.total_invoiced)}</div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
              Across {totalInvoicesCount} billing statement{totalInvoicesCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Total Paid */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Paid</span>
            <div className="kpi-icon green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>
            {formatCurrency(totals.total_paid)}
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--success)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> {recentPayments.length} recorded payments
            </span>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="kpi-card" style={{ borderColor: isSettled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)' }}>
          <div className="kpi-header">
            <span className="kpi-title">Outstanding Balance</span>
            <div className={`kpi-icon ${isSettled ? 'green' : 'amber'}`}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: isSettled ? 'var(--success)' : 'var(--warning)' }}>
            {formatCurrency(totals.total_outstanding)}
          </div>
          <div className="kpi-footer">
            {isSettled ? (
              <span className="badge badge-success" style={{ fontSize: '11px' }}>
                <CheckCircle2 size={12} /> All invoices paid in full
              </span>
            ) : (
              <span className="badge badge-warning" style={{ fontSize: '11px' }}>
                <Clock size={12} /> Balance awaiting settlement
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Invoices & Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'var(--space-6)' }}>
        {/* Left: Recent Invoices */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <FileText size={18} color="var(--accent-blue)" />
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>Recent Invoices</h2>
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-blue)' }}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              No invoices generated yet.
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>View</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv) => {
                    const bal = inv.total_amount - inv.amount_paid;
                    return (
                      <tr key={inv.id}>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{inv.invoice_number}</span>
                        </td>
                        <td>{formatDate(inv.due_date)}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(inv.total_amount)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: bal > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                          {formatCurrency(bal)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${getStatusBadgeClass(inv.status)}`} style={{ fontSize: '11px' }}>
                            <span className="badge-dot"></span>
                            {formatStatusLabel(inv.status)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedInvoiceId(inv.id)}
                            className="btn btn-ghost btn-sm"
                            title="View Invoice"
                            style={{ padding: '5px 8px' }}
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Deliverables & Projects */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Briefcase size={18} color="var(--accent-purple)" />
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>Active Deliverables</h2>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-purple)' }}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              No active project deliverables at this time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', gap: 'var(--space-3)', marginTop: '2px' }}>
                      {job.invoice_number && <span>Invoice: {job.invoice_number}</span>}
                      {job.start_date && <span>Started: {formatDate(job.start_date)}</span>}
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(job.status)}`} style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                    <span className="badge-dot"></span>
                    {formatStatusLabel(job.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="card" style={{ padding: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <CreditCard size={18} color="var(--success)" />
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>Payment History</h2>
        </div>

        {recentPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
            No recorded payments yet.
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Payment Date</th>
                  <th>Invoice #</th>
                  <th style={{ textAlign: 'right' }}>Amount Paid</th>
                  <th>Payment Method</th>
                  <th>Reference / Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} color="var(--text-muted)" /> {formatDate(p.payment_date)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{p.invoice_number || 'N/A'}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                      {formatCurrency(p.amount)}
                    </td>
                    <td>
                      <span className="badge badge-default" style={{ textTransform: 'capitalize', fontSize: '11px' }}>
                        {p.method}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                      {p.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
};
export default ClientPortalPage;

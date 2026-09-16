import React from 'react';
import { FileText, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Invoice, Payment } from '../../types';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

interface RecentActivityProps {
  invoices: Invoice[];
  payments: Payment[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ invoices, payments }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
      {/* Recent Payments Received */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ color: 'var(--text-primary)' }}>Recent Cash Inflows</h3>
          <Link to="/invoices" style={{ fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ExternalLink size={12} />
          </Link>
        </div>

        <div className="activity-list">
          {payments.length === 0 ? (
            <div style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
              No payments recorded yet.
            </div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="activity-item">
                <div className="activity-icon income">
                  <ArrowDownLeft size={18} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">{p.client_name}</div>
                  <div className="activity-time">
                    {p.invoice_number} • {formatDate(p.payment_date)} • via {p.method}
                  </div>
                </div>
                <div className="activity-amount text-success">
                  +{formatCurrency(p.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Invoices Issued */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ color: 'var(--text-primary)' }}>Recently Issued Invoices</h3>
          <Link to="/invoices" style={{ fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ExternalLink size={12} />
          </Link>
        </div>

        <div className="activity-list">
          {invoices.length === 0 ? (
            <div style={{ padding: 'var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
              No invoices generated yet.
            </div>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="activity-item">
                <div className="activity-icon invoice">
                  <FileText size={18} />
                </div>
                <div className="activity-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="activity-title">{inv.invoice_number}</span>
                    <span className={`badge ${getStatusBadgeClass(inv.status)}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="activity-time">
                    {inv.client_name} • Due {formatDate(inv.due_date)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="activity-amount">{formatCurrency(inv.total_amount)}</div>
                  {inv.amount_paid > 0 && inv.status !== 'paid' && (
                    <div style={{ fontSize: '11px', color: 'var(--warning)' }}>
                      Paid: {formatCurrency(inv.amount_paid)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

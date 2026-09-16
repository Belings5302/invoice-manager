import React, { useEffect, useState } from 'react';
import { Client, Invoice, Payment, Job } from '../../types';
import { api } from '../../utils/api';
import { formatCurrency, formatDate, getStatusBadgeClass, formatStatusLabel } from '../../utils/formatters';
import { X, DollarSign, CheckCircle2, Clock, Briefcase, FileText, ArrowDownLeft } from 'lucide-react';

interface ClientDetailDrawerProps {
  clientId: number;
  onClose: () => void;
  onOpenInvoice: (invoiceId: number) => void;
}

interface ClientDetailData extends Client {
  invoices: Invoice[];
  jobs: Job[];
  payments: Payment[];
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  clientId,
  onClose,
  onOpenInvoice,
}) => {
  const [data, setData] = useState<ClientDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await api.get<ClientDetailData>(`/clients/${clientId}`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  if (loading || !data) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  const totalInvoiced = data.invoices.reduce((sum, i) => sum + i.total_amount, 0);
  const totalPaid = data.invoices.reduce((sum, i) => sum + i.amount_paid, 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 800 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{data.name}</h3>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {data.company && <span>{data.company} • </span>}
              {data.email && <span>{data.email} • </span>}
              {data.phone && <span>{data.phone}</span>}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Money Flow Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)'
        }}>
          <div className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Billed</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{formatCurrency(totalInvoiced)}</div>
          </div>
          <div className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
            <div style={{ fontSize: '11px', color: 'var(--success)' }}>Total Collected</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(totalPaid)}</div>
          </div>
          <div className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
            <div style={{ fontSize: '11px', color: 'var(--warning)' }}>Outstanding Balance</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--warning)' }}>{formatCurrency(totalOutstanding)}</div>
          </div>
          <div className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-blue)' }}>Collection Rate</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-blue)' }}>{collectionRate}%</div>
          </div>
        </div>

        {/* Invoices for this Client */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} color="var(--accent-blue)" /> Invoices Issued ({data.invoices.length})
          </h4>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}>Paid</th>
                  <th style={{ textAlign: 'right' }}>Remaining</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                      No invoices yet for this client.
                    </td>
                  </tr>
                ) : (
                  data.invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => onOpenInvoice(inv.id)}
                      style={{ cursor: 'pointer' }}
                      title="Click to view details"
                    >
                      <td><strong>{inv.invoice_number}</strong></td>
                      <td>{formatDate(inv.issue_date)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(inv.total_amount)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatCurrency(inv.amount_paid)}</td>
                      <td style={{ textAlign: 'right', color: inv.total_amount - inv.amount_paid > 0 ? 'var(--warning)' : 'inherit' }}>
                        {formatCurrency(inv.total_amount - inv.amount_paid)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${getStatusBadgeClass(inv.status)}`} style={{ fontSize: '11px' }}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Inflow Timeline */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowDownLeft size={16} color="var(--success)" /> Money Inflow History ({data.payments.length})
          </h4>
          {data.payments.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', padding: '12px' }}>
              No payments recorded from this client yet.
            </div>
          ) : (
            <div className="activity-list">
              {data.payments.map((p) => (
                <div key={p.id} className="activity-item">
                  <div className="activity-icon income">
                    <DollarSign size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      Payment for {p.invoice_number}
                      {p.notes && <span style={{ color: 'var(--text-muted)' }}> ({p.notes})</span>}
                    </div>
                    <div className="activity-time">
                      {formatDate(p.payment_date)} • via {p.method}
                    </div>
                  </div>
                  <div className="activity-amount text-success">
                    +{formatCurrency(p.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jobs Linked to this Client */}
        <div>
          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={16} color="var(--accent-purple)" /> Jobs & Deliverables ({data.jobs.length})
          </h4>
          {data.jobs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', padding: '12px' }}>
              No jobs assigned to this client.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {data.jobs.map((j) => (
                <div key={j.id} className="card" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{j.title}</strong>
                    <span className={`badge ${getStatusBadgeClass(j.status)}`} style={{ fontSize: '10px' }}>
                      {formatStatusLabel(j.status)}
                    </span>
                  </div>
                  {j.description && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {j.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

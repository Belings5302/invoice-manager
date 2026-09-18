import React, { useEffect, useState } from 'react';
import { Invoice } from '../../types';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { X, Printer, CheckCircle, CreditCard, Clock } from 'lucide-react';

interface InvoiceDetailModalProps {
  invoiceId: number;
  onClose: () => void;
  onRecordPayment?: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoiceId,
  onClose,
  onRecordPayment,
}) => {
  const { isAdmin } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const data = await api.get<Invoice>(`/invoices/${invoiceId}`);
      setInvoice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [invoiceId]);

  if (loading || !invoice) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  const balanceDue = invoice.total_amount - invoice.amount_paid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 740 }} onClick={(e) => e.stopPropagation()}>
        {/* Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className={`badge ${getStatusBadgeClass(invoice.status)}`} style={{ fontSize: '13px' }}>
              <span className="badge-dot"></span>
              {invoice.status.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePrint} className="btn btn-secondary btn-sm">
              <Printer size={14} /> Print / PDF
            </button>
            {isAdmin && balanceDue > 0 && onRecordPayment && (
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="btn btn-success btn-sm"
              >
                <CreditCard size={14} /> Record Payment
              </button>
            )}
            <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Box */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
                {invoice.invoice_number}
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                Issued on: <strong>{formatDate(invoice.issue_date)}</strong> • Due date: <strong>{formatDate(invoice.due_date)}</strong>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>FlowBill Operations</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>billing@flowbill.rw</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Kigali, Rwanda</div>
            </div>
          </div>

          {/* Client Billed To */}
          <div style={{ margin: 'var(--space-4) 0' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Billed To
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', marginTop: '2px' }}>
              {invoice.client_name}
            </div>
            {invoice.client_company && (
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                {invoice.client_company}
              </div>
            )}
            {invoice.client_email && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {invoice.client_email} • {invoice.client_phone || 'N/A'}
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <table className="table" style={{ margin: 'var(--space-4) 0' }}>
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((it) => (
                <tr key={it.id}>
                  <td>{it.description}</td>
                  <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(it.unit_price)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Box */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '6px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: 'var(--space-4)',
          }}>
            <div style={{ display: 'flex', gap: '32px', fontSize: 'var(--font-size-sm)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
              <strong>{formatCurrency(invoice.total_amount)}</strong>
            </div>
            <div style={{ display: 'flex', gap: '32px', fontSize: 'var(--font-size-sm)', color: 'var(--success)' }}>
              <span>Total Paid:</span>
              <strong>-{formatCurrency(invoice.amount_paid)}</strong>
            </div>
            <div style={{
              display: 'flex',
              gap: '32px',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 800,
              color: balanceDue > 0 ? 'var(--warning)' : 'var(--success)',
              marginTop: '4px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '8px',
            }}>
              <span>Remaining Balance:</span>
              <span>{formatCurrency(balanceDue)}</span>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '8px' }}>
                Payment History ({invoice.payments.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 'var(--font-size-xs)',
                      padding: '6px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <strong>{formatDate(p.payment_date)}</strong> via {p.method}
                      {p.notes && <span style={{ color: 'var(--text-muted)' }}> ({p.notes})</span>}
                    </div>
                    <strong className="text-success">+{formatCurrency(p.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invoice.notes && (
            <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

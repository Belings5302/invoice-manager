import React, { useState } from 'react';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { api } from '../../utils/api';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, onClose, onSuccess }) => {
  const balanceRemaining = invoice.total_amount - invoice.amount_paid;

  const [amount, setAmount] = useState<number>(balanceRemaining);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'bank' | 'mobile' | 'cash'>('mobile');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Payment amount must be greater than 0.');
      return;
    }
    if (amount > balanceRemaining) {
      setError(`Amount cannot exceed the remaining balance of ${formatCurrency(balanceRemaining)}.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post('/payments', {
        invoice_id: invoice.id,
        amount,
        payment_date: paymentDate,
        method,
        notes,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Record Payment</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Invoice {invoice.invoice_number} • {invoice.client_name}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Balance Overview Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          textAlign: 'center',
          gap: 'var(--space-2)'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Invoice Total</div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>{formatCurrency(invoice.total_amount)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--success)' }}>Already Paid</div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--success)' }}>{formatCurrency(invoice.amount_paid)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--warning)' }}>Balance Due</div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--warning)' }}>{formatCurrency(balanceRemaining)}</div>
          </div>
        </div>

        {error && (
          <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Payment Amount (MWK)</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              max={balanceRemaining}
              min={1}
              required
              style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '2px 8px' }}
                onClick={() => setAmount(balanceRemaining)}
              >
                Pay Full Balance ({formatCurrency(balanceRemaining)})
              </button>
              {balanceRemaining > 100000 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                  onClick={() => setAmount(Math.floor(balanceRemaining / 2))}
                >
                  Pay 50% ({formatCurrency(Math.floor(balanceRemaining / 2))})
                </button>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                className="form-input"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={method}
                onChange={(e: any) => setMethod(e.target.value)}
              >
                <option value="mobile">Mobile Money (MTN / Airtel)</option>
                <option value="bank">Bank Transfer / Wire</option>
                <option value="cash">Cash in Hand</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Notes / Reference</label>
            <input
              type="text"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Transaction ID, Check #, or memo"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-success">
              <CheckCircle size={16} />
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

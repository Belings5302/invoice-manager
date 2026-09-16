import React, { useState } from 'react';
import { Client } from '../../types';
import { api } from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import { X, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

interface InvoiceModalProps {
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemRow {
  description: string;
  quantity: number;
  unit_price: number;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ clients, onClose, onSuccess }) => {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date();
  due.setDate(due.getDate() + 30);
  const defaultDueDate = due.toISOString().split('T')[0];

  const [clientId, setClientId] = useState<number | string>(clients[0]?.id || '');
  const [issueDate, setIssueDate] = useState<string>(today);
  const [dueDate, setDueDate] = useState<string>(defaultDueDate);
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<ItemRow[]>([
    { description: 'Professional Services', quantity: 1, unit_price: 100000 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemRow, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, it) => sum + (Number(it.quantity) * Number(it.unit_price)), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select a client.');
      return;
    }
    const hasEmpty = items.some(it => !it.description.trim() || it.quantity <= 0);
    if (hasEmpty) {
      setError('All items must have a valid description and quantity > 0.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post('/invoices', {
        client_id: Number(clientId),
        issue_date: issueDate,
        due_date: dueDate,
        notes,
        items,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Create New Invoice</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Add items, assign to client, and generate a new bill
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Client Selection */}
          <div className="form-group">
            <label className="form-label">Client / Organization</label>
            <select
              className="form-select"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input
                type="date"
                className="form-input"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <label className="form-label" style={{ margin: 0 }}>Invoice Items & Deliverables</label>
              <button
                type="button"
                onClick={addItem}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11px', color: 'var(--accent-blue)' }}
              >
                <Plus size={14} /> Add Row
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Description / Service"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    style={{ flex: 3 }}
                    required
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                    style={{ flex: 1, minWidth: 60 }}
                    min={1}
                    required
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Unit Price"
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                    style={{ flex: 2, minWidth: 100 }}
                    min={0}
                    required
                  />
                  <div style={{ flex: 2, textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>
                    {formatCurrency(item.quantity * item.unit_price)}
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal / Total Calculation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-4)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            margin: 'var(--space-4) 0'
          }}>
            <span style={{ fontWeight: 600 }}>Total Invoice Amount:</span>
            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--accent-blue)' }}>
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Payment Instructions (Optional)</label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bank account details or special instructions"
              rows={2}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Save size={16} />
              {submitting ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

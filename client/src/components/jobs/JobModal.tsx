import React, { useState } from 'react';
import { api } from '../../utils/api';
import { Job, Client, Invoice } from '../../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface JobModalProps {
  job?: Job | null;
  clients: Client[];
  invoices: Invoice[];
  onClose: () => void;
  onSuccess: () => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  job,
  clients,
  invoices,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState(job?.title || '');
  const [clientId, setClientId] = useState<number | string>(job?.client_id || (clients[0]?.id || ''));
  const [invoiceId, setInvoiceId] = useState<number | string>(job?.invoice_id || '');
  const [status, setStatus] = useState<Job['status']>(job?.status || 'in_progress');
  const [startDate, setStartDate] = useState(job?.start_date || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(job?.end_date || '');
  const [description, setDescription] = useState(job?.description || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter invoices for selected client
  const clientInvoices = invoices.filter(i => i.client_id === Number(clientId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) {
      setError('Job title and client are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (job?.id) {
        await api.put(`/jobs/${job.id}`, {
          title,
          client_id: Number(clientId),
          invoice_id: invoiceId ? Number(invoiceId) : null,
          status,
          start_date: startDate || null,
          end_date: status === 'completed' && !endDate ? new Date().toISOString().split('T')[0] : (endDate || null),
          description,
        });
      } else {
        await api.post('/jobs', {
          title,
          client_id: Number(clientId),
          invoice_id: invoiceId ? Number(invoiceId) : null,
          status,
          start_date: startDate || null,
          end_date: status === 'completed' && !endDate ? new Date().toISOString().split('T')[0] : (endDate || null),
          description,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save job.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{job ? 'Edit Job Project' : 'Add New Job Assignment'}</h3>
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
          <div className="form-group">
            <label className="form-label">Job / Project Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign, Network Setup"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Client</label>
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

            <div className="form-group">
              <label className="form-label">Link Invoice (Optional)</label>
              <select
                className="form-select"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
              >
                <option value="">No linked invoice</option>
                {clientInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} (MWK{inv.total_amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Execution Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed (Done)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Completion Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Required if completed"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Scope of Work</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the deliverables and objectives for this job?"
              rows={2}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Save size={16} />
              {submitting ? 'Saving...' : 'Save Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

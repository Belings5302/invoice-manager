import React, { useState } from 'react';
import { api } from '../../utils/api';
import { Expense } from '../../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface ExpenseModalProps {
  expense?: Expense | null;
  categories: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  expense,
  categories,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState(expense?.category || (categories[0] || 'Rent'));
  const [customCategory, setCustomCategory] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [amount, setAmount] = useState<number>(expense?.amount || 0);
  const [expenseDate, setExpenseDate] = useState(expense?.expense_date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(expense?.description || '');
  const [reference, setReference] = useState(expense?.reference || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isCustom ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Please provide a category.');
      return;
    }
    if (amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (expense?.id) {
        await api.put(`/expenses/${expense.id}`, {
          category: finalCategory,
          amount,
          expense_date: expenseDate,
          description,
          reference,
        });
      } else {
        await api.post('/expenses', {
          category: finalCategory,
          amount,
          expense_date: expenseDate,
          description,
          reference,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to record expense.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{expense ? 'Edit Expense' : 'Record Expenditure'}</h3>
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
            <label className="form-label">Expense Amount (MWK)</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              required
              style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--danger)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            {!isCustom ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  {['Rent', 'Salaries', 'Utilities', 'Supplies', 'Marketing', 'Equipment', 'Taxes', 'Travel'].filter(c => !categories.includes(c)).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCustom(true)}
                >
                  + New Category
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter new category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCustom(false)}
                >
                  Select Existing
                </button>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Expense Date</label>
              <input
                type="date"
                className="form-input"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reference / Receipt # (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. REC-8492"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expenditure for?"
              rows={2}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-danger">
              <Save size={16} />
              {submitting ? 'Saving...' : 'Save Expenditure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Expense } from '../types';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ExpenseModal } from '../components/expenses/ExpenseModal';
import { Plus, Search, Filter, Trash2, Edit2, RefreshCw, CreditCard } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const [expList, cats] = await Promise.all([
        api.get<Expense[]>('/expenses'),
        api.get<string[]>('/expenses/categories'),
      ]);
      setExpenses(expList);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      loadExpenses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
      (e.reference && e.reference.toLowerCase().includes(search.toLowerCase())) ||
      e.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Organization Expenditures</h1>
            <p>Track business expenses, overheads, payroll, and operational costs</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={loadExpenses} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn btn-danger btn-sm">
              <Plus size={16} /> Record Expense
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner Total */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {selectedCategory === 'all' ? 'Total Expenditures' : `Total for ${selectedCategory}`}
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--danger)', marginTop: '2px' }}>
            {formatCurrency(totalFilteredAmount)}
          </div>
        </div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>
          {filteredExpenses.length} record(s) logged
        </div>
      </div>

      {/* Filter & Search */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div className="filter-bar">
          <div className="search-input">
            <Search />
            <input
              type="text"
              placeholder="Search description, reference #, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Reference #</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
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
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  No expenditures found.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{formatDate(exp.expense_date)}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td>{exp.description || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    {exp.reference || '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>
                    {formatCurrency(exp.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button
                        onClick={() => setEditingExpense(exp)}
                        className="btn btn-ghost btn-sm"
                        title="Edit"
                        style={{ padding: '6px' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="btn btn-ghost btn-sm"
                        title="Delete"
                        style={{ padding: '6px', color: 'var(--danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {(showAddModal || editingExpense) && (
        <ExpenseModal
          expense={editingExpense}
          categories={categories}
          onClose={() => {
            setShowAddModal(false);
            setEditingExpense(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingExpense(null);
            loadExpenses();
          }}
        />
      )}
    </div>
  );
};

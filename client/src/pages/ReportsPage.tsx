import React, { useEffect, useState } from 'react';
import { ProfitLossMonth, Client, ClientStatement } from '../types';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Printer, RefreshCw, BarChart3, FileText, ArrowDownLeft, TrendingUp } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pnl' | 'statement'>('pnl');
  const [plData, setPlData] = useState<ProfitLossMonth[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | string>('');
  const [clientStatement, setClientStatement] = useState<ClientStatement | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [pl, cls] = await Promise.all([
        api.get<ProfitLossMonth[]>('/reports/profit-loss?months=6'),
        api.get<Client[]>('/clients'),
      ]);
      setPlData(pl);
      setClients(cls);
      if (cls.length > 0 && !selectedClientId) {
        setSelectedClientId(cls[0].id);
        fetchStatement(cls[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatement = async (clientId: number | string) => {
    if (!clientId) return;
    try {
      const stmt = await api.get<ClientStatement>(`/reports/client-statement/${clientId}`);
      setClientStatement(stmt);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleClientChange = (id: string) => {
    setSelectedClientId(id);
    fetchStatement(id);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Financial Reports & Client Statements</h1>
            <p>Audited Profit & Loss performance and per-client transaction ledger</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={loadReports} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
              <Printer size={14} /> Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-3)' }}>
        <button
          onClick={() => setActiveTab('pnl')}
          className={`btn ${activeTab === 'pnl' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <BarChart3 size={15} /> Monthly Profit & Loss Statement
        </button>
        <button
          onClick={() => setActiveTab('statement')}
          className={`btn ${activeTab === 'statement' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <FileText size={15} /> Client Ledger & Statement
        </button>
      </div>

      {/* TAB 1: PROFIT & LOSS */}
      {activeTab === 'pnl' && (
        <div className="animate-fade-in">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th style={{ textAlign: 'right' }}>Cash Inflow (Income)</th>
                  <th style={{ textAlign: 'right' }}>Expenditures</th>
                  <th style={{ textAlign: 'right' }}>Net Margin</th>
                  <th style={{ textAlign: 'right' }}>Top Expenditure Categories</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                      <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </td>
                  </tr>
                ) : (
                  plData.map((m, idx) => {
                    const isProfit = m.profit >= 0;
                    return (
                      <tr key={idx}>
                        <td>
                          <strong>{m.month}</strong>
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                          {formatCurrency(m.income)}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>
                          {formatCurrency(m.expenses)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800 }}>
                          <span style={{ color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
                            {formatCurrency(m.profit)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)' }}>
                          {m.expenseBreakdown && m.expenseBreakdown.length > 0 ? (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                              {m.expenseBreakdown.slice(0, 3).map((cat) => (
                                <span
                                  key={cat.category}
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                    padding: '2px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-secondary)',
                                  }}
                                >
                                  {cat.category}: {formatCurrency(cat.total)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>No expense data</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT STATEMENT */}
      {activeTab === 'statement' && (
        <div className="animate-fade-in">
          {/* Client Selector */}
          <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Select Client:</label>
              <select
                className="form-select"
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                style={{ maxWidth: 360 }}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {clientStatement && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
            }}>
              {/* Statement Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Account Statement</h2>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginTop: '4px' }}>
                    {clientStatement.client.name}
                  </div>
                  {clientStatement.client.company && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {clientStatement.client.company}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Statement Date</div>
                  <div style={{ fontWeight: 700 }}>{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Statement Summary KPI */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                textAlign: 'center',
              }}>
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Total Invoiced</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
                    {formatCurrency(clientStatement.totals.total_invoiced)}
                  </div>
                </div>
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>Total Received</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--success)' }}>
                    {formatCurrency(clientStatement.totals.total_paid)}
                  </div>
                </div>
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--warning)' }}>Current Outstanding Balance</div>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--warning)' }}>
                    {formatCurrency(clientStatement.totals.total_outstanding)}
                  </div>
                </div>
              </div>

              {/* All Invoices */}
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                Issued Invoices
              </h3>
              <table className="table" style={{ marginBottom: 'var(--space-6)' }}>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right' }}>Paid</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clientStatement.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td><strong>{inv.invoice_number}</strong></td>
                      <td>{formatDate(inv.issue_date)}</td>
                      <td>{formatDate(inv.due_date)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(inv.total_amount)}</td>
                      <td style={{ textAlign: 'right', color: 'var(--success)' }}>{formatCurrency(inv.amount_paid)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(inv.total_amount - inv.amount_paid)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ textTransform: 'capitalize', fontSize: '11px' }}>{inv.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Payment Timeline */}
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                Payment Receipts
              </h3>
              <div className="activity-list">
                {clientStatement.payments.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', padding: '12px' }}>
                    No payments on record.
                  </div>
                ) : (
                  clientStatement.payments.map((p) => (
                    <div key={p.id} className="activity-item">
                      <div className="activity-icon income">
                        <ArrowDownLeft size={16} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">
                          Payment towards {p.invoice_number}
                          {p.notes && <span style={{ color: 'var(--text-muted)' }}> ({p.notes})</span>}
                        </div>
                        <div className="activity-time">{formatDate(p.payment_date)} • via {p.method}</div>
                      </div>
                      <div className="activity-amount text-success">
                        +{formatCurrency(p.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

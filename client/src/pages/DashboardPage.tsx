import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { DashboardData } from '../types';
import { KPICards } from '../components/dashboard/KPICards';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { InvoiceStatusChart } from '../components/dashboard/InvoiceStatusChart';
import { JobsChart } from '../components/dashboard/JobsChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { RefreshCw, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DashboardData>('/reports/dashboard');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load financial dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-error" style={{ margin: 'var(--space-6) 0' }}>
        <strong>Error:</strong> {error}
        <button onClick={loadDashboard} className="btn btn-secondary btn-sm" style={{ marginLeft: '12px' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Financial Operations Dashboard</h1>
            <p>Real-time billing, partial payments tracking, cash flow, and project deliveries</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={loadDashboard} className="btn btn-secondary btn-sm" title="Refresh metrics">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <Link to="/invoices?new=1" className="btn btn-primary btn-sm">
              <Plus size={16} /> New Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards kpis={data.kpis} />

      {/* Main Income vs Expense Chart */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <RevenueChart data={data.charts.monthlyComparison} />
      </div>

      {/* Secondary Charts: Invoice Status Breakdown & Jobs Completed */}
      <div className="chart-grid">
        <InvoiceStatusChart data={data.charts.invoiceStatus} />
        <JobsChart data={data.charts.jobsPerMonth} />
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <RecentActivity
          invoices={data.recent.invoices}
          payments={data.recent.payments}
        />
      </div>
    </div>
  );
};

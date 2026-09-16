import React from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { DashboardKPIs } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface KPICardsProps {
  kpis: DashboardKPIs;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const isProfitable = kpis.netProfit >= 0;

  return (
    <div className="kpi-grid">
      {/* Monthly Revenue */}
      <div className="kpi-card blue animate-fade-in">
        <div className="kpi-card-header">
          <div>
            <div className="kpi-card-label">Monthly Inflow (Paid)</div>
            <div className="kpi-card-value text-info">
              {formatCurrency(kpis.monthlyRevenue)}
            </div>
          </div>
          <div className="kpi-card-icon">
            <DollarSign size={22} />
          </div>
        </div>
        <div className="kpi-card-sub">Collected payments this month</div>
      </div>

      {/* Monthly Expenses */}
      <div className="kpi-card red animate-fade-in">
        <div className="kpi-card-header">
          <div>
            <div className="kpi-card-label">Monthly Expenses</div>
            <div className="kpi-card-value text-danger">
              {formatCurrency(kpis.monthlyExpenses)}
            </div>
          </div>
          <div className="kpi-card-icon">
            <TrendingDown size={22} />
          </div>
        </div>
        <div className="kpi-card-sub">Organization spend this month</div>
      </div>

      {/* Net Profit / Loss */}
      <div className={`kpi-card ${isProfitable ? 'green' : 'red'} animate-fade-in`}>
        <div className="kpi-card-header">
          <div>
            <div className="kpi-card-label">Net Profit / Loss</div>
            <div className={`kpi-card-value ${isProfitable ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(kpis.netProfit)}
            </div>
          </div>
          <div className="kpi-card-icon">
            <TrendingUp size={22} />
          </div>
        </div>
        <div className="kpi-card-sub">Inflow minus expenses</div>
      </div>

      {/* Outstanding Invoices */}
      <div className="kpi-card amber animate-fade-in">
        <div className="kpi-card-header">
          <div>
            <div className="kpi-card-label">Unpaid Receivables</div>
            <div className="kpi-card-value text-warning">
              {formatCurrency(kpis.outstanding)}
            </div>
          </div>
          <div className="kpi-card-icon">
            <Clock size={22} />
          </div>
        </div>
        <div className="kpi-card-sub">{kpis.outstandingCount} active invoice(s) pending</div>
      </div>

      {/* Overdue Invoices */}
      <div className="kpi-card red animate-fade-in">
        <div className="kpi-card-header">
          <div>
            <div className="kpi-card-label">Overdue Invoices</div>
            <div className="kpi-card-value text-danger">
              {formatCurrency(kpis.overdueAmount)}
            </div>
          </div>
          <div className="kpi-card-icon">
            <AlertTriangle size={22} />
          </div>
        </div>
        <div className="kpi-card-sub">{kpis.overdueCount} invoice(s) past due date</div>
      </div>

      {/* Active Clients */}
      <div className="kpi-card purple animate-fade-in">
        <div className="kpi-card-header">
          <div>
            <div className="kpi-card-label">Client Portfolio</div>
            <div className="kpi-card-value" style={{ color: 'var(--accent-purple)' }}>
              {kpis.totalClients}
            </div>
          </div>
          <div className="kpi-card-icon">
            <Users size={22} />
          </div>
        </div>
        <div className="kpi-card-sub">Tracked organizations & clients</div>
      </div>
    </div>
  );
};

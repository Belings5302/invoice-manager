import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MonthlyChartPoint } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RevenueChartProps {
  data: MonthlyChartPoint[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>{label}</div>
          {payload.map((item: any) => (
            <div key={item.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: item.color, fontSize: 'var(--font-size-xs)' }}>
              <span>{item.name}:</span>
              <strong>{formatCurrency(item.value)}</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card full-width">
      <div className="card-header">
        <div>
          <h3 className="chart-card-title">Monthly Income vs. Expenses & Profit Flow</h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Comparing collected cash inflow against organizational expenditures over the last 6 months
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: 320, marginTop: 'var(--space-4)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }} />
            <Bar dataKey="income" name="Income (Collected)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expenses" name="Expenditures" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="profit" name="Net Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

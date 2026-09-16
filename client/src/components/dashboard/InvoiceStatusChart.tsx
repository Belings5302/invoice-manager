import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { InvoiceStatusPoint } from '../../types';
import { formatCurrency, formatStatusLabel } from '../../utils/formatters';

interface InvoiceStatusChartProps {
  data: InvoiceStatusPoint[];
}

const COLORS: Record<string, string> = {
  paid: '#10b981',
  partial: '#f59e0b',
  overdue: '#ef4444',
  sent: '#3b82f6',
  draft: '#64748b',
};

export const InvoiceStatusChart: React.FC<InvoiceStatusChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: formatStatusLabel(item.status),
    status: item.status,
    value: item.total,
    count: item.count,
  }));

  const totalInvoiced = data.reduce((sum, item) => sum + item.total, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-lg)',
          fontSize: 'var(--font-size-xs)',
        }}>
          <div style={{ fontWeight: 700, color: COLORS[item.status] || '#fff' }}>{item.name}</div>
          <div>Total Volume: <strong>{formatCurrency(item.value)}</strong></div>
          <div>Invoices: <strong>{item.count}</strong></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card">
      <h3 className="chart-card-title">Invoice Status & Health</h3>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.status}`} fill={COLORS[entry.status] || '#64748b'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{
        textAlign: 'center',
        marginTop: '-18px',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--text-muted)'
      }}>
        Cumulative Volume: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalInvoiced)}</strong>
      </div>
    </div>
  );
};

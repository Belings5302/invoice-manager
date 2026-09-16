export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Client {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  company?: string | null;
  total_invoiced?: number;
  total_paid?: number;
  outstanding?: number;
  created_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  method: 'cash' | 'bank' | 'mobile';
  notes?: string | null;
  invoice_number?: string;
  client_name?: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  client_name?: string;
  client_company?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  client_address?: string | null;
  total_amount: number;
  amount_paid: number;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
  issue_date: string;
  due_date: string;
  notes?: string | null;
  items?: InvoiceItem[];
  payments?: Payment[];
  created_at: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  expense_date: string;
  description?: string | null;
  reference?: string | null;
  created_at: string;
}

export interface Job {
  id: number;
  client_id: number;
  invoice_id?: number | null;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  client_name?: string;
  invoice_number?: string | null;
  created_at: string;
}

export interface DashboardKPIs {
  monthlyRevenue: number;
  monthlyExpenses: number;
  netProfit: number;
  outstanding: number;
  outstandingCount: number;
  overdueCount: number;
  overdueAmount: number;
  totalClients: number;
}

export interface MonthlyChartPoint {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface InvoiceStatusPoint {
  status: string;
  count: number;
  total: number;
}

export interface JobsChartPoint {
  month: string;
  completed: number;
  total: number;
}

export interface ExpenseCategoryPoint {
  category: string;
  total: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  charts: {
    monthlyComparison: MonthlyChartPoint[];
    invoiceStatus: InvoiceStatusPoint[];
    jobsPerMonth: JobsChartPoint[];
    expenseByCategory: ExpenseCategoryPoint[];
  };
  recent: {
    invoices: Invoice[];
    payments: Payment[];
  };
}

export interface ProfitLossMonth {
  month: string;
  income: number;
  expenses: number;
  profit: number;
  expenseBreakdown: Array<{ category: string; total: number }>;
}

export interface ClientStatement {
  client: Client;
  invoices: Invoice[];
  payments: Payment[];
  totals: {
    total_invoiced: number;
    total_paid: number;
    total_outstanding: number;
  };
}

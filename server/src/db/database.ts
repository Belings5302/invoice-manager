import fs from 'fs';
import path from 'path';

export interface User {
  id: number;
  email: string;
  password_hash: string;
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
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  total_amount: number;
  amount_paid: number;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
  issue_date: string;
  due_date: string;
  notes?: string | null;
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
  created_at: string;
}

export interface DatabaseState {
  users: User[];
  clients: Client[];
  invoices: Invoice[];
  invoice_items: InvoiceItem[];
  payments: Payment[];
  expenses: Expense[];
  jobs: Job[];
  nextIds: {
    users: number;
    clients: number;
    invoices: number;
    invoice_items: number;
    payments: number;
    expenses: number;
    jobs: number;
  };
}

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseEngine {
  private data: DatabaseState;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseState {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed reading existing db.json, creating new database.', e);
      }
    }
    return {
      users: [],
      clients: [],
      invoices: [],
      invoice_items: [],
      payments: [],
      expenses: [],
      jobs: [],
      nextIds: {
        users: 1,
        clients: 1,
        invoices: 1,
        invoice_items: 1,
        payments: 1,
        expenses: 1,
        jobs: 1,
      },
    };
  }

  public save(): void {
    this.ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public getState(): DatabaseState {
    return this.data;
  }

  public transaction<T>(fn: () => T): T {
    const result = fn();
    this.save();
    return result;
  }

  // --- USERS ---
  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: number): User | undefined {
    return this.data.users.find(u => u.id === Number(id));
  }

  public createUser(user: Omit<User, 'id' | 'created_at'>): User {
    const id = this.data.nextIds.users++;
    const newUser: User = {
      ...user,
      id,
      created_at: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- CLIENTS ---
  public getClientsWithTotals() {
    return this.data.clients.map(c => {
      const clientInvoices = this.data.invoices.filter(i => i.client_id === c.id);
      const total_invoiced = clientInvoices.reduce((sum, i) => sum + i.total_amount, 0);
      const total_paid = clientInvoices.reduce((sum, i) => sum + i.amount_paid, 0);
      const outstanding = total_invoiced - total_paid;
      return {
        ...c,
        total_invoiced,
        total_paid,
        outstanding,
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getClientById(id: number): Client | undefined {
    return this.data.clients.find(c => c.id === Number(id));
  }

  public createClient(client: Omit<Client, 'id' | 'created_at'>): Client {
    const id = this.data.nextIds.clients++;
    const newClient: Client = {
      ...client,
      id,
      created_at: new Date().toISOString(),
    };
    this.data.clients.push(newClient);
    this.save();
    return newClient;
  }

  public updateClient(id: number, fields: Partial<Client>): Client | undefined {
    const client = this.data.clients.find(c => c.id === Number(id));
    if (!client) return undefined;
    Object.assign(client, fields);
    this.save();
    return client;
  }

  public deleteClient(id: number): boolean {
    const numId = Number(id);
    const hasInvoices = this.data.invoices.some(i => i.client_id === numId);
    const hasJobs = this.data.jobs.some(j => j.client_id === numId);
    if (hasInvoices || hasJobs) {
      throw new Error('FOREIGN KEY: Cannot delete client with existing invoices or jobs.');
    }
    this.data.clients = this.data.clients.filter(c => c.id !== numId);
    this.save();
    return true;
  }

  // --- INVOICES ---
  public getInvoices(filters?: { status?: string; client_id?: string | number }) {
    let list = this.data.invoices.map(inv => {
      const client = this.data.clients.find(c => c.id === inv.client_id);
      return {
        ...inv,
        client_name: client?.name || 'Unknown',
        client_company: client?.company || null,
      };
    });

    if (filters?.status) {
      list = list.filter(i => i.status === filters.status);
    }
    if (filters?.client_id) {
      list = list.filter(i => i.client_id === Number(filters.client_id));
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getInvoiceById(id: number) {
    const inv = this.data.invoices.find(i => i.id === Number(id));
    if (!inv) return undefined;
    const client = this.data.clients.find(c => c.id === inv.client_id);
    const items = this.data.invoice_items.filter(it => it.invoice_id === inv.id);
    const payments = this.data.payments.filter(p => p.invoice_id === inv.id)
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

    return {
      ...inv,
      client_name: client?.name || 'Unknown',
      client_email: client?.email || null,
      client_phone: client?.phone || null,
      client_address: client?.address || null,
      client_company: client?.company || null,
      items,
      payments,
    };
  }

  public getNextInvoiceNumber(): string {
    const last = this.data.invoices[this.data.invoices.length - 1];
    let nextNum = 1;
    if (last) {
      const match = last.invoice_number.match(/INV-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    return `INV-${String(nextNum).padStart(3, '0')}`;
  }

  public createInvoice(
    invoiceData: { client_id: number; issue_date: string; due_date: string; notes?: string },
    items: Array<{ description: string; quantity: number; unit_price: number }>
  ): Invoice & { items: InvoiceItem[] } {
    const invoiceId = this.data.nextIds.invoices++;
    const invoiceNumber = this.getNextInvoiceNumber();

    const createdItems: InvoiceItem[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const itemId = this.data.nextIds.invoice_items++;
      const itemTotal = Number(item.quantity) * Number(item.unit_price);
      totalAmount += itemTotal;
      const createdItem: InvoiceItem = {
        id: itemId,
        invoice_id: invoiceId,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: itemTotal,
      };
      this.data.invoice_items.push(createdItem);
      createdItems.push(createdItem);
    }

    const newInvoice: Invoice = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      client_id: Number(invoiceData.client_id),
      total_amount: totalAmount,
      amount_paid: 0,
      status: 'draft',
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date,
      notes: invoiceData.notes || null,
      created_at: new Date().toISOString(),
    };

    this.data.invoices.push(newInvoice);
    this.save();
    return { ...newInvoice, items: createdItems };
  }

  public updateInvoice(id: number, data: {
    client_id?: number;
    issue_date?: string;
    due_date?: string;
    notes?: string | null;
    status?: Invoice['status'];
    items?: Array<{ description: string; quantity: number; unit_price: number }>;
  }) {
    const numId = Number(id);
    const invoice = this.data.invoices.find(i => i.id === numId);
    if (!invoice) return undefined;

    if (data.status) invoice.status = data.status;
    if (data.client_id) invoice.client_id = Number(data.client_id);
    if (data.issue_date) invoice.issue_date = data.issue_date;
    if (data.due_date) invoice.due_date = data.due_date;
    if (data.notes !== undefined) invoice.notes = data.notes;

    if (data.items && data.items.length > 0) {
      // Remove old items
      this.data.invoice_items = this.data.invoice_items.filter(it => it.invoice_id !== numId);
      let total = 0;
      for (const item of data.items) {
        const itemId = this.data.nextIds.invoice_items++;
        const itemTotal = Number(item.quantity) * Number(item.unit_price);
        total += itemTotal;
        this.data.invoice_items.push({
          id: itemId,
          invoice_id: numId,
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total: itemTotal,
        });
      }
      invoice.total_amount = total;
    }

    this.save();
    const items = this.data.invoice_items.filter(it => it.invoice_id === numId);
    return { ...invoice, items };
  }

  public deleteInvoice(id: number): boolean {
    const numId = Number(id);
    this.data.invoices = this.data.invoices.filter(i => i.id !== numId);
    this.data.invoice_items = this.data.invoice_items.filter(it => it.invoice_id !== numId);
    this.data.payments = this.data.payments.filter(p => p.invoice_id !== numId);
    this.save();
    return true;
  }

  // --- PAYMENTS ---
  public createPayment(data: { invoice_id: number; amount: number; payment_date: string; method?: Payment['method']; notes?: string | null }) {
    const numInvoiceId = Number(data.invoice_id);
    const invoice = this.data.invoices.find(i => i.id === numInvoiceId);
    if (!invoice) throw new Error('Invoice not found.');

    const remaining = invoice.total_amount - invoice.amount_paid;
    if (Number(data.amount) > remaining) {
      throw new Error(`Payment exceeds remaining balance of ${remaining}.`);
    }

    const paymentId = this.data.nextIds.payments++;
    const newPayment: Payment = {
      id: paymentId,
      invoice_id: numInvoiceId,
      amount: Number(data.amount),
      payment_date: data.payment_date,
      method: data.method || 'bank',
      notes: data.notes || null,
      created_at: new Date().toISOString(),
    };

    this.data.payments.push(newPayment);
    invoice.amount_paid += Number(data.amount);
    invoice.status = invoice.amount_paid >= invoice.total_amount ? 'paid' : 'partial';

    this.save();
    return { payment: newPayment, invoice };
  }

  public getAllPayments() {
    return this.data.payments.map(p => {
      const invoice = this.data.invoices.find(i => i.id === p.invoice_id);
      const client = invoice ? this.data.clients.find(c => c.id === invoice.client_id) : undefined;
      return {
        ...p,
        invoice_number: invoice?.invoice_number || 'N/A',
        client_name: client?.name || 'Unknown',
      };
    }).sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  }

  public deletePayment(id: number) {
    const numId = Number(id);
    const payment = this.data.payments.find(p => p.id === numId);
    if (!payment) return false;

    this.data.payments = this.data.payments.filter(p => p.id !== numId);
    const invoice = this.data.invoices.find(i => i.id === payment.invoice_id);
    if (invoice) {
      const remainingPayments = this.data.payments.filter(p => p.invoice_id === invoice.id);
      const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
      invoice.amount_paid = totalPaid;
      invoice.status = totalPaid >= invoice.total_amount ? 'paid' : totalPaid > 0 ? 'partial' : 'sent';
    }

    this.save();
    return true;
  }

  // --- EXPENSES ---
  public getExpenses(filters?: { month?: string; year?: string; category?: string }) {
    let list = [...this.data.expenses];
    if (filters?.category) {
      list = list.filter(e => e.category === filters.category);
    }
    if (filters?.month && filters?.year) {
      const targetMonth = String(filters.month).padStart(2, '0');
      const targetYear = String(filters.year);
      list = list.filter(e => {
        const d = new Date(e.expense_date);
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const y = String(d.getFullYear());
        return m === targetMonth && y === targetYear;
      });
    }
    return list.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
  }

  public getExpenseCategories(): string[] {
    const set = new Set<string>();
    this.data.expenses.forEach(e => set.add(e.category));
    return Array.from(set).sort();
  }

  public createExpense(data: Omit<Expense, 'id' | 'created_at'>): Expense {
    const id = this.data.nextIds.expenses++;
    const expense: Expense = {
      ...data,
      id,
      amount: Number(data.amount),
      created_at: new Date().toISOString(),
    };
    this.data.expenses.push(expense);
    this.save();
    return expense;
  }

  public updateExpense(id: number, fields: Partial<Expense>): Expense | undefined {
    const expense = this.data.expenses.find(e => e.id === Number(id));
    if (!expense) return undefined;
    Object.assign(expense, fields);
    if (fields.amount !== undefined) expense.amount = Number(fields.amount);
    this.save();
    return expense;
  }

  public deleteExpense(id: number): boolean {
    this.data.expenses = this.data.expenses.filter(e => e.id !== Number(id));
    this.save();
    return true;
  }

  // --- JOBS ---
  public getJobs(filters?: { status?: string; client_id?: string | number }) {
    let list = this.data.jobs.map(j => {
      const client = this.data.clients.find(c => c.id === j.client_id);
      const invoice = j.invoice_id ? this.data.invoices.find(i => i.id === j.invoice_id) : undefined;
      return {
        ...j,
        client_name: client?.name || 'Unknown',
        invoice_number: invoice?.invoice_number || null,
      };
    });

    if (filters?.status) list = list.filter(j => j.status === filters.status);
    if (filters?.client_id) list = list.filter(j => j.client_id === Number(filters.client_id));

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getJobById(id: number) {
    const job = this.data.jobs.find(j => j.id === Number(id));
    if (!job) return undefined;
    const client = this.data.clients.find(c => c.id === job.client_id);
    const invoice = job.invoice_id ? this.data.invoices.find(i => i.id === job.invoice_id) : undefined;
    return {
      ...job,
      client_name: client?.name || 'Unknown',
      invoice_number: invoice?.invoice_number || null,
    };
  }

  public createJob(data: Omit<Job, 'id' | 'created_at'>): Job {
    const id = this.data.nextIds.jobs++;
    const job: Job = {
      ...data,
      id,
      client_id: Number(data.client_id),
      invoice_id: data.invoice_id ? Number(data.invoice_id) : null,
      created_at: new Date().toISOString(),
    };
    this.data.jobs.push(job);
    this.save();
    return job;
  }

  public updateJob(id: number, fields: Partial<Job>): Job | undefined {
    const job = this.data.jobs.find(j => j.id === Number(id));
    if (!job) return undefined;
    Object.assign(job, fields);
    if (fields.client_id !== undefined) job.client_id = Number(fields.client_id);
    if (fields.invoice_id !== undefined) job.invoice_id = fields.invoice_id ? Number(fields.invoice_id) : null;
    this.save();
    return job;
  }

  public deleteJob(id: number): boolean {
    this.data.jobs = this.data.jobs.filter(j => j.id !== Number(id));
    this.save();
    return true;
  }

  // --- REPORTS ---
  public getDashboardReport() {
    const now = new Date();
    const curM = now.getMonth();
    const curY = now.getFullYear();

    const monthlyRevenue = this.data.payments
      .filter(p => {
        const d = new Date(p.payment_date);
        return d.getMonth() === curM && d.getFullYear() === curY;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyExpenses = this.data.expenses
      .filter(e => {
        const d = new Date(e.expense_date);
        return d.getMonth() === curM && d.getFullYear() === curY;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const outstandingInvoices = this.data.invoices.filter(i =>
      ['sent', 'partial', 'overdue'].includes(i.status)
    );
    const outstandingTotal = outstandingInvoices.reduce((sum, i) => sum + (i.total_amount - i.amount_paid), 0);

    const todayStr = now.toISOString().split('T')[0];
    const overdueInvoices = this.data.invoices.filter(i =>
      i.status === 'overdue' || (i.due_date < todayStr && ['sent', 'partial'].includes(i.status))
    );
    const overdueTotal = overdueInvoices.reduce((sum, i) => sum + (i.total_amount - i.amount_paid), 0);

    // 6 months comparison
    const monthlyComparison: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curY, curM - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });

      const income = this.data.payments
        .filter(p => {
          const pd = new Date(p.payment_date);
          return pd.getMonth() === m && pd.getFullYear() === y;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const expenses = this.data.expenses
        .filter(e => {
          const ed = new Date(e.expense_date);
          return ed.getMonth() === m && ed.getFullYear() === y;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      monthlyComparison.push({
        month: monthLabel,
        income,
        expenses,
        profit: income - expenses,
      });
    }

    // Status breakdown
    const statusMap: Record<string, { count: number; total: number }> = {};
    for (const inv of this.data.invoices) {
      if (!statusMap[inv.status]) statusMap[inv.status] = { count: 0, total: 0 };
      statusMap[inv.status].count++;
      statusMap[inv.status].total += inv.total_amount;
    }
    const invoiceStatus = Object.keys(statusMap).map(status => ({
      status,
      count: statusMap[status].count,
      total: statusMap[status].total,
    }));

    // Jobs completed per month (last 6 months)
    const jobsPerMonth: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curY, curM - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });

      const completed = this.data.jobs.filter(j => {
        if (j.status !== 'completed' || !j.end_date) return false;
        const ed = new Date(j.end_date);
        return ed.getMonth() === m && ed.getFullYear() === y;
      }).length;

      const total = this.data.jobs.filter(j => {
        const cd = new Date(j.created_at);
        return cd.getMonth() === m && cd.getFullYear() === y;
      }).length;

      jobsPerMonth.push({
        month: monthLabel,
        completed,
        total,
      });
    }

    // Recent
    const recentInvoices = this.getInvoices().slice(0, 5);
    const recentPayments = this.getAllPayments().slice(0, 5);

    // Current month expense by category
    const catMap: Record<string, number> = {};
    this.data.expenses
      .filter(e => {
        const d = new Date(e.expense_date);
        return d.getMonth() === curM && d.getFullYear() === curY;
      })
      .forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });
    const expenseByCategory = Object.keys(catMap).map(category => ({
      category,
      total: catMap[category],
    })).sort((a, b) => b.total - a.total);

    return {
      kpis: {
        monthlyRevenue,
        monthlyExpenses,
        netProfit: monthlyRevenue - monthlyExpenses,
        outstanding: outstandingTotal,
        outstandingCount: outstandingInvoices.length,
        overdueCount: overdueInvoices.length,
        overdueAmount: overdueTotal,
        totalClients: this.data.clients.length,
      },
      charts: {
        monthlyComparison,
        invoiceStatus,
        jobsPerMonth,
        expenseByCategory,
      },
      recent: {
        invoices: recentInvoices,
        payments: recentPayments,
      },
    };
  }

  public getProfitLoss(numMonths: number = 6) {
    const now = new Date();
    const curM = now.getMonth();
    const curY = now.getFullYear();
    const data: any[] = [];

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(curY, curM - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthLabel = d.toLocaleString('default', { month: 'long', year: 'numeric' });

      const income = this.data.payments
        .filter(p => {
          const pd = new Date(p.payment_date);
          return pd.getMonth() === m && pd.getFullYear() === y;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const monthExpenses = this.data.expenses.filter(e => {
        const ed = new Date(e.expense_date);
        return ed.getMonth() === m && ed.getFullYear() === y;
      });

      const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      const catMap: Record<string, number> = {};
      monthExpenses.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });
      const expenseBreakdown = Object.keys(catMap)
        .map(category => ({ category, total: catMap[category] }))
        .sort((a, b) => b.total - a.total);

      data.push({
        month: monthLabel,
        income,
        expenses: totalExpenses,
        profit: income - totalExpenses,
        expenseBreakdown,
      });
    }

    return data;
  }

  public getClientStatement(clientId: number) {
    const numId = Number(clientId);
    const client = this.getClientById(numId);
    if (!client) return null;

    const invoices = this.data.invoices
      .filter(i => i.client_id === numId)
      .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());

    const clientInvoiceIds = new Set(invoices.map(i => i.id));
    const payments = this.data.payments
      .filter(p => clientInvoiceIds.has(p.invoice_id))
      .map(p => {
        const inv = invoices.find(i => i.id === p.invoice_id);
        return {
          ...p,
          invoice_number: inv?.invoice_number || 'N/A',
        };
      })
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

    const total_invoiced = invoices.reduce((sum, i) => sum + i.total_amount, 0);
    const total_paid = invoices.reduce((sum, i) => sum + i.amount_paid, 0);
    const total_outstanding = total_invoiced - total_paid;

    return {
      client,
      invoices,
      payments,
      totals: {
        total_invoiced,
        total_paid,
        total_outstanding,
      },
    };
  }
}

let instance: DatabaseEngine | null = null;

export function getDb(): DatabaseEngine {
  if (!instance) {
    instance = new DatabaseEngine();
  }
  return instance;
}

export default getDb;

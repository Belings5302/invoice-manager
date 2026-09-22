export interface User {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    role: 'admin' | 'user';
    client_id?: number | null;
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
declare class DatabaseEngine {
    private data;
    constructor();
    private ensureDataDir;
    private loadData;
    save(): void;
    getState(): DatabaseState;
    transaction<T>(fn: () => T): T;
    getUserByEmail(email: string): User | undefined;
    getUserById(id: number): User | undefined;
    getUserByClientId(clientId: number): User | undefined;
    createUser(user: Omit<User, 'id' | 'created_at'>): User;
    updateUser(id: number, updates: Partial<User>): User | undefined;
    getUsers(): {
        client_name: string | undefined;
        client_company: string | null | undefined;
        id: number;
        email: string;
        name: string;
        role: "admin" | "user";
        client_id?: number | null;
        created_at: string;
    }[];
    getClients(): Client[];
    getClientsWithTotals(): {
        total_invoiced: number;
        total_paid: number;
        outstanding: number;
        id: number;
        name: string;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        company?: string | null;
        created_at: string;
    }[];
    getClientById(id: number): Client | undefined;
    createClient(client: Omit<Client, 'id' | 'created_at'>): Client;
    updateClient(id: number, fields: Partial<Client>): Client | undefined;
    deleteClient(id: number): boolean;
    getInvoices(filters?: {
        status?: string;
        client_id?: string | number;
    }): {
        client_name: string;
        client_company: string | null;
        id: number;
        invoice_number: string;
        client_id: number;
        total_amount: number;
        amount_paid: number;
        status: "draft" | "sent" | "partial" | "paid" | "overdue";
        issue_date: string;
        due_date: string;
        notes?: string | null;
        created_at: string;
    }[];
    getInvoiceById(id: number): {
        client_name: string;
        client_email: string | null;
        client_phone: string | null;
        client_address: string | null;
        client_company: string | null;
        items: InvoiceItem[];
        payments: Payment[];
        id: number;
        invoice_number: string;
        client_id: number;
        total_amount: number;
        amount_paid: number;
        status: "draft" | "sent" | "partial" | "paid" | "overdue";
        issue_date: string;
        due_date: string;
        notes?: string | null;
        created_at: string;
    } | undefined;
    getNextInvoiceNumber(): string;
    createInvoice(invoiceData: {
        client_id: number;
        issue_date: string;
        due_date: string;
        notes?: string;
    }, items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
    }>): Invoice & {
        items: InvoiceItem[];
    };
    updateInvoice(id: number, data: {
        client_id?: number;
        issue_date?: string;
        due_date?: string;
        notes?: string | null;
        status?: Invoice['status'];
        items?: Array<{
            description: string;
            quantity: number;
            unit_price: number;
        }>;
    }): {
        items: InvoiceItem[];
        id: number;
        invoice_number: string;
        client_id: number;
        total_amount: number;
        amount_paid: number;
        status: "draft" | "sent" | "partial" | "paid" | "overdue";
        issue_date: string;
        due_date: string;
        notes?: string | null;
        created_at: string;
    } | undefined;
    deleteInvoice(id: number): boolean;
    createPayment(data: {
        invoice_id: number;
        amount: number;
        payment_date: string;
        method?: Payment['method'];
        notes?: string | null;
    }): {
        payment: Payment;
        invoice: Invoice;
    };
    getAllPayments(): {
        invoice_number: string;
        client_name: string;
        id: number;
        invoice_id: number;
        amount: number;
        payment_date: string;
        method: "cash" | "bank" | "mobile";
        notes?: string | null;
        created_at: string;
    }[];
    deletePayment(id: number): boolean;
    getExpenses(filters?: {
        month?: string;
        year?: string;
        category?: string;
    }): Expense[];
    getExpenseCategories(): string[];
    createExpense(data: Omit<Expense, 'id' | 'created_at'>): Expense;
    updateExpense(id: number, fields: Partial<Expense>): Expense | undefined;
    deleteExpense(id: number): boolean;
    getJobs(filters?: {
        status?: string;
        client_id?: string | number;
    }): {
        client_name: string;
        invoice_number: string | null;
        id: number;
        client_id: number;
        invoice_id?: number | null;
        title: string;
        status: "pending" | "in_progress" | "completed";
        start_date?: string | null;
        end_date?: string | null;
        description?: string | null;
        created_at: string;
    }[];
    getJobById(id: number): {
        client_name: string;
        invoice_number: string | null;
        id: number;
        client_id: number;
        invoice_id?: number | null;
        title: string;
        status: "pending" | "in_progress" | "completed";
        start_date?: string | null;
        end_date?: string | null;
        description?: string | null;
        created_at: string;
    } | undefined;
    createJob(data: Omit<Job, 'id' | 'created_at'>): Job;
    updateJob(id: number, fields: Partial<Job>): Job | undefined;
    deleteJob(id: number): boolean;
    getDashboardReport(): {
        kpis: {
            monthlyRevenue: number;
            monthlyExpenses: number;
            netProfit: number;
            outstanding: number;
            outstandingCount: number;
            overdueCount: number;
            overdueAmount: number;
            totalClients: number;
        };
        charts: {
            monthlyComparison: any[];
            invoiceStatus: {
                status: string;
                count: number;
                total: number;
            }[];
            jobsPerMonth: any[];
            expenseByCategory: {
                category: string;
                total: number;
            }[];
        };
        recent: {
            invoices: {
                client_name: string;
                client_company: string | null;
                id: number;
                invoice_number: string;
                client_id: number;
                total_amount: number;
                amount_paid: number;
                status: "draft" | "sent" | "partial" | "paid" | "overdue";
                issue_date: string;
                due_date: string;
                notes?: string | null;
                created_at: string;
            }[];
            payments: {
                invoice_number: string;
                client_name: string;
                id: number;
                invoice_id: number;
                amount: number;
                payment_date: string;
                method: "cash" | "bank" | "mobile";
                notes?: string | null;
                created_at: string;
            }[];
        };
    };
    getProfitLoss(numMonths?: number): any[];
    getClientStatement(clientId: number): {
        client: Client;
        invoices: Invoice[];
        payments: {
            invoice_number: string;
            id: number;
            invoice_id: number;
            amount: number;
            payment_date: string;
            method: "cash" | "bank" | "mobile";
            notes?: string | null;
            created_at: string;
        }[];
        totals: {
            total_invoiced: number;
            total_paid: number;
            total_outstanding: number;
        };
    } | null;
}
export declare function getDb(): DatabaseEngine;
export default getDb;
//# sourceMappingURL=database.d.ts.map
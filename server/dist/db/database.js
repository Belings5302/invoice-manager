"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, '..', '..', 'data');
const DB_FILE = path_1.default.join(DATA_DIR, 'db.json');
class DatabaseEngine {
    constructor() {
        this.ensureDataDir();
        this.data = this.loadData();
    }
    ensureDataDir() {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
    }
    loadData() {
        if (fs_1.default.existsSync(DB_FILE)) {
            try {
                const raw = fs_1.default.readFileSync(DB_FILE, 'utf-8');
                return JSON.parse(raw);
            }
            catch (e) {
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
    save() {
        this.ensureDataDir();
        fs_1.default.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    }
    getState() {
        return this.data;
    }
    transaction(fn) {
        const result = fn();
        this.save();
        return result;
    }
    // --- USERS ---
    getUserByEmail(email) {
        return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    getUserById(id) {
        return this.data.users.find(u => u.id === Number(id));
    }
    getUserByClientId(clientId) {
        return this.data.users.find(u => u.client_id === Number(clientId));
    }
    createUser(user) {
        const id = this.data.nextIds.users++;
        const newUser = {
            ...user,
            client_id: user.client_id ?? null,
            id,
            created_at: new Date().toISOString(),
        };
        this.data.users.push(newUser);
        this.save();
        return newUser;
    }
    updateUser(id, updates) {
        const user = this.getUserById(id);
        if (!user)
            return undefined;
        Object.assign(user, updates);
        this.save();
        return user;
    }
    getUsers() {
        return this.data.users.map(({ password_hash, ...u }) => {
            const client = u.client_id ? this.getClientById(u.client_id) : undefined;
            return {
                ...u,
                client_name: client?.name,
                client_company: client?.company,
            };
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    getClients() {
        return this.data.clients;
    }
    // --- CLIENTS ---
    getClientsWithTotals() {
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
    getClientById(id) {
        return this.data.clients.find(c => c.id === Number(id));
    }
    createClient(client) {
        const id = this.data.nextIds.clients++;
        const newClient = {
            ...client,
            id,
            created_at: new Date().toISOString(),
        };
        this.data.clients.push(newClient);
        this.save();
        return newClient;
    }
    updateClient(id, fields) {
        const client = this.data.clients.find(c => c.id === Number(id));
        if (!client)
            return undefined;
        Object.assign(client, fields);
        this.save();
        return client;
    }
    deleteClient(id) {
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
    getInvoices(filters) {
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
    getInvoiceById(id) {
        const inv = this.data.invoices.find(i => i.id === Number(id));
        if (!inv)
            return undefined;
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
    getNextInvoiceNumber() {
        const last = this.data.invoices[this.data.invoices.length - 1];
        let nextNum = 1;
        if (last) {
            const match = last.invoice_number.match(/INV-(\d+)/);
            if (match)
                nextNum = parseInt(match[1]) + 1;
        }
        return `INV-${String(nextNum).padStart(3, '0')}`;
    }
    createInvoice(invoiceData, items) {
        const invoiceId = this.data.nextIds.invoices++;
        const invoiceNumber = this.getNextInvoiceNumber();
        const createdItems = [];
        let totalAmount = 0;
        for (const item of items) {
            const itemId = this.data.nextIds.invoice_items++;
            const itemTotal = Number(item.quantity) * Number(item.unit_price);
            totalAmount += itemTotal;
            const createdItem = {
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
        const newInvoice = {
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
    updateInvoice(id, data) {
        const numId = Number(id);
        const invoice = this.data.invoices.find(i => i.id === numId);
        if (!invoice)
            return undefined;
        if (data.status)
            invoice.status = data.status;
        if (data.client_id)
            invoice.client_id = Number(data.client_id);
        if (data.issue_date)
            invoice.issue_date = data.issue_date;
        if (data.due_date)
            invoice.due_date = data.due_date;
        if (data.notes !== undefined)
            invoice.notes = data.notes;
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
    deleteInvoice(id) {
        const numId = Number(id);
        this.data.invoices = this.data.invoices.filter(i => i.id !== numId);
        this.data.invoice_items = this.data.invoice_items.filter(it => it.invoice_id !== numId);
        this.data.payments = this.data.payments.filter(p => p.invoice_id !== numId);
        this.save();
        return true;
    }
    // --- PAYMENTS ---
    createPayment(data) {
        const numInvoiceId = Number(data.invoice_id);
        const invoice = this.data.invoices.find(i => i.id === numInvoiceId);
        if (!invoice)
            throw new Error('Invoice not found.');
        const remaining = invoice.total_amount - invoice.amount_paid;
        if (Number(data.amount) > remaining) {
            throw new Error(`Payment exceeds remaining balance of ${remaining}.`);
        }
        const paymentId = this.data.nextIds.payments++;
        const newPayment = {
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
    getAllPayments() {
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
    deletePayment(id) {
        const numId = Number(id);
        const payment = this.data.payments.find(p => p.id === numId);
        if (!payment)
            return false;
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
    getExpenses(filters) {
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
    getExpenseCategories() {
        const set = new Set();
        this.data.expenses.forEach(e => set.add(e.category));
        return Array.from(set).sort();
    }
    createExpense(data) {
        const id = this.data.nextIds.expenses++;
        const expense = {
            ...data,
            id,
            amount: Number(data.amount),
            created_at: new Date().toISOString(),
        };
        this.data.expenses.push(expense);
        this.save();
        return expense;
    }
    updateExpense(id, fields) {
        const expense = this.data.expenses.find(e => e.id === Number(id));
        if (!expense)
            return undefined;
        Object.assign(expense, fields);
        if (fields.amount !== undefined)
            expense.amount = Number(fields.amount);
        this.save();
        return expense;
    }
    deleteExpense(id) {
        this.data.expenses = this.data.expenses.filter(e => e.id !== Number(id));
        this.save();
        return true;
    }
    // --- JOBS ---
    getJobs(filters) {
        let list = this.data.jobs.map(j => {
            const client = this.data.clients.find(c => c.id === j.client_id);
            const invoice = j.invoice_id ? this.data.invoices.find(i => i.id === j.invoice_id) : undefined;
            return {
                ...j,
                client_name: client?.name || 'Unknown',
                invoice_number: invoice?.invoice_number || null,
            };
        });
        if (filters?.status)
            list = list.filter(j => j.status === filters.status);
        if (filters?.client_id)
            list = list.filter(j => j.client_id === Number(filters.client_id));
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    getJobById(id) {
        const job = this.data.jobs.find(j => j.id === Number(id));
        if (!job)
            return undefined;
        const client = this.data.clients.find(c => c.id === job.client_id);
        const invoice = job.invoice_id ? this.data.invoices.find(i => i.id === job.invoice_id) : undefined;
        return {
            ...job,
            client_name: client?.name || 'Unknown',
            invoice_number: invoice?.invoice_number || null,
        };
    }
    createJob(data) {
        const id = this.data.nextIds.jobs++;
        const job = {
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
    updateJob(id, fields) {
        const job = this.data.jobs.find(j => j.id === Number(id));
        if (!job)
            return undefined;
        Object.assign(job, fields);
        if (fields.client_id !== undefined)
            job.client_id = Number(fields.client_id);
        if (fields.invoice_id !== undefined)
            job.invoice_id = fields.invoice_id ? Number(fields.invoice_id) : null;
        this.save();
        return job;
    }
    deleteJob(id) {
        this.data.jobs = this.data.jobs.filter(j => j.id !== Number(id));
        this.save();
        return true;
    }
    // --- REPORTS ---
    getDashboardReport() {
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
        const outstandingInvoices = this.data.invoices.filter(i => ['sent', 'partial', 'overdue'].includes(i.status));
        const outstandingTotal = outstandingInvoices.reduce((sum, i) => sum + (i.total_amount - i.amount_paid), 0);
        const todayStr = now.toISOString().split('T')[0];
        const overdueInvoices = this.data.invoices.filter(i => i.status === 'overdue' || (i.due_date < todayStr && ['sent', 'partial'].includes(i.status)));
        const overdueTotal = overdueInvoices.reduce((sum, i) => sum + (i.total_amount - i.amount_paid), 0);
        // 6 months comparison
        const monthlyComparison = [];
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
        const statusMap = {};
        for (const inv of this.data.invoices) {
            if (!statusMap[inv.status])
                statusMap[inv.status] = { count: 0, total: 0 };
            statusMap[inv.status].count++;
            statusMap[inv.status].total += inv.total_amount;
        }
        const invoiceStatus = Object.keys(statusMap).map(status => ({
            status,
            count: statusMap[status].count,
            total: statusMap[status].total,
        }));
        // Jobs completed per month (last 6 months)
        const jobsPerMonth = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(curY, curM - i, 1);
            const m = d.getMonth();
            const y = d.getFullYear();
            const monthLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });
            const completed = this.data.jobs.filter(j => {
                if (j.status !== 'completed' || !j.end_date)
                    return false;
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
        const catMap = {};
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
    getProfitLoss(numMonths = 6) {
        const now = new Date();
        const curM = now.getMonth();
        const curY = now.getFullYear();
        const data = [];
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
            const catMap = {};
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
    getClientStatement(clientId) {
        const numId = Number(clientId);
        const client = this.getClientById(numId);
        if (!client)
            return null;
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
let instance = null;
function getDb() {
    if (!instance) {
        instance = new DatabaseEngine();
    }
    return instance;
}
exports.default = getDb;
//# sourceMappingURL=database.js.map
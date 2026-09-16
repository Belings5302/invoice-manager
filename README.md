# FlowBill — Invoice, Billing & Financial Operations Dashboard

A modern, full-stack billing management and financial operating system for any organization to generate invoices, record partial payments, track income vs expenditures, monitor client money flow, and track project deliveries.

---

## 🌟 Key Features

### 1. Invoice & Billing Management
- **Create Invoices**: Dynamic line item calculation (quantity × unit price), notes, issue date, due date.
- **Partial Payments Tracking**: Supports the exact real-world scenario (e.g., a **500,000 RWF** invoice receives a **300,000 RWF** partial payment, tracking the **200,000 RWF** remaining balance).
- **Automated Statuses**: Automatically transitions through `Draft`, `Sent`, `Partially Paid`, `Fully Paid`, and `Overdue`.
- **Printable Invoices**: Itemized printable/PDF view with payment history timeline and outstanding balances.

### 2. Financial Dashboard & Analytics
- **Executive KPIs**: Monthly Collected Inflow, Monthly Expenses, Net Margin, Outstanding Receivables, Overdue Invoices, Active Client Portfolio.
- **Visual Graphs**:
  - 📊 **Monthly Income vs. Expenses & Profit**: Last 6 months bar chart comparing cash in vs. cash out.
  - 🍩 **Invoice Health & Status Breakdown**: Donut chart of paid, partial, overdue, sent, and draft volumes.
  - 📈 **Jobs Completed Per Month**: Delivery volume chart.
- **Recent Inflow Feed**: Real-time log of collected payments and newly issued invoices.

### 3. Client Money Flow Tracker
- Track financial health on a per-client basis.
- View total invoiced, total collected, outstanding receivables, and collection rate (%) for every client.
- Complete client financial ledger showing all invoices, payment history, and linked jobs.

### 4. Organization Expenditures
- Record overheads, salaries, rent, utilities, supplies, marketing, and taxes.
- Filter by category and date.
- Track expense breakdown per month.

### 5. Jobs & Deliverables Tracker
- Track how many times in a month jobs have been completed.
- Track statuses (`Pending`, `In Progress`, `Completed`).
- Link jobs to specific clients and invoices.

### 6. Reports & P&L Statement
- Audited Monthly Profit & Loss Statement table.
- Client Statement generator with printable accounts ledger.

---

## 🚀 Quick Start Guide

### 1. Start Backend API Server
```bash
cd server
npm run dev
# Running on http://localhost:3001
```

### 2. Start Frontend Web App
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@invoicemanager.com` | `admin123` |
| **Regular User** | `user@invoicemanager.com` | `user123` |

*(Quick one-click login buttons are also provided directly on the login screen)*

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("./database"));
async function seed() {
    const db = (0, database_1.default)();
    const state = db.getState();
    // Check if already seeded
    if (state.users.length > 0) {
        console.log('Database already seeded. Skipping.');
        return;
    }
    console.log('Seeding database...');
    // Create clients
    const client1 = db.createClient({ name: 'Acme Corporation', email: 'billing@acme.com', phone: '+250 788 100 200', address: 'KG 123 St, Kigali', company: 'Acme Corp' });
    const client2 = db.createClient({ name: 'TechVentures Ltd', email: 'finance@techventures.rw', phone: '+250 788 300 400', address: 'KN 45 Ave, Kigali', company: 'TechVentures' });
    const client3 = db.createClient({ name: 'Green Solutions', email: 'accounts@greensol.rw', phone: '+250 788 500 600', address: 'KK 78 St, Kigali', company: 'Green Solutions LLC' });
    const client4 = db.createClient({ name: 'Summit Builders', email: 'pay@summitbuild.rw', phone: '+250 788 700 800', address: 'KG 90 St, Kigali', company: 'Summit Builders' });
    const client5 = db.createClient({ name: 'Horizon Media', email: 'billing@horizon.rw', phone: '+250 788 900 100', address: 'KN 12 Ave, Kigali', company: 'Horizon Media Group' });
    // Create admin and regular user
    const adminHash = await bcryptjs_1.default.hash('admin123', 10);
    const userHash = await bcryptjs_1.default.hash('user123', 10);
    db.createUser({ email: 'admin@invoicemanager.com', password_hash: adminHash, name: 'Admin User', role: 'admin' });
    db.createUser({ email: 'user@invoicemanager.com', password_hash: userHash, name: 'Regular User', role: 'user', client_id: client1.id });
    // Helper date functions
    const monthsAgo = (n) => {
        const d = new Date();
        d.setMonth(d.getMonth() - n);
        return d.toISOString().split('T')[0];
    };
    const daysFromNow = (n) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return d.toISOString().split('T')[0];
    };
    const today = new Date().toISOString().split('T')[0];
    // Invoice 1: Paid in full (500,000)
    const inv1 = db.createInvoice({
        client_id: client1.id,
        issue_date: monthsAgo(3),
        due_date: monthsAgo(2),
        notes: 'Website development project',
    }, [
        { description: 'Website Design', quantity: 1, unit_price: 200000 },
        { description: 'Frontend Development', quantity: 1, unit_price: 200000 },
        { description: 'Testing & Deployment', quantity: 1, unit_price: 100000 },
    ]);
    db.createPayment({ invoice_id: inv1.id, amount: 300000, payment_date: monthsAgo(3), method: 'bank', notes: 'First installment' });
    db.createPayment({ invoice_id: inv1.id, amount: 200000, payment_date: monthsAgo(2), method: 'bank', notes: 'Final payment' });
    // Invoice 2: Partially paid (500,000 invoiced, 300,000 paid) -> EXACT USER EXAMPLE
    const inv2 = db.createInvoice({
        client_id: client2.id,
        issue_date: monthsAgo(1),
        due_date: daysFromNow(10),
        notes: 'Mobile app development MVP',
    }, [
        { description: 'UI/UX Design', quantity: 1, unit_price: 150000 },
        { description: 'App Development', quantity: 1, unit_price: 250000 },
        { description: 'API Integration', quantity: 1, unit_price: 100000 },
    ]);
    db.createPayment({ invoice_id: inv2.id, amount: 300000, payment_date: monthsAgo(1), method: 'mobile', notes: 'Partial payment via MoMo' });
    // Invoice 3: Overdue (350,000 unpaid)
    const inv3 = db.createInvoice({
        client_id: client3.id,
        issue_date: monthsAgo(2),
        due_date: monthsAgo(1),
        notes: 'Business strategy consulting engagement',
    }, [
        { description: 'Business Analysis', quantity: 10, unit_price: 15000 },
        { description: 'Strategy Workshop', quantity: 2, unit_price: 100000 },
    ]);
    db.updateInvoice(inv3.id, { status: 'overdue' });
    // Invoice 4: Sent (800,000)
    const inv4 = db.createInvoice({
        client_id: client4.id,
        issue_date: monthsAgo(1),
        due_date: daysFromNow(15),
        notes: 'Construction project management',
    }, [
        { description: 'Project Planning', quantity: 1, unit_price: 200000 },
        { description: 'Site Supervision', quantity: 4, unit_price: 100000 },
        { description: 'Materials Procurement', quantity: 1, unit_price: 200000 },
    ]);
    db.updateInvoice(inv4.id, { status: 'sent' });
    // Invoice 5: Draft (250,000)
    db.createInvoice({
        client_id: client5.id,
        issue_date: today,
        due_date: daysFromNow(30),
        notes: 'Digital marketing campaign',
    }, [
        { description: 'Social Media Management', quantity: 1, unit_price: 150000 },
        { description: 'Content Creation', quantity: 1, unit_price: 100000 },
    ]);
    // Invoice 6: Paid (650,000)
    const inv6 = db.createInvoice({
        client_id: client1.id,
        issue_date: monthsAgo(5),
        due_date: monthsAgo(4),
        notes: 'ERP system setup',
    }, [
        { description: 'System Installation', quantity: 1, unit_price: 300000 },
        { description: 'Configuration', quantity: 1, unit_price: 200000 },
        { description: 'Staff Training', quantity: 1, unit_price: 150000 },
    ]);
    db.createPayment({ invoice_id: inv6.id, amount: 650000, payment_date: monthsAgo(4), method: 'bank', notes: 'Paid in full' });
    // Invoice 7: Partially paid (420,000 total, 200,000 paid)
    const inv7 = db.createInvoice({
        client_id: client3.id,
        issue_date: monthsAgo(1),
        due_date: daysFromNow(7),
        notes: 'IT infrastructure security audit',
    }, [
        { description: 'Network Assessment', quantity: 1, unit_price: 180000 },
        { description: 'Security Review', quantity: 1, unit_price: 140000 },
        { description: 'Report & Recommendations', quantity: 1, unit_price: 100000 },
    ]);
    db.createPayment({ invoice_id: inv7.id, amount: 200000, payment_date: today, method: 'cash', notes: 'Initial deposit' });
    // Invoice 8: Paid (300,000)
    const inv8 = db.createInvoice({
        client_id: client2.id,
        issue_date: monthsAgo(4),
        due_date: monthsAgo(3),
        notes: 'Database optimization and indexing',
    }, [
        { description: 'Performance Analysis', quantity: 1, unit_price: 100000 },
        { description: 'Query Optimization', quantity: 1, unit_price: 120000 },
        { description: 'Indexing Strategy', quantity: 1, unit_price: 80000 },
    ]);
    db.createPayment({ invoice_id: inv8.id, amount: 300000, payment_date: monthsAgo(3), method: 'bank', notes: 'Full payment' });
    // Expenses across last 6 months
    const expenseData = [
        { category: 'Rent', amount: 200000, date: monthsAgo(5), desc: 'Office rent - Month 1', ref: 'RENT-001' },
        { category: 'Salaries', amount: 450000, date: monthsAgo(5), desc: 'Staff salaries', ref: 'SAL-001' },
        { category: 'Utilities', amount: 35000, date: monthsAgo(5), desc: 'Electricity & water', ref: 'UTL-001' },
        { category: 'Rent', amount: 200000, date: monthsAgo(4), desc: 'Office rent - Month 2', ref: 'RENT-002' },
        { category: 'Salaries', amount: 450000, date: monthsAgo(4), desc: 'Staff salaries', ref: 'SAL-002' },
        { category: 'Supplies', amount: 65000, date: monthsAgo(4), desc: 'Office supplies', ref: 'SUP-001' },
        { category: 'Utilities', amount: 38000, date: monthsAgo(4), desc: 'Electricity & water', ref: 'UTL-002' },
        { category: 'Rent', amount: 200000, date: monthsAgo(3), desc: 'Office rent - Month 3', ref: 'RENT-003' },
        { category: 'Salaries', amount: 480000, date: monthsAgo(3), desc: 'Staff salaries', ref: 'SAL-003' },
        { category: 'Utilities', amount: 32000, date: monthsAgo(3), desc: 'Electricity & water', ref: 'UTL-003' },
        { category: 'Marketing', amount: 120000, date: monthsAgo(3), desc: 'Online advertising', ref: 'MKT-001' },
        { category: 'Rent', amount: 200000, date: monthsAgo(2), desc: 'Office rent - Month 4', ref: 'RENT-004' },
        { category: 'Salaries', amount: 480000, date: monthsAgo(2), desc: 'Staff salaries', ref: 'SAL-004' },
        { category: 'Supplies', amount: 45000, date: monthsAgo(2), desc: 'Printer cartridges', ref: 'SUP-002' },
        { category: 'Utilities', amount: 40000, date: monthsAgo(2), desc: 'Electricity & water', ref: 'UTL-004' },
        { category: 'Rent', amount: 200000, date: monthsAgo(1), desc: 'Office rent - Month 5', ref: 'RENT-005' },
        { category: 'Salaries', amount: 500000, date: monthsAgo(1), desc: 'Staff salaries', ref: 'SAL-005' },
        { category: 'Utilities', amount: 36000, date: monthsAgo(1), desc: 'Electricity & water', ref: 'UTL-005' },
        { category: 'Marketing', amount: 85000, date: monthsAgo(1), desc: 'Social media ads', ref: 'MKT-002' },
        { category: 'Rent', amount: 200000, date: today, desc: 'Office rent - Current', ref: 'RENT-006' },
        { category: 'Salaries', amount: 500000, date: today, desc: 'Staff salaries', ref: 'SAL-006' },
        { category: 'Utilities', amount: 42000, date: today, desc: 'Electricity & water', ref: 'UTL-006' },
    ];
    for (const e of expenseData) {
        db.createExpense({ category: e.category, amount: e.amount, expense_date: e.date, description: e.desc, reference: e.ref });
    }
    // Jobs
    db.createJob({ client_id: client1.id, invoice_id: inv1.id, title: 'Website Redesign', status: 'completed', start_date: monthsAgo(4), end_date: monthsAgo(3), description: 'Complete website redesign and development' });
    db.createJob({ client_id: client2.id, invoice_id: inv2.id, title: 'Mobile App MVP', status: 'in_progress', start_date: monthsAgo(2), end_date: null, description: 'Develop MVP for mobile application' });
    db.createJob({ client_id: client3.id, invoice_id: inv3.id, title: 'Business Consulting', status: 'completed', start_date: monthsAgo(3), end_date: monthsAgo(2), description: 'Business strategy consulting engagement' });
    db.createJob({ client_id: client4.id, invoice_id: inv4.id, title: 'Construction PM', status: 'in_progress', start_date: monthsAgo(1), end_date: null, description: 'Project management for new office building' });
    db.createJob({ client_id: client5.id, invoice_id: null, title: 'Marketing Campaign', status: 'pending', start_date: null, end_date: null, description: 'Q4 marketing campaign planning and execution' });
    db.createJob({ client_id: client1.id, invoice_id: inv6.id, title: 'ERP Implementation', status: 'completed', start_date: monthsAgo(6), end_date: monthsAgo(4), description: 'Full ERP system setup and deployment' });
    db.createJob({ client_id: client3.id, invoice_id: inv7.id, title: 'IT Audit', status: 'in_progress', start_date: monthsAgo(1), end_date: null, description: 'Complete IT infrastructure audit' });
    db.createJob({ client_id: client2.id, invoice_id: inv8.id, title: 'Database Optimization', status: 'completed', start_date: monthsAgo(5), end_date: monthsAgo(3), description: 'Database performance tuning' });
    db.createJob({ client_id: client4.id, invoice_id: null, title: 'Site Inspection', status: 'completed', start_date: monthsAgo(2), end_date: monthsAgo(2), description: 'Initial site inspection and assessment' });
    db.createJob({ client_id: client5.id, invoice_id: null, title: 'Brand Strategy', status: 'completed', start_date: monthsAgo(3), end_date: monthsAgo(2), description: 'Brand positioning and strategy development' });
    console.log('✅ Database seeded successfully!');
    console.log('Admin login: admin@invoicemanager.com / admin123');
    console.log('User login: user@invoicemanager.com / user123');
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map
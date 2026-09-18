"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/reports/dashboard — Main dashboard KPIs and chart data (Admin only)
router.get('/dashboard', auth_1.adminOnly, (req, res) => {
    const db = (0, database_1.default)();
    const dashboard = db.getDashboardReport();
    res.json(dashboard);
});
// GET /api/reports/profit-loss (Admin only)
router.get('/profit-loss', auth_1.adminOnly, (req, res) => {
    const db = (0, database_1.default)();
    const { months = '6' } = req.query;
    const data = db.getProfitLoss(parseInt(months) || 6);
    res.json(data);
});
// GET /api/reports/client-statement/:id
router.get('/client-statement/:id', (req, res) => {
    const statementClientId = Number(req.params.id);
    // If user role, can only access their own statement
    if (req.user?.role !== 'admin' && statementClientId !== req.user?.client_id) {
        return res.status(403).json({ error: 'Access denied. You can only view your own statement.' });
    }
    const db = (0, database_1.default)();
    const statement = db.getClientStatement(statementClientId);
    if (!statement)
        return res.status(404).json({ error: 'Client not found.' });
    res.json(statement);
});
// GET /api/reports/my-summary — Client portal overview
router.get('/my-summary', (req, res) => {
    const clientId = req.user?.client_id;
    if (!clientId) {
        return res.status(400).json({ error: 'User is not linked to a client account.' });
    }
    const db = (0, database_1.default)();
    const statement = db.getClientStatement(clientId);
    if (!statement) {
        return res.status(404).json({ error: 'Client account not found.' });
    }
    const jobs = db.getJobs({ client_id: clientId });
    res.json({
        client: statement.client,
        totals: statement.totals,
        recentInvoices: statement.invoices.slice(0, 5),
        recentPayments: statement.payments.slice(0, 5),
        jobs,
        totalInvoicesCount: statement.invoices.length,
        totalJobsCount: jobs.length,
        activeJobsCount: jobs.filter(j => j.status !== 'completed').length,
    });
});
exports.default = router;
//# sourceMappingURL=reports.js.map
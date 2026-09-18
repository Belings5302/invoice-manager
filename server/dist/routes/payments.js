"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/payments (Record a full or partial payment - Admin only)
router.post('/', auth_1.adminOnly, (req, res) => {
    const { invoice_id, amount, payment_date, method, notes } = req.body;
    if (!invoice_id || !amount || !payment_date) {
        return res.status(400).json({ error: 'Invoice ID, amount, and payment date are required.' });
    }
    const db = (0, database_1.default)();
    try {
        const result = db.createPayment({
            invoice_id: Number(invoice_id),
            amount: Number(amount),
            payment_date,
            method,
            notes,
        });
        res.status(201).json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// GET /api/payments
router.get('/', (req, res) => {
    const db = (0, database_1.default)();
    // Regular users only see payments for their invoices
    if (req.user?.role !== 'admin') {
        const clientId = req.user?.client_id;
        if (!clientId)
            return res.json([]);
        const clientInvoices = db.getInvoices({ client_id: clientId });
        const invoiceIds = new Set(clientInvoices.map(i => i.id));
        const payments = db.getAllPayments().filter(p => invoiceIds.has(p.invoice_id));
        return res.json(payments);
    }
    const payments = db.getAllPayments();
    res.json(payments);
});
// DELETE /api/payments/:id
router.delete('/:id', auth_1.adminOnly, (req, res) => {
    const db = (0, database_1.default)();
    const ok = db.deletePayment(Number(req.params.id));
    if (!ok)
        return res.status(404).json({ error: 'Payment not found.' });
    res.json({ message: 'Payment deleted and invoice updated.' });
});
exports.default = router;
//# sourceMappingURL=payments.js.map
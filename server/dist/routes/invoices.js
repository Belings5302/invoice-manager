"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/invoices
router.get('/', (req, res) => {
    const db = (0, database_1.default)();
    let { status, client_id } = req.query;
    // Regular users only see their own invoices
    if (req.user?.role !== 'admin') {
        if (!req.user?.client_id) {
            const freshUser = db.getUserById(req.user.id);
            if (freshUser?.client_id) {
                req.user.client_id = freshUser.client_id;
            }
            else {
                return res.json([]);
            }
        }
        client_id = String(req.user.client_id);
    }
    const invoices = db.getInvoices({
        status: status,
        client_id: client_id,
    });
    res.json(invoices);
});
// GET /api/invoices/:id
router.get('/:id', (req, res) => {
    const db = (0, database_1.default)();
    const invoice = db.getInvoiceById(Number(req.params.id));
    if (!invoice)
        return res.status(404).json({ error: 'Invoice not found.' });
    // Regular users can only see their own invoice
    if (req.user?.role !== 'admin') {
        if (invoice.client_id !== req.user?.client_id) {
            return res.status(403).json({ error: 'Access denied. You can only view your own invoices.' });
        }
    }
    res.json(invoice);
});
// POST /api/invoices
router.post('/', auth_1.adminOnly, (req, res) => {
    const { client_id, items, issue_date, due_date, notes } = req.body;
    if (!client_id || !items || items.length === 0) {
        return res.status(400).json({ error: 'Client and at least one item are required.' });
    }
    const db = (0, database_1.default)();
    const invoice = db.createInvoice({
        client_id: Number(client_id),
        issue_date: issue_date || new Date().toISOString().split('T')[0],
        due_date: due_date || new Date().toISOString().split('T')[0],
        notes,
    }, items);
    res.status(201).json(invoice);
});
// PUT /api/invoices/:id
router.put('/:id', auth_1.adminOnly, (req, res) => {
    const db = (0, database_1.default)();
    const updated = db.updateInvoice(Number(req.params.id), req.body);
    if (!updated)
        return res.status(404).json({ error: 'Invoice not found.' });
    res.json(updated);
});
// DELETE /api/invoices/:id
router.delete('/:id', auth_1.adminOnly, (req, res) => {
    const db = (0, database_1.default)();
    const ok = db.deleteInvoice(Number(req.params.id));
    if (!ok)
        return res.status(404).json({ error: 'Invoice not found.' });
    res.json({ message: 'Invoice deleted.' });
});
exports.default = router;
//# sourceMappingURL=invoices.js.map
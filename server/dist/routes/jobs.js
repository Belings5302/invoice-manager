"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/jobs
router.get('/', (req, res) => {
    const db = (0, database_1.default)();
    let { status, client_id } = req.query;
    // Regular users only see their own jobs
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
    const jobs = db.getJobs({
        status: status,
        client_id: client_id,
    });
    res.json(jobs);
});
// GET /api/jobs/:id
router.get('/:id', (req, res) => {
    const db = (0, database_1.default)();
    const job = db.getJobById(Number(req.params.id));
    if (!job)
        return res.status(404).json({ error: 'Job not found.' });
    // Regular users can only see their own jobs
    if (req.user?.role !== 'admin') {
        if (job.client_id !== req.user?.client_id) {
            return res.status(403).json({ error: 'Access denied. You can only view your own jobs.' });
        }
    }
    res.json(job);
});
// POST /api/jobs
router.post('/', auth_1.adminOnly, (req, res) => {
    const { client_id, invoice_id, title, status, start_date, end_date, description } = req.body;
    if (!client_id || !title)
        return res.status(400).json({ error: 'Client and title are required.' });
    const db = (0, database_1.default)();
    const job = db.createJob({
        client_id: Number(client_id),
        invoice_id: invoice_id ? Number(invoice_id) : null,
        title,
        status: status || 'pending',
        start_date: start_date || null,
        end_date: end_date || null,
        description: description || null,
    });
    res.status(201).json(job);
});
// PUT /api/jobs/:id
router.put('/:id', auth_1.adminOnly, (req, res) => {
    const db = (0, database_1.default)();
    const updated = db.updateJob(Number(req.params.id), req.body);
    if (!updated)
        return res.status(404).json({ error: 'Job not found.' });
    res.json(updated);
});
// DELETE /api/jobs/:id
router.delete('/:id', auth_1.adminOnly, (req, res) => {
    const db = (0, database_1.default)();
    const ok = db.deleteJob(Number(req.params.id));
    if (!ok)
        return res.status(404).json({ error: 'Job not found.' });
    res.json({ message: 'Job deleted.' });
});
exports.default = router;
//# sourceMappingURL=jobs.js.map
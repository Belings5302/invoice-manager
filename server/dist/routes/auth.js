"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../db/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, client_id } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required.' });
        }
        const db = (0, database_1.default)();
        const existing = db.getUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered.' });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = db.createUser({
            email,
            password_hash: hash,
            name,
            role: 'user',
            client_id: client_id ? Number(client_id) : null,
        });
        const token = (0, auth_1.generateToken)({ id: user.id, email: user.email, name: user.name, role: user.role, client_id: user.client_id });
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, client_id: user.client_id } });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const db = (0, database_1.default)();
        const user = db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const token = (0, auth_1.generateToken)({ id: user.id, email: user.email, name: user.name, role: user.role, client_id: user.client_id });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, client_id: user.client_id } });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authMiddleware, (req, res) => {
    const db = (0, database_1.default)();
    const user = db.getUserById(req.user?.id);
    if (!user)
        return res.status(404).json({ error: 'User not found.' });
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
});
exports.default = router;
//# sourceMappingURL=auth.js.map
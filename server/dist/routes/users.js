"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const router = (0, express_1.Router)();
// GET /api/users — List all registered users (Admin only)
router.get('/', (_req, res) => {
    const db = (0, database_1.default)();
    const users = db.getUsers();
    res.json(users);
});
// PATCH /api/users/:id/role — Change a user's role between 'admin' and 'user'
router.patch('/:id/role', (req, res) => {
    const userId = Number(req.params.id);
    const { role } = req.body;
    if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: "Invalid role. Role must be 'admin' or 'user'." });
    }
    const db = (0, database_1.default)();
    const targetUser = db.getUserById(userId);
    if (!targetUser) {
        return res.status(404).json({ error: 'User not found.' });
    }
    // Prevent demoting the primary superadmin account
    if (targetUser.id === 1 && role !== 'admin') {
        return res.status(403).json({ error: 'Cannot revoke admin privileges from the primary superadmin account.' });
    }
    const updatedUser = db.updateUser(userId, { role });
    if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to update user role.' });
    }
    const { password_hash, ...safeUser } = updatedUser;
    res.json(safeUser);
});
// PATCH /api/users/:id/client — Link or unlink a user to a client profile (Admin only)
router.patch('/:id/client', (req, res) => {
    const userId = Number(req.params.id);
    const { client_id } = req.body;
    const db = (0, database_1.default)();
    const targetUser = db.getUserById(userId);
    if (!targetUser) {
        return res.status(404).json({ error: 'User not found.' });
    }
    // Validate client exists if client_id is provided
    const numClientId = client_id !== null && client_id !== undefined ? Number(client_id) : null;
    if (numClientId !== null) {
        const client = db.getClientById(numClientId);
        if (!client) {
            return res.status(404).json({ error: 'Client not found.' });
        }
    }
    const updatedUser = db.updateUser(userId, { client_id: numClientId });
    if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to update user client link.' });
    }
    const { password_hash, ...safeUser } = updatedUser;
    res.json(safeUser);
});
// DELETE /api/users/:id — Delete a user account (Admin only)
router.delete('/:id', (req, res) => {
    const userId = Number(req.params.id);
    if (userId === 1) {
        return res.status(403).json({ error: 'Cannot delete the primary superadmin account.' });
    }
    if (req.user?.id === userId) {
        return res.status(400).json({ error: 'Cannot delete your own currently active account.' });
    }
    const db = (0, database_1.default)();
    const state = db.getState();
    const initialLength = state.users.length;
    state.users = state.users.filter(u => u.id !== userId);
    if (state.users.length === initialLength) {
        return res.status(404).json({ error: 'User not found.' });
    }
    db.save();
    res.json({ message: 'User account deleted successfully.' });
});
exports.default = router;
//# sourceMappingURL=users.js.map
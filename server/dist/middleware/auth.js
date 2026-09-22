"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.authMiddleware = authMiddleware;
exports.adminOnly = adminOnly;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../db/database"));
const JWT_SECRET = process.env.JWT_SECRET || 'invoice-manager-secret-key-change-in-production';
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        let clientId = decoded.client_id ?? null;
        if (clientId === null) {
            const db = (0, database_1.default)();
            const dbUser = db.getUserById(decoded.id);
            if (dbUser && dbUser.client_id) {
                clientId = dbUser.client_id;
            }
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            client_id: clientId,
        };
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
}
function adminOnly(req, res, next) {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map
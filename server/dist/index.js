"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const clients_1 = __importDefault(require("./routes/clients"));
const invoices_1 = __importDefault(require("./routes/invoices"));
const payments_1 = __importDefault(require("./routes/payments"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const reports_1 = __importDefault(require("./routes/reports"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Public routes
app.use('/api/auth', auth_2.default);
// Protected routes
app.use('/api/clients', auth_1.authMiddleware, auth_1.adminOnly, clients_1.default);
app.use('/api/invoices', auth_1.authMiddleware, invoices_1.default);
app.use('/api/payments', auth_1.authMiddleware, payments_1.default);
app.use('/api/expenses', auth_1.authMiddleware, auth_1.adminOnly, expenses_1.default);
app.use('/api/jobs', auth_1.authMiddleware, jobs_1.default);
app.use('/api/reports', auth_1.authMiddleware, reports_1.default);
app.use('/api/users', auth_1.authMiddleware, auth_1.adminOnly, users_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`🚀 Invoice Manager API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   RBAC initialized`);
});
//# sourceMappingURL=index.js.map
import express from 'express';
import cors from 'cors';
import path from 'path';
import { authMiddleware, adminOnly } from './middleware/auth';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import invoiceRoutes from './routes/invoices';
import paymentRoutes from './routes/payments';
import expenseRoutes from './routes/expenses';
import jobRoutes from './routes/jobs';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/clients', authMiddleware, adminOnly, clientRoutes);
app.use('/api/invoices', authMiddleware, invoiceRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/expenses', authMiddleware, adminOnly, expenseRoutes);
app.use('/api/jobs', authMiddleware, jobRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/users', authMiddleware, adminOnly, userRoutes);

// Health check (responds to /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Process error handlers so crashes are logged
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Invoice Manager API running on http://${HOST}:${PORT}`);
  console.log(`   Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`   RBAC initialized`);
});

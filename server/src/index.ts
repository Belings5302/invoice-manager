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

const app = express();
const PORT = process.env.PORT || 3001;

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Invoice Manager API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   RBAC initialized`);
});

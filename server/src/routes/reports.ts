import { Router } from 'express';
import getDb from '../db/database';
import { adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/reports/dashboard — Main dashboard KPIs and chart data (Admin only)
router.get('/dashboard', adminOnly, (req: AuthRequest, res) => {
  const db = getDb();
  const dashboard = db.getDashboardReport();
  res.json(dashboard);
});

// GET /api/reports/profit-loss (Admin only)
router.get('/profit-loss', adminOnly, (req: AuthRequest, res) => {
  const db = getDb();
  const { months = '6' } = req.query;
  const data = db.getProfitLoss(parseInt(months as string) || 6);
  res.json(data);
});

// GET /api/reports/client-statement/:id
router.get('/client-statement/:id', (req: AuthRequest, res) => {
  const statementClientId = Number(req.params.id);

  // If user role, can only access their own statement
  if (req.user?.role !== 'admin' && statementClientId !== req.user?.client_id) {
    return res.status(403).json({ error: 'Access denied. You can only view your own statement.' });
  }

  const db = getDb();
  const statement = db.getClientStatement(statementClientId);
  if (!statement) return res.status(404).json({ error: 'Client not found.' });
  res.json(statement);
});

// GET /api/reports/my-summary — Client portal overview
// Returns client data ONLY if the user is linked to a client by an admin.
// Does NOT auto-create clients on demand.
router.get('/my-summary', (req: AuthRequest, res) => {
  const db = getDb();

  // Refresh client_id from DB in case admin linked it after login
  const freshUser = db.getUserById(req.user!.id);
  const clientId = freshUser?.client_id ?? req.user?.client_id;

  if (!clientId) {
    return res.status(404).json({
      error: 'PENDING_ACTIVATION',
      message: 'Your account has not yet been linked to a client profile. Please contact the administrator.',
    });
  }

  const statement = db.getClientStatement(clientId);
  if (!statement) {
    return res.status(404).json({
      error: 'CLIENT_NOT_FOUND',
      message: 'Client account not found. Please contact the administrator.',
    });
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

export default router;

import { Router } from 'express';
import getDb from '../db/database';

const router = Router();

// GET /api/reports/dashboard — Main dashboard KPIs and chart data
router.get('/dashboard', (req, res) => {
  const db = getDb();
  const dashboard = db.getDashboardReport();
  res.json(dashboard);
});

// GET /api/reports/profit-loss
router.get('/profit-loss', (req, res) => {
  const db = getDb();
  const { months = '6' } = req.query;
  const data = db.getProfitLoss(parseInt(months as string) || 6);
  res.json(data);
});

// GET /api/reports/client-statement/:id
router.get('/client-statement/:id', (req, res) => {
  const db = getDb();
  const statement = db.getClientStatement(Number(req.params.id));
  if (!statement) return res.status(404).json({ error: 'Client not found.' });
  res.json(statement);
});

export default router;

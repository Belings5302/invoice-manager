import { Router } from 'express';
import getDb from '../db/database';
import { adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/payments (Record a full or partial payment - Admin only)
router.post('/', adminOnly, (req: AuthRequest, res) => {
  const { invoice_id, amount, payment_date, method, notes } = req.body;
  if (!invoice_id || !amount || !payment_date) {
    return res.status(400).json({ error: 'Invoice ID, amount, and payment date are required.' });
  }

  const db = getDb();
  try {
    const result = db.createPayment({
      invoice_id: Number(invoice_id),
      amount: Number(amount),
      payment_date,
      method,
      notes,
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/payments
router.get('/', (req: AuthRequest, res) => {
  const db = getDb();

  // Regular users only see payments for their invoices
  if (req.user?.role !== 'admin') {
    const clientId = req.user?.client_id;
    if (!clientId) return res.json([]);
    const clientInvoices = db.getInvoices({ client_id: clientId });
    const invoiceIds = new Set(clientInvoices.map(i => i.id));
    const payments = db.getAllPayments().filter(p => invoiceIds.has(p.invoice_id));
    return res.json(payments);
  }

  const payments = db.getAllPayments();
  res.json(payments);
});

// DELETE /api/payments/:id
router.delete('/:id', adminOnly, (req: AuthRequest, res) => {
  const db = getDb();
  const ok = db.deletePayment(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Payment not found.' });
  res.json({ message: 'Payment deleted and invoice updated.' });
});

export default router;

import { Router } from 'express';
import getDb from '../db/database';

const router = Router();

// POST /api/payments (Record a full or partial payment)
router.post('/', (req, res) => {
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
router.get('/', (req, res) => {
  const db = getDb();
  const payments = db.getAllPayments();
  res.json(payments);
});

// DELETE /api/payments/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const ok = db.deletePayment(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Payment not found.' });
  res.json({ message: 'Payment deleted and invoice updated.' });
});

export default router;

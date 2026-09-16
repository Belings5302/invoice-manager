import { Router } from 'express';
import getDb from '../db/database';

const router = Router();

// GET /api/invoices
router.get('/', (req, res) => {
  const db = getDb();
  const { status, client_id } = req.query;
  const invoices = db.getInvoices({
    status: status as string,
    client_id: client_id as string,
  });
  res.json(invoices);
});

// GET /api/invoices/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const invoice = db.getInvoiceById(Number(req.params.id));
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
  res.json(invoice);
});

// POST /api/invoices
router.post('/', (req, res) => {
  const { client_id, items, issue_date, due_date, notes } = req.body;
  if (!client_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'Client and at least one item are required.' });
  }

  const db = getDb();
  const invoice = db.createInvoice(
    {
      client_id: Number(client_id),
      issue_date: issue_date || new Date().toISOString().split('T')[0],
      due_date: due_date || new Date().toISOString().split('T')[0],
      notes,
    },
    items
  );

  res.status(201).json(invoice);
});

// PUT /api/invoices/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const updated = db.updateInvoice(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Invoice not found.' });
  res.json(updated);
});

// DELETE /api/invoices/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const ok = db.deleteInvoice(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Invoice not found.' });
  res.json({ message: 'Invoice deleted.' });
});

export default router;

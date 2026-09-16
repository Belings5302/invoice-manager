import { Router } from 'express';
import getDb from '../db/database';

const router = Router();

// GET /api/clients
router.get('/', (req, res) => {
  const db = getDb();
  const clients = db.getClientsWithTotals();
  res.json(clients);
});

// GET /api/clients/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const client = db.getClientById(Number(req.params.id));
  if (!client) return res.status(404).json({ error: 'Client not found.' });

  const statement = db.getClientStatement(Number(req.params.id));
  const jobs = db.getJobs({ client_id: req.params.id });

  res.json({
    ...client,
    invoices: statement?.invoices || [],
    jobs,
    payments: statement?.payments || [],
  });
});

// POST /api/clients
router.post('/', (req, res) => {
  const { name, email, phone, address, company } = req.body;
  if (!name) return res.status(400).json({ error: 'Client name is required.' });

  const db = getDb();
  const client = db.createClient({
    name,
    email: email || null,
    phone: phone || null,
    address: address || null,
    company: company || null,
  });
  res.status(201).json(client);
});

// PUT /api/clients/:id
router.put('/:id', (req, res) => {
  const { name, email, phone, address, company } = req.body;
  const db = getDb();
  const updated = db.updateClient(Number(req.params.id), {
    name,
    email: email || null,
    phone: phone || null,
    address: address || null,
    company: company || null,
  });
  if (!updated) return res.status(404).json({ error: 'Client not found.' });
  res.json(updated);
});

// DELETE /api/clients/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  try {
    const deleted = db.deleteClient(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Client not found.' });
    res.json({ message: 'Client deleted.' });
  } catch (err: any) {
    if (err.message.includes('FOREIGN KEY')) {
      res.status(400).json({ error: 'Cannot delete client with existing invoices or jobs.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;

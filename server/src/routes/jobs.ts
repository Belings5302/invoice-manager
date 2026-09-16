import { Router } from 'express';
import getDb from '../db/database';

const router = Router();

// GET /api/jobs
router.get('/', (req, res) => {
  const db = getDb();
  const { status, client_id } = req.query;
  const jobs = db.getJobs({
    status: status as string,
    client_id: client_id as string,
  });
  res.json(jobs);
});

// GET /api/jobs/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const job = db.getJobById(Number(req.params.id));
  if (!job) return res.status(404).json({ error: 'Job not found.' });
  res.json(job);
});

// POST /api/jobs
router.post('/', (req, res) => {
  const { client_id, invoice_id, title, status, start_date, end_date, description } = req.body;
  if (!client_id || !title) return res.status(400).json({ error: 'Client and title are required.' });

  const db = getDb();
  const job = db.createJob({
    client_id: Number(client_id),
    invoice_id: invoice_id ? Number(invoice_id) : null,
    title,
    status: status || 'pending',
    start_date: start_date || null,
    end_date: end_date || null,
    description: description || null,
  });
  res.status(201).json(job);
});

// PUT /api/jobs/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const updated = db.updateJob(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Job not found.' });
  res.json(updated);
});

// DELETE /api/jobs/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const ok = db.deleteJob(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Job not found.' });
  res.json({ message: 'Job deleted.' });
});

export default router;

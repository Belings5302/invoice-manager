import { Router } from 'express';
import bcrypt from 'bcryptjs';
import getDb from '../db/database';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
// Creates a plain user account (role='user') with NO linked client.
// An admin must link the user to a client from the Users management page.
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    const db = getDb();
    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 10);

    // Create user with NO client link. Admin assigns client access later.
    const user = db.createUser({
      email,
      password_hash: hash,
      name,
      role: 'user',
      client_id: null,
    });

    const token = generateToken({ id: user.id, email: user.email, name: user.name, role: user.role, client_id: user.client_id });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, client_id: user.client_id } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDb();
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name, role: user.role, client_id: user.client_id });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, client_id: user.client_id } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  const db = getDb();
  const user = db.getUserById(req.user?.id!);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password_hash, ...safeUser } = user;
  res.json(safeUser);
});

export default router;

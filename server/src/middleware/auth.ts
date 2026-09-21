import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import getDb from '../db/database';

const JWT_SECRET = process.env.JWT_SECRET || 'invoice-manager-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
    client_id?: number | null;
  };
}

export function generateToken(payload: { id: number; email: string; name: string; role: string; client_id?: number | null }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let clientId = decoded.client_id ?? null;
    if (clientId === null) {
      const db = getDb();
      const dbUser = db.getUserById(decoded.id);
      if (dbUser && dbUser.client_id) {
        clientId = dbUser.client_id;
      }
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      client_id: clientId,
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    return;
  }
  next();
}

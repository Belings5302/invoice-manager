import { Router } from 'express';
import getDb from '../db/database';

const router = Router();

// GET /api/expenses
router.get('/', (req, res) => {
  const db = getDb();
  const { month, year, category } = req.query;
  const expenses = db.getExpenses({
    month: month as string,
    year: year as string,
    category: category as string,
  });
  res.json(expenses);
});

// GET /api/expenses/categories
router.get('/categories', (req, res) => {
  const db = getDb();
  const categories = db.getExpenseCategories();
  res.json(categories);
});

// POST /api/expenses
router.post('/', (req, res) => {
  const { category, amount, expense_date, description, reference } = req.body;
  if (!category || !amount || !expense_date) {
    return res.status(400).json({ error: 'Category, amount, and date are required.' });
  }

  const db = getDb();
  const expense = db.createExpense({
    category,
    amount: Number(amount),
    expense_date,
    description: description || null,
    reference: reference || null,
  });
  res.status(201).json(expense);
});

// PUT /api/expenses/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const updated = db.updateExpense(Number(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Expense not found.' });
  res.json(updated);
});

// DELETE /api/expenses/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const ok = db.deleteExpense(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Expense not found.' });
  res.json({ message: 'Expense deleted.' });
});

export default router;

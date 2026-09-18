"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../db/database"));
const router = (0, express_1.Router)();
// GET /api/expenses
router.get('/', (req, res) => {
    const db = (0, database_1.default)();
    const { month, year, category } = req.query;
    const expenses = db.getExpenses({
        month: month,
        year: year,
        category: category,
    });
    res.json(expenses);
});
// GET /api/expenses/categories
router.get('/categories', (req, res) => {
    const db = (0, database_1.default)();
    const categories = db.getExpenseCategories();
    res.json(categories);
});
// POST /api/expenses
router.post('/', (req, res) => {
    const { category, amount, expense_date, description, reference } = req.body;
    if (!category || !amount || !expense_date) {
        return res.status(400).json({ error: 'Category, amount, and date are required.' });
    }
    const db = (0, database_1.default)();
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
    const db = (0, database_1.default)();
    const updated = db.updateExpense(Number(req.params.id), req.body);
    if (!updated)
        return res.status(404).json({ error: 'Expense not found.' });
    res.json(updated);
});
// DELETE /api/expenses/:id
router.delete('/:id', (req, res) => {
    const db = (0, database_1.default)();
    const ok = db.deleteExpense(Number(req.params.id));
    if (!ok)
        return res.status(404).json({ error: 'Expense not found.' });
    res.json({ message: 'Expense deleted.' });
});
exports.default = router;
//# sourceMappingURL=expenses.js.map
import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      orderBy: { created_at: 'asc' },
    });
    res.json(budgets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/budgets  — upsert (create or update)
router.put('/', async (req, res) => {
  try {
    const { category_id, amount, month, year } = req.body;
    const parsedAmount = parseFloat(amount);

    if (parsedAmount <= 0) {
      // Delete if amount is 0 or negative
      await prisma.budget.deleteMany({
        where: { category_id, month, year },
      });
      return res.json({ deleted: true });
    }

    const budget = await prisma.budget.upsert({
      where: { category_id_month_year: { category_id, month, year } },
      update: { amount: parsedAmount },
      create: { category_id, amount: parsedAmount, month, year },
    });
    res.json(budget);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.budget.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/budgets/copy  — copy budgets from one month to another
router.post('/copy', async (req, res) => {
  try {
    const { fromMonth, fromYear, toMonth, toYear } = req.body;

    const sourceBudgets = await prisma.budget.findMany({
      where: { month: parseInt(fromMonth), year: parseInt(fromYear) },
    });

    const results = [];
    for (const src of sourceBudgets) {
      const b = await prisma.budget.upsert({
        where: { category_id_month_year: { category_id: src.category_id, month: toMonth, year: toYear } },
        update: { amount: src.amount },
        create: { category_id: src.category_id, amount: src.amount, month: toMonth, year: toYear },
      });
      results.push(b);
    }

    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

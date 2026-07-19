import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { created_at: 'asc' },
    });
    res.json(accounts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/accounts
router.post('/', async (req, res) => {
  try {
    const { name, type, balance, currency, icon, color } = req.body;
    const account = await prisma.account.create({
      data: { name, type, balance: parseFloat(balance), currency, icon, color },
    });
    res.status(201).json(account);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/accounts/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.balance !== undefined) data.balance = parseFloat(data.balance);

    const account = await prisma.account.update({ where: { id }, data });
    res.json(account);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.account.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

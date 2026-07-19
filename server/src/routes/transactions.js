import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// Helper: adjust account balance
const adjustBalance = async (accountId, delta) => {
  await prisma.account.update({
    where: { id: accountId },
    data: { balance: { increment: delta } },
  });
};

// Helper: apply transaction effect on balances
const applyEffect = async (tx, multiply) => {
  if (tx.type === 'income') {
    await adjustBalance(tx.account_id, tx.amount * multiply);
  } else if (tx.type === 'expense') {
    await adjustBalance(tx.account_id, -tx.amount * multiply);
  } else if (tx.type === 'transfer' && tx.to_account_id) {
    await adjustBalance(tx.account_id, -tx.amount * multiply);
    await adjustBalance(tx.to_account_id, tx.amount * multiply);
  }
};

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: [{ transaction_date: 'desc' }, { created_at: 'desc' }],
    });
    // Serialize created_at to ISO string
    res.json(transactions.map(t => ({
      ...t,
      created_at: t.created_at.toISOString(),
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const {
      account_id, category_id, to_account_id,
      type, amount, note, receipt_url, transaction_date,
    } = req.body;

    const parsedAmount = parseFloat(amount);

    const tx = await prisma.transaction.create({
      data: {
        account_id,
        category_id: category_id || null,
        to_account_id: to_account_id || null,
        type,
        amount: parsedAmount,
        note: note || '',
        receipt_url: receipt_url || null,
        transaction_date,
      },
    });

    // Apply balance effect
    await applyEffect({ ...tx, amount: parsedAmount }, 1);

    res.status(201).json({ ...tx, created_at: tx.created_at.toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const oldTx = await prisma.transaction.findUnique({ where: { id } });
    if (!oldTx) return res.status(404).json({ error: 'Transaction not found' });

    // Revert old effect
    await applyEffect(oldTx, -1);

    const {
      account_id, category_id, to_account_id,
      type, amount, note, receipt_url, transaction_date,
    } = req.body;

    const parsedAmount = parseFloat(amount);

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        account_id,
        category_id: category_id || null,
        to_account_id: to_account_id || null,
        type,
        amount: parsedAmount,
        note: note ?? '',
        receipt_url: receipt_url ?? null,
        transaction_date,
      },
    });

    // Apply new effect
    await applyEffect(updated, 1);

    res.json({ ...updated, created_at: updated.created_at.toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    // Revert balance effect
    await applyEffect(tx, -1);

    await prisma.transaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/transactions  (batch delete, ids in body)
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body; // Array of ids
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array required' });
    }

    // Revert all effects first
    const txs = await prisma.transaction.findMany({ where: { id: { in: ids } } });
    for (const tx of txs) {
      await applyEffect(tx, -1);
    }

    await prisma.transaction.deleteMany({ where: { id: { in: ids } } });
    res.json({ success: true, deleted: ids.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

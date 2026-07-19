import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// Helper: compute next date string
const getNextDateStr = (currentStr, frequency) => {
  const [year, month, day] = currentStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  if (frequency === 'daily') d.setDate(d.getDate() + 1);
  else if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const rDay = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${rDay}`;
};

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// GET /api/recurring
router.get('/', async (req, res) => {
  try {
    const rules = await prisma.recurringRule.findMany({
      orderBy: { created_at: 'asc' },
    });
    res.json(rules);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/recurring
router.post('/', async (req, res) => {
  try {
    const { template_transaction, frequency, start_date, end_date } = req.body;
    const rule = await prisma.recurringRule.create({
      data: {
        template_transaction,
        frequency,
        start_date,
        end_date: end_date || null,
        next_run_date: start_date,
      },
    });
    res.status(201).json(rule);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/recurring/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const rule = await prisma.recurringRule.update({ where: { id }, data });
    res.json(rule);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/recurring/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.recurringRule.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/recurring/process  — run due recurring rules
router.post('/process', async (req, res) => {
  try {
    const rules = await prisma.recurringRule.findMany();
    const todayStr = getTodayStr();
    const createdTransactions = [];

    for (const rule of rules) {
      let nextRun = rule.next_run_date;
      const template = rule.template_transaction;

      while (nextRun <= todayStr) {
        if (rule.end_date && nextRun > rule.end_date) break;

        // Create transaction
        const tx = await prisma.transaction.create({
          data: {
            account_id: template.account_id,
            category_id: template.category_id || null,
            to_account_id: template.to_account_id || null,
            type: template.type,
            amount: parseFloat(template.amount),
            note: template.note || '',
            receipt_url: template.receipt_url || null,
            transaction_date: nextRun,
          },
        });

        // Apply balance effect
        const amt = parseFloat(template.amount);
        if (template.type === 'income') {
          await prisma.account.update({ where: { id: template.account_id }, data: { balance: { increment: amt } } });
        } else if (template.type === 'expense') {
          await prisma.account.update({ where: { id: template.account_id }, data: { balance: { decrement: amt } } });
        } else if (template.type === 'transfer' && template.to_account_id) {
          await prisma.account.update({ where: { id: template.account_id }, data: { balance: { decrement: amt } } });
          await prisma.account.update({ where: { id: template.to_account_id }, data: { balance: { increment: amt } } });
        }

        createdTransactions.push(tx);
        nextRun = getNextDateStr(nextRun, rule.frequency);
      }

      // Update next_run_date
      await prisma.recurringRule.update({
        where: { id: rule.id },
        data: { next_run_date: nextRun },
      });
    }

    res.json({ processed: rules.length, created: createdTransactions.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

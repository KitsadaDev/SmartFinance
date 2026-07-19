import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// POST /api/reset
router.post('/', async (req, res) => {
  try {
    // Delete dependent models in proper dependency order
    await prisma.transaction.deleteMany({});
    await prisma.budget.deleteMany({});
    await prisma.recurringRule.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.account.deleteMany({});
    
    // Reset Settings to default (id 1)
    await prisma.settings.update({
      where: { id: 1 },
      data: {
        name: '',
        currency: 'THB',
        theme: 'light',
        timezone: 'Asia/Bangkok'
      }
    });

    res.json({ success: true, message: 'All data has been reset to factory defaults.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

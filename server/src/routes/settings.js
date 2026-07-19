import { Router } from 'express';
import { prisma } from '../index.js';

const router = Router();

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const { name, currency, theme, timezone } = req.body;
    const settings = await prisma.settings.update({
      where: { id: 1 },
      data: { name, currency, theme, timezone },
    });
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

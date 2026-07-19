import { Router } from 'express';
import { prisma } from '../index.js';
import { defaultCategories } from '../../prisma/seed.js';

const router = Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { created_at: 'asc' },
    });

    // If no categories exist, seed defaults
    if (categories.length === 0) {
      const seeded = await prisma.category.createMany({
        data: defaultCategories,
        skipDuplicates: true,
      });
      const all = await prisma.category.findMany({ orderBy: { created_at: 'asc' } });
      return res.json(all);
    }

    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, type, parent_id, icon, color } = req.body;
    const category = await prisma.category.create({
      data: { name, type, parent_id: parent_id || null, icon, color },
    });
    res.status(201).json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const category = await prisma.category.update({ where: { id }, data });
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/categories/:id  — also deletes subcategories
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Delete children first
    await prisma.category.deleteMany({ where: { parent_id: id } });
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

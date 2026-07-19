import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import accountsRouter from './routes/accounts.js';
import categoriesRouter from './routes/categories.js';
import transactionsRouter from './routes/transactions.js';
import budgetsRouter from './routes/budgets.js';
import recurringRouter from './routes/recurring.js';
import settingsRouter from './routes/settings.js';
import resetRouter from './routes/reset.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

export const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' })); // limit สำหรับ receipt_url base64

// Routes
app.use('/api/accounts', accountsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reset', resetRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 SmartFinance API running at http://localhost:${PORT}`);

  // Ensure Settings row exists (singleton)
  try {
    await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    console.log('✅ Settings initialized');
  } catch (e) {
    console.error('❌ Could not init settings:', e.message);
  }
});

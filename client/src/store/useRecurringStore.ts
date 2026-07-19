import { create } from 'zustand';
import type { RecurringRule, RecurringFrequency } from '../types';
import { api } from '../lib/api';
import { useTransactionStore } from './useTransactionStore';

interface RecurringState {
  rules: RecurringRule[];
  isLoading: boolean;
  error: string | null;
  fetchRules: () => Promise<void>;
  addRule: (rule: Omit<RecurringRule, 'id' | 'next_run_date'>) => Promise<void>;
  updateRule: (id: string, data: Partial<Omit<RecurringRule, 'id'>>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  processRules: () => Promise<void>;
}

export const getNextDateStr = (currentStr: string, frequency: RecurringFrequency): string => {
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

export const useRecurringStore = create<RecurringState>()((set) => ({
  rules: [],
  isLoading: false,
  error: null,

  fetchRules: async () => {
    set({ isLoading: true, error: null });
    try {
      const rules = await api.get('/recurring');
      set({ rules, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addRule: async (rule) => {
    try {
      const newRule = await api.post('/recurring', rule);
      set((state) => ({ rules: [...state.rules, newRule] }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  updateRule: async (id, data) => {
    try {
      const updated = await api.put(`/recurring/${id}`, data);
      set((state) => ({
        rules: state.rules.map((r) => (r.id === id ? updated : r)),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  deleteRule: async (id) => {
    try {
      await api.delete(`/recurring/${id}`);
      set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  processRules: async () => {
    try {
      await api.post('/recurring/process', {});
      // After processing, refresh transactions and rules
      await useTransactionStore.getState().fetchTransactions();
      const freshRules = await api.get('/recurring');
      set({ rules: freshRules });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));

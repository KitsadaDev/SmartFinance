import { create } from 'zustand';
import type { Budget } from '../types';
import { api } from '../lib/api';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;
  error: string | null;
  fetchBudgets: () => Promise<void>;
  setBudget: (category_id: string, amount: number, month: number, year: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  copyBudgets: (fromMonth: number, fromYear: number, toMonth: number, toYear: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>()((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,

  fetchBudgets: async () => {
    set({ isLoading: true, error: null });
    try {
      const budgets = await api.get('/budgets');
      set({ budgets, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  setBudget: async (category_id, amount, month, year) => {
    try {
      const result = await api.put('/budgets', { category_id, amount, month, year });

      if (result.deleted) {
        // Amount was 0 → deleted
        set((state) => ({
          budgets: state.budgets.filter(
            (b) => !(b.category_id === category_id && b.month === month && b.year === year)
          ),
        }));
      } else {
        // Upsert
        const existing = get().budgets.find(
          (b) => b.category_id === category_id && b.month === month && b.year === year
        );
        if (existing) {
          set((state) => ({
            budgets: state.budgets.map((b) => (b.id === result.id ? result : b)),
          }));
        } else {
          set((state) => ({ budgets: [...state.budgets, result] }));
        }
      }
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  deleteBudget: async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  copyBudgets: async (fromMonth, fromYear, toMonth, toYear) => {
    try {
      const newBudgets = await api.post('/budgets/copy', { fromMonth, fromYear, toMonth, toYear });
      // Merge into existing budgets
      set((state) => {
        const existing = state.budgets.filter(
          (b) => !(b.month === toMonth && b.year === toYear)
        );
        return { budgets: [...existing, ...newBudgets] };
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));

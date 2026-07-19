import { create } from 'zustand';
import type { Transaction } from '../types';
import { api } from '../lib/api';
import { useAccountStore } from './useAccountStore';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'created_at'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteMultipleTransactions: (ids: string[]) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>()((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await api.get('/transactions');
      set({ transactions, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addTransaction: async (transaction) => {
    try {
      const newTx = await api.post('/transactions', transaction);
      set((state) => ({ transactions: [newTx, ...state.transactions] }));
      // Refresh account balances from server
      await useAccountStore.getState().fetchAccounts();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  updateTransaction: async (id, data) => {
    try {
      const oldTx = useTransactionStore.getState().transactions.find((t) => t.id === id);
      if (!oldTx) return;

      const updated = await api.put(`/transactions/${id}`, { ...oldTx, ...data });
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updated : t)),
      }));
      // Refresh account balances from server
      await useAccountStore.getState().fetchAccounts();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  deleteTransaction: async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
      // Refresh account balances from server
      await useAccountStore.getState().fetchAccounts();
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  deleteMultipleTransactions: async (ids) => {
    try {
      await api.delete('/transactions', { ids });
      set((state) => ({
        transactions: state.transactions.filter((t) => !ids.includes(t.id)),
      }));
      // Refresh account balances from server
      await useAccountStore.getState().fetchAccounts();
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));

import { create } from 'zustand';
import type { Account, AccountType } from '../types';
import { api } from '../lib/api';

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: {
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
    icon: string;
    color: string;
  }) => Promise<void>;
  updateAccount: (id: string, data: Partial<Omit<Account, 'id'>>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  archiveAccount: (id: string, isArchived: boolean) => Promise<void>;
  // Used internally by transaction store after server handles balance
  _setAccounts: (accounts: Account[]) => void;
}

export const useAccountStore = create<AccountState>()((set) => ({
  accounts: [],
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await api.get('/accounts');
      set({ accounts, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addAccount: async (account) => {
    try {
      const newAccount = await api.post('/accounts', account);
      set((state) => ({ accounts: [...state.accounts, newAccount] }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  updateAccount: async (id, data) => {
    try {
      const updated = await api.put(`/accounts/${id}`, data);
      set((state) => ({
        accounts: state.accounts.map((acc) => (acc.id === id ? updated : acc)),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  deleteAccount: async (id) => {
    try {
      await api.delete(`/accounts/${id}`);
      set((state) => ({
        accounts: state.accounts.filter((acc) => acc.id !== id),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  archiveAccount: async (id, isArchived) => {
    try {
      const updated = await api.put(`/accounts/${id}`, { is_archived: isArchived });
      set((state) => ({
        accounts: state.accounts.map((acc) => (acc.id === id ? updated : acc)),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  _setAccounts: (accounts) => set({ accounts }),
}));

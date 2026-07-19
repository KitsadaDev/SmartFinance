import { create } from 'zustand';
import type { Category } from '../types';
import { api } from '../lib/api';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: {
    name: string;
    type: 'income' | 'expense';
    parent_id?: string;
    icon: string;
    color: string;
  }) => Promise<void>;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>()((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await api.get('/categories');
      set({ categories, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addCategory: async (category) => {
    try {
      const newCategory = await api.post('/categories', category);
      set((state) => ({ categories: [...state.categories, newCategory] }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  updateCategory: async (id, data) => {
    try {
      const updated = await api.put(`/categories/${id}`, data);
      set((state) => ({
        categories: state.categories.map((cat) => (cat.id === id ? updated : cat)),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      set((state) => ({
        // Remove deleted category and its children
        categories: state.categories.filter(
          (cat) => cat.id !== id && cat.parent_id !== id
        ),
      }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));

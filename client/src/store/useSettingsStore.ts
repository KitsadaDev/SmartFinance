import { create } from 'zustand';
import type { Settings } from '../types';
import { api } from '../lib/api';

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<Settings>) => Promise<void>;
}

const defaultSettings: Settings = {
  name: '',
  currency: 'THB',
  theme: 'light',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok',
};

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: defaultSettings,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get('/settings');
      if (data) {
        set({
          settings: {
            name: data.name ?? '',
            currency: data.currency ?? 'THB',
            theme: (data.theme ?? 'light') as 'light' | 'dark',
            timezone: data.timezone ?? defaultSettings.timezone,
          },
          isLoading: false,
        });
      }
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  updateSettings: async (data) => {
    try {
      const merged = { ...get().settings, ...data };
      const updated = await api.put('/settings', merged);
      set({
        settings: {
          name: updated.name ?? '',
          currency: updated.currency ?? 'THB',
          theme: (updated.theme ?? 'light') as 'light' | 'dark',
          timezone: updated.timezone ?? defaultSettings.timezone,
        },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));

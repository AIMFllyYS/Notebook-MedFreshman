import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  aiApiUrl: string;
  aiModel: string;
  aiApiKey: string;
  theme: 'dark' | 'light';
  updateAiConfig: (url: string, model: string, key: string) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      aiApiUrl: import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1/chat/completions',
      aiModel: import.meta.env.VITE_AI_MODEL || 'gpt-4o',
      aiApiKey: import.meta.env.VITE_AI_API_KEY || '',
      theme: 'dark',
      
      updateAiConfig: (url, model, key) => set({ aiApiUrl: url, aiModel: model, aiApiKey: key }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'prob-settings',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'slate' | 'green' | 'orange' | 'purple' | 'blue';

interface ThemeState {
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      color: 'slate',
      setColor: (color) => set({ color }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const themePalettes: Record<ThemeColor, { primary: string; accent: string }> = {
  slate: { primary: '#0f172a', accent: '#f8fafc' },
  green: { primary: '#16a34a', accent: '#f0fdf4' },
  orange: { primary: '#ea580c', accent: '#fff7ed' },
  purple: { primary: '#9333ea', accent: '#faf5ff' },
  blue: { primary: '#2563eb', accent: '#eff6ff' },
};

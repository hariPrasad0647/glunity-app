import { create } from 'zustand';

interface AppState {
  hasSeenIntro: boolean;
  setHasSeenIntro: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasSeenIntro: false,
  setHasSeenIntro: (value) => set({ hasSeenIntro: value }),
}));

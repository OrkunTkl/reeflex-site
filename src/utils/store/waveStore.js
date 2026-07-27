import { create } from 'zustand'
export const useWaveStore = create((set) => ({
  active: false,
  toggleActive: () => set((state) => ({ active: !state.active })),
}))

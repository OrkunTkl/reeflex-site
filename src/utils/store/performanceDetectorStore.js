import { create } from 'zustand'
const usePerformanceStore = create(set => ({
  level: null,
  setLevel: (level) => set({ level }),
}))
export default usePerformanceStore

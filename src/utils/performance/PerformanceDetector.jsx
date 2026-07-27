import { useEffect } from 'react'
import { getGPUTier } from 'detect-gpu'
import usePerformanceStore from '../store/performanceDetectorStore'

export default function PerformanceDetector() {
  const setLevel = usePerformanceStore(state => state.setLevel)
  useEffect(() => {
    getGPUTier().then(({ tier, isMobile }) => {
      const adjustedTier = isMobile ? Math.max(0, tier - 1) : tier
      const level =
        adjustedTier >= 3 ? 'veryHigh' :
        adjustedTier === 2 ? 'high' :
        adjustedTier === 1 ? 'medium' : 'low'
      setLevel(level)
    }).catch(() => setLevel('medium'))
  }, [setLevel])
  return null
}

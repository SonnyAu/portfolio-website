"use client"

import { useEffect, useRef, useState, useCallback, memo } from "react"
import { Activity } from "lucide-react"

interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  networkSpeed: string
}

const PerformanceMonitor = memo(function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    networkSpeed: "4g",
  })
  const [isVisible, setIsVisible] = useState(false)
  const monitorRef = useRef<HTMLDivElement>(null)

  // Lightweight FPS monitoring (only when panel is visible)
  const measurePerformance = useCallback(() => {
    if (!isVisible) return () => {}

    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        setMetrics((prev) => ({ ...prev, fps }))
        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    measureFPS()
    return () => cancelAnimationFrame(animationId)
  }, [isVisible])

  useEffect(() => {
    // Initial metrics
    if ("memory" in performance) {
      const memory = (performance as any).memory
      setMetrics((prev) => ({ ...prev, memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) }))
    }
    if ("connection" in navigator) {
      const connection = (navigator as any).connection
      setMetrics((prev) => ({ ...prev, networkSpeed: connection?.effectiveType || "4g" }))
    }

    // Keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  useEffect(() => {
    return measurePerformance()
  }, [measurePerformance])

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return "text-green-400"
    if (fps >= 30) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-black/80 border border-[#00D2BE] rounded-full p-2 text-[#00D2BE] hover:bg-[#00D2BE] hover:text-black transition-colors duration-200 text-sm font-f1-bold"
        title="Performance Monitor (Ctrl+Shift+P)"
        aria-label="Toggle performance monitor"
      >
        <Activity size={14} />
      </button>

      {/* Performance monitor panel */}
      {isVisible && (
        <div
          ref={monitorRef}
          className="fixed top-20 right-4 z-40 bg-black/90 backdrop-blur-sm border border-[#00D2BE]/50 rounded-lg p-3 text-xs font-f1 shadow-lg"
          style={{ minWidth: "180px" }}
        >
          <div className="text-[#00D2BE] font-f1-bold mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00D2BE] rounded-full animate-pulse" />
            PERFORMANCE
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-neutral-400">FPS:</span>
              <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Memory:</span>
              <span className="text-white">{metrics.memoryUsage}MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Network:</span>
              <span className="text-white">{metrics.networkSpeed}</span>
            </div>
          </div>

          {/* FPS bar */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-neutral-500 w-8">FPS</span>
            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  metrics.fps >= 55 ? "bg-green-400" : metrics.fps >= 30 ? "bg-yellow-400" : "bg-red-400"
                }`}
                style={{ width: `${Math.min((metrics.fps / 60) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
})

export default PerformanceMonitor

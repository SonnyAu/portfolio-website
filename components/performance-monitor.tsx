"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

interface PerformanceMetrics {
  fps: number
  loadTime: number
  memoryUsage: number
  networkSpeed: string
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    loadTime: 0,
    memoryUsage: 0,
    networkSpeed: "Unknown",
  })
  const [isVisible, setIsVisible] = useState(false)
  const monitorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    // FPS monitoring
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

    // Start FPS monitoring
    measureFPS()

    // Load time measurement
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      setMetrics((prev) => ({ ...prev, loadTime: Math.round(loadTime) }))
    }

    // Memory usage (if available)
    if ("memory" in performance) {
      const memory = (performance as any).memory
      const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      setMetrics((prev) => ({ ...prev, memoryUsage }))
    }

    // Network speed estimation
    if ("connection" in navigator) {
      const connection = (navigator as any).connection
      const networkSpeed = connection.effectiveType || "Unknown"
      setMetrics((prev) => ({ ...prev, networkSpeed }))
    }

    // Keyboard shortcut to toggle monitor (Ctrl + Shift + P)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [])

  useEffect(() => {
    if (monitorRef.current) {
      if (isVisible) {
        gsap.to(monitorRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: "power2.out",
        })
      } else {
        gsap.to(monitorRef.current, {
          opacity: 0,
          x: 100,
          duration: 0.3,
          ease: "power2.out",
        })
      }
    }
  }, [isVisible])

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
        className="fixed bottom-4 right-4 z-50 bg-black/80 border border-[#00D2BE] rounded-full p-2 text-[#00D2BE] hover:bg-[#00D2BE] hover:text-black transition-all duration-300 text-xs font-f1"
        title="Performance Monitor (Ctrl+Shift+P)"
      >
        📊
      </button>

      {/* Performance monitor */}
      <div
        ref={monitorRef}
        className="fixed top-20 right-4 z-40 bg-black/90 backdrop-blur-sm border border-[#00D2BE]/50 rounded-lg p-3 text-xs font-f1 opacity-0 translate-x-full"
        style={{ minWidth: "200px" }}
      >
        <div className="text-[#00D2BE] font-f1-bold mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00D2BE] rounded-full animate-pulse" />
          PERFORMANCE
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-400">FPS:</span>
            <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-400">Load:</span>
            <span className="text-white">{metrics.loadTime}ms</span>
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

        {/* Performance bars */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 w-8">FPS</span>
            <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  metrics.fps >= 55 ? "bg-green-400" : metrics.fps >= 30 ? "bg-yellow-400" : "bg-red-400"
                }`}
                style={{ width: `${Math.min((metrics.fps / 60) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

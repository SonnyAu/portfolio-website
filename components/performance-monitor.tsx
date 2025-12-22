"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import { Activity, Cpu, HardDrive, Wifi, Zap, AlertTriangle } from "lucide-react"

interface PerformanceMetrics {
  fps: number
  loadTime: number
  memoryUsage: number
  networkSpeed: string
  renderTime: number
  bundleSize: number
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
  }
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    loadTime: 0,
    memoryUsage: 0,
    networkSpeed: "Unknown",
    renderTime: 0,
    bundleSize: 0,
    coreWebVitals: {
      lcp: 0,
      fid: 0,
      cls: 0,
    },
  })
  const [isVisible, setIsVisible] = useState(false)
  const [optimizationLevel, setOptimizationLevel] = useState<"excellent" | "good" | "needs-improvement">("excellent")
  const monitorRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<PerformanceMetrics>(metrics)

  // Enhanced performance monitoring
  const measurePerformance = useCallback(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))

        setMetrics((prev) => {
          const newMetrics = { ...prev, fps }
          metricsRef.current = newMetrics
          return newMetrics
        })

        frameCount = 0
        lastTime = currentTime

        // Enhanced optimization level detection
        if (fps >= 55) {
          setOptimizationLevel("excellent")
        } else if (fps >= 30) {
          setOptimizationLevel("good")
        } else {
          setOptimizationLevel("needs-improvement")
        }
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    measureFPS()
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Core Web Vitals measurement
  const measureCoreWebVitals = useCallback(() => {
    // Largest Contentful Paint (LCP)
    if ("PerformanceObserver" in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        if (lastEntry) {
          setMetrics((prev) => ({
            ...prev,
            coreWebVitals: { ...prev.coreWebVitals, lcp: Math.round(lastEntry.startTime) },
          }))
        }
      })
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          setMetrics((prev) => ({
            ...prev,
            coreWebVitals: { ...prev.coreWebVitals, fid: Math.round(entry.processingStart - entry.startTime) },
          }))
        })
      })
      fidObserver.observe({ entryTypes: ["first-input"] })

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        setMetrics((prev) => ({
          ...prev,
          coreWebVitals: { ...prev.coreWebVitals, cls: Math.round(clsValue * 1000) / 1000 },
        }))
      })
      clsObserver.observe({ entryTypes: ["layout-shift"] })
    }
  }, [])

  // Advanced resource optimization
  const optimizeResources = useCallback(() => {
    // Preload critical resources with priority hints
    const criticalResources = [
      { href: "/fonts/Formula1-Regular_web_0.ttf", as: "font", type: "font/ttf" },
      { href: "/fonts/Formula1-Bold_web_0.ttf", as: "font", type: "font/ttf" },
    ]

    criticalResources.forEach((resource) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = resource.href
      link.as = resource.as
      if (resource.type) link.type = resource.type
      link.crossOrigin = "anonymous"
      document.head.appendChild(link)
    })

    // Optimize images with intersection observer
    const images = document.querySelectorAll("img")
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (!img.loading) img.loading = "lazy"
          if (!img.decoding) img.decoding = "async"
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach((img) => imageObserver.observe(img))

    // Resource hints for better performance
    const addResourceHints = () => {
      const head = document.head

      // DNS prefetch
      const dnsPrefetch = document.createElement("link")
      dnsPrefetch.rel = "dns-prefetch"
      dnsPrefetch.href = "//fonts.googleapis.com"
      head.appendChild(dnsPrefetch)

      // Preconnect
      const preconnect = document.createElement("link")
      preconnect.rel = "preconnect"
      preconnect.href = "https://fonts.gstatic.com"
      preconnect.crossOrigin = "anonymous"
      head.appendChild(preconnect)
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(addResourceHints)
    } else {
      setTimeout(addResourceHints, 1000)
    }
  }, [])

  useEffect(() => {
    const cleanup = measurePerformance()
    measureCoreWebVitals()
    optimizeResources()

    // Enhanced performance measurements
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      setMetrics((prev) => ({ ...prev, loadTime: Math.round(loadTime) }))
    }

    // Memory usage
    if ("memory" in performance) {
      const memory = (performance as any).memory
      const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      setMetrics((prev) => ({ ...prev, memoryUsage }))
    }

    // Network information
    if ("connection" in navigator) {
      const connection = (navigator as any).connection
      const networkSpeed = connection.effectiveType || "Unknown"
      setMetrics((prev) => ({ ...prev, networkSpeed }))
    }

    // Bundle size estimation
    if (performance.getEntriesByType) {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
      const totalSize = resources.reduce((acc, resource) => {
        return acc + (resource.transferSize || 0)
      }, 0)
      setMetrics((prev) => ({ ...prev, bundleSize: Math.round(totalSize / 1024) }))
    }

    // Keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      cleanup()
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [measurePerformance, measureCoreWebVitals, optimizeResources])

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

  const getOptimizationColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "text-green-400"
      case "good":
        return "text-yellow-400"
      case "needs-improvement":
        return "text-red-400"
      default:
        return "text-neutral-400"
    }
  }

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return "text-green-400"
    if (fps >= 30) return "text-yellow-400"
    return "text-red-400"
  }

  const getCoreWebVitalColor = (metric: string, value: number) => {
    switch (metric) {
      case "lcp":
        if (value <= 2500) return "text-green-400"
        if (value <= 4000) return "text-yellow-400"
        return "text-red-400"
      case "fid":
        if (value <= 100) return "text-green-400"
        if (value <= 300) return "text-yellow-400"
        return "text-red-400"
      case "cls":
        if (value <= 0.1) return "text-green-400"
        if (value <= 0.25) return "text-yellow-400"
        return "text-red-400"
      default:
        return "text-neutral-400"
    }
  }

  return (
    <>
      {/* Enhanced toggle button with F1 styling */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-black/90 border-2 border-[#00D2BE] rounded-full p-3 text-[#00D2BE] hover:bg-[#00D2BE] hover:text-black transition-all duration-300 text-sm font-f1-bold shadow-lg shadow-[#00D2BE]/20"
        title="F1 Performance Monitor (Ctrl+Shift+P)"
      >
        <Activity size={16} className="animate-pulse" />
      </button>

      {/* Enhanced performance monitor with F1 telemetry styling */}
      <div
        ref={monitorRef}
        className="fixed top-20 right-4 z-40 bg-black/95 backdrop-blur-sm border-2 border-[#00D2BE]/60 rounded-lg p-4 text-xs font-f1 opacity-0 translate-x-full shadow-2xl shadow-[#00D2BE]/10"
        style={{ minWidth: "280px" }}
      >
        <div className="text-[#00D2BE] font-f1-bold mb-3 flex items-center gap-2">
          <div className="w-3 h-3 bg-[#00D2BE] rounded-full animate-pulse" />
          F1 PERFORMANCE TELEMETRY
          <div className={`w-2 h-2 rounded-full ${getOptimizationColor(optimizationLevel)} animate-pulse`} />
        </div>

        {/* Core metrics */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-neutral-400 flex items-center gap-1">
              <Zap size={10} />
              FPS:
            </span>
            <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400 flex items-center gap-1">
              <Activity size={10} />
              Load:
            </span>
            <span className="text-white">{metrics.loadTime}ms</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400 flex items-center gap-1">
              <Cpu size={10} />
              Memory:
            </span>
            <span className="text-white">{metrics.memoryUsage}MB</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400 flex items-center gap-1">
              <Wifi size={10} />
              Network:
            </span>
            <span className="text-white">{metrics.networkSpeed}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400 flex items-center gap-1">
              <HardDrive size={10} />
              Bundle:
            </span>
            <span className="text-white">{metrics.bundleSize}KB</span>
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="border-t border-[#00D2BE]/30 pt-3 mb-4">
          <div className="text-[#00D2BE] font-f1-bold mb-2 text-xs">CORE WEB VITALS</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">LCP:</span>
              <span className={getCoreWebVitalColor("lcp", metrics.coreWebVitals.lcp)}>
                {metrics.coreWebVitals.lcp}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">FID:</span>
              <span className={getCoreWebVitalColor("fid", metrics.coreWebVitals.fid)}>
                {metrics.coreWebVitals.fid}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">CLS:</span>
              <span className={getCoreWebVitalColor("cls", metrics.coreWebVitals.cls)}>
                {metrics.coreWebVitals.cls}
              </span>
            </div>
          </div>
        </div>

        {/* Performance bars with F1 styling */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 w-12">FPS</span>
            <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  metrics.fps >= 55 ? "bg-green-400" : metrics.fps >= 30 ? "bg-yellow-400" : "bg-red-400"
                }`}
                style={{ width: `${Math.min((metrics.fps / 60) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 w-12">MEM</span>
            <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  metrics.memoryUsage < 50 ? "bg-green-400" : metrics.memoryUsage < 100 ? "bg-yellow-400" : "bg-red-400"
                }`}
                style={{ width: `${Math.min((metrics.memoryUsage / 150) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Optimization status */}
        <div className="border-t border-[#00D2BE]/30 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Status:</span>
            <span className={`${getOptimizationColor(optimizationLevel)} font-f1-bold flex items-center gap-1`}>
              {optimizationLevel === "needs-improvement" && <AlertTriangle size={10} />}
              {optimizationLevel.toUpperCase().replace("-", " ")}
            </span>
          </div>
        </div>

        {/* F1 Performance tips */}
        <div className="mt-3 p-2 bg-neutral-900/50 rounded border border-[#00D2BE]/20">
          <div className="text-[#00D2BE] font-f1-bold mb-1 text-xs">OPTIMIZATION TIPS</div>
          {optimizationLevel === "needs-improvement" && (
            <div className="text-red-400 text-xs">• Reduce animations for better FPS</div>
          )}
          {optimizationLevel === "good" && <div className="text-yellow-400 text-xs">• Consider image optimization</div>}
          {optimizationLevel === "excellent" && (
            <div className="text-green-400 text-xs">• Performance is championship level!</div>
          )}
        </div>
      </div>
    </>
  )
}

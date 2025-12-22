"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"

interface PerformanceMetrics {
  fps: number
  loadTime: number
  memoryUsage: number
  networkSpeed: string
  renderTime: number
  bundleSize: number
}

export default function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    loadTime: 0,
    memoryUsage: 0,
    networkSpeed: "Unknown",
    renderTime: 0,
    bundleSize: 0,
  })
  const [isVisible, setIsVisible] = useState(false)
  const [optimizationLevel, setOptimizationLevel] = useState<"high" | "medium" | "low">("high")
  const monitorRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<PerformanceMetrics>(metrics)

  // Performance monitoring
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

        // Auto-adjust optimization level based on FPS
        if (fps < 30) {
          setOptimizationLevel("low")
        } else if (fps < 50) {
          setOptimizationLevel("medium")
        } else {
          setOptimizationLevel("high")
        }
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    measureFPS()
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Resource optimization
  const optimizeResources = useCallback(() => {
    // Preload critical resources
    const criticalResources = ["/fonts/Formula1-Regular_web_0.ttf", "/fonts/Formula1-Bold_web_0.ttf"]

    criticalResources.forEach((resource) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = resource
      link.as = "font"
      link.type = "font/ttf"
      link.crossOrigin = "anonymous"
      document.head.appendChild(link)
    })

    // Optimize images
    const images = document.querySelectorAll("img")
    images.forEach((img) => {
      if (!img.loading) {
        img.loading = "lazy"
      }
      if (!img.decoding) {
        img.decoding = "async"
      }
    })

    // Remove unused CSS
    const removeUnusedCSS = () => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
      stylesheets.forEach((stylesheet) => {
        if (stylesheet instanceof HTMLLinkElement) {
          // Mark as non-render blocking
          stylesheet.media = "print"
          stylesheet.onload = () => {
            stylesheet.media = "all"
          }
        }
      })
    }

    // Defer non-critical CSS
    setTimeout(removeUnusedCSS, 100)
  }, [])

  // Memory optimization
  const optimizeMemory = useCallback(() => {
    // Clean up GSAP animations
    const cleanupAnimations = () => {
      gsap.globalTimeline.getChildren().forEach((tween) => {
        if (tween.progress() === 1) {
          tween.kill()
        }
      })
    }

    // Clean up event listeners
    const cleanupEventListeners = () => {
      const elements = document.querySelectorAll("[data-cleanup]")
      elements.forEach((element) => {
        const clonedElement = element.cloneNode(true)
        element.parentNode?.replaceChild(clonedElement, element)
      })
    }

    // Run cleanup periodically
    setInterval(() => {
      cleanupAnimations()
      if (metricsRef.current.memoryUsage > 100) {
        cleanupEventListeners()
      }
    }, 30000)
  }, [])

  // Network optimization
  const optimizeNetwork = useCallback(() => {
    // Alternative: Use browser cache with resource hints
    const addResourceHints = () => {
      const head = document.head

      // Add DNS prefetch for external resources
      const dnsPrefetch = document.createElement("link")
      dnsPrefetch.rel = "dns-prefetch"
      dnsPrefetch.href = "//fonts.googleapis.com"
      head.appendChild(dnsPrefetch)

      // Add preconnect for critical resources
      const preconnect = document.createElement("link")
      preconnect.rel = "preconnect"
      preconnect.href = "https://fonts.gstatic.com"
      preconnect.crossOrigin = "anonymous"
      head.appendChild(preconnect)
    }

    // Prefetch next page resources using Intersection Observer
    const prefetchResources = () => {
      const links = document.querySelectorAll('a[href^="/"], a[href^="#"]')

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const link = entry.target as HTMLAnchorElement
              if (link.href && !link.href.includes("#")) {
                const prefetchLink = document.createElement("link")
                prefetchLink.rel = "prefetch"
                prefetchLink.href = link.href
                document.head.appendChild(prefetchLink)
              }
              observer.unobserve(link)
            }
          })
        },
        { rootMargin: "100px" },
      )

      links.forEach((link) => observer.observe(link))
    }

    // Use requestIdleCallback for non-critical optimizations
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        addResourceHints()
        prefetchResources()
      })
    } else {
      setTimeout(() => {
        addResourceHints()
        prefetchResources()
      }, 2000)
    }

    // Implement memory-based caching for frequently accessed data
    const createMemoryCache = () => {
      const cache = new Map()
      const maxSize = 50

      return {
        get: (key: string) => cache.get(key),
        set: (key: string, value: any) => {
          if (cache.size >= maxSize) {
            const firstKey = cache.keys().next().value
            cache.delete(firstKey)
          }
          cache.set(key, value)
        },
        clear: () => cache.clear(),
      }
    }

    // Store cache in window for global access
    if (typeof window !== "undefined") {
      ;(window as any).performanceCache = createMemoryCache()
    }
  }, [])

  useEffect(() => {
    const cleanup = measurePerformance()
    optimizeResources()
    optimizeMemory()
    optimizeNetwork()

    // Measure initial load time
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      setMetrics((prev) => ({ ...prev, loadTime: Math.round(loadTime) }))
    }

    // Measure memory usage
    if ("memory" in performance) {
      const memory = (performance as any).memory
      const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      setMetrics((prev) => ({ ...prev, memoryUsage }))
    }

    // Measure network speed
    if ("connection" in navigator) {
      const connection = (navigator as any).connection
      const networkSpeed = connection.effectiveType || "Unknown"
      setMetrics((prev) => ({ ...prev, networkSpeed }))
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
  }, [measurePerformance, optimizeResources, optimizeMemory, optimizeNetwork])

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
      case "high":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "low":
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

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-black/80 border border-[#00D2BE] rounded-full p-2 text-[#00D2BE] hover:bg-[#00D2BE] hover:text-black transition-all duration-300 text-xs font-f1"
        title="Performance Monitor (Ctrl+Shift+P)"
      >
        ⚡
      </button>

      {/* Performance monitor */}
      <div
        ref={monitorRef}
        className="fixed top-20 right-4 z-40 bg-black/95 backdrop-blur-sm border border-[#00D2BE]/50 rounded-lg p-3 text-xs font-f1 opacity-0 translate-x-full"
        style={{ minWidth: "220px" }}
      >
        <div className="text-[#00D2BE] font-f1-bold mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00D2BE] rounded-full animate-pulse" />
          PERFORMANCE OPTIMIZER
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

          <div className="flex justify-between">
            <span className="text-neutral-400">Mode:</span>
            <span className={getOptimizationColor(optimizationLevel)}>{optimizationLevel.toUpperCase()}</span>
          </div>
        </div>

        {/* Performance bars */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 w-12">FPS</span>
            <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
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
            <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  metrics.memoryUsage < 50 ? "bg-green-400" : metrics.memoryUsage < 100 ? "bg-yellow-400" : "bg-red-400"
                }`}
                style={{ width: `${Math.min((metrics.memoryUsage / 150) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Optimization tips */}
        <div className="mt-3 p-2 bg-neutral-900 rounded text-xs">
          <div className="text-[#00D2BE] font-f1-bold mb-1">TIPS</div>
          {optimizationLevel === "low" && <div className="text-red-400">• Reduce animations</div>}
          {optimizationLevel === "medium" && <div className="text-yellow-400">• Optimize images</div>}
          {optimizationLevel === "high" && <div className="text-green-400">• Performance optimal</div>}
        </div>
      </div>
    </>
  )
}

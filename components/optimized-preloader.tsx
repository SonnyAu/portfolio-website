"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"

export default function OptimizedPreloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lightsRef = useRef<(HTMLDivElement | null)[]>([])
  const textRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const percentageRef = useRef<HTMLSpanElement>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("INITIALIZING")

  const preloadCriticalResources = useCallback(async () => {
    const criticalResources = ["/fonts/Formula1-Regular_web_0.ttf", "/fonts/Formula1-Bold_web_0.ttf"]

    const preloadPromises = criticalResources.map((resource) => {
      return new Promise((resolve) => {
        if (resource.endsWith(".ttf")) {
          // Font preloading with better error handling
          const font = new FontFace("Formula1", `url(${resource})`)
          font
            .load()
            .then(() => {
              document.fonts.add(font)
              resolve(resource)
            })
            .catch(() => {
              // Fallback to system fonts if custom fonts fail
              console.warn(`Failed to load font: ${resource}`)
              resolve(resource)
            })
        } else {
          // Generic resource preloading
          const link = document.createElement("link")
          link.rel = "preload"
          link.href = resource
          link.as = resource.endsWith(".css") ? "style" : "script"
          link.onload = () => resolve(resource)
          link.onerror = () => {
            console.warn(`Failed to preload: ${resource}`)
            resolve(resource) // Resolve anyway to continue
          }
          document.head.appendChild(link)
        }
      })
    })

    try {
      await Promise.allSettled(preloadPromises) // Use allSettled instead of all
      return true
    } catch (error) {
      console.warn("Some resources failed to preload:", error)
      return true // Continue anyway
    }
  }, [])

  useEffect(() => {
    let animationId: number
    let timelineInstance: gsap.core.Timeline

    const initializePreloader = async () => {
      // Optimized loading sequence
      const loadingSteps = [
        { progress: 20, text: "LOADING FONTS", duration: 0.3 },
        { progress: 40, text: "OPTIMIZING ASSETS", duration: 0.2 },
        { progress: 60, text: "INITIALIZING GSAP", duration: 0.2 },
        { progress: 80, text: "PREPARING UI", duration: 0.2 },
        { progress: 100, text: "READY TO RACE", duration: 0.3 },
      ]

      // Preload critical resources
      const preloadPromise = preloadCriticalResources()

      timelineInstance = gsap.timeline()

      // Optimized progress animation
      loadingSteps.forEach((step, index) => {
        timelineInstance.to(
          {},
          {
            duration: step.duration,
            onUpdate: function () {
              const prevProgress = index === 0 ? 0 : loadingSteps[index - 1].progress
              const currentProgress = gsap.utils.interpolate(prevProgress, step.progress, this.progress())
              setLoadingProgress(Math.round(currentProgress))
              setLoadingText(step.text)
            },
          },
        )
      })

      // Optimized progress bar animation
      timelineInstance.to(
        progressBarRef.current,
        {
          width: "100%",
          duration: 1.4,
          ease: "power2.inOut",
        },
        0,
      )

      // Streamlined lights sequence
      lightsRef.current.forEach((light, index) => {
        if (light) {
          timelineInstance.to(
            light,
            {
              backgroundColor: "#00D2BE",
              boxShadow: "0 0 15px #00D2BE",
              duration: 0.15,
              ease: "power2.inOut",
            },
            0.3 + index * 0.15,
          )
        }
      })

      // Quick lights off sequence
      lightsRef.current.forEach((light, index) => {
        if (light) {
          timelineInstance.to(
            light,
            {
              backgroundColor: "#2a2a2a",
              boxShadow: "none",
              duration: 0.08,
              ease: "power2.inOut",
            },
            1.2 + index * 0.05,
          )
        }
      })

      // Wait for both animation and preloading to complete
      await Promise.all([
        new Promise((resolve) => {
          timelineInstance.eventCallback("onComplete", resolve)
        }),
        preloadPromise,
      ])

      // Fast exit animation
      timelineInstance.to(containerRef.current, {
        opacity: 0,
        scale: 1.05,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.display = "none"
            // Cleanup
            timelineInstance.kill()
            if (animationId) cancelAnimationFrame(animationId)
            // Signal completion
            window.dispatchEvent(new CustomEvent("preloaderComplete"))
          }
        },
      })
    }

    initializePreloader()

    return () => {
      if (timelineInstance) timelineInstance.kill()
      if (animationId) cancelAnimationFrame(animationId)
      setLoadingProgress(0)
      setLoadingText("INITIALIZING")
    }
  }, [preloadCriticalResources])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
    >
      {/* Minimal background effects for performance */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D2BE]/10 via-transparent to-[#00D2BE]/5" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 relative z-10">
        {/* Optimized text section */}
        <div ref={textRef} className="text-center">
          <div className="text-xl md:text-3xl font-f1-bold text-[#00D2BE] mb-2">F1/DEV PORTFOLIO</div>
          <div className="text-xs md:text-sm text-neutral-400 font-f1 mb-3">{loadingText}</div>
        </div>

        {/* Optimized start lights */}
        <div className="flex items-center justify-center">
          <div className="flex space-x-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (lightsRef.current[i] = el)}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#2a2a2a] border border-neutral-700"
              />
            ))}
          </div>
        </div>

        {/* Streamlined progress section */}
        <div className="w-full max-w-xs">
          <div className="relative w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div ref={progressBarRef} className="h-full bg-[#00D2BE] rounded-full" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500 font-f1">
            <span>0%</span>
            <span ref={percentageRef} className="text-[#00D2BE] font-f1-bold">
              {loadingProgress}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

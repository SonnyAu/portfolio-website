"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

export default function AdvancedPreloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lightsRef = useRef<(HTMLDivElement | null)[]>([])
  const textRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const percentageRef = useRef<HTMLSpanElement>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("INITIALIZING SYSTEMS")

  useEffect(() => {
    const loadingSteps = [
      { progress: 15, text: "LOADING TELEMETRY DATA" },
      { progress: 30, text: "CALIBRATING SENSORS" },
      { progress: 45, text: "CONNECTING TO SERVERS" },
      { progress: 60, text: "OPTIMIZING PERFORMANCE" },
      { progress: 75, text: "LOADING ASSETS" },
      { progress: 90, text: "FINALIZING SETUP" },
      { progress: 100, text: "READY TO RACE" },
    ]

    const tl = gsap.timeline()

    // Simulate realistic loading with varying speeds
    loadingSteps.forEach((step, index) => {
      tl.to(
        {},
        {
          duration: gsap.utils.random(0.3, 0.8),
          onUpdate: function () {
            const currentProgress = gsap.utils.interpolate(
              index === 0 ? 0 : loadingSteps[index - 1].progress,
              step.progress,
              this.progress(),
            )
            setLoadingProgress(Math.round(currentProgress))
            setLoadingText(step.text)
          },
        },
      )
    })

    // Progress bar animation
    tl.to(
      progressBarRef.current,
      {
        width: "100%",
        duration: 2.5,
        ease: "power2.inOut",
      },
      0,
    )

    // Animate lights sequence with realistic F1 start lights
    lightsRef.current.forEach((light, index) => {
      if (light) {
        tl.to(
          light,
          {
            backgroundColor: "#ff0000",
            boxShadow: "0 0 20px #ff0000",
            duration: 0.2,
            ease: "power2.inOut",
          },
          0.5 + index * 0.3,
        )
      }
    })

    // Turn off lights in sequence (F1 start sequence)
    lightsRef.current.forEach((light, index) => {
      if (light) {
        tl.to(
          light,
          {
            backgroundColor: "#2a2a2a",
            boxShadow: "none",
            duration: 0.1,
            ease: "power2.inOut",
          },
          2.8 + index * 0.1,
        )
      }
    })

    // Final exit animation
    tl.to(
      containerRef.current,
      {
        opacity: 0,
        scale: 1.1,
        filter: "blur(10px)",
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.display = "none"
            // Clear the timeline to prevent memory leaks
            tl.kill()
            // Dispatch custom event for main app
            window.dispatchEvent(new CustomEvent("preloaderComplete"))
          }
        },
      },
      "+=0.3",
    )

    return () => {
      // Cleanup timeline on unmount
      tl.kill()
      // Clear loading states
      setLoadingProgress(0)
      setLoadingText("INITIALIZING SYSTEMS")
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid animate-pulse" />
      </div>

      {/* Racing stripes */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent transform -skew-y-12 scale-150 animate-pulse" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
        {/* Enhanced text section */}
        <div ref={textRef} className="text-center">
          <div className="text-2xl md:text-4xl font-f1-bold text-[#00D2BE] mb-2 relative">
            F1/DEV PORTFOLIO
            <div className="absolute -inset-2 bg-[#00D2BE]/20 blur-xl rounded-full animate-pulse" />
          </div>
          <div className="text-sm md:text-base text-neutral-400 font-f1 mb-4">{loadingText}</div>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <div className="w-2 h-2 bg-[#00D2BE] rounded-full animate-pulse" />
            <span>Optimizing for performance...</span>
          </div>
        </div>

        {/* F1 Start Lights - Enhanced */}
        <div className="flex items-center justify-center">
          <div className="flex space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="relative">
                <div
                  ref={(el) => (lightsRef.current[i] = el)}
                  className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#2a2a2a] transition-all duration-200 border-2 border-neutral-700"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced progress section */}
        <div ref={progressRef} className="w-full max-w-xs md:max-w-md">
          <div className="relative w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-[#00D2BE] to-[#00A896] rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          </div>
          <div className="flex justify-between mt-3 text-xs text-neutral-500 font-f1">
            <span>0%</span>
            <span ref={percentageRef} className="text-[#00D2BE] font-f1-bold">
              {loadingProgress}%
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-[#00D2BE] rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <span>Loading resources...</span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-[#00D2BE] opacity-30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-[#00D2BE] opacity-30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-[#00D2BE] opacity-30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-[#00D2BE] opacity-30 rounded-br-lg" />
    </div>
  )
}

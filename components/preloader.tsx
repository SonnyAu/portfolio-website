"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lightsRef = useRef<(HTMLDivElement | null)[]>([])
  const textRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // Initial setup
    gsap.set(progressBarRef.current, { width: "0%" })

    // Progress bar animation
    tl.to(progressBarRef.current, {
      width: "100%",
      duration: 2,
      ease: "power2.inOut",
    })

    // Animate lights sequence
    lightsRef.current.forEach((light, index) => {
      if (light) {
        tl.to(light, { backgroundColor: "#00D2BE", duration: 0.2, ease: "power2.inOut" }, index * 0.2)
      }
    })

    // Turn off lights in reverse
    lightsRef.current.forEach((light, index) => {
      if (light) {
        tl.to(
          light,
          { backgroundColor: "#2a2a2a", duration: 0.15, ease: "power2.inOut" },
          2.2 + (lightsRef.current.length - index - 1) * 0.05,
        )
      }
    })

    // Fade out preloader with racing-style exit
    tl.to(
      containerRef.current,
      {
        opacity: 0,
        scale: 1.1,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.display = "none"
          }
        },
      },
      "+=0.2",
    )
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Text Section */}
        <div ref={textRef} className="text-center">
          <div className="text-2xl md:text-3xl font-f1-bold text-[#00D2BE] mb-2">INITIALIZING</div>
          <div className="text-sm text-neutral-400 font-f1">SYSTEM STARTUP</div>
        </div>

        {/* Startup Lights - Perfectly Centered */}
        <div className="flex items-center justify-center">
          <div className="flex space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (lightsRef.current[i] = el)}
                className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#2a2a2a] transition-all duration-200"
              />
            ))}
          </div>
        </div>

        {/* Progress Bar Section */}
        <div ref={progressRef} className="w-full max-w-xs md:max-w-sm">
          <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div ref={progressBarRef} className="h-full bg-[#00D2BE] rounded-full" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500 font-f1">
            <span>0%</span>
            <span>LOADING...</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

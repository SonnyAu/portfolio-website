"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lightsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const tl = gsap.timeline()

    // Animate lights
    lightsRef.current.forEach((light, index) => {
      if (light) {
        tl.to(light, { backgroundColor: "#ff3333", duration: 0.3, ease: "power2.inOut" }, index * 0.3)
      }
    })

    // Turn off lights
    lightsRef.current.forEach((light, index) => {
      if (light) {
        tl.to(light, { backgroundColor: "#2a2a2a", duration: 0.2, ease: "power2.inOut" }, 1.6 + index * 0.05)
      }
    })

    // Fade out preloader
    tl.to(
      containerRef.current,
      {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.display = "none" // Completely remove from flow
          }
        },
      },
      "+=0.1", // Start fade out slightly after lights turn off
    )
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex space-x-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} ref={(el) => (lightsRef.current[i] = el)} className="w-6 h-6 rounded-full bg-[#2a2a2a]" />
        ))}
      </div>
    </div>
  )
}

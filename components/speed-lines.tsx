"use client"

import { useEffect, useRef, useState, memo } from "react"
import { gsap } from "gsap"

const SpeedLines = memo(function SpeedLines() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Check performance constraints
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false
    const isMobile = window.innerWidth < 768

    // Skip on low-end devices, mobile, or reduced motion preference for better performance
    if (prefersReducedMotion || (isLowEndDevice && isMobile)) {
      setShouldRender(false)
      return
    }

    // Adaptive number of lines based on device performance
    const lineCount = isLowEndDevice ? 8 : isMobile ? 10 : 15
    const lines: HTMLElement[] = []

    // Create speed lines with optimized settings
    for (let i = 0; i < lineCount; i++) {
      const line = document.createElement("div")
      line.className = "speed-line"
      line.style.cssText = `
        position: absolute;
        width: 1px;
        height: 80px;
        background: linear-gradient(to bottom, transparent, #00D2BE, transparent);
        opacity: 0;
        top: ${Math.random() * 100}%;
        right: -10px;
        will-change: transform;
        contain: layout style paint;
      `
      container.appendChild(line)
      lines.push(line)

      // Animate speed lines with reduced frequency
      gsap.to(line, {
        x: -window.innerWidth - 100,
        opacity: 0.2,
        duration: gsap.utils.random(2, 4),
        delay: gsap.utils.random(0, 3),
        repeat: -1,
        ease: "none",
      })
    }

    return () => {
      lines.forEach(line => gsap.killTweensOf(line))
      if (container) container.innerHTML = ""
    }
  }, [])

  if (!shouldRender) return null

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10" aria-hidden="true" />
})

export default SpeedLines

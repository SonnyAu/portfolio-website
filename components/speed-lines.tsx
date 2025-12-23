"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function SpeedLines() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Reduce animations on low-end devices and for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
    
    if (prefersReducedMotion) return

    // Adaptive number of lines based on device performance
    const lineCount = isLowEndDevice ? 10 : 20
    const lines: HTMLElement[] = []

    // Create speed lines
    for (let i = 0; i < lineCount; i++) {
      const line = document.createElement("div")
      line.className = "speed-line"
      line.style.cssText = `
        position: absolute;
        width: 2px;
        height: 100px;
        background: linear-gradient(to bottom, transparent, #00D2BE, transparent);
        opacity: 0;
        top: ${Math.random() * 100}%;
        right: -10px;
        will-change: transform;
      `
      container.appendChild(line)
      lines.push(line)

      // Animate speed lines
      gsap.to(line, {
        x: -window.innerWidth - 100,
        opacity: 0.3,
        duration: gsap.utils.random(1, 3),
        delay: gsap.utils.random(0, 2),
        repeat: -1,
        ease: "none",
      })
    }

    return () => {
      // Cleanup animations before removing elements
      lines.forEach(line => gsap.killTweensOf(line))
      container.innerHTML = ""
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10" />
}

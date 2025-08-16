"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function SpeedLines() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create speed lines
    for (let i = 0; i < 20; i++) {
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
      `
      container.appendChild(line)

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
      container.innerHTML = ""
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10" />
}

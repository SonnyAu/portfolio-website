"use client"

import { useEffect, useRef, useState, memo } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const F1TelemetryBackground = memo(function F1TelemetryBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const telemetryRef = useRef<SVGSVGElement>(null)
  const dataStreamRef = useRef<HTMLDivElement>(null)
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  // Listen for preloader completion before starting animations
  useEffect(() => {
    // Check performance constraints early
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false
    const isMobile = window.innerWidth < 768

    // Disable on low-end mobile devices for better performance
    if (prefersReducedMotion || (isLowEndDevice && isMobile)) {
      setShouldRender(false)
      return
    }

    // Check if preloader already completed
    if (document.body.classList.contains("preloader-complete")) {
      setIsPreloaderComplete(true)
      return
    }

    const handlePreloaderComplete = () => {
      setIsPreloaderComplete(true)
    }

    window.addEventListener("preloaderComplete", handlePreloaderComplete)
    return () => {
      window.removeEventListener("preloaderComplete", handlePreloaderComplete)
    }
  }, [])

  useEffect(() => {
    if (!isPreloaderComplete || !shouldRender) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false

    if (prefersReducedMotion) return

    // Simplified telemetry animation for better performance
    if (telemetryRef.current) {
      const paths = telemetryRef.current.querySelectorAll("path")

      // Limit to just 2 paths for animation on lower-end devices
      const maxPaths = isLowEndDevice ? 2 : Math.min(3, paths.length)

      Array.from(paths).slice(0, maxPaths).forEach((path, index) => {
        gsap.fromTo(
          path,
          { strokeDasharray: "0 2000" },
          {
            strokeDasharray: "2000 0",
            duration: 6 + index,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 2,
          },
        )
      })
    }

    // Reduced particle count for better performance
    const createDataParticles = () => {
      const container = dataStreamRef.current
      if (!container) return

      const particleCount = isLowEndDevice ? 10 : 15

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div")
        particle.className = "absolute w-1 h-1 bg-[#00D2BE] rounded-full opacity-20"
        particle.style.cssText = `
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          contain: layout style paint;
        `
        container.appendChild(particle)

        gsap.to(particle, {
          x: `+=${Math.random() * 200 - 100}`,
          y: `+=${Math.random() * 200 - 100}`,
          opacity: Math.random() * 0.4,
          scale: gsap.utils.random(0.5, 1.5),
          duration: gsap.utils.random(12, 20),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
    }

    createDataParticles()

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      if (dataStreamRef.current) {
        dataStreamRef.current.innerHTML = ""
      }
    }
  }, [isPreloaderComplete, shouldRender])

  if (!shouldRender) return null

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Simplified F1 Telemetry Data Visualization */}
      <svg
        ref={telemetryRef}
        className="absolute inset-0 w-full h-full opacity-5"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="telemetryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2BE" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#00A896" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00D2BE" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Reduced telemetry lines for performance */}
        <g opacity="0.4">
          <path
            d="M0,300 Q400,250 800,300 T1600,300 Q1800,350 1920,300"
            stroke="url(#telemetryGradient)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0,600 Q300,550 600,600 T1200,600 Q1500,650 1920,600"
            stroke="url(#telemetryGradient)"
            strokeWidth="1"
            fill="none"
          />
        </g>
      </svg>

      {/* Data Stream Particles - reduced for performance */}
      <div ref={dataStreamRef} className="absolute inset-0 opacity-20" />

      {/* Simplified Racing Line */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent" />
      </div>
    </div>
  )
})

export default F1TelemetryBackground

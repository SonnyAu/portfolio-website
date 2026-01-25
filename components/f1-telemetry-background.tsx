"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function F1TelemetryBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const telemetryRef = useRef<SVGSVGElement>(null)
  const brakeDiscsRef = useRef<HTMLDivElement>(null)
  const dataStreamRef = useRef<HTMLDivElement>(null)
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false)

  // Listen for preloader completion before starting animations
  useEffect(() => {
    // Check if preloader already completed (e.g., on navigation back)
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
    // Wait for preloader to complete before starting animations
    if (!isPreloaderComplete) return

    // Animate telemetry data streams (reduce on low-end devices)
    if (telemetryRef.current) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
      
      if (prefersReducedMotion || isLowEndDevice) return

      const paths = telemetryRef.current.querySelectorAll("path")
      const circles = telemetryRef.current.querySelectorAll("circle")

      // Limit animations for performance
      const maxPaths = isLowEndDevice ? 3 : paths.length
      const maxCircles = isLowEndDevice ? 5 : circles.length

      Array.from(paths).slice(0, maxPaths).forEach((path, index) => {
        gsap.fromTo(
          path,
          { strokeDasharray: "0 2000" },
          {
            strokeDasharray: "2000 0",
            duration: 4 + index * 0.8,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 1,
          },
        )
      })

      Array.from(circles).slice(0, maxCircles).forEach((circle, index) => {
        gsap.to(circle, {
          opacity: gsap.utils.random(0.2, 0.8),
          scale: gsap.utils.random(0.8, 1.2),
          duration: gsap.utils.random(2, 4),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2,
        })
      })
    }

    // Scroll-triggered brake disc effects (optimized - only on desktop)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
    
    if (!prefersReducedMotion && !isLowEndDevice) {
      const sections = document.querySelectorAll(".section")
      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          onEnter: () => {
            // Trigger brake glow effect
            if (brakeDiscsRef.current) {
              const brakeDisc = brakeDiscsRef.current.children[index % 4]
              if (brakeDisc) {
                gsap.to(brakeDisc, {
                  boxShadow: "0 0 40px rgba(255, 100, 100, 0.4), 0 0 80px rgba(255, 100, 100, 0.2)",
                  duration: 0.8,
                  ease: "power2.out",
                  yoyo: true,
                  repeat: 1,
                })
              }
            }
          },
          onLeave: () => {
            // Fade brake glow
            if (brakeDiscsRef.current) {
              const brakeDisc = brakeDiscsRef.current.children[index % 4]
              if (brakeDisc) {
                gsap.to(brakeDisc, {
                  boxShadow: "0 0 0 rgba(255, 100, 100, 0)",
                  duration: 1,
                  ease: "power2.out",
                })
              }
            }
          },
        })
      })
    }

    // Data stream particles
    const createDataParticles = () => {
      const container = dataStreamRef.current
      if (!container) return

      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div")
        particle.className = "absolute w-1 h-1 bg-[#00D2BE] rounded-full opacity-30"
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`
        container.appendChild(particle)

        gsap.to(particle, {
          x: `+=${Math.random() * 400 - 200}`,
          y: `+=${Math.random() * 400 - 200}`,
          opacity: Math.random() * 0.6,
          scale: gsap.utils.random(0.5, 2),
          duration: gsap.utils.random(8, 15),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
    }

    createDataParticles()

    // Continuous scroll-based animations
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress

        // Animate telemetry data based on scroll
        if (telemetryRef.current) {
          gsap.to(telemetryRef.current, {
            rotation: progress * 5,
            duration: 0.3,
          })
        }

        // Update data stream intensity
        if (dataStreamRef.current) {
          gsap.to(dataStreamRef.current, {
            opacity: 0.3 + progress * 0.4,
            duration: 0.3,
          })
        }
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      if (dataStreamRef.current) {
        dataStreamRef.current.innerHTML = ""
      }
    }
  }, [isPreloaderComplete])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* F1 Telemetry Data Visualization */}
      <svg
        ref={telemetryRef}
        className="absolute inset-0 w-full h-full opacity-8"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="telemetryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2BE" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#00A896" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00D2BE" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D2BE" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="brakeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6464" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#FF9664" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Telemetry Data Lines */}
        <g opacity="0.6">
          <path
            d="M0,200 Q200,150 400,200 T800,200 Q1200,250 1600,200 T1920,250"
            stroke="url(#telemetryGradient)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0,400 Q300,350 600,400 T1200,400 Q1500,450 1800,400 T1920,450"
            stroke="url(#telemetryGradient)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0,600 Q250,550 500,600 T1000,600 Q1300,650 1600,600 T1920,650"
            stroke="url(#telemetryGradient)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0,800 Q400,750 800,800 T1600,800 Q1800,850 1920,800"
            stroke="url(#telemetryGradient)"
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* Speed Data Visualization */}
        <g opacity="0.4">
          <rect x="100" y="180" width="200" height="4" fill="url(#speedGradient)" />
          <rect x="300" y="380" width="250" height="4" fill="url(#speedGradient)" />
          <rect x="200" y="580" width="180" height="4" fill="url(#speedGradient)" />
          <rect x="400" y="780" width="220" height="4" fill="url(#speedGradient)" />
        </g>

        {/* Telemetry Data Points */}
        <g opacity="0.5">
          <circle cx="200" cy="200" r="3" fill="#00D2BE" />
          <circle cx="600" cy="400" r="2.5" fill="#00D2BE" />
          <circle cx="400" cy="600" r="2" fill="#00D2BE" />
          <circle cx="800" cy="800" r="3.5" fill="#00D2BE" />
          <circle cx="1200" cy="300" r="2" fill="#00D2BE" />
          <circle cx="1600" cy="500" r="2.5" fill="#00D2BE" />
          <circle cx="1400" cy="700" r="3" fill="#00D2BE" />
        </g>

        {/* Sector Timing Arcs */}
        <g opacity="0.3">
          <path d="M 100 100 A 50 50 0 0 1 200 100" stroke="#00D2BE" strokeWidth="2" fill="none" />
          <path d="M 1600 100 A 50 50 0 0 1 1700 100" stroke="#00D2BE" strokeWidth="2" fill="none" />
          <path d="M 100 900 A 50 50 0 0 1 200 900" stroke="#00D2BE" strokeWidth="2" fill="none" />
          <path d="M 1600 900 A 50 50 0 0 1 1700 900" stroke="#00D2BE" strokeWidth="2" fill="none" />
        </g>
      </svg>

      {/* Brake Disc Glow Effects */}
      <div ref={brakeDiscsRef} className="absolute inset-0">
        <div
          className="absolute top-20 left-20 w-16 h-16 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255, 100, 100, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-20 right-20 w-16 h-16 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255, 100, 100, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-20 left-20 w-16 h-16 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255, 100, 100, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-20 right-20 w-16 h-16 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255, 100, 100, 0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Data Stream Particles */}
      <div ref={dataStreamRef} className="absolute inset-0 opacity-30" />

      {/* Tire Track Patterns */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `
            repeating-linear-gradient(
              15deg,
              transparent,
              transparent 12px,
              rgba(0, 210, 190, 0.2) 12px,
              rgba(0, 210, 190, 0.2) 14px,
              transparent 14px,
              transparent 28px
            ),
            repeating-linear-gradient(
              75deg,
              transparent,
              transparent 8px,
              rgba(0, 210, 190, 0.1) 8px,
              rgba(0, 210, 190, 0.1) 9px,
              transparent 9px,
              transparent 24px
            )
          `,
            backgroundSize: "100% 100%, 100% 100%",
            animation: "tireRotation 25s linear infinite",
          }}
        />
      </div>

      {/* Racing Line Visualization */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent transform -rotate-2" />
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00A896] to-transparent transform rotate-1" />
        <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent transform -rotate-1" />
      </div>

      {/* Corner Telemetry Displays */}
      <div className="absolute top-4 left-4 w-24 h-16 border border-[#00D2BE] opacity-20 rounded telemetry-pattern" />
      <div className="absolute top-4 right-4 w-24 h-16 border border-[#00D2BE] opacity-20 rounded telemetry-pattern" />
      <div className="absolute bottom-4 left-4 w-24 h-16 border border-[#00D2BE] opacity-20 rounded telemetry-pattern" />
      <div className="absolute bottom-4 right-4 w-24 h-16 border border-[#00D2BE] opacity-20 rounded telemetry-pattern" />
    </div>
  )
}

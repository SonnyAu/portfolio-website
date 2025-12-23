"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowDown, Zap, MapPin, GraduationCap, Trophy, Target, Activity, Cpu } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export default function EnhancedHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const telemetryRef = useRef<HTMLDivElement>(null)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [telemetryData, setTelemetryData] = useState({
    speed: 0,
    rpm: 0,
    gear: 1,
    temp: 85,
    fuel: 100,
  })

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    checkMobile()
    
    // Throttle resize handler for performance
    let ticking = false
    const handleResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkMobile()
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [checkMobile])

  // Simulate F1 telemetry data (throttled for performance)
  useEffect(() => {
    let lastUpdate = 0
    const throttleMs = 100 // Update max every 100ms
    let rafId: number | null = null

    const updateTelemetry = (timestamp: number) => {
      if (timestamp - lastUpdate >= throttleMs) {
        setTelemetryData((prev) => ({
          speed: Math.min(prev.speed + Math.random() * 10 - 5, 320),
          rpm: Math.min(prev.rpm + Math.random() * 500 - 250, 15000),
          gear: Math.max(1, Math.min(8, prev.gear + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))),
          temp: Math.max(70, Math.min(110, prev.temp + Math.random() * 4 - 2)),
          fuel: Math.max(0, prev.fuel - Math.random() * 0.1),
        }))
        lastUpdate = timestamp
      }
      rafId = requestAnimationFrame(updateTelemetry)
    }

    rafId = requestAnimationFrame(updateTelemetry)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  useEffect(() => {
    if (isAnimationComplete) return

    const ctx = gsap.context(() => {
      // Kill any existing animations
      gsap.killTweensOf([
        line1Ref.current,
        line2Ref.current,
        subtextRef.current,
        scrollRef.current,
        statsRef.current?.children,
        hudRef.current?.children,
        metricsRef.current?.children,
        telemetryRef.current?.children,
      ])

      // Enhanced initial states
      gsap.set([line1Ref.current, line2Ref.current], {
        y: 120,
        opacity: 0,
        rotationX: 60,
        transformOrigin: "50% 100%",
        scale: 0.8,
      })

      gsap.set(subtextRef.current, { y: 60, opacity: 0, scale: 0.9 })
      gsap.set(scrollRef.current, { y: 40, opacity: 0 })

      if (statsRef.current?.children) {
        gsap.set(statsRef.current.children, { y: 40, opacity: 0, scale: 0.8, rotationY: 15 })
      }

      if (hudRef.current?.children) {
        gsap.set(hudRef.current.children, { x: -60, opacity: 0, rotationZ: -5 })
      }

      if (metricsRef.current?.children) {
        gsap.set(metricsRef.current.children, { x: 60, opacity: 0, rotationZ: 5 })
      }

      if (telemetryRef.current?.children) {
        gsap.set(telemetryRef.current.children, { y: -30, opacity: 0, scale: 0.7 })
      }

      // Enhanced timeline with F1 start sequence timing
      const tl = gsap.timeline({
        delay: 2.8,
        onComplete: () => {
          setIsAnimationComplete(true)
          // Advanced floating animations
          if (!isMobile) {
            gsap.to(statsRef.current, {
              y: -8,
              rotation: 0.5,
              duration: 4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            })
          }
        },
      })

      // F1 Telemetry displays first (like real F1 startup)
      if (telemetryRef.current?.children) {
        tl.to(telemetryRef.current.children, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
        })
      }

      // HUD systems online
      if (hudRef.current?.children) {
        tl.to(
          hudRef.current.children,
          {
            x: 0,
            opacity: 0.95,
            rotationZ: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
          },
          "-=0.6",
        )
      }

      // Metrics telemetry
      if (metricsRef.current?.children) {
        tl.to(
          metricsRef.current.children,
          {
            x: 0,
            opacity: 0.95,
            rotationZ: 0,
            duration: 1,
            stagger: 0.12,
            ease: "power3.out",
          },
          "-=0.8",
        )
      }

      // Main title with championship entrance
      tl.to(
        line1Ref.current,
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          scale: 1,
          duration: 1.4,
          ease: "back.out(1.4)",
        },
        "-=0.5",
      )

      // Subtitle with racing precision
      tl.to(
        line2Ref.current,
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          scale: 1,
          duration: 1.4,
          ease: "back.out(1.4)",
        },
        "-=1.0",
      )

      // Description with telemetry timing
      tl.to(
        subtextRef.current,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=0.8",
      )

      // Performance stats with podium reveal
      if (statsRef.current?.children) {
        tl.to(
          statsRef.current.children,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotationY: 0,
            stagger: 0.2,
            duration: 1,
            ease: "back.out(1.5)",
          },
          "-=0.6",
        )
      }

      // Scroll indicator with checkered flag timing
      tl.to(
        scrollRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => {
            if (!isMobile) {
              gsap.to(scrollRef.current, {
                y: -6,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              })
            }
          },
        },
        "-=0.3",
      )
    }, containerRef)

    return () => ctx.revert()
  }, [isAnimationComplete, isMobile])

  const handleScrollClick = useCallback(() => {
    const aboutSection = document.getElementById("about")
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center p-2 md:p-4 bg-grid overflow-hidden"
    >
      {/* Enhanced background overlays with F1 atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-gradient-radial from-[#00D2BE]/8 via-[#00D2BE]/3 to-transparent" />
      <div className="absolute inset-0 bg-gradient-conic from-[#00D2BE]/5 via-transparent to-[#00D2BE]/5 opacity-30" />

      {/* F1 Telemetry Data Stream - Moved to top with better spacing */}
      <div ref={telemetryRef} className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex gap-1 md:gap-2 text-xs font-f1">
          <div className="bg-black/80 backdrop-blur-sm border border-[#00D2BE]/40 rounded px-1.5 py-0.5 md:px-2 md:py-1">
            <span className="text-[#00D2BE]">SECTOR:</span> <span className="text-green-400">1:23.456</span>
          </div>
          <div className="bg-black/80 backdrop-blur-sm border border-[#00D2BE]/40 rounded px-1.5 py-0.5 md:px-2 md:py-1">
            <span className="text-[#00D2BE]">LAP:</span> <span className="text-white">1/∞</span>
          </div>
          <div className="bg-black/80 backdrop-blur-sm border border-[#00D2BE]/40 rounded px-1.5 py-0.5 md:px-2 md:py-1">
            <span className="text-[#00D2BE]">POS:</span> <span className="text-yellow-400">P1</span>
          </div>
        </div>
      </div>

      {/* Enhanced Racing HUD - Repositioned to avoid title overlap */}
      <div ref={hudRef} className="absolute top-16 md:top-20 left-2 md:left-4 text-[#00D2BE] font-f1 text-xs z-20">
        <div className="bg-black/70 backdrop-blur-sm border border-[#00D2BE]/40 rounded-lg p-2 md:p-3 space-y-1.5 max-w-[140px] md:max-w-none">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity size={10} className="animate-pulse" />
            <span className="text-[#00D2BE] font-f1-bold text-xs">DRIVER</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1">
              <MapPin size={6} />
              <span className="truncate">San Jose, CA</span>
            </div>
            <div className="flex items-center gap-1">
              <GraduationCap size={6} />
              <span>SJSU 3.75</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={6} />
              <span>Scholar</span>
            </div>
            <div className="flex items-center gap-1">
              <Target size={6} />
              <span className="text-green-400">READY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Performance Metrics - Repositioned to avoid title overlap */}
      <div
        ref={metricsRef}
        className="absolute top-16 md:top-20 right-2 md:right-4 text-[#00D2BE] font-f1 text-xs z-20"
      >
        <div className="bg-black/70 backdrop-blur-sm border border-[#00D2BE]/40 rounded-lg p-2 md:p-3 space-y-1.5 max-w-[120px] md:max-w-none">
          <div className="flex items-center gap-1.5 mb-2">
            <Cpu size={10} className="animate-pulse" />
            <span className="text-[#00D2BE] font-f1-bold text-xs">PERF</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-2 text-xs">
              <span>EXP:</span>
              <span className="text-green-400">3.5Y</span>
            </div>
            <div className="flex justify-between gap-2 text-xs">
              <span>USR:</span>
              <span className="text-green-400">1K+</span>
            </div>
            <div className="flex justify-between gap-2 text-xs">
              <span>BST:</span>
              <span className="text-yellow-400">900%</span>
            </div>
            <div className="flex justify-between gap-2 text-xs">
              <span>UP:</span>
              <span className="text-green-400">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-2">
        {/* Enhanced typography with F1 championship styling - Added margin top for mobile */}
        <div className="mt-16 md:mt-0">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-f1-bold tracking-tighter uppercase leading-[0.8] md:leading-[0.85]">
            <span ref={line1Ref} className="block relative">
              Sonny Au
              <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-3 h-3 md:w-6 md:h-6 bg-[#00D2BE] rounded-full animate-pulse" />
            </span>
            <span ref={line2Ref} className="block text-[#00D2BE] relative mt-1 md:mt-2">
              Software Engineer
              <Zap
                className="absolute -right-2 md:-right-6 top-0 md:top-1 text-[#00D2BE] animate-pulse"
                size={isMobile ? 16 : 24}
              />
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent opacity-60 animate-pulse" />
              <div className="absolute -bottom-2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#00D2BE] to-yellow-400 opacity-40" />
            </span>
          </h1>

          <p
            ref={subtextRef}
            className="mt-4 md:mt-8 max-w-2xl md:max-w-3xl mx-auto text-xs sm:text-sm md:text-lg lg:text-xl text-neutral-300 font-f1 px-2 leading-relaxed"
          >
            President's Scholar at SJSU engineering high-performance applications from React Native mobile apps to
            machine learning models. Co-founder driving innovation in food-tech with championship-level precision and
            scalability.
          </p>

          {/* Enhanced F1-style performance stats */}
          <div
            ref={statsRef}
            className="mt-6 md:mt-12 grid grid-cols-3 gap-2 md:gap-8 max-w-xl md:max-w-3xl mx-auto px-2"
          >
            <div className="text-center group">
              <div className="relative bg-black/60 backdrop-blur-sm border border-neutral-800 rounded-lg p-3 md:p-6 hover:border-[#00D2BE] transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-[#00D2BE]/20">
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <div className="text-sm md:text-2xl lg:text-3xl font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors duration-300">
                  3.5+
                </div>
                <div className="text-xs md:text-sm text-neutral-400 font-f1 mb-2">YEARS EXP</div>
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00D2BE] to-green-400 rounded-full w-4/5 animate-pulse" />
                </div>
                <div className="text-xs text-[#00D2BE] mt-1 opacity-60">EXPERT</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="relative bg-black/60 backdrop-blur-sm border border-neutral-800 rounded-lg p-3 md:p-6 hover:border-[#00D2BE] transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-[#00D2BE]/20">
                <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <div className="text-sm md:text-2xl lg:text-3xl font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors duration-300">
                  1000+
                </div>
                <div className="text-xs md:text-sm text-neutral-400 font-f1 mb-2">USERS</div>
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00D2BE] to-yellow-400 rounded-full w-full animate-pulse" />
                </div>
                <div className="text-xs text-[#00D2BE] mt-1 opacity-60">IMPACT</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="relative bg-black/60 backdrop-blur-sm border border-neutral-800 rounded-lg p-3 md:p-6 hover:border-[#00D2BE] transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-[#00D2BE]/20">
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <div className="text-sm md:text-2xl lg:text-3xl font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors duration-300">
                  900%
                </div>
                <div className="text-xs md:text-sm text-neutral-400 font-f1 mb-2">EFFICIENCY</div>
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00D2BE] to-red-400 rounded-full w-5/6 animate-pulse" />
                </div>
                <div className="text-xs text-[#00D2BE] mt-1 opacity-60">BOOST</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced scroll indicator with F1 checkered flag styling */}
      <div
        ref={scrollRef}
        className="absolute bottom-6 md:bottom-10 flex flex-col items-center text-neutral-400 font-f1 cursor-pointer group z-20"
        onClick={handleScrollClick}
      >
        <div className="relative mb-2">
          <div className="w-8 h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent mb-1" />
          <div className="w-6 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
        </div>
        <span className="text-xs mb-2 tracking-wider group-hover:text-[#00D2BE] transition-colors duration-300">
          SCROLL TO EXPLORE
        </span>
        <div className="relative">
          <ArrowDown className="group-hover:text-[#00D2BE] transition-colors duration-300" size={16} />
          <div className="absolute inset-0 bg-[#00D2BE] rounded-full opacity-0 group-hover:opacity-30 animate-ping" />
        </div>
      </div>

      {/* Enhanced racing line decorations */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent opacity-40" />
      <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />

      {/* F1 Corner markers */}
      <div className="absolute top-1/2 left-0 w-1 h-16 bg-gradient-to-b from-transparent via-[#00D2BE] to-transparent opacity-30" />
      <div className="absolute top-1/2 right-0 w-1 h-16 bg-gradient-to-b from-transparent via-[#00D2BE] to-transparent opacity-30" />
    </section>
  )
}

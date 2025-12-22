"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import { ArrowDown, Zap, MapPin, GraduationCap, Gauge, Trophy, Target } from "lucide-react"

export default function OptimizedHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [checkMobile])

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
      ])

      // Optimized initial states
      gsap.set([line1Ref.current, line2Ref.current], {
        y: 60,
        opacity: 0,
        rotationX: 30,
        transformOrigin: "50% 100%",
      })

      gsap.set(subtextRef.current, { y: 30, opacity: 0 })
      gsap.set(scrollRef.current, { y: 20, opacity: 0 })

      if (statsRef.current?.children) {
        gsap.set(statsRef.current.children, { y: 20, opacity: 0, scale: 0.95 })
      }

      if (hudRef.current?.children) {
        gsap.set(hudRef.current.children, { x: -20, opacity: 0 })
      }

      if (metricsRef.current?.children) {
        gsap.set(metricsRef.current.children, { x: 20, opacity: 0 })
      }

      // Optimized timeline with reduced delay
      const tl = gsap.timeline({
        delay: 2.5, // Reduced from 3.5s
        onComplete: () => {
          setIsAnimationComplete(true)
          // Subtle floating animation
          if (statsRef.current && !isMobile) {
            gsap.to(statsRef.current, {
              y: -3,
              duration: 4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            })
          }
        },
      })

      // Faster HUD animations
      if (hudRef.current?.children) {
        tl.to(hudRef.current.children, {
          x: 0,
          opacity: 0.9,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
        })
      }

      if (metricsRef.current?.children) {
        tl.to(
          metricsRef.current.children,
          {
            x: 0,
            opacity: 0.9,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.4",
        )
      }

      // Optimized title animations
      tl.to(
        line1Ref.current,
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1,
          ease: "back.out(1.4)",
        },
        "-=0.3",
      )

      tl.to(
        line2Ref.current,
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1,
          ease: "back.out(1.4)",
        },
        "-=0.7",
      )

      tl.to(
        subtextRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.5",
      )

      if (statsRef.current?.children) {
        tl.to(
          statsRef.current.children,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: "back.out(1.4)",
          },
          "-=0.3",
        )
      }

      tl.to(
        scrollRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            if (!isMobile) {
              gsap.to(scrollRef.current, {
                y: -3,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              })
            }
          },
        },
        "-=0.2",
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
      {/* Optimized background overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-gradient-radial from-[#00D2BE]/3 via-transparent to-transparent" />

      {/* Optimized HUD overlay */}
      <div ref={hudRef} className="absolute top-16 left-2 md:left-8 text-[#00D2BE] font-f1 text-xs md:text-sm z-20">
        <div className="bg-black/70 backdrop-blur-sm border border-[#00D2BE]/30 rounded-lg p-2 md:p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Gauge size={12} className="animate-pulse" />
            <span className="text-[#00D2BE] font-f1-bold text-xs">STATUS</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin size={8} />
            <span>San Jose, CA</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <GraduationCap size={8} />
            <span>SJSU - 3.75 GPA</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Trophy size={8} />
            <span>President's Scholar</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Target size={8} />
            <span className="text-green-400">AVAILABLE</span>
          </div>
        </div>
      </div>

      {/* Optimized metrics HUD */}
      <div ref={metricsRef} className="absolute top-16 right-2 md:right-8 text-[#00D2BE] font-f1 text-xs z-20">
        <div className="bg-black/70 backdrop-blur-sm border border-[#00D2BE]/30 rounded-lg p-2 space-y-1">
          <div className="text-[#00D2BE] font-f1-bold text-xs mb-1.5">TELEMETRY</div>
          <div className="flex justify-between gap-3 text-xs">
            <span>EXP:</span>
            <span className="text-green-400">3.5Y</span>
          </div>
          <div className="flex justify-between gap-3 text-xs">
            <span>USERS:</span>
            <span className="text-green-400">1K+</span>
          </div>
          <div className="flex justify-between gap-3 text-xs">
            <span>PERF:</span>
            <span className="text-green-400">900%</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-2">
        {/* Optimized typography with better scaling */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-f1-bold tracking-tighter uppercase leading-[0.85] md:leading-[0.9]">
          <span ref={line1Ref} className="block relative">
            Sonny Au
          </span>
          <span ref={line2Ref} className="block text-[#00D2BE] relative mt-1 md:mt-2">
            Software Engineer
            <Zap className="absolute -right-2 md:-right-6 top-0 md:top-1 text-[#00D2BE]" size={isMobile ? 16 : 20} />
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent opacity-50" />
          </span>
        </h1>

        <p
          ref={subtextRef}
          className="mt-3 md:mt-6 max-w-2xl mx-auto text-xs sm:text-sm md:text-lg lg:text-xl text-neutral-300 font-f1 px-2 leading-relaxed"
        >
          President's Scholar at SJSU engineering high-performance applications from React Native mobile apps to machine
          learning models. Co-founder driving innovation in food-tech with precision and scalability.
        </p>

        {/* Optimized stats with better mobile layout */}
        <div ref={statsRef} className="mt-4 md:mt-8 grid grid-cols-3 gap-2 md:gap-6 max-w-xl md:max-w-2xl mx-auto px-2">
          <div className="text-center group">
            <div className="bg-black/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-2 md:p-4 hover:border-[#00D2BE] transition-all duration-300 hover:scale-105">
              <div className="text-sm md:text-2xl lg:text-3xl font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors">
                3.5+
              </div>
              <div className="text-xs md:text-sm text-neutral-400 font-f1">YEARS EXP</div>
              <div className="w-full h-0.5 md:h-1 bg-neutral-800 rounded-full mt-1 md:mt-2 overflow-hidden">
                <div className="h-full bg-[#00D2BE] rounded-full w-4/5" />
              </div>
            </div>
          </div>
          <div className="text-center group">
            <div className="bg-black/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-2 md:p-4 hover:border-[#00D2BE] transition-all duration-300 hover:scale-105">
              <div className="text-sm md:text-2xl lg:text-3xl font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors">
                1000+
              </div>
              <div className="text-xs md:text-sm text-neutral-400 font-f1">USERS</div>
              <div className="w-full h-0.5 md:h-1 bg-neutral-800 rounded-full mt-1 md:mt-2 overflow-hidden">
                <div className="h-full bg-[#00D2BE] rounded-full w-full" />
              </div>
            </div>
          </div>
          <div className="text-center group">
            <div className="bg-black/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-2 md:p-4 hover:border-[#00D2BE] transition-all duration-300 hover:scale-105">
              <div className="text-sm md:text-2xl lg:text-3xl font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors">
                900%
              </div>
              <div className="text-xs md:text-sm text-neutral-400 font-f1">EFFICIENCY</div>
              <div className="w-full h-0.5 md:h-1 bg-neutral-800 rounded-full mt-1 md:mt-2 overflow-hidden">
                <div className="h-full bg-[#00D2BE] rounded-full w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="absolute bottom-4 md:bottom-8 flex flex-col items-center text-neutral-400 font-f1 cursor-pointer group z-20"
        onClick={handleScrollClick}
      >
        <span className="text-xs mb-1 tracking-wider group-hover:text-[#00D2BE] transition-colors">
          SCROLL TO EXPLORE
        </span>
        <div className="relative">
          <ArrowDown className="group-hover:text-[#00D2BE] transition-colors" size={14} />
          <div className="absolute inset-0 bg-[#00D2BE] rounded-full opacity-0 group-hover:opacity-20 animate-ping" />
        </div>
      </div>

      {/* Racing line decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent opacity-30" />
    </section>
  )
}

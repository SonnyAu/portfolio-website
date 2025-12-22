"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ArrowDown, Zap, MapPin, GraduationCap, Gauge, Trophy, Target } from "lucide-react"

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)

  useEffect(() => {
    // Prevent multiple animations by checking if already animated
    if (isAnimationComplete) return

    const ctx = gsap.context(() => {
      // Kill any existing animations on these elements
      gsap.killTweensOf([
        line1Ref.current,
        line2Ref.current,
        subtextRef.current,
        scrollRef.current,
        statsRef.current?.children,
        hudRef.current?.children,
        metricsRef.current?.children,
      ])

      // Set initial states
      gsap.set([line1Ref.current, line2Ref.current], {
        y: 100,
        opacity: 0,
        rotationX: 45,
        transformOrigin: "50% 100%",
      })

      gsap.set(subtextRef.current, { y: 50, opacity: 0 })
      gsap.set(scrollRef.current, { y: 30, opacity: 0 })

      if (statsRef.current?.children) {
        gsap.set(statsRef.current.children, { y: 30, opacity: 0, scale: 0.9 })
      }

      if (hudRef.current?.children) {
        gsap.set(hudRef.current.children, { x: -30, opacity: 0 })
      }

      if (metricsRef.current?.children) {
        gsap.set(metricsRef.current.children, { x: 30, opacity: 0 })
      }

      // Create main timeline
      const tl = gsap.timeline({
        delay: 3.5,
        onComplete: () => {
          setIsAnimationComplete(true)
          // Add subtle floating animation only after main animation completes
          if (statsRef.current) {
            gsap.to(statsRef.current, {
              y: -5,
              duration: 3,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            })
          }
        },
      })

      // HUD elements animation
      if (hudRef.current?.children) {
        tl.to(hudRef.current.children, {
          x: 0,
          opacity: 0.8,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
        })
      }

      // Metrics animation
      if (metricsRef.current?.children) {
        tl.to(
          metricsRef.current.children,
          {
            x: 0,
            opacity: 0.8,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
          },
          "-=0.6",
        )
      }

      // Main title animation
      tl.to(
        line1Ref.current,
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1.2,
          ease: "back.out(1.7)",
        },
        "-=0.4",
      )

      // Subtitle animation
      tl.to(
        line2Ref.current,
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1.2,
          ease: "back.out(1.7)",
        },
        "-=0.8",
      )

      // Description animation
      tl.to(
        subtextRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.6",
      )

      // Stats animation
      if (statsRef.current?.children) {
        tl.to(
          statsRef.current.children,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.4",
        )
      }

      // Scroll indicator animation
      tl.to(
        scrollRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            // Add bounce animation only after main animation
            gsap.to(scrollRef.current, {
              y: -5,
              duration: 1.5,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            })
          },
        },
        "-=0.2",
      )
    }, containerRef)

    // Cleanup function
    return () => {
      ctx.revert()
    }
  }, [isAnimationComplete])

  const handleScrollClick = () => {
    const aboutSection = document.getElementById("about")
    if (aboutSection) {
      // Use faster scroll with less smooth behavior
      aboutSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center p-2 md:p-4 bg-grid overflow-hidden"
    >
      {/* Background overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-gradient-radial from-[#00D2BE]/5 via-transparent to-transparent" />

      {/* Enhanced Racing HUD overlay */}
      <div ref={hudRef} className="absolute top-16 left-2 md:left-8 text-[#00D2BE] font-f1 text-xs md:text-sm z-20">
        <div className="bg-black/60 backdrop-blur-sm border border-[#00D2BE]/30 rounded-lg p-3 md:p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Gauge size={14} className="animate-pulse" />
            <span className="text-[#00D2BE] font-f1-bold">DRIVER STATUS</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <MapPin size={10} />
            <span>San Jose, CA</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <GraduationCap size={10} />
            <span>SJSU - 3.75 GPA</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Trophy size={10} />
            <span>President's Scholar</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Target size={10} />
            <span className="text-green-400">AVAILABLE</span>
          </div>
        </div>
      </div>

      {/* Performance metrics HUD */}
      <div ref={metricsRef} className="absolute top-16 right-2 md:right-8 text-[#00D2BE] font-f1 text-xs z-20">
        <div className="bg-black/60 backdrop-blur-sm border border-[#00D2BE]/30 rounded-lg p-3 space-y-1">
          <div className="text-[#00D2BE] font-f1-bold text-xs mb-2">TELEMETRY</div>
          <div className="flex justify-between gap-4">
            <span>EXP:</span>
            <span className="text-green-400">3.5Y</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>USERS:</span>
            <span className="text-green-400">1K+</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>PERF:</span>
            <span className="text-green-400">900%</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-2">
        <h1 className="text-4xl md:text-7xl lg:text-9xl font-f1-bold tracking-tighter uppercase leading-none">
          <span ref={line1Ref} className="block relative">
            Sonny Au
          </span>
          <span ref={line2Ref} className="block text-[#00D2BE] relative">
            Software Engineer
            <Zap className="absolute -right-4 md:-right-8 top-1 md:top-2 text-[#00D2BE]" size={24} />
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent opacity-50" />
          </span>
        </h1>

        <p
          ref={subtextRef}
          className="mt-4 md:mt-8 max-w-3xl mx-auto text-sm md:text-xl text-neutral-300 font-f1 px-2 leading-relaxed"
        >
          President's Scholar at SJSU engineering high-performance applications from React Native mobile apps to machine
          learning models. Co-founder driving innovation in food-tech with precision and scalability.
        </p>

        {/* Enhanced F1-style stats */}
        <div ref={statsRef} className="mt-6 md:mt-12 grid grid-cols-3 gap-3 md:gap-8 max-w-2xl mx-auto px-2">
          <div className="text-center group">
            <div className="bg-black/40 backdrop-blur-sm border border-neutral-800 rounded-lg p-3 md:p-4 hover:border-[#00D2BE] transition-all duration-300 hover:scale-105">
              <div className="text-lg md:text-3xl font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors">
                3.5+
              </div>
              <div className="text-xs md:text-sm text-neutral-400 font-f1">YEARS EXP</div>
              <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#00D2BE] rounded-full w-4/5" />
              </div>
            </div>
          </div>
          <div className="text-center group">
            <div className="bg-black/40 backdrop-blur-sm border border-neutral-800 rounded-lg p-3 md:p-4 hover:border-[#00D2BE] transition-all duration-300 hover:scale-105">
              <div className="text-lg md:text-3xl font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors">
                1000+
              </div>
              <div className="text-xs md:text-sm text-neutral-400 font-f1">USERS</div>
              <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#00D2BE] rounded-full w-full" />
              </div>
            </div>
          </div>
          <div className="text-center group">
            <div className="bg-black/40 backdrop-blur-sm border border-neutral-800 rounded-lg p-3 md:p-4 hover:border-[#00D2BE] transition-all duration-300 hover:scale-105">
              <div className="text-lg md:text-3xl font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors">
                900%
              </div>
              <div className="text-xs md:text-sm text-neutral-400 font-f1">EFFICIENCY</div>
              <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#00D2BE] rounded-full w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="absolute bottom-6 md:bottom-10 flex flex-col items-center text-neutral-400 font-f1 cursor-pointer group z-20"
        onClick={handleScrollClick}
      >
        <span className="text-xs mb-1 md:mb-2 tracking-wider group-hover:text-[#00D2BE] transition-colors">
          SCROLL TO EXPLORE
        </span>
        <div className="relative">
          <ArrowDown className="group-hover:text-[#00D2BE] transition-colors" size={16} />
          <div className="absolute inset-0 bg-[#00D2BE] rounded-full opacity-0 group-hover:opacity-20 animate-ping" />
        </div>
      </div>

      {/* Racing line decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent opacity-30" />
    </section>
  )
}

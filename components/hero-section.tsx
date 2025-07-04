"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ArrowDown } from "lucide-react"

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 3.0 }) // Delay to start after preloader

    tl.fromTo(line1Ref.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" })
      .fromTo(line2Ref.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.8")
      .fromTo(
        subtextRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.6",
      )
      .fromTo(
        scrollRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.4",
      )

    // Parallax effect
    gsap.to(containerRef.current, {
      backgroundPosition: "50% 100%",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    })
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter uppercase">
          <span ref={line1Ref} className="block">
            Precision &
          </span>
          <span ref={line2Ref} className="block text-[#39ff14]">
            Velocity
          </span>
        </h1>
        <p ref={subtextRef} className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-neutral-400">
          Crafting high-performance digital experiences, from pixel-perfect interfaces to robust full-stack
          architecture.
        </p>
      </div>
      <div ref={scrollRef} className="absolute bottom-10 flex flex-col items-center text-neutral-400">
        <span className="text-xs mb-2">SCROLL</span>
        <ArrowDown className="animate-bounce" size={20} />
      </div>
    </section>
  )
}

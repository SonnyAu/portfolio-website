"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import Image from "next/image"
import { GraduationCap, Users, Code } from "lucide-react"

export default function AboutSection() {
  const [isMounted, setIsMounted] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const achievementsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const imageElement = imageRef.current
    if (!imageElement) return

    // Image hover effect (only on desktop, throttled)
    const isDesktop = window.innerWidth >= 768
    if (!isDesktop) return

    let rafId: number | null = null
    
    const handleMouseEnter = () => {
      if (rafId === null && imageRef.current) {
        rafId = requestAnimationFrame(() => {
          if (imageRef.current) {
            gsap.to(imageRef.current, { scale: 1.05, duration: 0.3, ease: "power2.out" })
          }
          rafId = null
        })
      }
    }

    const handleMouseLeave = () => {
      if (rafId === null && imageRef.current) {
        rafId = requestAnimationFrame(() => {
          if (imageRef.current) {
            gsap.to(imageRef.current, { scale: 1, duration: 0.3, ease: "power2.out" })
          }
          rafId = null
        })
      }
    }

    imageElement.addEventListener("mouseenter", handleMouseEnter)
    imageElement.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      imageElement.removeEventListener("mouseenter", handleMouseEnter)
      imageElement.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isMounted])

  return (
    <section id="about" className="section container mx-auto py-12 md:py-32 px-2 md:px-4 relative">
      {/* Racing stripe decoration */}
      <div className="absolute left-0 top-1/2 w-1 h-16 md:h-32 bg-[#00D2BE] transform -translate-y-1/2" />

      <div className="grid md:grid-cols-3 gap-4 md:gap-12 items-center max-w-5xl mx-auto">
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          <div>
            <h2 className="text-2xl md:text-5xl font-f1-bold mb-3 md:mb-6 relative">
              <span className="text-[#00D2BE]">01/</span> DRIVER PROFILE
              <div className="absolute -top-1 md:-top-2 -right-4 md:-right-8 w-8 md:w-16 h-0.5 md:h-1 bg-[#00D2BE] opacity-30" />
            </h2>

            <div className="space-y-3 md:space-y-4 text-neutral-300 font-f1 text-sm md:text-lg leading-relaxed">
              <p>
                As a President's Scholar at San Jose State University pursuing Software Engineering with a 3.75 GPA,
                I've evolved from academic excellence to real-world impact. Like a Formula 1 driver mastering each
                circuit, I've navigated diverse technical challenges across mobile development, machine learning, and
                full-stack engineering.
              </p>
              <p className="hidden md:block">
                My journey spans co-founding PalAte, a food-tech startup serving 1,000+ users, to leading educational
                initiatives impacting 280+ students across seven schools. Every project is approached with the precision
                of an F1 engineer—optimizing for performance, scalability, and user experience.
              </p>
              <p>
                Currently expanding my technical arsenal through a Frontend React Developer internship at GBCS Group,
                where I've achieved 900% code efficiency improvements and revolutionized HR email systems using modern
                technologies like Next.js, Tailwind, and cloud infrastructure.
              </p>
            </div>
          </div>

          {/* Achievement badges - More compact on mobile */}
          <div ref={achievementsRef} className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="flex flex-col items-center p-2 md:p-3 border border-neutral-800 rounded-lg bg-[#0f0f0f] hover:border-[#00D2BE] transition-colors duration-300">
              <GraduationCap className="text-[#00D2BE] mb-1 md:mb-2" size={20} />
              <span className="text-xs md:text-sm font-f1 text-center">President's Scholar</span>
            </div>
            <div className="flex flex-col items-center p-2 md:p-3 border border-neutral-800 rounded-lg bg-[#0f0f0f] hover:border-[#00D2BE] transition-colors duration-300">
              <Users className="text-[#00D2BE] mb-1 md:mb-2" size={20} />
              <span className="text-xs md:text-sm font-f1 text-center">Team Leadership</span>
            </div>
            <div className="flex flex-col items-center p-2 md:p-3 border border-neutral-800 rounded-lg bg-[#0f0f0f] hover:border-[#00D2BE] transition-colors duration-300">
              <Code className="text-[#00D2BE] mb-1 md:mb-2" size={20} />
              <span className="text-xs md:text-sm font-f1 text-center">Full-Stack Innovation</span>
            </div>
          </div>

          {/* Education Details - More compact on mobile */}
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-lg p-3 md:p-4">
            <h3 className="text-lg md:text-xl font-f1-bold text-[#00D2BE] mb-2 md:mb-4">EDUCATION & ORGANIZATIONS</h3>
            <div className="space-y-2 md:space-y-3 text-neutral-300 font-f1">
              <div>
                <div className="font-f1-bold text-sm md:text-base">San Jose State University</div>
                <div className="text-xs md:text-sm">
                  Bachelor of Science in Software Engineering • Aug 2021 - June 2026
                </div>
              </div>
              <div className="text-xs md:text-sm space-y-0.5 md:space-y-1">
                <div>• SJSU Software & Computer Engineering Society (Member)</div>
                <div>• Virtual Reality Club (Developer)</div>
                <div className="hidden md:block">
                  • Coursework: Data Structures, OOP, Software Engineering, Operating Systems
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 relative">
          <div ref={imageRef} className="relative h-64 md:h-96 lg:h-[420px] overflow-hidden rounded-lg">
            <Image
              loading="lazy"
              quality={85}
              sizes="(max-width: 768px) 100vw, 33vw"
              src="/placeholder.svg?width=400&height=500"
              alt="Sonny Au - Software Engineer"
              fill
              className="object-cover grayscale brightness-75 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
              <div className="bg-black/80 p-2 md:p-3 rounded border-l-4 border-[#00D2BE]">
                <div className="text-[#00D2BE] text-xs md:text-sm font-f1-bold">CURRENT STATUS</div>
                <div className="text-white text-xs font-f1">AVAILABLE FOR NEW OPPORTUNITIES</div>
                <div className="text-white text-xs font-f1 mt-1">San Jose, CA • (408) 669-9299</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

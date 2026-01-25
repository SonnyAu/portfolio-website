"use client"

import { useEffect, useRef, useState, Suspense, lazy, useMemo } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"
import dynamic from "next/dynamic"

// Loading system must be client-only to avoid SSR hydration issues
const AdvancedLoadingSystem = dynamic(() => import("@/components/advanced-loading-system"), {
  ssr: false,
  loading: () => (
    <div
      data-loading-system
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
      style={{ opacity: 1, visibility: "visible", display: "flex" }}
    >
      <div className="text-center">
        <div 
          className="text-3xl md:text-5xl font-f1-bold text-[#00D2BE] mb-3"
          style={{ fontFamily: '"Formula1", system-ui, -apple-system, sans-serif' }}
        >
          F1/DEV PORTFOLIO
        </div>
        <div 
          className="text-sm md:text-lg text-neutral-400 font-f1"
          style={{ fontFamily: '"Formula1", system-ui, -apple-system, sans-serif' }}
        >
          SYSTEM INITIALIZATION
        </div>
      </div>
    </div>
  ),
})

// Critical components loaded immediately with enhanced loading
const Header = lazy(() => import("@/components/header"))
const EnhancedHeroSection = lazy(() => import("@/components/enhanced-hero-section"))
const AboutSection = lazy(() => import("@/components/about-section"))
const ExperienceSection = lazy(() => import("@/components/experience-section"))
const SkillsSection = lazy(() => import("@/components/skills-section"))
const ProjectsSection = lazy(() => import("@/components/projects-section"))
const ContactSection = lazy(() => import("@/components/contact-section"))

// Performance-critical components
const PerformanceMonitor = dynamic(() => import("@/components/performance-monitor"), { ssr: false })

// Non-critical components with lower priority
const CustomCursor = dynamic(() => import("@/components/custom-cursor"), {
  ssr: false,
  loading: () => null,
})
const SpeedLines = dynamic(() => import("@/components/speed-lines"), {
  ssr: false,
  loading: () => null,
})
const F1TelemetryBackground = dynamic(() => import("@/components/f1-telemetry-background"), {
  ssr: false,
  loading: () => null,
})

gsap.registerPlugin(ScrollTrigger, TextPlugin)

// Enhanced loading fallback with F1 styling
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-[#00D2BE] border-t-transparent rounded-full animate-spin" />
      <div className="text-[#00D2BE] font-f1 text-sm animate-pulse">LOADING F1 SYSTEMS...</div>
    </div>
  </div>
)

// Minimal loading fallback for non-critical components
const MinimalFallback = () => null

export default function EnhancedF1Portfolio() {
  const mainContentRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Memoize performance checks to avoid recalculating
  const performanceSettings = useMemo(() => {
    if (typeof window === "undefined") return { prefersReducedMotion: false, isLowEndDevice: false, isSlowConnection: false }
    
    return {
      prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      isLowEndDevice: navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 2 : false,
      isSlowConnection: navigator.connection ? (navigator.connection as any).effectiveType === "slow-2g" : false,
    }
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const { prefersReducedMotion, isLowEndDevice, isSlowConnection } = performanceSettings

    // Clear any GSAP styles that might have been applied during SSR (optimized scope)
    if (mainContentRef.current && !prefersReducedMotion && !isLowEndDevice) {
      const animatedElements = mainContentRef.current.querySelectorAll(".section *")
      if (animatedElements.length > 0) {
        gsap.set(animatedElements, { 
          clearProps: "transform,opacity,filter,scale,translate,rotate" 
        })
      }
    }

    if (prefersReducedMotion || isLowEndDevice || isSlowConnection) {
      gsap.globalTimeline.clear()
      return
    }

    // Initially hide main content with enhanced styling (only on client)
    if (mainContentRef.current) {
      gsap.set(mainContentRef.current, {
        opacity: 0,
        visibility: "hidden",
        filter: "blur(10px)",
        scale: 0.98,
      })
    }

    // Enhanced preloader completion handler
    const handlePreloaderComplete = () => {
      // Mark body as preloader complete to remove CSS hiding
      document.body.classList.add("preloader-complete")
      
      // Remove the hidden class that was added by the inline script
      if (mainContentRef.current) {
        mainContentRef.current.classList.remove("main-content-hidden")
      }
      
      // Clear any existing animations
      gsap.killTweensOf(mainContentRef.current)

      gsap.to(mainContentRef.current, {
        opacity: 1,
        visibility: "visible",
        filter: "blur(0px)",
        scale: 1,
        duration: prefersReducedMotion ? 0.01 : 1.2,
        ease: "power3.out",
        delay: prefersReducedMotion ? 0 : 0.2,
        onComplete: () => {
          document.body.style.cursor = "default"
          window.scrollTo(0, 0)

          if (!prefersReducedMotion && !isLowEndDevice && isMounted) {
            // Enhanced section animations with F1 timing
            // Small delay to ensure DOM is ready after hydration
            setTimeout(() => {
              gsap.utils.toArray<HTMLElement>(".section").forEach((section, index) => {
                const elements = Array.from(section.children)

                // Clear any existing GSAP styles first
                gsap.killTweensOf(elements)
                gsap.set(elements, { clearProps: "transform,opacity,scale,translate,rotate" })

                gsap.fromTo(
                  elements,
                  {
                    y: 80,
                    opacity: 0,
                    scale: 0.95,
                    rotationX: 10,
                  },
                  {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotationX: 0,
                    stagger: 0.15,
                    duration: 1.2,
                    ease: "back.out(1.4)",
                    scrollTrigger: {
                      trigger: section,
                      start: "top 85%",
                      end: "top 15%",
                      toggleActions: "play none none none",
                      id: `section-${index}`,
                      onComplete: () => {
                        ScrollTrigger.getById(`section-${index}`)?.kill()
                      },
                    },
                  },
                )
              })
            }, 100)

            // Enhanced parallax effects with F1 telemetry feel
            gsap.utils.toArray<HTMLElement>(".parallax-slow").forEach((element, index) => {
              gsap.killTweensOf(element)

              gsap.to(element, {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                  trigger: element,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 2,
                  id: `parallax-${index}`,
                },
              })
            })

            // Standard scroll behavior
            ScrollTrigger.config({
              autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
            })

            // Enhanced scroll-based animations (throttled for performance)
            let scrollUpdateRaf: number | null = null
            ScrollTrigger.create({
              trigger: "body",
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
              onUpdate: (self) => {
                // Throttle updates using requestAnimationFrame
                if (scrollUpdateRaf === null) {
                  scrollUpdateRaf = requestAnimationFrame(() => {
                    const progress = self.progress
                    // Dynamic background intensity based on scroll
                    document.documentElement.style.setProperty("--scroll-intensity", `${0.1 + progress * 0.3}`)
                    scrollUpdateRaf = null
                  })
                }
              },
            })
          }
        },
      })
    }

    window.addEventListener("preloaderComplete", handlePreloaderComplete)

    // Cleanup function
    return () => {
      window.removeEventListener("preloaderComplete", handlePreloaderComplete)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      gsap.globalTimeline.clear()

      // Reset CSS custom properties
      document.documentElement.style.removeProperty("--scroll-intensity")
    }
  }, [isMounted, performanceSettings])

  return (
    <>
      <AdvancedLoadingSystem />

      <div
        ref={mainContentRef}
        data-main-content
        className="bg-[#0a0a0a] text-neutral-200 font-f1 overflow-x-hidden relative main-content-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(0, 210, 190, var(--scroll-intensity, 0.1)) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 210, 190, var(--scroll-intensity, 0.05)) 0%, transparent 50%)
          `,
        }}
      >
        <Suspense fallback={<MinimalFallback />}>
          <F1TelemetryBackground />
          <SpeedLines />
          <CustomCursor />
          <PerformanceMonitor />
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <Header />
        </Suspense>

        <main className="relative z-10">
          <Suspense fallback={<LoadingFallback />}>
            <EnhancedHeroSection />
            <AboutSection />
            <ExperienceSection />
            <SkillsSection />
            <ProjectsSection />
            <ContactSection />
          </Suspense>
        </main>

        {/* Enhanced F1 racing line at bottom */}
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent opacity-30 z-50" />
        <div className="fixed bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 z-50" />
      </div>
    </>
  )
}

"use client"

import { useEffect, useRef, Suspense, lazy } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"
import dynamic from "next/dynamic"

// Lazy load components for better performance
const AdvancedPreloader = lazy(() => import("@/components/advanced-preloader"))
const Header = lazy(() => import("@/components/header"))
const HeroSection = lazy(() => import("@/components/hero-section"))
const AboutSection = lazy(() => import("@/components/about-section"))
const ExperienceSection = lazy(() => import("@/components/experience-section"))
const SkillsSection = lazy(() => import("@/components/skills-section"))
const ProjectsSection = lazy(() => import("@/components/projects-section"))
const ContactSection = lazy(() => import("@/components/contact-section"))

// Dynamic imports for non-critical components
const CustomCursor = dynamic(() => import("@/components/custom-cursor"), { ssr: false })
const SpeedLines = dynamic(() => import("@/components/speed-lines"), { ssr: false })
const F1TelemetryBackground = dynamic(() => import("@/components/f1-telemetry-background"), { ssr: false })
const PerformanceMonitor = dynamic(() => import("@/components/performance-monitor"), { ssr: false })

gsap.registerPlugin(ScrollTrigger, TextPlugin)

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="text-[#00D2BE] font-f1">Loading...</div>
  </div>
)

export default function Portfolio() {
  const mainContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Performance optimization: Reduce motion for users who prefer it
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      gsap.globalTimeline.clear()
      gsap.set("*", { clearProps: "all" })
    }

    // Initially hide the main content
    gsap.set(mainContentRef.current, { opacity: 0, visibility: "hidden" })

    // Listen for preloader completion
    const handlePreloaderComplete = () => {
      // Clear any existing animations
      gsap.killTweensOf(mainContentRef.current)

      gsap.to(mainContentRef.current, {
        opacity: 1,
        visibility: "visible",
        duration: prefersReducedMotion ? 0.01 : 1,
        ease: "power3.out",
        delay: prefersReducedMotion ? 0 : 0.2,
        onComplete: () => {
          document.body.style.cursor = "default"
          window.scrollTo(0, 0)

          if (!prefersReducedMotion) {
            // Enhanced section animations with proper cleanup
            gsap.utils.toArray<HTMLElement>(".section").forEach((section, index) => {
              const elements = section.children

              // Kill any existing animations on these elements
              gsap.killTweensOf(elements)

              gsap.fromTo(
                elements,
                {
                  y: 100,
                  opacity: 0,
                  scale: 0.95,
                },
                {
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  stagger: 0.15,
                  duration: 1.2,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    end: "top 15%",
                    toggleActions: "play none none none",
                    id: `section-${index}`,
                    onComplete: () => {
                      // Cleanup for performance
                      ScrollTrigger.getById(`section-${index}`)?.kill()
                    },
                  },
                },
              )
            })

            // Enhanced parallax effects with cleanup
            gsap.utils.toArray<HTMLElement>(".parallax-slow").forEach((element, index) => {
              gsap.killTweensOf(element)

              gsap.to(element, {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                  trigger: element,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                  id: `parallax-${index}`,
                },
              })
            })

            // Smooth scroll enhancements
            ScrollTrigger.normalizeScroll(true)
          }
        },
      })
    }

    window.addEventListener("preloaderComplete", handlePreloaderComplete)

    // Cleanup function
    return () => {
      window.removeEventListener("preloaderComplete", handlePreloaderComplete)
      // Kill all ScrollTrigger instances
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      // Clear GSAP global timeline
      gsap.globalTimeline.clear()
    }
  }, [])

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <AdvancedPreloader />
      </Suspense>

      <div ref={mainContentRef} className="bg-[#0a0a0a] text-neutral-200 font-f1 overflow-x-hidden relative">
        <Suspense fallback={null}>
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
            <HeroSection />
            <AboutSection />
            <ExperienceSection />
            <SkillsSection />
            <ProjectsSection />
            <ContactSection />
          </Suspense>
        </main>
      </div>
    </>
  )
}

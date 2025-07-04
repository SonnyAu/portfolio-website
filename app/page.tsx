"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Preloader from "@/components/preloader"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import SkillsSection from "@/components/skills-section"
import ProjectsSection from "@/components/projects-section"
import ContactSection from "@/components/contact-section"
import CustomCursor from "@/components/custom-cursor"

gsap.registerPlugin(ScrollTrigger)

export default function Portfolio() {
  const mainContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initially hide the main content using GSAP
    gsap.set(mainContentRef.current, { opacity: 0, visibility: "hidden" })

    // Animate main content in after the preloader is guaranteed to be gone
    // The delay here should be slightly longer than the preloader's total animation duration
    gsap.to(mainContentRef.current, {
      opacity: 1,
      visibility: "visible",
      duration: 1,
      ease: "power3.out",
      delay: 2.8, // Preloader animation is ~2.5s, so 2.8s gives a small buffer
      onComplete: () => {
        document.body.style.cursor = "default"
        window.scrollTo(0, 0) // Ensure scroll position is at top

        // Animate sections after main content is visible
        gsap.utils.toArray<HTMLElement>(".section").forEach((section) => {
          gsap.fromTo(
            section.children,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.2,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "top 20%",
                toggleActions: "play none none none",
              },
            },
          )
        })
      },
    })
  }, [])

  return (
    <>
      {/* Preloader is always rendered, and handles its own disappearance */}
      <Preloader />

      {/* Main content is initially hidden by GSAP and then animated in */}
      <div ref={mainContentRef} className="bg-[#0a0a0a] text-neutral-200 font-sans">
        <CustomCursor />
        <Header />
        <main>
          <HeroSection />
          <AboutSection />
          <SkillsSection />
          <ProjectsSection />
          <ContactSection />
        </main>
      </div>
    </>
  )
}

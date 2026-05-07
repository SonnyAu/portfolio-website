"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { gsap } from "gsap"

const AdvancedLoadingSystem = dynamic(() => import("@/components/advanced-loading-system"), {
  ssr: false,
  loading: () => (
    <div
      data-loading-system
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
      style={{ opacity: 1, visibility: "visible", display: "flex" }}
    >
      <div className="text-center">
        <div className="mb-3 text-3xl font-f1-bold text-[#00D2BE] md:text-5xl">F1/DEV PORTFOLIO</div>
        <div className="text-sm font-f1 text-neutral-400 md:text-lg">SYSTEM INITIALIZATION</div>
      </div>
    </div>
  ),
})

const F1TrackPortfolio = dynamic(() => import("@/components/f1-track-portfolio"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#030506]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00D2BE] border-t-transparent" />
        <p className="text-sm uppercase tracking-[0.35em] text-[#00D2BE]">Loading circuit</p>
      </div>
    </div>
  ),
})

export default function PortfolioCircuitPage() {
  const mainContentRef = useRef<HTMLDivElement>(null)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    gsap.set(mainContentRef.current, {
      autoAlpha: 0,
      filter: prefersReducedMotion ? "none" : "blur(12px)",
      scale: prefersReducedMotion ? 1 : 0.985,
    })

    const revealPortfolio = () => {
      document.body.classList.add("preloader-complete")
      document.documentElement.classList.add("preloader-complete")
      setShowContent(true)

      requestAnimationFrame(() => {
        gsap.to(mainContentRef.current, {
          autoAlpha: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: prefersReducedMotion ? 0.01 : 1,
          ease: "power3.out",
        })
      })
    }

    window.addEventListener("preloaderComplete", revealPortfolio)
    const fallbackTimer = window.setTimeout(revealPortfolio, 6500)

    return () => {
      window.removeEventListener("preloaderComplete", revealPortfolio)
      window.clearTimeout(fallbackTimer)
      gsap.killTweensOf(mainContentRef.current)
    }
  }, [])

  return (
    <>
      <AdvancedLoadingSystem />
      <main ref={mainContentRef} data-main-content className="main-content-hidden min-h-screen bg-[#030506] font-f1 text-neutral-100">
        {showContent ? <F1TrackPortfolio /> : null}
      </main>
    </>
  )
}

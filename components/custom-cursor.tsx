"use client"

import { useEffect, useRef, useState, memo } from "react"
import { gsap } from "gsap"

const CustomCursor = memo(function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(true) // Default to mobile to avoid flash

  useEffect(() => {
    // Check if device is mobile or prefers reduced motion
    const checkMobile = () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isSmallScreen || isTouch || prefersReducedMotion)
    }

    checkMobile()

    // Throttled resize handler
    let resizeTimer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(checkMobile, 150)
    }

    window.addEventListener("resize", handleResize, { passive: true })
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  useEffect(() => {
    if (isMobile) return

    const cursor = cursorRef.current
    const follower = followerRef.current
    if (!cursor || !follower) return

    // Set initial position
    gsap.set([cursor, follower], {
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
    })

    let mouseX = 0
    let mouseY = 0
    let rafId: number | null = null
    let isHoveringInteractive = false

    const updateCursor = () => {
      if (cursor && follower) {
        gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.05, ease: "none" })
        gsap.to(follower, { x: mouseX, y: mouseY, duration: 0.25, ease: "power2.out" })
      }
      rafId = null
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Throttle with RAF
      if (rafId === null) {
        rafId = requestAnimationFrame(updateCursor)
      }

      // Check if hovering over interactive element
      const target = e.target as HTMLElement
      const isInteractive = target?.closest("button, a, input, [role='button'], .project-card") !== null
      
      if (isInteractive !== isHoveringInteractive) {
        isHoveringInteractive = isInteractive
        const scale = isInteractive ? 1.4 : 1
        gsap.to([cursor, follower], { scale, duration: 0.2, ease: "power2.out" })
      }
    }

    const onMouseLeave = () => {
      gsap.to([cursor, follower], { opacity: 0, duration: 0.15 })
    }

    const onMouseEnter = () => {
      gsap.to([cursor, follower], { opacity: 1, duration: 0.15 })
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    document.addEventListener("mouseleave", onMouseLeave)
    document.addEventListener("mouseenter", onMouseEnter)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseleave", onMouseLeave)
      document.removeEventListener("mouseenter", onMouseEnter)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[#00D2BE] rounded-full pointer-events-none z-50"
        style={{ mixBlendMode: "difference", willChange: "transform", contain: "layout style paint" }}
        aria-hidden="true"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-7 h-7 border border-[#00D2BE] rounded-full pointer-events-none z-50"
        style={{ mixBlendMode: "difference", willChange: "transform", contain: "layout style paint" }}
        aria-hidden="true"
      />
    </>
  )
})

export default CustomCursor

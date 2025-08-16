"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) {
      // Add haptic feedback for mobile devices
      const addHapticFeedback = () => {
        const interactiveElements = document.querySelectorAll("button, a, input, [role='button'], .project-card")

        interactiveElements.forEach((el) => {
          const handleTouchStart = () => {
            // Light haptic feedback
            if (navigator.vibrate) {
              navigator.vibrate(10) // Very short vibration (10ms)
            }
          }

          const handleClick = () => {
            // Slightly stronger haptic feedback on click
            if (navigator.vibrate) {
              navigator.vibrate([15, 10, 15]) // Pattern: vibrate 15ms, pause 10ms, vibrate 15ms
            }
          }

          el.addEventListener("touchstart", handleTouchStart, { passive: true })
          el.addEventListener("click", handleClick)
        })
      }

      // Add haptic feedback after a short delay to ensure DOM is ready
      const timer = setTimeout(addHapticFeedback, 100)

      // Re-add haptic feedback when new elements are added (e.g., after animations)
      const observer = new MutationObserver(addHapticFeedback)
      observer.observe(document.body, { childList: true, subtree: true })

      return () => {
        clearTimeout(timer)
        observer.disconnect()
      }
    } else {
      // Desktop cursor logic
      const cursor = cursorRef.current
      const follower = followerRef.current
      if (!cursor || !follower) return

      gsap.set(cursor, { xPercent: -50, yPercent: -50 })
      gsap.set(follower, { xPercent: -50, yPercent: -50 })

      const onMouseMove = (e: MouseEvent) => {
        gsap.to(cursor, { duration: 0.1, x: e.clientX, y: e.clientY })
        gsap.to(follower, { duration: 0.6, x: e.clientX, y: e.clientY, ease: "expo.out" })
      }

      const onMouseEnter = () => {
        gsap.to(follower, { scale: 1.5, duration: 0.3 })
        gsap.to(cursor, { scale: 1.5, duration: 0.3 })
      }

      const onMouseLeave = () => {
        gsap.to(follower, { scale: 1, duration: 0.3 })
        gsap.to(cursor, { scale: 1, duration: 0.3 })
      }

      window.addEventListener("mousemove", onMouseMove)
      document.querySelectorAll("button, a, input, [role='button']").forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnter)
        el.addEventListener("mouseleave", onMouseLeave)
      })

      return () => {
        window.removeEventListener("mousemove", onMouseMove)
        document.querySelectorAll("button, a, input, [role='button']").forEach((el) => {
          el.removeEventListener("mouseenter", onMouseEnter)
          el.removeEventListener("mouseleave", onMouseLeave)
        })
      }
    }
  }, [isMobile])

  // Only render cursor elements on desktop
  if (isMobile) {
    return null
  }

  return (
    <>
      <div ref={cursorRef} className="fixed top-0 left-0 w-2 h-2 bg-[#00D2BE] rounded-full pointer-events-none z-50" />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border-2 border-[#00D2BE] rounded-full pointer-events-none z-50 mix-blend-difference"
      />
    </>
  )
}

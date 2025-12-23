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

      // Set initial position to center the cursor properly
      gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
      })
      gsap.set(follower, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
      })

      let mouseX = 0
      let mouseY = 0
      let rafId: number | null = null
      let needsUpdate = false

      const onMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX
        mouseY = e.clientY
        needsUpdate = true

        // Use requestAnimationFrame for better performance
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            if (needsUpdate && cursor && follower) {
              // Update cursor position immediately for precise tracking
              gsap.to(cursor, {
                duration: 0.05,
                x: mouseX,
                y: mouseY,
                ease: "none",
              })

              // Follower with slight delay for smooth trailing effect
              gsap.to(follower, {
                duration: 0.3,
                x: mouseX,
                y: mouseY,
                ease: "power2.out",
              })
              needsUpdate = false
              rafId = null
            }
          })
        }
      }

      const onMouseEnter = () => {
        gsap.to(follower, { scale: 1.5, duration: 0.3, ease: "power2.out" })
        gsap.to(cursor, { scale: 1.5, duration: 0.3, ease: "power2.out" })
      }

      const onMouseLeave = () => {
        gsap.to(follower, { scale: 1, duration: 0.3, ease: "power2.out" })
        gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" })
      }

      // Hide cursor when mouse leaves window
      const onMouseEnterWindow = () => {
        gsap.to([cursor, follower], { opacity: 1, duration: 0.2 })
      }

      const onMouseLeaveWindow = () => {
        gsap.to([cursor, follower], { opacity: 0, duration: 0.2 })
      }

      // Event listeners (passive for better performance)
      window.addEventListener("mousemove", onMouseMove, { passive: true })
      document.addEventListener("mouseenter", onMouseEnterWindow)
      document.addEventListener("mouseleave", onMouseLeaveWindow)

      // Interactive elements (use delegation for better performance)
      const handleInteractiveEnter = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.matches("button, a, input, [role='button'], .project-card")) {
          onMouseEnter()
        }
      }
      
      const handleInteractiveLeave = (e: Event) => {
        const target = e.target as HTMLElement
        if (target.matches("button, a, input, [role='button'], .project-card")) {
          onMouseLeave()
        }
      }

      document.addEventListener("mouseenter", handleInteractiveEnter, true)
      document.addEventListener("mouseleave", handleInteractiveLeave, true)

      // Set initial mouse position
      const setInitialPosition = () => {
        gsap.set([cursor, follower], { x: mouseX, y: mouseY })
      }

      // Small delay to ensure proper initialization
      setTimeout(setInitialPosition, 50)

      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
        }
        window.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseenter", onMouseEnterWindow)
        document.removeEventListener("mouseleave", onMouseLeaveWindow)
        document.removeEventListener("mouseenter", handleInteractiveEnter, true)
        document.removeEventListener("mouseleave", handleInteractiveLeave, true)
      }
    }
  }, [isMobile])

  // Only render cursor elements on desktop
  if (isMobile) {
    return null
  }

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[#00D2BE] rounded-full pointer-events-none z-50"
        style={{
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border-2 border-[#00D2BE] rounded-full pointer-events-none z-50"
        style={{
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
    </>
  )
}

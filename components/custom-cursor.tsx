"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
    }

    const onMouseLeave = () => {
      gsap.to(follower, { scale: 1, duration: 0.3 })
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
  }, [])

  return (
    <>
      <div ref={cursorRef} className="fixed top-0 left-0 w-2 h-2 bg-[#39ff14] rounded-full pointer-events-none z-50" />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border-2 border-[#39ff14] rounded-full pointer-events-none z-50 mix-blend-difference"
      />
    </>
  )
}

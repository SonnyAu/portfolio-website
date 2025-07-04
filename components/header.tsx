"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import Link from "next/link"

export default function Header() {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 2.8 },
    )
  }, [])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-40 px-4 py-3 mix-blend-difference text-white md:px-8"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-wider uppercase">
          V/DEV
        </Link>
        <nav className="hidden md:flex space-x-8 text-sm">
          <button
            onClick={() => scrollToSection("about")}
            className="hover:text-[#39ff14] transition-colors duration-300"
          >
            01/ABOUT
          </button>
          <button
            onClick={() => scrollToSection("skills")}
            className="hover:text-[#39ff14] transition-colors duration-300"
          >
            02/SKILLS
          </button>
          <button
            onClick={() => scrollToSection("projects")}
            className="hover:text-[#39ff14] transition-colors duration-300"
          >
            03/PROJECTS
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="hover:text-[#39ff14] transition-colors duration-300"
          >
            04/CONTACT
          </button>
        </nav>
      </div>
    </header>
  )
}

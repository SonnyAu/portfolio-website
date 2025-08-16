"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 3.5 },
    )
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      gsap.to(mobileMenuRef.current, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" })
    } else {
      gsap.to(mobileMenuRef.current, { opacity: 0, y: -20, duration: 0.3, ease: "power2.out" })
    }
  }, [isMenuOpen])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 px-2 py-2 md:px-8 md:py-4 bg-black/80 backdrop-blur-md border-b border-neutral-800"
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg md:text-2xl font-f1-bold tracking-wider uppercase text-[#00D2BE]">
            F1/DEV
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm font-f1">
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-[#00D2BE] transition-colors duration-300 relative group"
            >
              01/ABOUT
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D2BE] transition-all duration-300 group-hover:w-full" />
            </button>
            <button
              onClick={() => scrollToSection("skills")}
              className="hover:text-[#00D2BE] transition-colors duration-300 relative group"
            >
              02/SKILLS
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D2BE] transition-all duration-300 group-hover:w-full" />
            </button>
            <button
              onClick={() => scrollToSection("projects")}
              className="hover:text-[#00D2BE] transition-colors duration-300 relative group"
            >
              03/PROJECTS
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D2BE] transition-all duration-300 group-hover:w-full" />
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="hover:text-[#00D2BE] transition-colors duration-300 relative group"
            >
              04/CONTACT
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00D2BE] transition-all duration-300 group-hover:w-full" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-[#00D2BE] p-1">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu - More compact */}
      <div
        ref={mobileMenuRef}
        className="fixed top-12 left-0 right-0 z-30 bg-black/95 backdrop-blur-md border-b border-neutral-800 opacity-0 translate-y-[-20px] md:hidden"
      >
        <nav className="container mx-auto px-2 py-4 space-y-3 font-f1">
          <button
            onClick={() => scrollToSection("about")}
            className="block text-sm hover:text-[#00D2BE] transition-colors duration-300"
          >
            01/ABOUT
          </button>
          <button
            onClick={() => scrollToSection("skills")}
            className="block text-sm hover:text-[#00D2BE] transition-colors duration-300"
          >
            02/SKILLS
          </button>
          <button
            onClick={() => scrollToSection("projects")}
            className="block text-sm hover:text-[#00D2BE] transition-colors duration-300"
          >
            03/PROJECTS
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="block text-sm hover:text-[#00D2BE] transition-colors duration-300"
          >
            04/CONTACT
          </button>
        </nav>
      </div>
    </>
  )
}

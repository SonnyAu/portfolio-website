"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function F1Background() {
  const containerRef = useRef<HTMLDivElement>(null)
  const circuitRef = useRef<SVGSVGElement>(null)
  const tireTracksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate circuit lines
    if (circuitRef.current) {
      const paths = circuitRef.current.querySelectorAll("path")
      paths.forEach((path, index) => {
        gsap.fromTo(
          path,
          { strokeDasharray: "0 1000" },
          {
            strokeDasharray: "1000 0",
            duration: 3 + index * 0.5,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 2,
          },
        )
      })
    }

    // Animate tire tracks
    if (tireTracksRef.current) {
      gsap.to(tireTracksRef.current, {
        backgroundPosition: "100px 0, 50px 0, 0 100px",
        duration: 20,
        ease: "none",
        repeat: -1,
      })
    }

    // Create floating particles
    const createParticles = () => {
      const container = containerRef.current
      if (!container) return

      for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div")
        particle.className = "absolute w-1 h-1 bg-[#00D2BE] rounded-full opacity-20"
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`
        container.appendChild(particle)

        gsap.to(particle, {
          x: `+=${Math.random() * 200 - 100}`,
          y: `+=${Math.random() * 200 - 100}`,
          opacity: Math.random() * 0.5,
          duration: gsap.utils.random(10, 20),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
    }

    createParticles()

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Tire Track Texture Layer */}
      <div
        ref={tireTracksRef}
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 12px,
              rgba(0, 210, 190, 0.3) 12px,
              rgba(0, 210, 190, 0.3) 14px,
              transparent 14px,
              transparent 18px,
              rgba(0, 210, 190, 0.2) 18px,
              rgba(0, 210, 190, 0.2) 19px,
              transparent 19px,
              transparent 35px
            ),
            repeating-linear-gradient(
              15deg,
              transparent,
              transparent 8px,
              rgba(0, 210, 190, 0.2) 8px,
              rgba(0, 210, 190, 0.2) 9px,
              transparent 9px,
              transparent 20px
            ),
            radial-gradient(
              ellipse 300px 80px at 30% 20%,
              rgba(0, 210, 190, 0.1) 0%,
              transparent 70%
            )
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%",
        }}
      />

      {/* Dynamic Circuit Pattern */}
      <svg
        ref={circuitRef}
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2BE" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#00A896" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00D2BE" stopOpacity="0.3" />
          </linearGradient>
          <pattern id="tirePattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="none" />
            <line x1="0" y1="5" x2="20" y2="5" stroke="#00D2BE" strokeWidth="0.5" opacity="0.2" />
            <line x1="0" y1="15" x2="20" y2="15" stroke="#00D2BE" strokeWidth="0.3" opacity="0.1" />
          </pattern>
        </defs>

        {/* Racing circuit paths with tire track textures */}
        <path
          d="M100,200 Q300,100 500,200 T900,200 Q1200,300 1400,200 T1800,300"
          stroke="url(#circuitGradient)"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M200,400 Q400,300 600,400 T1000,400 Q1300,500 1500,400 T1820,500"
          stroke="url(#circuitGradient)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M50,600 Q250,500 450,600 T850,600 Q1150,700 1350,600 T1750,700"
          stroke="url(#circuitGradient)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M150,800 Q350,700 550,800 T950,800 Q1250,900 1450,800 T1850,900"
          stroke="url(#circuitGradient)"
          strokeWidth="2"
          fill="none"
        />

        {/* Tire track marks along the racing line */}
        <g opacity="0.1">
          <rect x="90" y="195" width="40" height="10" fill="url(#tirePattern)" />
          <rect x="190" y="395" width="40" height="10" fill="url(#tirePattern)" />
          <rect x="40" y="595" width="40" height="10" fill="url(#tirePattern)" />
          <rect x="140" y="795" width="40" height="10" fill="url(#tirePattern)" />
        </g>
      </svg>

      {/* Racing stripes overlay with tire textures */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent transform -skew-y-12 scale-150 tire-tracks" />
        <div className="absolute top-1/3 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#00A896] to-transparent transform skew-y-12 scale-150" />
        <div className="absolute top-2/3 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent transform -skew-y-12 scale-150" />
      </div>

      {/* Curved tire marks for racing corners */}
      <div className="absolute inset-0 opacity-3 tire-curves" />

      {/* Corner accent elements with tire track details */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#00D2BE] opacity-20">
        <div className="absolute top-2 left-2 w-4 h-1 bg-[#00D2BE] opacity-30 rounded-full" />
        <div className="absolute top-4 left-2 w-3 h-1 bg-[#00D2BE] opacity-20 rounded-full" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#00D2BE] opacity-20">
        <div className="absolute top-2 right-2 w-4 h-1 bg-[#00D2BE] opacity-30 rounded-full" />
        <div className="absolute top-4 right-2 w-3 h-1 bg-[#00D2BE] opacity-20 rounded-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#00D2BE] opacity-20">
        <div className="absolute bottom-2 left-2 w-4 h-1 bg-[#00D2BE] opacity-30 rounded-full" />
        <div className="absolute bottom-4 left-2 w-3 h-1 bg-[#00D2BE] opacity-20 rounded-full" />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#00D2BE] opacity-20">
        <div className="absolute bottom-2 right-2 w-4 h-1 bg-[#00D2BE] opacity-30 rounded-full" />
        <div className="absolute bottom-4 right-2 w-3 h-1 bg-[#00D2BE] opacity-20 rounded-full" />
      </div>
    </div>
  )
}

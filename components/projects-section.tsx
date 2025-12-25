"use client"

import { useEffect, useRef, useState, memo } from "react"
import { gsap } from "gsap"
import Image from "next/image"
import { ArrowUpRight, Github, ExternalLink, Zap } from "lucide-react"
import HRDashboardDemo from "./hr-dashboard-demo"
import PalateTagsDemo from "./palate-tags-demo"

interface Project {
  title: string
  description: string
  tags: string[]
  image?: string
  link?: string
  impact: string
  interactiveDemo?: React.ReactNode
  techHighlight?: string
}

const projects: Project[] = [
  {
    title: "HR/INTERN INTERNAL DASHBOARD",
    description:
      "Built an internal HR and intern dashboard that centralizes intern task tracking and supports automated, data-driven email personalization for onboarding, offboarding, and internal HR communications.",
    tags: ["Next.js", "Tailwind CSS", "GraphQL", "PostgreSQL", "SendGrid"],
    impact: "SkyIT Internal",
    techHighlight: "SendGrid Integration",
    interactiveDemo: <HRDashboardDemo />,
  },
  {
    title: "PALATE TAGS EDITOR",
    description:
      "A restaurant management tool that enables restaurants to edit and customize tags for their dishes. Features an intuitive table interface for efficient tag management across multiple dishes.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
    impact: "Restaurant Platform",
    techHighlight: "Tag Management",
    interactiveDemo: <PalateTagsDemo />,
  },
]

const ProjectCard = memo(({ project, index }: { project: Project; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const card = cardRef.current
    if (!card) return

    // Clear any existing GSAP styles first
    gsap.set(card, { clearProps: "transform,y" })

    const handleMouseEnter = () => {
      gsap.to(card, { y: -5, duration: 0.3, ease: "power2.out" })
    }

    const handleMouseLeave = () => {
      gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" })
    }

    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isMounted])

  return (
    <>
      <div
        ref={cardRef}
        className="project-card group relative overflow-hidden rounded-lg border border-neutral-800 bg-[#0f0f0f] transition-all duration-300 hover:border-[#00D2BE]"
      >
        {project.image ? (
          <div className="relative h-32 md:h-48 overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          </div>
        ) : (
          <div className="relative h-32 md:h-48 overflow-hidden bg-gradient-to-br from-[#00D2BE]/10 to-neutral-900 flex items-center justify-center">
            <div className="text-4xl md:text-6xl opacity-20">📊</div>
          </div>
        )}

        {/* Impact badge */}
        <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-[#00D2BE] text-black px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-f1-bold">
          {project.impact}
        </div>

        {/* Tech Highlight badge */}
        {project.techHighlight && (
          <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-black/70 text-[#00D2BE] px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-f1">
            {project.techHighlight}
          </div>
        )}

        <div className="p-3 md:p-5">
          <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
            <Zap className="text-[#00D2BE]" size={12} />
            <h3 className="text-sm md:text-lg font-f1-bold text-white group-hover:text-[#00D2BE] transition-colors duration-300 line-clamp-1">
              {project.title}
            </h3>
          </div>

          <p className="text-neutral-400 mb-3 md:mb-4 font-f1 text-xs md:text-sm leading-relaxed line-clamp-2">
            {project.description}
          </p>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 md:mb-4">
              {project.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-neutral-800 text-[#00D2BE] px-1.5 md:px-2 py-0.5 md:py-1 rounded font-f1"
                >
                  {tag}
                </span>
              ))}
              {/* Show remaining tags only on desktop */}
              {project.tags.slice(2).map((tag) => (
                <span
                  key={tag}
                  className="hidden md:inline-block text-xs bg-neutral-800 text-[#00D2BE] px-2 py-1 rounded font-f1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex gap-2 md:gap-3">
              {project.interactiveDemo && (
                <button
                  onClick={() => setShowDemo(true)}
                  className="flex items-center gap-1 text-[#00D2BE] hover:text-white transition-colors duration-300 text-xs md:text-sm font-f1"
                >
                  <Zap size={12} />
                  Try Demo
                </button>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#00D2BE] hover:text-white transition-colors duration-300 text-xs md:text-sm font-f1"
                >
                  <ExternalLink size={12} />
                  Live
                </a>
              )}
            </div>

            <div className="p-1.5 md:p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowUpRight className="text-[#00D2BE]" size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Modal */}
      {showDemo && project.interactiveDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-[#00D2BE] rounded-lg">
            <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#00D2BE] p-4 flex items-center justify-between z-10">
              <h3 className="text-lg md:text-xl font-f1-bold text-[#00D2BE]">{project.title} - Interactive Demo</h3>
              <button
                onClick={() => setShowDemo(false)}
                className="text-neutral-400 hover:text-white transition-colors font-f1-bold text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-4 md:p-6">{project.interactiveDemo}</div>
          </div>
        </div>
      )}
    </>
  )
})

ProjectCard.displayName = "ProjectCard"

export default function ProjectsSection() {
  return (
    <section id="projects" className="section container mx-auto py-12 md:py-24 px-2 md:px-4">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-f1-bold mb-2 md:mb-3">
          <span className="text-[#00D2BE]">04/</span> RACE VICTORIES
        </h2>
        <p className="text-neutral-400 font-f1 max-w-xl mx-auto text-xs md:text-sm px-2">
          High-performance digital solutions engineered with precision across mobile, web, and machine learning domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-6xl mx-auto">
        {projects
          .filter((p) => p.title !== "PROJECT TWO" || p.description !== "Coming soon...")
          .map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
      </div>
    </section>
  )
}

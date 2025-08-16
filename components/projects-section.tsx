"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import Image from "next/image"
import { ArrowUpRight, Github, ExternalLink, Zap } from "lucide-react"

const projects = [
  {
    title: "PALATE PROMOTIONAL WEBSITE",
    description:
      "Dynamic promotional website for food-tech startup with Next.js, focusing on performance and SEO optimization.",
    tags: ["Next.js", "Tailwind CSS", "SEO"],
    image: "/placeholder.svg?width=400&height=250",
    link: "https://pal-ate.com",
    impact: "Marketing Platform",
  },
  {
    title: "PALATE MOBILE APP",
    description:
      "React Native app with 20+ screens helping SJSU students discover restaurants matching dietary preferences.",
    tags: ["React Native", "PostgreSQL", "Google Maps API"],
    image: "/placeholder.svg?width=400&height=250",
    impact: "1,000+ Users",
  },
  {
    title: "NBA PREDICTION MODEL",
    description: "Machine learning model predicting NBA playoff win percentages using 21 years of statistical data.",
    tags: ["Python", "scikit-learn", "Data Analysis"],
    image: "/placeholder.svg?width=400&height=250",
    impact: "High Accuracy",
  },
  {
    title: "VR HAUNTED HOUSE",
    description:
      "Immersive virtual reality experience built with Unity and C# featuring interactive gameplay elements.",
    tags: ["C#", "Unity", "Virtual Reality"],
    image: "/placeholder.svg?width=400&height=250",
    impact: "Full VR Experience",
  },
]

const ProjectCard = ({ project, index }: { project: (typeof projects)[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

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
  }, [])

  return (
    <div
      ref={cardRef}
      className="project-card group relative overflow-hidden rounded-lg border border-neutral-800 bg-[#0f0f0f] transition-all duration-300 hover:border-[#00D2BE]"
    >
      <div className="relative h-32 md:h-48 overflow-hidden">
        <Image
          src={project.image || "/placeholder.svg"}
          alt={project.title}
          fill
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

        {/* Impact badge */}
        <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-[#00D2BE] text-black px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-f1-bold">
          {project.impact}
        </div>
      </div>

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

        <div className="flex justify-between items-center">
          <div className="flex gap-2 md:gap-3">
            <button className="flex items-center gap-1 text-[#00D2BE] hover:text-white transition-colors duration-300 text-xs md:text-sm font-f1">
              <Github size={12} />
              Code
            </button>
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
  )
}

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

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-6xl mx-auto">
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} />
        ))}
      </div>

      {/* Quick stats - More compact on mobile */}
      <div className="flex justify-center gap-4 md:gap-8 mt-8 md:mt-12 text-center">
        <div>
          <div className="text-lg md:text-xl font-f1-bold text-[#00D2BE]">4</div>
          <div className="text-xs text-neutral-400 font-f1">PROJECTS</div>
        </div>
        <div>
          <div className="text-lg md:text-xl font-f1-bold text-[#00D2BE]">1K+</div>
          <div className="text-xs text-neutral-400 font-f1">USERS IMPACTED</div>
        </div>
        <div>
          <div className="text-lg md:text-xl font-f1-bold text-[#00D2BE]">6</div>
          <div className="text-xs text-neutral-400 font-f1">TECHNOLOGIES</div>
        </div>
      </div>
    </section>
  )
}

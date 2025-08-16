"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Calendar, MapPin, TrendingUp, Users, Code } from "lucide-react"

const experiences = [
  {
    company: "GBCS Group (SkyIT)",
    role: "Frontend React Developer Intern",
    location: "Calgary, Alberta (Remote)",
    period: "Jan 2025 – May 2025",
    achievements: [
      "Revamped HR email system using SendGrid for prospective intern communications",
      "Enhanced internal dashboard with Next.js, Tailwind, and Prisma for streamlined workflows",
      "Achieved 900% code efficiency improvement by migrating hardcoded templates to cloud infrastructure",
    ],
    technologies: ["Next.js", "Tailwind CSS", "Prisma", "SendGrid", "Cloud Infrastructure"],
    icon: <Code className="text-[#00D2BE]" size={24} />,
    current: true,
  },
  {
    company: "PalAte",
    role: "Software Developer and Co-founder",
    location: "San Jose, CA",
    period: "Sep 2023 - Present",
    achievements: [
      "Engineered React Native app with 20+ screens and 15+ integrated packages including Google Maps API",
      "Maintained PostgreSQL databases in Supabase with row-level security policies",
      "Optimized recommendation algorithms, boosting accuracy by 37% and improving scalability",
      "Led product launch campaign reaching 1,000+ clients and 10+ restaurants",
    ],
    technologies: ["React Native", "PostgreSQL", "Supabase", "Google Maps API", "Machine Learning"],
    icon: <TrendingUp className="text-[#00D2BE]" size={24} />,
    current: true,
  },
  {
    company: "SJSU College Corps",
    role: "Lead Project Manager and Instructor",
    location: "San Jose, CA",
    period: "Aug 2021 - May 2025",
    achievements: [
      "Led coordination of programming projects for 280+ students across seven schools",
      "Guided colleagues in creating Scratch-based debugging programs for K-6 students",
      "Trained 70+ San Jose State colleagues with relevant programming skills",
      "Managed educational initiatives with measurable impact on student learning outcomes",
    ],
    technologies: ["Scratch", "Educational Technology", "Project Management", "Team Leadership"],
    icon: <Users className="text-[#00D2BE]" size={24} />,
    current: false,
  },
]

const ExperienceCard = ({ experience, index }: { experience: (typeof experiences)[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { x: index % 2 === 0 ? -50 : 50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      },
    )
  }, [index])

  return (
    <div ref={cardRef} className="relative">
      {/* Timeline connector */}
      <div className="absolute left-4 md:left-8 top-8 md:top-16 bottom-0 w-0.5 bg-neutral-800" />

      <div className="flex gap-3 md:gap-6 mb-6 md:mb-12">
        <div className="flex-shrink-0 w-8 h-8 md:w-16 md:h-16 bg-[#0f0f0f] border-2 border-[#00D2BE] rounded-full flex items-center justify-center relative z-10">
          <div className="scale-75 md:scale-100">{experience.icon}</div>
        </div>

        <div className="flex-1 bg-[#0f0f0f] border border-neutral-800 rounded-lg p-3 md:p-6 hover:border-[#00D2BE] transition-all duration-300 group">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 md:mb-4">
            <div>
              <h3 className="text-base md:text-xl font-f1-bold text-white group-hover:text-[#00D2BE] transition-colors duration-300">
                {experience.role}
              </h3>
              <div className="text-[#00D2BE] font-f1-bold text-sm md:text-base">{experience.company}</div>
            </div>
            <div className="flex flex-col md:items-end text-xs md:text-sm text-neutral-400 font-f1 mt-1 md:mt-0">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {experience.period}
              </div>
              <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                <MapPin size={12} />
                {experience.location}
              </div>
              {experience.current && (
                <div className="bg-[#00D2BE] text-black px-2 py-0.5 md:py-1 rounded-full text-xs font-f1-bold mt-1 md:mt-2">
                  CURRENT
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
            {experience.achievements.slice(0, 2).map((achievement, i) => (
              <div key={i} className="flex items-start gap-2 md:gap-3 text-neutral-300 font-f1 text-xs md:text-sm">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#00D2BE] rounded-full mt-1.5 md:mt-2 flex-shrink-0" />
                <span>{achievement}</span>
              </div>
            ))}
            {/* Show remaining achievements only on desktop */}
            {experience.achievements.slice(2).map((achievement, i) => (
              <div key={i + 2} className="hidden md:flex items-start gap-3 text-neutral-300 font-f1">
                <div className="w-1.5 h-1.5 bg-[#00D2BE] rounded-full mt-2 flex-shrink-0" />
                <span>{achievement}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1 md:gap-2">
            {experience.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-xs bg-neutral-800 text-[#00D2BE] px-1.5 md:px-2 py-0.5 md:py-1 rounded font-f1"
              >
                {tech}
              </span>
            ))}
            {/* Show remaining technologies only on desktop */}
            {experience.technologies.slice(3).map((tech) => (
              <span
                key={tech}
                className="hidden md:inline-block text-xs bg-neutral-800 text-[#00D2BE] px-2 py-1 rounded font-f1"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExperienceSection() {
  return (
    <section className="section container mx-auto py-12 md:py-32 px-2 md:px-4">
      <div className="text-center mb-8 md:mb-16">
        <h2 className="text-2xl md:text-5xl font-f1-bold mb-2 md:mb-4">
          <span className="text-[#00D2BE]">02/</span> RACING CAREER
        </h2>
        <p className="text-neutral-400 font-f1 max-w-2xl mx-auto text-sm md:text-base px-2">
          Professional journey through the fast-paced world of software engineering, from startup co-founder to
          technical leadership roles.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {experiences.map((experience, index) => (
          <ExperienceCard key={experience.company + experience.role} experience={experience} index={index} />
        ))}
      </div>
    </section>
  )
}

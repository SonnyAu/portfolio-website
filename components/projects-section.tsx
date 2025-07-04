import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

const projects = [
  {
    title: "Project Apex",
    description:
      "A high-performance e-commerce platform with real-time inventory updates and a dynamic user interface built with Next.js and GSAP.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    image: "/placeholder.svg?width=500&height=350",
  },
  {
    title: "Momentum Dash",
    description:
      "An interactive data visualization dashboard for motorsport analytics, featuring fluid charts and a fully responsive layout.",
    tags: ["React", "D3.js", "Node.js", "WebSocket"],
    image: "/placeholder.svg?width=500&height=350",
  },
  {
    title: "Chicane CMS",
    description:
      "A headless CMS designed for speed and flexibility, with a GraphQL API and a sleek, developer-friendly interface.",
    tags: ["GraphQL", "Node.js", "React", "Docker"],
    image: "/placeholder.svg?width=500&height=350",
  },
]

const ProjectCard = ({ project }: { project: (typeof projects)[0] }) => (
  <div className="group relative overflow-hidden rounded-lg border border-neutral-800 bg-[#0f0f0f]">
    <Image
      src={project.image || "/placeholder.svg"}
      alt={project.title}
      width={500}
      height={350}
      className="w-full h-60 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
    />
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
      <p className="text-neutral-400 mb-4 text-sm">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map((tag) => (
          <span key={tag} className="text-xs bg-neutral-800 text-[#39ff14] px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
    <a href="#" className="absolute inset-0">
      <div className="absolute top-4 right-4 p-2 bg-[#0a0a0a] rounded-full translate-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-transform duration-300">
        <ArrowUpRight className="text-[#39ff14]" size={20} />
      </div>
    </a>
  </div>
)

export default function ProjectsSection() {
  return (
    <section id="projects" className="section container mx-auto py-20 md:py-32 px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
        <span className="text-[#39ff14]">03/</span> FEATURED WORK
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  )
}

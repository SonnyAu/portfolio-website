const SkillCard = ({ title, skills }: { title: string; skills: string[] }) => (
  <div className="border border-neutral-800 p-6 rounded-lg bg-[#0f0f0f]">
    <h3 className="text-xl font-bold mb-4 text-[#39ff14]">{title}</h3>
    <ul className="grid grid-cols-2 gap-2 text-neutral-300">
      {skills.map((skill) => (
        <li key={skill} className="flex items-center">
          <span className="w-2 h-2 bg-[#39ff14] rounded-full mr-3" />
          {skill}
        </li>
      ))}
    </ul>
  </div>
)

export default function SkillsSection() {
  const frontendSkills = ["React / Next.js", "TypeScript", "GSAP", "Tailwind CSS", "Framer Motion", "Three.js / R3F"]
  const fullstackSkills = ["Node.js", "Express", "PostgreSQL", "Docker", "REST APIs", "GraphQL"]

  return (
    <section id="skills" className="section container mx-auto py-20 md:py-32 px-4">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
        <span className="text-[#39ff14]">02/</span> TECHNICAL TOOLKIT
      </h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <SkillCard title="Front-End" skills={frontendSkills} />
        <SkillCard title="Full-Stack" skills={fullstackSkills} />
      </div>
    </section>
  )
}

import Image from "next/image"

export default function AboutSection() {
  return (
    <section id="about" className="section container mx-auto py-20 md:py-32 px-4">
      <div className="grid md:grid-cols-5 gap-12 items-center">
        <div className="md:col-span-3">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-[#39ff14]">01/</span> ABOUT ME
          </h2>
          <div className="space-y-4 text-neutral-300">
            <p>
              I'm a passionate developer with a foundation in front-end technologies, now accelerating into the world of
              full-stack development. My journey is driven by a relentless pursuit of clean, efficient code and a deep
              appreciation for impactful design.
            </p>
            <p>
              Like a Formula 1 team, I believe in the power of iteration, precision engineering, and seamless
              collaboration to achieve peak performance. I thrive on solving complex problems and architecting solutions
              that are not only functional but also elegant and scalable.
            </p>
            <p>
              My goal is to bridge the gap between intricate back-end logic and flawless user-facing interfaces,
              delivering cohesive and powerful web applications.
            </p>
          </div>
        </div>
        <div className="md:col-span-2 relative h-80 md:h-96">
          <Image
            src="/placeholder.svg?width=400&height=500"
            alt="Developer Portrait"
            fill
            className="object-cover grayscale brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </div>
      </div>
    </section>
  )
}

import { Button } from "@/components/ui/button"

export default function ContactSection() {
  return (
    <section id="contact" className="section container mx-auto py-20 md:py-32 px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        <span className="text-[#39ff14]">04/</span> GET IN TOUCH
      </h2>
      <p className="max-w-xl mx-auto text-neutral-400 mb-8">
        Have a project in mind or just want to connect? I'm always open to new opportunities and collaborations. Let's
        build something exceptional together.
      </p>
      <Button
        size="lg"
        className="bg-transparent border-2 border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14] hover:text-[#0a0a0a] transition-all duration-300 rounded-full px-8 py-6 text-lg"
      >
        <a href="mailto:hello@example.com">SAY HELLO</a>
      </Button>
      <footer className="mt-24 text-neutral-600 text-sm">
        <p>&copy; {new Date().getFullYear()}. Designed & Built with Precision.</p>
      </footer>
    </section>
  )
}

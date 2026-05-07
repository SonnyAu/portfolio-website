"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Send,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  ExternalLink,
  User,
  AtSign,
  FileText,
  MessageSquare,
} from "lucide-react"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!formRef.current) return

    // Animate form elements on scroll
    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(formRef.current?.children ?? []),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate email sending process
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Show success animation
    if (formRef.current && successRef.current) {
      gsap.to(formRef.current, { opacity: 0, y: -20, duration: 0.5 })
      gsap.to(successRef.current, { opacity: 1, y: 0, duration: 0.5, delay: 0.3 })
    }

    setIsSubmitting(false)
    setEmailSent(true)

    // Reset form after 5 seconds
    setTimeout(() => {
      setEmailSent(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
      if (formRef.current && successRef.current) {
        gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.5 })
        gsap.to(successRef.current, { opacity: 0, y: 4, duration: 0.3 })
      }
    }, 5000)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }, [])

  return (
    <section id="contact" className="section container mx-auto py-12 md:py-32 px-2 md:px-4 relative">
      {/* Racing flag pattern */}
      <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-[#00D2BE] to-transparent transform rotate-45" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-5xl font-f1-bold mb-2 md:mb-4">
            <span className="text-[#00D2BE]">05/</span> PIT STOP
          </h2>
          <p className="text-neutral-400 font-f1 max-w-2xl mx-auto text-sm md:text-lg px-2">
            Ready to build something extraordinary? Let's discuss your next project and create digital experiences that
            perform at championship level.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Contact Information */}
          <div className="space-y-4 md:space-y-8">
            <div>
              <h3 className="text-lg md:text-2xl font-f1-bold text-[#00D2BE] mb-3 md:mb-6">GET IN TOUCH</h3>
              <div className="space-y-2 md:space-y-4">
                <div className="flex items-center gap-3 md:gap-4 p-2 md:p-4 border border-neutral-800 rounded-lg bg-[#0f0f0f] hover:border-[#00D2BE] transition-colors duration-300">
                  <Mail className="text-[#00D2BE]" size={16} />
                  <div>
                    <div className="font-f1-bold text-white text-sm md:text-base">Email</div>
                    <div className="text-neutral-400 font-f1 text-xs md:text-sm">au.sonny10@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 p-2 md:p-4 border border-neutral-800 rounded-lg bg-[#0f0f0f] hover:border-[#00D2BE] transition-colors duration-300">
                  <Phone className="text-[#00D2BE]" size={16} />
                  <div>
                    <div className="font-f1-bold text-white text-sm md:text-base">Phone</div>
                    <div className="text-neutral-400 font-f1 text-xs md:text-sm">(408) 669-9299</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 p-2 md:p-4 border border-neutral-800 rounded-lg bg-[#0f0f0f] hover:border-[#00D2BE] transition-colors duration-300">
                  <MapPin className="text-[#00D2BE]" size={16} />
                  <div>
                    <div className="font-f1-bold text-white text-sm md:text-base">Location</div>
                    <div className="text-neutral-400 font-f1 text-xs md:text-sm">San Jose, CA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-base md:text-xl font-f1-bold text-[#00D2BE] mb-2 md:mb-4">FOLLOW THE RACE</h3>
              <div className="flex gap-2 md:gap-4">
                <a
                  href="https://github.com/SonnyAu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 md:p-3 border border-neutral-800 rounded-lg bg-[#0f0f0f] hover:border-[#00D2BE] hover:bg-[#00D2BE] hover:text-black transition-all duration-300"
                >
                  <Github size={16} />
                </a>
                <a
                  href="https://linkedin.com/in/sonny-au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 md:p-3 border border-neutral-800 rounded-lg bg-[#0f0f0f] hover:border-[#00D2BE] hover:bg-[#00D2BE] hover:text-black transition-all duration-300"
                >
                  <Linkedin size={16} />
                </a>
                <a
                  href="https://pal-ate.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 md:p-3 border border-neutral-800 rounded-lg bg-[#0f0f0f] hover:border-[#00D2BE] hover:bg-[#00D2BE] hover:text-black transition-all duration-300"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-[#0f0f0f] border border-[#00D2BE] rounded-lg p-3 md:p-6">
              <h3 className="text-sm md:text-lg font-f1-bold text-[#00D2BE] mb-2 md:mb-3">CURRENT STATUS</h3>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm font-f1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Availability:</span>
                  <span className="text-[#00D2BE]">Open to Opportunities</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Graduation:</span>
                  <span className="text-white">June 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Current Role:</span>
                  <span className="text-white">Frontend Developer Intern</span>
                </div>
              </div>
            </div>
          </div>

          {/* Write an Email Section */}
          <div className="relative">
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-lg p-3 md:p-6 mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                <Mail className="text-[#00D2BE]" size={20} />
                <h3 className="text-base md:text-xl font-f1-bold text-[#00D2BE]">WRITE AN EMAIL</h3>
              </div>
              <p className="text-neutral-400 font-f1 text-xs md:text-sm mb-3 md:mb-6">
                Send me a direct message about opportunities, collaborations, or just to say hello.
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 md:space-y-6">
              {/* Sender Information */}
              <div className="grid md:grid-cols-2 gap-3 md:gap-6">
                <div className="relative">
                  <label className="block text-xs md:text-sm font-f1-bold text-[#00D2BE] mb-1 md:mb-2 flex items-center gap-1 md:gap-2">
                    <User size={12} />
                    YOUR NAME
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="bg-[#0f0f0f] border-neutral-800 text-white font-f1 focus:border-[#00D2BE] pl-3 md:pl-4 py-2 md:py-3 text-sm md:text-base"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs md:text-sm font-f1-bold text-[#00D2BE] mb-1 md:mb-2 flex items-center gap-1 md:gap-2">
                    <AtSign size={12} />
                    YOUR EMAIL
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="bg-[#0f0f0f] border-neutral-800 text-white font-f1 focus:border-[#00D2BE] pl-3 md:pl-4 py-2 md:py-3 text-sm md:text-base"
                    required
                  />
                </div>
              </div>

              {/* Email Subject */}
              <div className="relative">
                <label className="block text-xs md:text-sm font-f1-bold text-[#00D2BE] mb-1 md:mb-2 flex items-center gap-1 md:gap-2">
                  <FileText size={12} />
                  SUBJECT LINE
                </label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What's this email about?"
                  className="bg-[#0f0f0f] border-neutral-800 text-white font-f1 focus:border-[#00D2BE] pl-3 md:pl-4 py-2 md:py-3 text-sm md:text-base"
                  required
                />
              </div>

              {/* Email Body */}
              <div className="relative">
                <label className="block text-xs md:text-sm font-f1-bold text-[#00D2BE] mb-1 md:mb-2 flex items-center gap-1 md:gap-2">
                  <MessageSquare size={12} />
                  MESSAGE BODY
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Tell me about your project, opportunity, or just say hello..."
                  className="bg-[#0f0f0f] border-neutral-800 text-white font-f1 focus:border-[#00D2BE] resize-none pl-3 md:pl-4 py-2 md:py-3 text-sm md:text-base"
                  required
                />
                <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 text-xs text-neutral-500 font-f1">
                  {formData.message.length}/1000
                </div>
              </div>

              {/* Email Preview */}
              {(formData.name || formData.subject || formData.message) && (
                <div className="hidden md:block bg-neutral-900 border border-neutral-700 rounded-lg p-4">
                  <div className="text-xs font-f1-bold text-[#00D2BE] mb-2">EMAIL PREVIEW</div>
                  <div className="space-y-1 text-sm font-f1">
                    <div className="text-neutral-400">
                      <span className="text-[#00D2BE]">From:</span> {formData.name || "Your Name"} &lt;
                      {formData.email || "your.email@example.com"}&gt;
                    </div>
                    <div className="text-neutral-400">
                      <span className="text-[#00D2BE]">To:</span> Sonny Au &lt;au.sonny10@gmail.com&gt;
                    </div>
                    <div className="text-neutral-400">
                      <span className="text-[#00D2BE]">Subject:</span> {formData.subject || "No subject"}
                    </div>
                    {formData.message && (
                      <div className="mt-3 pt-3 border-t border-neutral-700">
                        <div className="text-white whitespace-pre-wrap">{formData.message}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Send Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.message}
                className="w-full bg-[#00D2BE] text-black hover:bg-[#00A896] font-f1-bold py-4 md:py-6 text-sm md:text-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    SENDING EMAIL...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send size={16} />
                    SEND EMAIL
                  </div>
                )}
              </Button>
            </form>

            {/* Success Message */}
            <div
              ref={successRef}
              className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f] rounded-lg opacity-0 translate-y-4 border border-neutral-800"
            >
              <div className="text-center p-4 md:p-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#00D2BE] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Send className="text-black" size={20} />
                </div>
                <h3 className="text-lg md:text-xl font-f1-bold text-[#00D2BE] mb-2">EMAIL SENT SUCCESSFULLY!</h3>
                <p className="text-neutral-400 font-f1 mb-3 md:mb-4 text-sm md:text-base">
                  Your message has been delivered to my inbox. I'll get back to you within 24-48 hours.
                </p>
                <div className="text-xs md:text-sm text-neutral-500 font-f1">
                  This form will reset automatically in a few seconds...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 md:mt-24 pt-4 md:pt-8 border-t border-neutral-800 text-center">
          <p className="text-neutral-600 text-xs md:text-sm font-f1 px-2">
            &copy; {new Date().getFullYear()} Sonny Au. Engineered with Precision. Powered by Performance.
          </p>
        </footer>
      </div>
    </section>
  )
}

"use client";

import { useEffect, useRef, useState, memo, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const skillCategories = [
  {
    title: "FRONTEND",
    skills: ["React/Next.js", "TypeScript", "Tailwind CSS", "React Native"],
    icon: "🎨",
  },
  {
    title: "BACKEND",
    skills: ["Node.js", "PostgreSQL", "Supabase", "GraphQL"],
    icon: "⚙️",
  },
  {
    title: "TOOLS",
    skills: ["Git/GitHub", "Figma", "Unity", "Google Colab"],
    icon: "🛠️",
  },
  {
    title: "LANGUAGES",
    skills: ["JavaScript", "Python", "Java", "C#"],
    icon: "💻",
  },
];

const softSkills = [
  "Team Leadership",
  "Project Management",
  "Problem Solving",
  "Educational Instruction",
  "Startup Operations",
  "Cross-functional Collaboration",
];

const SkillCategory = memo(
  ({
    category,
    index,
  }: {
    category: (typeof skillCategories)[0];
    index: number;
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const skillsListRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLSpanElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
      const card = cardRef.current;
      const header = headerRef.current;
      const skillsList = skillsListRef.current;
      const icon = iconRef.current;
      const title = titleRef.current;

      if (!card || !header || !skillsList || !icon || !title) return;

      // Clear any existing GSAP styles first to prevent hydration issues
      gsap.set([card, icon, title, ...Array.from(skillsList.children)], {
        clearProps: "all",
      });

      // Initial setup - hide elements (only on client after mount)
      gsap.set([card, icon, title], { opacity: 0 });
      gsap.set(card, { y: 50, scale: 0.9, rotationX: 15 });
      gsap.set(icon, { scale: 0, rotation: -180 });
      gsap.set(title, { x: -20 });
      gsap.set(skillsList.children, { opacity: 0, x: -30, scale: 0.8 });

      // Create main timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          end: "top 20%",
          toggleActions: "play none none none",
          id: `skill-card-${index}`,
        },
      });

      // Card entrance animation with F1-inspired effects
      tl.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        duration: 0.8,
        ease: "back.out(1.2)",
        delay: index * 0.15, // Staggered delay
      })
        // Icon animation with racing-style spin
        .to(
          icon,
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.5)",
          },
          "-=0.4"
        )
        // Title slide-in with telemetry effect
        .to(
          title,
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.3"
        )
        // Skills list staggered animation
        .to(
          skillsList.children,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.4,
            stagger: {
              amount: 0.3,
              from: "start",
              ease: "power2.out",
            },
            ease: "back.out(1.1)",
          },
          "-=0.2"
        );

      // Hover animations for enhanced interactivity (only on desktop)
      const isDesktop = window.innerWidth >= 768;
      const handleMouseEnter = () => {
        if (isDesktop && card && icon && skillsList) {
          // Desktop hover effects
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(icon, {
            scale: 1.1,
            rotation: 5,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(skillsList.children, {
            x: 3,
            duration: 0.2,
            stagger: 0.02,
            ease: "power2.out",
          });
        }
      };

      const handleMouseLeave = () => {
        if (isDesktop && card && icon && skillsList) {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(skillsList.children, {
            x: 0,
            duration: 0.2,
            stagger: 0.02,
            ease: "power2.out",
          });
        }
      };

      // Touch-friendly animations for mobile
      const handleTouchStart = () => {
        if (window.innerWidth < 768) {
          gsap.to(card, {
            scale: 0.98,
            duration: 0.1,
            ease: "power2.out",
          });
        }
      };

      const handleTouchEnd = () => {
        if (window.innerWidth < 768) {
          gsap.to(card, {
            scale: 1,
            duration: 0.2,
            ease: "back.out(1.2)",
          });
        }
      };

      // Event listeners
      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);
      card.addEventListener("touchstart", handleTouchStart, { passive: true });
      card.addEventListener("touchend", handleTouchEnd, { passive: true });

      // Cleanup function
      return () => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
        card.removeEventListener("touchstart", handleTouchStart);
        card.removeEventListener("touchend", handleTouchEnd);
        tl.kill();
      };
    }, [index]);

    return (
      <div
        ref={cardRef}
        className="bg-[#0f0f0f] border border-neutral-800 rounded-lg p-3 md:p-6 hover:border-[#00D2BE] transition-colors duration-300 group overflow-hidden will-change-transform"
      >
        <div
          ref={headerRef}
          className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-4 min-h-[24px] md:min-h-[28px]"
        >
          <span
            ref={iconRef}
            className="text-xs md:text-base flex-shrink-0 will-change-transform"
          >
            {category.icon}
          </span>
          <h3
            ref={titleRef}
            className="text-xs md:text-sm font-f1-bold text-[#00D2BE] group-hover:text-white transition-colors duration-300 leading-tight truncate flex-1 will-change-transform"
          >
            {category.title}
          </h3>
        </div>
        <div ref={skillsListRef} className="space-y-2 md:space-y-3">
          {category.skills.map((skill, skillIndex) => (
            <div
              key={skill}
              className="flex items-center gap-2 md:gap-3 will-change-transform"
            >
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#00D2BE] rounded-full flex-shrink-0 opacity-80" />
              <span className="text-neutral-300 font-f1 text-xs leading-relaxed">
                {skill}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

SkillCategory.displayName = "SkillCategory";

export default function SkillsSection() {
  const [isMounted, setIsMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const softSkillsRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const section = sectionRef.current;
    const header = headerRef.current;
    const softSkills = softSkillsRef.current;
    const metrics = metricsRef.current;

    if (!section || !header || !softSkills || !metrics) return;

    // Clear any existing GSAP styles first to prevent hydration issues
    gsap.set([header.children, softSkills.children], { clearProps: "all" });

    // Header animation
    gsap.fromTo(
      header.children,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: header,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );

    // Soft skills animation with wave effect
    gsap.fromTo(
      softSkills.children,
      { scale: 0, opacity: 0, rotation: 10 },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.5,
        stagger: {
          amount: 0.8,
          from: "center",
          grid: "auto",
          ease: "power2.out",
        },
        ease: "back.out(1.3)",
        scrollTrigger: {
          trigger: softSkills,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    // Metrics counter animation (optimized with IntersectionObserver)
    const metricElements = metrics.querySelectorAll("[data-metric]");
    let metricObserver: IntersectionObserver | null = null;

    if (metricElements.length > 0) {
      const observerOptions = { threshold: 0.1, rootMargin: "50px" };

      metricObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const finalValue = element.textContent || "0";
            const index = Array.from(metricElements).indexOf(element);

            gsap.fromTo(
              element,
              { textContent: "0" },
              {
                textContent: finalValue,
                duration: 1.5,
                delay: index * 0.2,
                ease: "power2.out",
                snap: { textContent: 1 },
                onUpdate: function () {
                  if (finalValue.includes("+")) {
                    element.textContent =
                      Math.round(Number(this.targets()[0].textContent)) + "+";
                  } else if (finalValue.includes(".")) {
                    element.textContent = Number.parseFloat(
                      this.targets()[0].textContent
                    ).toFixed(2);
                  }
                },
              }
            );

            if (metricObserver) {
              metricObserver.unobserve(element);
            }
          }
        });
      }, observerOptions);

      metricElements.forEach((element) => metricObserver?.observe(element));
    }

    // Performance optimization: Cleanup on component unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (
          trigger.trigger === section ||
          (trigger.trigger && section.contains(trigger.trigger as Node))
        ) {
          trigger.kill();
        }
      });
      // Cleanup intersection observer
      if (metricObserver) {
        metricElements.forEach((element) => metricObserver?.unobserve(element));
        metricObserver.disconnect();
      }
    };
  }, [isMounted]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="section container mx-auto py-12 md:py-24 px-2 md:px-4"
    >
      <div ref={headerRef} className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-f1-bold mb-2 md:mb-3">
          <span className="text-[#00D2BE]">03/</span> TECHNICAL SPECS
        </h2>
        <p className="text-neutral-400 font-f1 max-w-xl mx-auto text-xs md:text-sm px-2">
          Core technologies and capabilities powering high-performance digital
          solutions.
        </p>
      </div>

      {/* Technical Skills Grid with Staggered Animation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto mb-8 md:mb-12">
        {skillCategories.map((category, index) => (
          <SkillCategory
            key={category.title}
            category={category}
            index={index}
          />
        ))}
      </div>

      {/* Soft Skills with Wave Animation */}
      <div className="max-w-4xl mx-auto mb-8 md:mb-12">
        <div className="bg-[#0f0f0f] border border-neutral-800 rounded-lg p-3 md:p-6">
          <h3 className="text-sm md:text-lg font-f1-bold text-[#00D2BE] mb-3 md:mb-4 text-center">
            LEADERSHIP & COLLABORATION
          </h3>
          <div
            ref={softSkillsRef}
            className="flex flex-wrap justify-center gap-2 md:gap-3"
          >
            {softSkills.map((skill) => (
              <span
                key={skill}
                className="bg-neutral-800 text-[#00D2BE] px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-f1 hover:bg-[#00D2BE] hover:text-black transition-colors duration-300 will-change-transform"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics with Counter Animation */}
      <div
        ref={metricsRef}
        className="flex justify-center gap-4 md:gap-8 text-center"
      >
        <div>
          <div
            data-metric="20+"
            className="text-lg md:text-xl font-f1-bold text-[#00D2BE]"
          >
            20+
          </div>
          <div className="text-xs text-neutral-400 font-f1">TECHNOLOGIES</div>
        </div>
        <div>
          <div
            data-metric="3.75"
            className="text-lg md:text-xl font-f1-bold text-[#00D2BE]"
          >
            3.75
          </div>
          <div className="text-xs text-neutral-400 font-f1">GPA</div>
        </div>
        <div>
          <div
            data-metric="280+"
            className="text-lg md:text-xl font-f1-bold text-[#00D2BE]"
          >
            280+
          </div>
          <div className="text-xs text-neutral-400 font-f1">
            STUDENTS TAUGHT
          </div>
        </div>
      </div>
    </section>
  );
}

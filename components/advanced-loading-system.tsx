"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

interface LoadingSystemProps {
  onComplete?: () => void;
}

export default function AdvancedLoadingSystem({
  onComplete,
}: LoadingSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lightsRef = useRef<(HTMLDivElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const rpmNeedleRef = useRef<HTMLDivElement>(null);
  const speedNeedleRef = useRef<HTMLDivElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("SYSTEM INITIALIZATION");
  const [telemetryData, setTelemetryData] = useState({
    rpm: 0,
    speed: 0,
    gear: 1,
    temp: 20,
    fuel: 100,
  });

  const preloadCriticalResources = useCallback(async () => {
    const criticalResources = [
      "/fonts/Formula1-Regular_web_0.ttf",
      "/fonts/Formula1-Bold_web_0.ttf",
    ];

    const preloadPromises = criticalResources.map((resource) => {
      return new Promise((resolve) => {
        if (resource.endsWith(".ttf")) {
          const font = new FontFace("Formula1", `url(${resource})`);
          font
            .load()
            .then(() => {
              document.fonts.add(font);
              resolve(resource);
            })
            .catch(() => {
              console.warn(`Failed to load font: ${resource}`);
              resolve(resource);
            });
        } else {
          const link = document.createElement("link");
          link.rel = "preload";
          link.href = resource;
          link.as = resource.endsWith(".css") ? "style" : "script";
          link.onload = () => resolve(resource);
          link.onerror = () => {
            console.warn(`Failed to preload: ${resource}`);
            resolve(resource);
          };
          document.head.appendChild(link);
        }
      });
    });

    try {
      await Promise.allSettled(preloadPromises);
      return true;
    } catch (error) {
      console.warn("Some resources failed to preload:", error);
      return true;
    }
  }, []);

  useEffect(() => {
    let animationId: number | undefined = undefined;
    let timelineInstance: gsap.core.Timeline;
    let telemetryInterval: NodeJS.Timeout;

    const initializeLoadingSystem = async () => {
      // Ensure we're in browser environment
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }

      // Wait for GSAP to be available and functional (critical for production)
      // In production, GSAP might be code-split and loaded asynchronously
      let gsapRetries = 0;
      const maxGsapRetries = 100; // Increased for production reliability
      const isGsapReady = () => {
        try {
          return (
            typeof gsap !== "undefined" &&
            gsap !== null &&
            typeof gsap.timeline === "function" &&
            typeof gsap.to === "function" &&
            typeof gsap.set === "function"
          );
        } catch (e) {
          return false;
        }
      };

      while (!isGsapReady() && gsapRetries < maxGsapRetries) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        gsapRetries++;
      }

      if (!isGsapReady()) {
        console.error("GSAP not available or not functional after waiting", {
          gsap: typeof gsap,
          hasTimeline: typeof gsap?.timeline,
          hasTo: typeof gsap?.to,
          hasSet: typeof gsap?.set,
        });
        return;
      }

      console.log("GSAP is ready and functional");

      // Ensure container is visible immediately (before any delay)
      if (containerRef.current) {
        containerRef.current.style.opacity = "1";
        containerRef.current.style.visibility = "visible";
        containerRef.current.style.display = "flex";
        containerRef.current.style.zIndex = "9999";
      }

      // Use requestAnimationFrame multiple times to ensure DOM is fully ready
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );

      // Wait for all critical refs to be attached to the DOM with retry logic
      // Increased retries and added small delays for production reliability
      let retries = 0;
      const maxRetries = 50; // Increased significantly for production
      while (
        (!progressBarRef.current ||
          !rpmNeedleRef.current ||
          !speedNeedleRef.current ||
          !containerRef.current) &&
        retries < maxRetries
      ) {
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 10); // Small delay for production
          });
        });
        retries++;
      }

      // Final check - if refs still aren't ready, wait a bit more
      if (
        !progressBarRef.current ||
        !rpmNeedleRef.current ||
        !speedNeedleRef.current
      ) {
        // Try one more time with a longer wait
        await new Promise((resolve) => setTimeout(resolve, 100));

        // If still not ready, log error but try to continue anyway
        if (
          !progressBarRef.current ||
          !rpmNeedleRef.current ||
          !speedNeedleRef.current
        ) {
          console.warn(
            "Loading system refs not ready after retries, attempting to continue"
          );
        }
      }

      // F1 Loading sequence with realistic telemetry
      const loadingSteps = [
        {
          progress: 10,
          text: "ENGINE STARTUP SEQUENCE",
          rpm: 1000,
          speed: 0,
          temp: 25,
        },
        {
          progress: 25,
          text: "LOADING TELEMETRY SYSTEMS",
          rpm: 3000,
          speed: 0,
          temp: 40,
        },
        {
          progress: 40,
          text: "CALIBRATING SENSORS",
          rpm: 5000,
          speed: 50,
          temp: 60,
        },
        {
          progress: 60,
          text: "OPTIMIZING PERFORMANCE",
          rpm: 8000,
          speed: 120,
          temp: 75,
        },
        {
          progress: 80,
          text: "WARMING UP SYSTEMS",
          rpm: 12000,
          speed: 200,
          temp: 85,
        },
        {
          progress: 95,
          text: "FINAL SYSTEM CHECK",
          rpm: 15000,
          speed: 280,
          temp: 95,
        },
        {
          progress: 100,
          text: "READY FOR RACE START",
          rpm: 8000,
          speed: 0,
          temp: 90,
        },
      ];

      // Simulate realistic F1 telemetry during loading (throttled for performance)
      let lastTelemetryUpdate = 0;
      telemetryInterval = setInterval(() => {
        const now = performance.now();
        if (now - lastTelemetryUpdate >= 200) {
          setTelemetryData((prev) => ({
            rpm: Math.max(0, prev.rpm + (Math.random() - 0.5) * 1000),
            speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 20),
            gear: Math.max(
              1,
              Math.min(
                8,
                prev.gear +
                  (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)
              )
            ),
            temp: Math.max(
              20,
              Math.min(120, prev.temp + (Math.random() - 0.5) * 5)
            ),
            fuel: Math.max(0, prev.fuel - Math.random() * 0.5),
          }));
          lastTelemetryUpdate = now;
        }
      }, 200);

      const preloadPromise = preloadCriticalResources();

      // Initialize all refs before starting animations - ensure they exist
      // In production, we'll try to continue even if some refs aren't ready
      if (
        !progressBarRef.current ||
        !rpmNeedleRef.current ||
        !speedNeedleRef.current
      ) {
        // Final attempt: wait one more frame and check again
        await new Promise((resolve) => requestAnimationFrame(resolve));

        if (
          !progressBarRef.current ||
          !rpmNeedleRef.current ||
          !speedNeedleRef.current
        ) {
          console.error(
            "Loading system refs not ready after all retries. Refs:",
            {
              progressBar: !!progressBarRef.current,
              rpmNeedle: !!rpmNeedleRef.current,
              speedNeedle: !!speedNeedleRef.current,
              container: !!containerRef.current,
            }
          );
          // Don't return - try to start animation anyway with available refs
          // This ensures the animation at least attempts to run in production
        }
      }

      // Clear any existing styles/animations first (only if refs exist)
      const refsToClear = [
        progressBarRef.current,
        rpmNeedleRef.current,
        speedNeedleRef.current,
        textRef.current,
        telemetryRef.current,
        percentageRef.current,
      ].filter(Boolean);

      if (refsToClear.length > 0) {
        gsap.killTweensOf(refsToClear);
      }

      // Initialize progress bar (only if ref exists)
      if (progressBarRef.current) {
        gsap.set(progressBarRef.current, {
          width: "0%",
          clearProps: "transform,opacity",
        });
      }

      // Initialize RPM needle (only if ref exists)
      if (rpmNeedleRef.current) {
        gsap.set(rpmNeedleRef.current, {
          rotation: 0,
          transformOrigin: "50% 100%",
          clearProps: "transform",
        });
      }

      // Initialize speed needle (only if ref exists)
      if (speedNeedleRef.current) {
        gsap.set(speedNeedleRef.current, {
          rotation: 0,
          transformOrigin: "50% 100%",
          clearProps: "transform",
        });
      }

      // Create timeline - this must always happen for animation to run
      // Timeline plays automatically when created
      let timelineResolve: (() => void) | null = null;
      const timelineCompletePromise = new Promise<void>((resolve) => {
        timelineResolve = resolve;
      });

      timelineInstance = gsap.timeline({
        paused: false, // Explicitly ensure it's not paused
        onStart: () => {
          console.log("F1 Loading animation started");
        },
        onComplete: () => {
          console.log("F1 Loading animation completed");
          if (timelineResolve) {
            timelineResolve();
          }
        },
      });

      // Explicitly start the timeline (in case it didn't auto-start in production)
      // This ensures the animation plays even if there are timing issues
      if (timelineInstance.paused()) {
        console.log("Timeline was paused, starting it now");
        timelineInstance.play();
      }

      // Verify timeline is actually playing
      console.log("Timeline created", {
        paused: timelineInstance.paused(),
        duration: timelineInstance.duration(),
        progress: timelineInstance.progress(),
      });

      // Enhanced progress animation with F1 timing - ensure full 0-100% progression
      const totalAnimationDuration = 5; // Total duration for full animation sequence

      // Create progress steps that sequentially build up to 100%
      loadingSteps.forEach((step, index) => {
        const prevProgress = index === 0 ? 0 : loadingSteps[index - 1].progress;
        const progressDelta = step.progress - prevProgress;
        // Each step takes time proportional to its progress delta
        const stepDuration = (totalAnimationDuration * progressDelta) / 100;

        timelineInstance.to(
          {},
          {
            duration: stepDuration,
            onStart: function () {
              // Update text when step starts
              setLoadingText(step.text);
            },
            onUpdate: function () {
              // Smoothly interpolate progress within this step
              const currentProgress =
                prevProgress + progressDelta * this.progress();
              setLoadingProgress(Math.round(currentProgress));

              // Update telemetry smoothly to match loading step targets
              const prevStep =
                index === 0
                  ? { rpm: 0, speed: 0, temp: 20 }
                  : loadingSteps[index - 1];
              setTelemetryData((prev) => ({
                rpm: prevStep.rpm + (step.rpm - prevStep.rpm) * this.progress(),
                speed:
                  prevStep.speed +
                  (step.speed - prevStep.speed) * this.progress(),
                temp:
                  prevStep.temp + (step.temp - prevStep.temp) * this.progress(),
                gear: prev.gear,
                fuel: prev.fuel,
              }));
            },
          }
        );
      });

      // Enhanced progress bar with F1 styling - matches total animation duration
      if (progressBarRef.current) {
        timelineInstance.to(
          progressBarRef.current,
          {
            width: "100%",
            duration: totalAnimationDuration,
            ease: "power2.inOut",
          },
          0
        );
      }

      // F1 Start lights sequence (5 red lights) - synchronized with progress
      lightsRef.current.forEach((light, index) => {
        if (light) {
          timelineInstance.to(
            light,
            {
              backgroundColor: "#ff0000",
              boxShadow: "0 0 20px #ff0000, 0 0 40px #ff0000",
              scale: 1.1,
              duration: 0.2,
              ease: "power2.inOut",
            },
            1.0 + index * 0.5
          );
        }
      });

      // All lights off (race start!) - happens near the end
      timelineInstance.to(
        lightsRef.current.filter(Boolean),
        {
          backgroundColor: "#2a2a2a",
          boxShadow: "none",
          scale: 1,
          duration: 0.1,
          ease: "power2.inOut",
        },
        totalAnimationDuration - 0.8
      );

      // RPM and Speed needle animations - span the full duration
      // Re-check refs are still valid before animating
      if (rpmNeedleRef.current) {
        timelineInstance.to(
          rpmNeedleRef.current,
          {
            rotation: 270,
            duration: totalAnimationDuration * 0.8,
            ease: "power2.inOut",
            transformOrigin: "50% 100%",
            immediateRender: false,
          },
          0.3
        );
      }

      if (speedNeedleRef.current) {
        timelineInstance.to(
          speedNeedleRef.current,
          {
            rotation: 180,
            duration: totalAnimationDuration * 0.85,
            ease: "power2.inOut",
            transformOrigin: "50% 100%",
            immediateRender: false,
          },
          0.5
        );
      }

      // Verify timeline has animations and is ready to play (critical for production)
      const timelineDuration = timelineInstance.duration();
      const hasAnimations = timelineDuration > 0;

      console.log("Timeline verification", {
        duration: timelineDuration,
        hasAnimations,
        paused: timelineInstance.paused(),
        children: timelineInstance.getChildren().length,
      });

      if (!hasAnimations) {
        console.error("Timeline has no animations! This should not happen.");
      }

      // Force timeline to play if it's paused (production safety)
      if (timelineInstance.paused()) {
        console.warn("Timeline is paused after setup, forcing play");
        timelineInstance.play();
      }

      // Wait for main content to be ready before starting exit animation
      // This ensures smooth transition without blank screen
      const waitForMainContent = async (): Promise<void> => {
        return new Promise((resolve) => {
          let checks = 0;
          const maxChecks = 100; // Check for up to 10 seconds (100 * 100ms)

          const checkMainContent = () => {
            checks++;

            // Check if main content exists and has some content loaded
            const mainContent = document.querySelector("[data-main-content]");
            const hasContent = mainContent && mainContent.children.length > 0;

            // Also check if React has hydrated by looking for interactive elements
            // These elements exist even if hidden by CSS
            const hasHydrated =
              document.querySelector("header, #hero, main, section") !== null;

            // If we have content structure, we're ready (but wait a bit for smooth transition)
            if ((hasContent || hasHydrated) && checks > 5) {
              // Content is ready, wait a bit more for smooth transition
              setTimeout(resolve, 300);
              return;
            }

            if (checks >= maxChecks) {
              // Timeout - proceed anyway to avoid infinite wait
              resolve();
              return;
            }

            // Check again after a short delay
            setTimeout(checkMainContent, 100);
          };

          // Start checking after animation has played for most of its duration
          // This allows the animation to play while we check for content readiness
          setTimeout(checkMainContent, totalAnimationDuration * 1000 - 1000);
        });
      };

      // timelineCompletePromise is already created above when timeline is initialized
      // It will resolve when the timeline's onComplete fires
      // Add a fallback timeout in case the timeline doesn't complete
      const timelineCompleteWithFallback = Promise.race([
        timelineCompletePromise,
        new Promise<void>((resolve) => {
          setTimeout(() => {
            console.warn("Timeline completion timeout - proceeding anyway");
            resolve();
          }, (totalAnimationDuration + 1) * 1000);
        }),
      ]);

      // Wait for main content to be ready (runs in parallel)
      const contentReadyPromise = waitForMainContent();

      // Wait for both animation to complete AND content to be ready
      // This ensures the animation plays fully AND content is ready before exit
      await Promise.all([timelineCompleteWithFallback, contentReadyPromise]);

      // Add a small delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Now start the exit animation (content is ready, so no blank screen)
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.1,
          filter: "blur(10px)",
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            if (containerRef.current) {
              containerRef.current.style.display = "none";
              timelineInstance.kill();
              if (animationId) cancelAnimationFrame(animationId);
              clearInterval(telemetryInterval);
              // Mark body as preloader complete to allow main content to show
              if (typeof document !== "undefined") {
                document.body.classList.add("preloader-complete");
              }
              onComplete?.();
              window.dispatchEvent(new CustomEvent("preloaderComplete"));
            }
          },
        });
      }

      // The exit animation is handled separately above, so we don't need to wait for timeline completion
      // The function will complete after the exit animation finishes (handled in onComplete callback)
    };

    initializeLoadingSystem();

    return () => {
      if (timelineInstance) timelineInstance.kill();
      if (animationId) cancelAnimationFrame(animationId);
      if (telemetryInterval) clearInterval(telemetryInterval);
      setLoadingProgress(0);
      setLoadingText("SYSTEM INITIALIZATION");
    };
  }, [preloadCriticalResources, onComplete]);

  return (
    <div
      ref={containerRef}
      data-loading-system
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
      style={{ opacity: 1, visibility: "visible", display: "flex" }}
    >
      {/* Enhanced F1 atmosphere */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D2BE]/20 via-transparent to-[#ff0000]/10" />
        <div className="absolute inset-0 bg-grid animate-pulse" />
      </div>

      {/* F1 Racing stripes */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#00D2BE] to-transparent transform -skew-y-12 scale-150 animate-pulse" />
        <div className="absolute top-1/3 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#ff0000] to-transparent transform skew-y-12 scale-150 animate-pulse" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
        {/* Enhanced F1 branding */}
        <div
          ref={textRef}
          className="text-center"
        >
          <div className="text-3xl md:text-5xl font-f1-bold text-[#00D2BE] mb-3 relative">
            F1/DEV PORTFOLIO
            <div className="absolute -inset-4 bg-[#00D2BE]/10 blur-2xl rounded-full animate-pulse" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <div className="text-sm md:text-lg text-neutral-400 font-f1 mb-4">
            {loadingText}
          </div>

          {/* Live telemetry display */}
          <div
            ref={telemetryRef}
            className="flex justify-center gap-4 text-xs font-f1"
          >
            <div className="bg-black/60 border border-[#00D2BE]/30 rounded px-2 py-1">
              <span className="text-[#00D2BE]">RPM:</span>{" "}
              <span className="text-red-400">
                {Math.round(telemetryData.rpm)}
              </span>
            </div>
            <div className="bg-black/60 border border-[#00D2BE]/30 rounded px-2 py-1">
              <span className="text-[#00D2BE]">KPH:</span>{" "}
              <span className="text-yellow-400">
                {Math.round(telemetryData.speed)}
              </span>
            </div>
            <div className="bg-black/60 border border-[#00D2BE]/30 rounded px-2 py-1">
              <span className="text-[#00D2BE]">TEMP:</span>{" "}
              <span className="text-green-400">
                {Math.round(telemetryData.temp)}°C
              </span>
            </div>
          </div>
        </div>

        {/* F1 Start Lights with enhanced styling */}
        <div className="flex items-center justify-center">
          <div className="flex space-x-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="relative">
                <div
                  ref={(el) => {
                    lightsRef.current[i] = el;
                  }}
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#2a2a2a] border-2 border-neutral-600 relative overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
                  <div className="absolute inset-1 rounded-full border border-neutral-500/30" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-neutral-700 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* F1 Style Gauges */}
        <div className="flex gap-8">
          {/* RPM Gauge */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-[#00D2BE]/40 bg-black/60 backdrop-blur-sm">
              <div className="absolute inset-2 rounded-full border border-red-500/50">
                <div
                  ref={rpmNeedleRef}
                  className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-red-500 origin-bottom transform -translate-x-1/2 -translate-y-full"
                  style={{
                    transformOrigin: "50% 100%",
                    transform: "translate(-50%, -100%) rotate(0deg)",
                  }}
                />
              </div>
            </div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-f1-bold text-[#00D2BE]">
              RPM
            </div>
          </div>

          {/* Speed Gauge */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-[#00D2BE]/40 bg-black/60 backdrop-blur-sm">
              <div className="absolute inset-2 rounded-full border border-yellow-500/50">
                <div
                  ref={speedNeedleRef}
                  className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-yellow-500 origin-bottom transform -translate-x-1/2 -translate-y-full"
                  style={{
                    transformOrigin: "50% 100%",
                    transform: "translate(-50%, -100%) rotate(0deg)",
                  }}
                />
              </div>
            </div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-f1-bold text-[#00D2BE]">
              KPH
            </div>
          </div>
        </div>

        {/* Enhanced progress section */}
        <div className="w-full max-w-md">
          <div className="relative w-full h-3 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-[#00D2BE] via-[#00A896] to-[#ff0000] rounded-full relative"
              style={{ width: "0%" }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/60 animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
          </div>
          <div className="flex justify-between mt-3 text-sm text-neutral-500 font-f1">
            <span>0%</span>
            <span
              ref={percentageRef}
              className="text-[#00D2BE] font-f1-bold"
            >
              {loadingProgress}%
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* F1 Status indicators */}
        <div className="flex items-center gap-4 text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>SYSTEMS ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span>LOADING ASSETS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span>STANDBY</span>
          </div>
        </div>
      </div>

      {/* Enhanced corner decorations with F1 styling */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-[#00D2BE] opacity-40 rounded-tl-lg">
        <div className="absolute top-2 left-2 w-2 h-2 bg-[#00D2BE] rounded-full animate-pulse" />
      </div>
      <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-[#00D2BE] opacity-40 rounded-tr-lg">
        <div className="absolute top-2 right-2 w-2 h-2 bg-[#00D2BE] rounded-full animate-pulse" />
      </div>
      <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-[#00D2BE] opacity-40 rounded-bl-lg">
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#00D2BE] rounded-full animate-pulse" />
      </div>
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-[#00D2BE] opacity-40 rounded-br-lg">
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#00D2BE] rounded-full animate-pulse" />
      </div>
    </div>
  );
}

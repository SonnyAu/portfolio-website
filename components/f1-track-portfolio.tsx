"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"

type ThreeNamespace = any

declare global {
  interface Window {
    THREE?: ThreeNamespace
  }
}

type Station = {
  id: string
  label: string
  title: string
  short: string
  details: string[]
  position: [number, number, number]
  accent: string
}

type Telemetry = {
  speed: number
  gear: number
  rpm: number
  sector: string
}

const MERCEDES = "#00D2BE"
const PETRONAS = "#00F5D4"
const trackPoints: Array<[number, number, number]> = [
  [-32, 0, -18],
  [-10, 0, -30],
  [18, 0, -26],
  [34, 0, -8],
  [26, 0, 16],
  [4, 0, 28],
  [-24, 0, 22],
  [-38, 0, 2],
]

const stations: Station[] = [
  {
    id: "about",
    label: "01 / ABOUT",
    title: "Driver Profile",
    short: "SJSU CS engineer building fast, polished full-stack products.",
    details: ["President's Scholar mindset", "React Native + AI specialist", "Product-focused startup builder"],
    position: [-20, 0, -28],
    accent: MERCEDES,
  },
  {
    id: "experience",
    label: "02 / EXPERIENCE",
    title: "Race History",
    short: "Frontend React Developer Intern experience with major performance wins.",
    details: ["GBCS Group internship", "Performance-focused UI systems", "Cross-functional engineering delivery"],
    position: [36, 0, -4],
    accent: "#E8E8E8",
  },
  {
    id: "skills",
    label: "03 / SKILLS",
    title: "Engineering Setup",
    short: "Next.js, TypeScript, Tailwind, React Native, Python, ML, and cloud tools.",
    details: ["Frontend systems", "Mobile apps", "ML-backed product features"],
    position: [15, 0, 28],
    accent: PETRONAS,
  },
  {
    id: "projects",
    label: "04 / PROJECTS",
    title: "Pit Garage",
    short: "PalAte and selected product builds staged around the circuit.",
    details: ["PalAte co-founder", "Food-tech product launch", "Portfolio-ready demos"],
    position: [-35, 0, 10],
    accent: "#FF3333",
  },
  {
    id: "contact",
    label: "05 / CONTACT",
    title: "Finish Straight",
    short: "Ready for internships, early-career software roles, and ambitious builds.",
    details: ["Open to collaboration", "Bay Area / remote", "Let’s ship something fast"],
    position: [-32, 0, -16],
    accent: "#FFFFFF",
  },
]

const loadThree = () => {
  if (typeof window === "undefined") return Promise.reject(new Error("three.js requires the browser"))
  if (window.THREE) return Promise.resolve(window.THREE)

  return new Promise<ThreeNamespace>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-threejs="portfolio-track"]')

    if (existingScript) {
      existingScript.addEventListener("load", () => window.THREE ? resolve(window.THREE) : reject(new Error("THREE global missing")), { once: true })
      existingScript.addEventListener("error", () => reject(new Error("Failed to load three.js")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.min.js"
    script.async = true
    script.defer = true
    script.dataset.threejs = "portfolio-track"
    script.onload = () => window.THREE ? resolve(window.THREE) : reject(new Error("THREE global missing"))
    script.onerror = () => reject(new Error("Failed to load three.js"))
    document.head.appendChild(script)
  })
}

const createTextSprite = (THREE: ThreeNamespace, text: string, color: string) => {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 160
  const context = canvas.getContext("2d")

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "rgba(3, 8, 10, 0.82)"
    context.strokeStyle = color
    context.lineWidth = 4
    context.roundRect(10, 10, 492, 140, 22)
    context.fill()
    context.stroke()
    context.font = "700 34px Arial"
    context.fillStyle = color
    context.textAlign = "center"
    context.fillText(text, 256, 92)
  }

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(10, 3.1, 1)
  return sprite
}

export default function F1TrackPortfolio() {
  const mountRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [activeStation, setActiveStation] = useState<Station>(stations[0])
  const [telemetry, setTelemetry] = useState<Telemetry>({ speed: 0, gear: 1, rpm: 1200, sector: "GARAGE" })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSceneReady, setIsSceneReady] = useState(false)
  const keys = useRef<Record<string, boolean>>({})
  const carState = useRef({ x: -30, z: -17, heading: 0.42, velocity: 0, targetHeading: 0.42 })
  const activeStationRef = useRef(activeStation)

  const nearestStation = useCallback((x: number, z: number) => {
    return stations.reduce(
      (nearest, station) => {
        const dx = station.position[0] - x
        const dz = station.position[2] - z
        const distance = Math.hypot(dx, dz)
        return distance < nearest.distance ? { station, distance } : nearest
      },
      { station: stations[0], distance: Number.POSITIVE_INFINITY },
    )
  }, [])

  const jumpToStation = useCallback((station: Station) => {
    const [x, , z] = station.position
    carState.current.x = x - 4
    carState.current.z = z + 3
    carState.current.velocity = 0
    setActiveStation(station)
    activeStationRef.current = station
    gsap.fromTo(overlayRef.current, { y: 18, autoAlpha: 0.65 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" })
  }, [])

  const stationButtons = useMemo(() => stations.map((station) => (
    <button
      key={station.id}
      type="button"
      onClick={() => jumpToStation(station)}
      className="rounded-full border border-white/10 bg-black/50 px-3 py-2 text-left text-[10px] uppercase tracking-[0.22em] text-neutral-300 transition hover:border-[#00D2BE] hover:text-[#00D2BE]"
    >
      {station.label}
    </button>
  )), [jumpToStation])

  useEffect(() => {
    activeStationRef.current = activeStation
  }, [activeStation])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(event.code)) {
        event.preventDefault()
        keys.current[event.code] = true
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keys.current[event.code] = false
    }

    const handlePointerMove = (event: PointerEvent) => {
      const width = window.innerWidth || 1
      const offset = (event.clientX / width - 0.5) * 0.9
      carState.current.targetHeading = carState.current.heading - offset
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("pointermove", handlePointerMove)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("pointermove", handlePointerMove)
    }
  }, [])

  useEffect(() => {
    let cleanup: (() => void) | undefined
    let cancelled = false

    loadThree()
      .then((THREE) => {
        if (cancelled || !mountRef.current) return

        const mount = mountRef.current
        const scene = new THREE.Scene()
        scene.background = new THREE.Color("#030506")
        scene.fog = new THREE.Fog("#030506", 50, 145)

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7))
        renderer.setSize(mount.clientWidth, mount.clientHeight)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        mount.appendChild(renderer.domElement)

        const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 300)
        camera.position.set(-18, 34, 32)

        const ambientLight = new THREE.AmbientLight("#7fded5", 0.75)
        scene.add(ambientLight)
        const keyLight = new THREE.DirectionalLight("#ffffff", 2.6)
        keyLight.position.set(-28, 50, 25)
        keyLight.castShadow = true
        keyLight.shadow.mapSize.set(1024, 1024)
        scene.add(keyLight)
        const cyanLight = new THREE.PointLight(MERCEDES, 3.4, 90)
        cyanLight.position.set(0, 14, 0)
        scene.add(cyanLight)

        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(150, 110, 1, 1),
          new THREE.MeshStandardMaterial({ color: "#06100f", roughness: 0.92, metalness: 0.05 }),
        )
        ground.rotation.x = -Math.PI / 2
        ground.receiveShadow = true
        scene.add(ground)

        const grid = new THREE.GridHelper(150, 38, "#083f3b", "#092220")
        grid.position.y = 0.012
        scene.add(grid)

        const curve = new THREE.CatmullRomCurve3(trackPoints.map(([x, y, z]) => new THREE.Vector3(x, y + 0.18, z)), true, "catmullrom", 0.5)
        const track = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 260, 3.6, 18, true),
          new THREE.MeshStandardMaterial({ color: "#111315", roughness: 0.62, metalness: 0.18 }),
        )
        track.receiveShadow = true
        scene.add(track)

        const racingLine = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 260, 0.16, 8, true),
          new THREE.MeshBasicMaterial({ color: MERCEDES }),
        )
        racingLine.position.y = 0.38
        scene.add(racingLine)

        const kerbMaterialA = new THREE.MeshBasicMaterial({ color: "#f6f6f6" })
        const kerbMaterialB = new THREE.MeshBasicMaterial({ color: "#ff2020" })
        for (let index = 0; index < 56; index += 1) {
          const point = curve.getPoint(index / 56)
          const tangent = curve.getTangent(index / 56)
          const kerb = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.15, 0.55), index % 2 === 0 ? kerbMaterialA : kerbMaterialB)
          kerb.position.set(point.x + tangent.z * 4.2, 0.34, point.z - tangent.x * 4.2)
          kerb.rotation.y = Math.atan2(tangent.x, tangent.z)
          scene.add(kerb)
        }

        const car = new THREE.Group()
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(1.45, 0.45, 3.15),
          new THREE.MeshStandardMaterial({ color: MERCEDES, roughness: 0.32, metalness: 0.55 }),
        )
        body.position.y = 0.65
        body.castShadow = true
        car.add(body)
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.28, 2.1), new THREE.MeshStandardMaterial({ color: "#e8fefa", roughness: 0.25, metalness: 0.5 }))
        nose.position.set(0, 0.54, -1.9)
        nose.castShadow = true
        car.add(nose)
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.045, 8, 24), new THREE.MeshBasicMaterial({ color: "#020202" }))
        halo.position.set(0, 0.96, -0.25)
        halo.rotation.x = Math.PI / 2
        car.add(halo)
        ;[-0.9, 0.9].forEach((x) => [-1.08, 1.12].forEach((z) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.34, 18), new THREE.MeshStandardMaterial({ color: "#050505", roughness: 0.7 }))
          wheel.position.set(x, 0.43, z)
          wheel.rotation.z = Math.PI / 2
          wheel.castShadow = true
          car.add(wheel)
        }))
        const rearWing = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.18, 0.34), new THREE.MeshBasicMaterial({ color: "#050505" }))
        rearWing.position.set(0, 0.9, 1.72)
        car.add(rearWing)
        car.position.set(carState.current.x, 0, carState.current.z)
        scene.add(car)

        stations.forEach((station) => {
          const beacon = new THREE.Group()
          const marker = new THREE.Mesh(
            new THREE.CylinderGeometry(1.25, 1.25, 0.16, 40),
            new THREE.MeshBasicMaterial({ color: station.accent, transparent: true, opacity: 0.78 }),
          )
          marker.position.y = 0.28
          beacon.add(marker)
          const ring = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.06, 8, 64), new THREE.MeshBasicMaterial({ color: station.accent }))
          ring.rotation.x = Math.PI / 2
          ring.position.y = 0.55
          beacon.add(ring)
          const sprite = createTextSprite(THREE, station.title, station.accent)
          sprite.position.y = 5
          beacon.add(sprite)
          beacon.position.set(...station.position)
          scene.add(beacon)
          gsap.to(ring.rotation, { z: Math.PI * 2, duration: 5, repeat: -1, ease: "none" })
          gsap.to(sprite.position, { y: 5.8, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" })
        })

        const resize = () => {
          if (!mountRef.current) return
          const width = mountRef.current.clientWidth
          const height = mountRef.current.clientHeight
          camera.aspect = width / Math.max(height, 1)
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
        }

        let animationFrame = 0
        let lastTime = performance.now()
        let lastTelemetryRender = 0
        const clockSector = ["S1", "S2", "S3", "DRS"]

        const animate = (time: number) => {
          const delta = Math.min((time - lastTime) / 1000, 0.04)
          lastTime = time
          const state = carState.current
          const input = keys.current
          const accelerating = input.KeyW || input.ArrowUp
          const braking = input.KeyS || input.ArrowDown
          const left = input.KeyA || input.ArrowLeft
          const right = input.KeyD || input.ArrowRight

          if (accelerating) state.velocity += 16 * delta
          if (braking) state.velocity -= 18 * delta
          state.velocity *= 0.982
          state.velocity = Math.max(-7, Math.min(24, state.velocity))
          if (left) state.heading += 2.5 * delta * Math.max(0.35, Math.abs(state.velocity) / 10)
          if (right) state.heading -= 2.5 * delta * Math.max(0.35, Math.abs(state.velocity) / 10)
          if (!left && !right) state.heading += (state.targetHeading - state.heading) * 0.018

          state.x += Math.sin(state.heading) * state.velocity * delta
          state.z += Math.cos(state.heading) * state.velocity * delta
          state.x = Math.max(-55, Math.min(55, state.x))
          state.z = Math.max(-40, Math.min(40, state.z))

          car.position.set(state.x, 0, state.z)
          car.rotation.y = state.heading
          cyanLight.position.set(state.x, 10, state.z)

          const cameraTarget = new THREE.Vector3(state.x - Math.sin(state.heading) * 18, 25, state.z - Math.cos(state.heading) * 18)
          camera.position.lerp(cameraTarget, 0.045)
          camera.lookAt(state.x, 0.3, state.z)

          const proximity = nearestStation(state.x, state.z)
          if (proximity.distance < 9.5 && proximity.station.id !== activeStationRef.current.id) {
            activeStationRef.current = proximity.station
            setActiveStation(proximity.station)
            gsap.fromTo(overlayRef.current, { x: 18, autoAlpha: 0.72 }, { x: 0, autoAlpha: 1, duration: 0.38, ease: "power2.out" })
          }

          if (time - lastTelemetryRender > 140) {
            lastTelemetryRender = time
            setTelemetry({
              speed: Math.round(Math.abs(state.velocity) * 14),
              gear: Math.max(1, Math.min(8, Math.ceil(Math.abs(state.velocity) / 3.2))),
              rpm: Math.round(1200 + Math.abs(state.velocity) * 610),
              sector: clockSector[Math.floor((time / 2600) % clockSector.length)],
            })
          }

          renderer.render(scene, camera)
          animationFrame = requestAnimationFrame(animate)
        }

        window.addEventListener("resize", resize)
        animationFrame = requestAnimationFrame(animate)
        setIsSceneReady(true)
        gsap.fromTo(overlayRef.current, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", delay: 0.25 })

        cleanup = () => {
          cancelAnimationFrame(animationFrame)
          window.removeEventListener("resize", resize)
          renderer.dispose()
          scene.traverse((object: any) => {
            const mesh = object as unknown as { geometry?: { dispose: () => void }, material?: { dispose?: () => void } | Array<{ dispose?: () => void }> }
            mesh.geometry?.dispose()
            if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose?.())
            else mesh.material?.dispose?.()
          })
          if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement)
        }
      })
      .catch((error: Error) => {
        setLoadError(error.message)
      })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [nearestStation])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030506] text-white">
      <div ref={mountRef} className="absolute inset-0" aria-label="Interactive 3D Formula 1 portfolio circuit" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,210,190,0.22),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.72))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 border-t-2 border-[#00D2BE]/50 bg-gradient-to-b from-[#00D2BE]/10 to-transparent" />

      <header className="absolute left-0 right-0 top-0 z-20 flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-8">
        <div className="rounded-2xl border border-[#00D2BE]/25 bg-black/55 p-4 shadow-2xl shadow-[#00D2BE]/10 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#00D2BE]">Mercedes-AMG F1 / Dev Garage</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black uppercase leading-none tracking-[-0.06em] text-white md:text-7xl">
            Drive the portfolio circuit.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300 md:text-base">
            Use <span className="text-[#00D2BE]">WASD</span> or arrow keys to pilot the car between portfolio checkpoints. Hover your cursor to bias the racing line, then pull into a station to reveal the next module.
          </p>
        </div>

        <div className="grid min-w-[240px] grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/65 p-3 font-mono text-xs uppercase backdrop-blur-md">
          <div><span className="block text-neutral-500">Speed</span><strong className="text-xl text-[#00D2BE]">{telemetry.speed}</strong></div>
          <div><span className="block text-neutral-500">Gear</span><strong className="text-xl text-white">{telemetry.gear}</strong></div>
          <div><span className="block text-neutral-500">RPM</span><strong className="text-xl text-[#00D2BE]">{telemetry.rpm}</strong></div>
          <div className="col-span-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#00D2BE]" style={{ width: `${Math.min(100, telemetry.rpm / 110)}%` }} /></div>
          <div className="col-span-3 text-right text-[10px] tracking-[0.28em] text-neutral-400">SECTOR {telemetry.sector}</div>
        </div>
      </header>

      <aside ref={overlayRef} className="absolute bottom-4 left-4 right-4 z-20 md:bottom-8 md:left-auto md:right-8 md:w-[430px]">
        <div className="rounded-3xl border border-[#00D2BE]/30 bg-black/70 p-5 shadow-2xl shadow-[#00D2BE]/15 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#00D2BE]">{activeStation.label}</p>
            <span className="rounded-full border border-[#00D2BE]/30 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-neutral-300">Checkpoint</span>
          </div>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">{activeStation.title}</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-300">{activeStation.short}</p>
          <ul className="mt-4 grid gap-2 text-sm text-neutral-200">
            {activeStation.details.map((detail) => (
              <li key={detail} className="flex items-center gap-3"><span className="h-1.5 w-8 rounded-full bg-[#00D2BE]" />{detail}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">{stationButtons}</div>
        </div>
      </aside>

      <div className="absolute bottom-4 left-4 z-10 hidden rounded-full border border-white/10 bg-black/55 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-neutral-300 backdrop-blur md:block">
        Controls: W accelerate · S brake/reverse · A/D steer · click checkpoint to jump
      </div>

      {(!isSceneReady || loadError) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#030506] text-center">
          <div className="max-w-md rounded-3xl border border-[#00D2BE]/30 bg-black/80 p-8 shadow-2xl shadow-[#00D2BE]/20">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#00D2BE] border-t-transparent" />
            <h2 className="text-2xl font-black uppercase text-[#00D2BE]">{loadError ? "3D systems offline" : "Loading 3D circuit"}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              {loadError ? "The portfolio shell is ready, but the three.js runtime could not load from the CDN." : "Building the track, telemetry beacons, and Mercedes F1 cursor car."}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"
import * as THREE from "three"
import { buildScene, type SceneRig } from "./f1/scene/buildScene"
import { BRIDGE_THRESHOLD, getCircuitSectionAt, SUZUKA_LANDMARKS, SUZUKA_TRACK_POINTS } from "./f1/scene/track"
import type { Station } from "./f1/scene/stations"

type Telemetry = {
  speed: number
  gear: number
  rpm: number
  section: string
  trackT: number
  carX: number
  carY: number
  carZ: number
}

type CarState = {
  x: number
  y: number
  z: number
  heading: number
  velocity: number
  steering: number
}

const START_GRID = SUZUKA_LANDMARKS.startFinish
const MINIMAP_WIDTH = 236
const MINIMAP_HEIGHT = 132
const MINIMAP_PAD = 10

const MINIMAP_SAMPLES = (() => {
  const curve = new THREE.CatmullRomCurve3(
    SUZUKA_TRACK_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    true,
    "centripetal",
    0.5,
  )
  const samples: Array<{ x: number; y: number; z: number; t: number }> = []
  for (let i = 0; i <= 220; i += 1) {
    const t = i / 220
    const point = curve.getPoint(t)
    samples.push({ x: point.x, y: point.y, z: point.z, t })
  }
  return samples
})()

const MINIMAP_BOUNDS = MINIMAP_SAMPLES.reduce(
  (bounds, point) => ({
    minX: Math.min(bounds.minX, point.x),
    maxX: Math.max(bounds.maxX, point.x),
    minZ: Math.min(bounds.minZ, point.z),
    maxZ: Math.max(bounds.maxZ, point.z),
  }),
  { minX: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, minZ: Number.POSITIVE_INFINITY, maxZ: Number.NEGATIVE_INFINITY },
)

const MINIMAP_SCALE = Math.min(
  (MINIMAP_WIDTH - MINIMAP_PAD * 2) / Math.max(1, MINIMAP_BOUNDS.maxX - MINIMAP_BOUNDS.minX),
  (MINIMAP_HEIGHT - MINIMAP_PAD * 2) / Math.max(1, MINIMAP_BOUNDS.maxZ - MINIMAP_BOUNDS.minZ),
)

const projectMinimapPoint = (x: number, z: number): { x: number; y: number } => ({
  x: MINIMAP_PAD + (x - MINIMAP_BOUNDS.minX) * MINIMAP_SCALE,
  y: MINIMAP_HEIGHT - MINIMAP_PAD - (z - MINIMAP_BOUNDS.minZ) * MINIMAP_SCALE,
})

const pointsToPolyline = (points: Array<{ x: number; z: number }>): string => (
  points.map((point) => {
    const projected = projectMinimapPoint(point.x, point.z)
    return `${projected.x.toFixed(1)},${projected.y.toFixed(1)}`
  }).join(" ")
)

const MINIMAP_TRACK_POLYLINE = pointsToPolyline(MINIMAP_SAMPLES)
const MINIMAP_BRIDGE_POLYLINE = pointsToPolyline(MINIMAP_SAMPLES.filter((point) => point.y > BRIDGE_THRESHOLD))
const MINIMAP_START = projectMinimapPoint(SUZUKA_LANDMARKS.startFinish.position[0], SUZUKA_LANDMARKS.startFinish.position[2])
const DRIVE_BOUNDS_MARGIN = 90
const DRIVE_BOUNDS = {
  minX: MINIMAP_BOUNDS.minX - DRIVE_BOUNDS_MARGIN,
  maxX: MINIMAP_BOUNDS.maxX + DRIVE_BOUNDS_MARGIN,
  minZ: MINIMAP_BOUNDS.minZ - DRIVE_BOUNDS_MARGIN,
  maxZ: MINIMAP_BOUNDS.maxZ + DRIVE_BOUNDS_MARGIN,
}

export default function F1TrackPortfolio() {
  const mountRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [activeStation, setActiveStation] = useState<Station | null>(null)
  const [stationsList, setStationsList] = useState<Station[]>([])
  const [telemetry, setTelemetry] = useState<Telemetry>({
    speed: 0,
    gear: 1,
    rpm: 1200,
    section: "PIT STRAIGHT",
    trackT: 0,
    carX: START_GRID.position[0],
    carY: START_GRID.position[1],
    carZ: START_GRID.position[2],
  })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSceneReady, setIsSceneReady] = useState(false)
  const keys = useRef<Record<string, boolean>>({})
  const carState = useRef<CarState>({
    x: START_GRID.position[0],
    y: START_GRID.position[1],
    z: START_GRID.position[2],
    heading: START_GRID.heading,
    velocity: 0,
    steering: 0,
  })
  const activeStationRef = useRef<Station | null>(activeStation)
  const stationsRef = useRef<Station[]>([])
  const minimapCar = projectMinimapPoint(telemetry.carX, telemetry.carZ)
  const minimapStations = useMemo(() => stationsList.map((station) => ({
    id: station.id,
    accent: station.accent,
    ...projectMinimapPoint(station.position[0], station.position[2]),
  })), [stationsList])

  const nearestStation = useCallback((x: number, z: number) => {
    const list = stationsRef.current
    if (!list.length) return { station: null as Station | null, distance: Number.POSITIVE_INFINITY }
    return list.reduce(
      (nearest, station) => {
        const dx = station.position[0] - x
        const dz = station.position[2] - z
        const distance = Math.hypot(dx, dz)
        return distance < nearest.distance ? { station, distance } : nearest
      },
      { station: list[0], distance: Number.POSITIVE_INFINITY },
    )
  }, [])

  const revealStation = useCallback((station: Station | null) => {
    activeStationRef.current = station
    setActiveStation(station)
    if (station) {
      gsap.fromTo(
        overlayRef.current,
        { scale: 0.92, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.32, ease: "power3.out" },
      )
    } else {
      gsap.to(overlayRef.current, { scale: 0.96, autoAlpha: 0, duration: 0.22, ease: "power2.in" })
    }
  }, [])

  const jumpToStation = useCallback((station: Station) => {
    const [x, , z] = station.position
    carState.current.x = x
    carState.current.z = z
    carState.current.y = station.position[1]
    carState.current.velocity = 0
    carState.current.steering = 0
    revealStation(station)
  }, [revealStation])

  const stationButtons = useMemo(() => stationsList.map((station) => (
    <button
      key={station.id}
      type="button"
      onClick={() => jumpToStation(station)}
      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-[10px] uppercase tracking-[0.22em] text-neutral-300 transition hover:border-[#00D2BE] hover:bg-[#00D2BE]/10 hover:text-[#00D2BE]"
    >
      {station.label}
    </button>
  )), [jumpToStation, stationsList])

  useEffect(() => {
    activeStationRef.current = activeStation
  }, [activeStation])

  useEffect(() => {
    const controls = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Space"]
    const handleKeyDown = (event: KeyboardEvent) => {
      if (controls.includes(event.code)) {
        event.preventDefault()
        keys.current[event.code] = true
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (controls.includes(event.code)) {
        event.preventDefault()
        keys.current[event.code] = false
      }
    }
    window.addEventListener("keydown", handleKeyDown, { passive: false })
    window.addEventListener("keyup", handleKeyUp, { passive: false })
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useEffect(() => {
    if (!mountRef.current) return
    let rig: SceneRig | null = null
    let animationFrame = 0
    let cancelled = false

    try {
      rig = buildScene(mountRef.current)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Three.js scene failed to initialize")
      return
    }

    const { renderer, camera, environment, stations, car, carGlow, track } = rig
    stationsRef.current = stations
    setStationsList(stations)

    const { sampler, trackHalfWidth } = track
    const colliders = environment.colliders
    const CAR_HALF_WIDTH = 1.5

    car.root.position.set(carState.current.x, carState.current.y, carState.current.z)
    car.root.rotation.y = carState.current.heading

    const resize = () => {
      if (!mountRef.current || !rig) return
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      rig.camera.aspect = width / Math.max(height, 1)
      rig.camera.updateProjectionMatrix()
      rig.renderer.setSize(width, height)
    }
    window.addEventListener("resize", resize)

    let lastTime = performance.now()
    let lastTelemetryRender = 0
    let cameraShakeIntensity = 0

    const tmpCamTarget = new THREE.Vector3()
    const tmpLookAt = new THREE.Vector3()

    const animate = (time: number) => {
      if (cancelled || !rig) return
      const delta = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time

      const state = carState.current
      const input = keys.current
      const throttle = input.KeyW || input.ArrowUp
      const brake = input.KeyS || input.ArrowDown
      const left = input.KeyA || input.ArrowLeft
      const right = input.KeyD || input.ArrowRight
      const handbrake = input.Space

      const targetSteer = (left ? 1 : 0) - (right ? 1 : 0)
      state.steering += (targetSteer - state.steering) * Math.min(1, 11 * delta)

      if (throttle) state.velocity += 32 * delta
      if (brake) state.velocity -= state.velocity > 1 ? 38 * delta : 18 * delta
      if (!throttle && !brake) state.velocity *= Math.pow(0.965, delta * 60)
      if (handbrake) state.velocity *= Math.pow(0.86, delta * 60)
      state.velocity = Math.max(-12, Math.min(58, state.velocity))

      const speedFactor = Math.min(1, Math.abs(state.velocity) / 36)
      const steerStrength = 1.7 * (0.34 + speedFactor * 0.66)
      state.heading += state.steering * steerStrength * delta * (state.velocity >= 0 ? 1 : -1)

      state.x += Math.sin(state.heading) * state.velocity * delta
      state.z += Math.cos(state.heading) * state.velocity * delta
      state.x = THREE.MathUtils.clamp(state.x, DRIVE_BOUNDS.minX, DRIVE_BOUNDS.maxX)
      state.z = THREE.MathUtils.clamp(state.z, DRIVE_BOUNDS.minZ, DRIVE_BOUNDS.maxZ)

      // Track-following Y elevation: drive up the ramp onto the bridge, drop back to ground when off it.
      const ground = sampler.getGroundAt(state.x, state.z, state.y)
      const onTrack = ground.distance < trackHalfWidth + 0.5
      const targetY = onTrack ? ground.y : 0
      const climbingRamp = targetY > state.y + 0.08
      const yFollowRate = targetY > 0.5 || state.y > 0.5 ? (climbingRamp ? 34 : 24) : 10
      state.y += (targetY - state.y) * Math.min(1, yFollowRate * delta)

      // Soft grass slowdown: exponential drag scales with how far off the track we are.
      const offTrackBy = Math.max(0, ground.distance - trackHalfWidth)
      if (offTrackBy > 0) {
        const grassDrag = Math.pow(0.93, delta * 60 * Math.min(2, 1 + offTrackBy * 0.1))
        state.velocity *= grassDrag
      }

      // Hard cylindrical hitboxes for environment props - push the car back out and bleed velocity.
      for (const c of colliders) {
        const dx = state.x - c.x
        const dz = state.z - c.z
        const distSq = dx * dx + dz * dz
        const r = c.radius + CAR_HALF_WIDTH
        if (distSq < r * r && distSq > 0.0001) {
          const dist = Math.sqrt(distSq)
          const push = (r - dist) / dist
          state.x += dx * push
          state.z += dz * push
          state.velocity *= 0.35
        }
      }

      car.root.position.set(state.x, state.y + 0.04, state.z)
      car.root.rotation.y = state.heading
      car.chassis.rotation.z = -state.steering * 0.04 * Math.min(1, Math.abs(state.velocity) / 8)

      // Wheel rotation: spin proportional to velocity
      const spin = state.velocity * delta * 2.6
      car.wheels.fl.rotation.x += spin
      car.wheels.fr.rotation.x += spin
      car.wheels.rl.rotation.x += spin
      car.wheels.rr.rotation.x += spin

      // Front-wheel steering
      const steerAngle = state.steering * 0.42
      car.steeringWheels.forEach((sw) => { sw.rotation.y = steerAngle })

      carGlow.position.set(state.x, state.y + 6, state.z)

      // Ferris wheel rotation
      environment.ferrisWheel.rotation.z += delta * 0.12

      // Petals drift
      environment.petals.update(delta)

      // Camera (chase camera with subtle shake at high speed)
      cameraShakeIntensity += ((speedFactor > 0.6 ? speedFactor * 0.18 : 0) - cameraShakeIntensity) * Math.min(1, 6 * delta)
      const shakeX = (Math.random() - 0.5) * cameraShakeIntensity
      const shakeY = (Math.random() - 0.5) * cameraShakeIntensity

      tmpCamTarget.set(
        state.x - Math.sin(state.heading) * 22,
        state.y + 6.5 + speedFactor * 0.9,
        state.z - Math.cos(state.heading) * 22,
      )
      camera.position.lerp(tmpCamTarget, 0.06)
      camera.position.x += shakeX
      camera.position.y += shakeY
      tmpLookAt.set(
        state.x + Math.sin(state.heading) * 12,
        state.y + 1.2,
        state.z + Math.cos(state.heading) * 12,
      )
      camera.lookAt(tmpLookAt)

      // Station proximity check
      const proximity = nearestStation(state.x, state.z)
      if (proximity.station) {
        const shouldShow = proximity.distance <= proximity.station.zoneRadius
        if (shouldShow && proximity.station.id !== activeStationRef.current?.id) revealStation(proximity.station)
        if (!shouldShow && activeStationRef.current) revealStation(null)
      }

      if (time - lastTelemetryRender > 110) {
        lastTelemetryRender = time
        setTelemetry({
          speed: Math.round(Math.abs(state.velocity) * 6.5),
          gear: Math.max(1, Math.min(8, Math.ceil(Math.abs(state.velocity) / 7))),
          rpm: Math.round(1200 + Math.abs(state.velocity) * 360),
          section: getCircuitSectionAt(ground.t, state.y),
          trackT: ground.t,
          carX: state.x,
          carY: state.y,
          carZ: state.z,
        })
      }

      renderer.render(rig.scene, camera)
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    setIsSceneReady(true)
    gsap.set(overlayRef.current, { autoAlpha: 0, scale: 0.92 })

    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", resize)
      rig?.dispose()
    }
  }, [nearestStation, revealStation])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#1a1740] text-white">
      <div ref={mountRef} className="absolute inset-0" aria-label="Stylized Suzuka circuit set in golden-hour Japan with a procedural Mercedes-AMG W15" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(0,210,190,0.14),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(255,200,150,0.10),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.55))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 border-t-2 border-[#00D2BE]/45 bg-gradient-to-b from-[#00D2BE]/10 to-transparent" />

      <header className="absolute left-0 right-0 top-0 z-20 flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-8">
        <div className="max-w-4xl rounded-3xl border border-[#00D2BE]/25 bg-black/55 p-5 shadow-2xl shadow-[#00D2BE]/10 backdrop-blur-xl md:p-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#00D2BE]">Mercedes-AMG W15 - Stylized Suzuka - Golden hour Japan</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-none tracking-[-0.06em] text-white md:text-7xl">
            Drive the circuit.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 md:text-base">
            Pilot a procedural <span className="text-[#00D2BE]">W15 Formula car</span> across a stylized Suzuka figure-8 with the iconic crossover bridge. Mt. Fuji, sakura, pagoda, and the Tokyo skyline sit on the horizon. Stop inside a glowing checkpoint to open that portfolio module.
          </p>
        </div>

        <div className="w-[300px] rounded-3xl border border-white/10 bg-black/70 p-3 font-mono text-xs uppercase shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-2">
            <div><span className="block text-neutral-500">Speed</span><strong className="text-xl text-[#00D2BE]">{telemetry.speed}</strong></div>
            <div><span className="block text-neutral-500">Gear</span><strong className="text-xl text-white">{telemetry.gear}</strong></div>
            <div><span className="block text-neutral-500">RPM</span><strong className="text-xl text-[#00D2BE]">{telemetry.rpm}</strong></div>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#00D2BE] transition-[width]" style={{ width: `${Math.min(100, telemetry.rpm / 210)}%` }} />
          </div>
          <svg
            className="mt-3 h-[132px] w-full overflow-visible"
            viewBox={`0 0 ${MINIMAP_WIDTH} ${MINIMAP_HEIGHT}`}
            role="img"
            aria-label="Live Suzuka circuit minimap"
          >
            <polyline points={MINIMAP_TRACK_POLYLINE} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={MINIMAP_TRACK_POLYLINE} fill="none" stroke="#111820" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={MINIMAP_BRIDGE_POLYLINE} fill="none" stroke="#00D2BE" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1={MINIMAP_START.x - 4} y1={MINIMAP_START.y} x2={MINIMAP_START.x + 4} y2={MINIMAP_START.y} stroke="#f5f5f5" strokeWidth="2" />
            {minimapStations.map((station) => (
              <circle key={station.id} cx={station.x} cy={station.y} r="2.1" fill={station.accent} opacity="0.86" />
            ))}
            <circle cx={minimapCar.x} cy={minimapCar.y} r="4.2" fill={telemetry.carY > BRIDGE_THRESHOLD ? "#ffd84d" : "#00D2BE"} stroke="#ffffff" strokeWidth="1.2" />
          </svg>
          <div className="mt-1 text-right text-[10px] tracking-[0.28em] text-neutral-400">SECTION - {telemetry.section}</div>
        </div>
      </header>

      <aside
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4"
        style={{ transformOrigin: "center center" }}
      >
        {activeStation ? (
          <div className="pointer-events-auto w-full max-w-[520px] rounded-[2rem] border border-[#00D2BE]/35 bg-black/80 p-6 shadow-2xl shadow-[#00D2BE]/30 backdrop-blur-2xl md:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#00D2BE]">{activeStation.label}</p>
              <span className="rounded-full border border-[#00D2BE]/30 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-neutral-300">Modal unlocked</span>
            </div>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white md:text-4xl">{activeStation.title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-300">{activeStation.short}</p>
            <ul className="mt-5 grid gap-2 text-sm text-neutral-200">
              {activeStation.details.map((detail) => (
                <li key={detail} className="flex items-center gap-3"><span className="h-1.5 w-8 rounded-full bg-[#00D2BE]" />{detail}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">{stationButtons}</div>
          </div>
        ) : null}
      </aside>

      <div className="absolute bottom-4 left-4 z-10 hidden rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-neutral-300 backdrop-blur md:block">
        Controls: W accelerate - S brake/reverse - A/D steer - Space slow - stop in a glowing zone to open a modal
      </div>

      <div className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 md:flex">
        {stationButtons}
      </div>

      {(!isSceneReady || loadError) && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0a14] text-center">
          <div className="max-w-md rounded-3xl border border-[#00D2BE]/30 bg-black/80 p-8 shadow-2xl shadow-[#00D2BE]/20">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#00D2BE] border-t-transparent" />
            <h2 className="text-2xl font-black uppercase text-[#00D2BE]">{loadError ? "3D systems offline" : "Loading Suzuka circuit"}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              {loadError ? "The portfolio shell is ready, but the three.js runtime could not initialize." : "Building the figure-8, procedural W15, golden-hour sky, and Japan environment."}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

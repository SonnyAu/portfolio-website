"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"
import * as THREE from "three"
import { buildScene, type SceneRig } from "./f1/scene/buildScene"
import type { Station } from "./f1/scene/stations"

type Telemetry = {
  speed: number
  gear: number
  rpm: number
  sector: string
}

type CarState = {
  x: number
  y: number
  z: number
  heading: number
  velocity: number
  steering: number
}

const SECTOR_NAMES = ["PIT STRAIGHT", "ESSES", "DUNLOP", "HAIRPIN", "SPOON", "130R", "CHICANE"]

export default function F1TrackPortfolio() {
  const mountRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [activeStation, setActiveStation] = useState<Station | null>(null)
  const [stationsList, setStationsList] = useState<Station[]>([])
  const [telemetry, setTelemetry] = useState<Telemetry>({ speed: 0, gear: 1, rpm: 1200, sector: "PIT" })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSceneReady, setIsSceneReady] = useState(false)
  const keys = useRef<Record<string, boolean>>({})
  // Initial position lines up with the start/finish straight at world scale (SCALE_X=2.4, SCALE_Z=2.6).
  const carState = useRef<CarState>({ x: -135, y: 0, z: 47, heading: Math.PI / 2, velocity: 0, steering: 0 })
  const activeStationRef = useRef<Station | null>(activeStation)
  const stationsRef = useRef<Station[]>([])

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
    carState.current.x = x - 2.5
    carState.current.z = z + 1.8
    carState.current.y = 0
    carState.current.velocity = 0
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

    const { scene, renderer, camera, environment, stations, car, carGlow, track } = rig
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
      state.x = Math.max(-380, Math.min(380, state.x))
      state.z = Math.max(-380, Math.min(380, state.z))

      // Track-following Y elevation: drive up the ramp onto the bridge, drop back to ground when off it.
      const ground = sampler.getGroundAt(state.x, state.z)
      const onTrack = ground.distance < trackHalfWidth + 0.5
      const targetY = onTrack ? ground.y : 0
      state.y += (targetY - state.y) * Math.min(1, 8 * delta)

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
        const sectorIndex = Math.floor((time / 3000) % SECTOR_NAMES.length)
        setTelemetry({
          speed: Math.round(Math.abs(state.velocity) * 6.5),
          gear: Math.max(1, Math.min(8, Math.ceil(Math.abs(state.velocity) / 7))),
          rpm: Math.round(1200 + Math.abs(state.velocity) * 360),
          sector: SECTOR_NAMES[sectorIndex],
        })
      }

      renderer.render(scene, camera)
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
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#00D2BE]">Mercedes-AMG W15 · Stylized Suzuka · Golden hour Japan</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-none tracking-[-0.06em] text-white md:text-7xl">
            Drive the circuit.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 md:text-base">
            Pilot a procedural <span className="text-[#00D2BE]">W15 Formula car</span> across a stylized Suzuka figure-8 with the iconic crossover bridge. Mt. Fuji, sakura, pagoda, and the Tokyo skyline sit on the horizon. Stop inside a glowing checkpoint to open that portfolio module.
          </p>
        </div>

        <div className="grid min-w-[250px] grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-black/65 p-3 font-mono text-xs uppercase shadow-2xl backdrop-blur-xl">
          <div><span className="block text-neutral-500">Speed</span><strong className="text-xl text-[#00D2BE]">{telemetry.speed}</strong></div>
          <div><span className="block text-neutral-500">Gear</span><strong className="text-xl text-white">{telemetry.gear}</strong></div>
          <div><span className="block text-neutral-500">RPM</span><strong className="text-xl text-[#00D2BE]">{telemetry.rpm}</strong></div>
          <div className="col-span-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#00D2BE] transition-[width]" style={{ width: `${Math.min(100, telemetry.rpm / 210)}%` }} /></div>
          <div className="col-span-3 text-right text-[10px] tracking-[0.28em] text-neutral-400">SECTOR · {telemetry.sector}</div>
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
        Controls: W accelerate · S brake/reverse · A/D steer · Space slow · stop in a glowing zone to open a modal
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

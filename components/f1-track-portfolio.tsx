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
  zoneRadius: number
}

type Telemetry = {
  speed: number
  gear: number
  rpm: number
  sector: string
}

type CarState = {
  x: number
  z: number
  heading: number
  velocity: number
  steering: number
}

const MERCEDES = "#00D2BE"
const PETRONAS = "#00F5D4"
const MODEL_PATH = "/models/mercedes-f1-inspired.gltf"

// Flat Suzuka-inspired layout: esses, Dunlop, hairpin, Spoon, 130R, and chicane-inspired stations.
const trackPoints: Array<[number, number, number]> = [
  [-48, 0, -10],
  [-40, 0, -22],
  [-24, 0, -29],
  [-7, 0, -25],
  [9, 0, -31],
  [25, 0, -24],
  [18, 0, -10],
  [32, 0, -2],
  [49, 0, 10],
  [32, 0, 22],
  [8, 0, 27],
  [-12, 0, 18],
  [-31, 0, 24],
  [-45, 0, 12],
  [-28, 0, 0],
  [-42, 0, -6],
]

const stations: Station[] = [
  {
    id: "about",
    label: "01 / ABOUT",
    title: "Driver Profile",
    short: "SJSU CS engineer building fast, polished full-stack products.",
    details: ["President's Scholar mindset", "React Native + AI specialist", "Product-focused startup builder"],
    position: [-26, 0, -28],
    accent: MERCEDES,
    zoneRadius: 7.8,
  },
  {
    id: "experience",
    label: "02 / EXPERIENCE",
    title: "Race History",
    short: "Frontend React Developer Intern experience with major performance wins.",
    details: ["GBCS Group internship", "Performance-focused UI systems", "Cross-functional engineering delivery"],
    position: [27, 0, -6],
    accent: "#E8E8E8",
    zoneRadius: 7.4,
  },
  {
    id: "skills",
    label: "03 / SKILLS",
    title: "Engineering Setup",
    short: "Next.js, TypeScript, Tailwind, React Native, Python, ML, and cloud tools.",
    details: ["Frontend systems", "Mobile apps", "ML-backed product features"],
    position: [13, 0, 27],
    accent: PETRONAS,
    zoneRadius: 7.8,
  },
  {
    id: "projects",
    label: "04 / PROJECTS",
    title: "Pit Garage",
    short: "PalAte and selected product builds staged around the circuit.",
    details: ["PalAte co-founder", "Food-tech product launch", "Portfolio-ready demos"],
    position: [-39, 0, 13],
    accent: "#FF3333",
    zoneRadius: 8.2,
  },
  {
    id: "contact",
    label: "05 / CONTACT",
    title: "Finish Straight",
    short: "Ready for internships, early-career software roles, and ambitious builds.",
    details: ["Open to collaboration", "Bay Area / remote", "Let’s ship something fast"],
    position: [-46, 0, -10],
    accent: "#FFFFFF",
    zoneRadius: 7.2,
  },
]

const loadScript = (src: string, dataAttribute: string) => {
  if (typeof window === "undefined") return Promise.reject(new Error("three.js requires the browser"))

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[${dataAttribute}]`)

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true })
      existingScript.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true })
      if (existingScript.dataset.ready === "true") resolve()
      return
    }

    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.defer = true
    script.setAttribute(dataAttribute, "true")
    script.onload = () => {
      script.dataset.ready = "true"
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

const loadThree = async () => {
  if (typeof window === "undefined") throw new Error("three.js requires the browser")
  if (!window.THREE) await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.min.js", "data-threejs-portfolio-track")
  if (!window.THREE) throw new Error("THREE global missing")
  return window.THREE
}

const createTextSprite = (THREE: ThreeNamespace, text: string, color: string) => {
  const canvas = document.createElement("canvas")
  canvas.width = 640
  canvas.height = 192
  const context = canvas.getContext("2d")

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "rgba(2, 8, 9, 0.9)"
    context.strokeStyle = color
    context.lineWidth = 5
    context.roundRect(12, 12, 616, 168, 28)
    context.fill()
    context.stroke()
    context.font = "800 42px Arial"
    context.fillStyle = color
    context.textAlign = "center"
    context.fillText(text, 320, 110)
  }

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(11.5, 3.45, 1)
  return sprite
}

const createFlatStrip = (THREE: ThreeNamespace, curve: any, width: number, samples: number, y: number, material: any) => {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let index = 0; index < samples; index += 1) {
    const t = index / samples
    const point = curve.getPoint(t)
    const tangent = curve.getTangent(t).normalize()
    const normalX = tangent.z
    const normalZ = -tangent.x
    positions.push(point.x + normalX * width * 0.5, y, point.z + normalZ * width * 0.5)
    positions.push(point.x - normalX * width * 0.5, y, point.z - normalZ * width * 0.5)
    normals.push(0, 1, 0, 0, 1, 0)
    uvs.push(0, t * 12, 1, t * 12)
  }

  for (let index = 0; index < samples; index += 1) {
    const next = (index + 1) % samples
    const left = index * 2
    const right = left + 1
    const nextLeft = next * 2
    const nextRight = nextLeft + 1
    indices.push(left, nextLeft, right, right, nextLeft, nextRight)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  return new THREE.Mesh(geometry, material)
}

const accessorTypeSize: Record<string, number> = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
}

const readEmbeddedBuffer = (uri: string) => {
  const [, base64Payload = ""] = uri.split(",")
  const binary = window.atob(base64Payload)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return buffer
}

const readAccessor = (gltf: any, buffer: ArrayBuffer, accessorIndex: number) => {
  const accessor = gltf.accessors[accessorIndex]
  const bufferView = gltf.bufferViews[accessor.bufferView]
  const componentCount = accessorTypeSize[accessor.type] ?? 1
  const byteOffset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0)
  const count = accessor.count * componentCount

  if (accessor.componentType === 5126) {
    return new Float32Array(buffer, byteOffset, count)
  }

  if (accessor.componentType === 5123) {
    return new Uint16Array(buffer, byteOffset, count)
  }

  return new Uint32Array(buffer, byteOffset, count)
}

const loadPortfolioFormulaModel = async (THREE: ThreeNamespace) => {
  const response = await fetch(MODEL_PATH)
  if (!response.ok) throw new Error("Formula car GLTF could not be loaded")
  const gltf = await response.json()
  const buffer = readEmbeddedBuffer(gltf.buffers[0].uri)
  const root = new THREE.Group()

  const materials = gltf.materials.map((material: any) => {
    const color = material.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1]
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color[0], color[1], color[2]),
      opacity: color[3],
      transparent: color[3] < 1,
      roughness: material.pbrMetallicRoughness?.roughnessFactor ?? 0.45,
      metalness: material.pbrMetallicRoughness?.metallicFactor ?? 0.25,
    })
  })

  gltf.meshes[0].primitives.forEach((primitive: any) => {
    const geometry = new THREE.BufferGeometry()
    const positions = readAccessor(gltf, buffer, primitive.attributes.POSITION)
    const normals = readAccessor(gltf, buffer, primitive.attributes.NORMAL)
    const indices = readAccessor(gltf, buffer, primitive.indices)
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3))
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))
    geometry.computeBoundingSphere()
    const mesh = new THREE.Mesh(geometry, materials[primitive.material] ?? materials[0])
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
  })

  root.rotation.y = Math.PI
  root.scale.set(1.08, 1.08, 1.08)
  return root
}

const createFallbackFormulaCar = (THREE: ThreeNamespace) => {
  const car = new THREE.Group()
  const black = new THREE.MeshStandardMaterial({ color: "#020405", roughness: 0.28, metalness: 0.62 })
  const teal = new THREE.MeshStandardMaterial({ color: MERCEDES, roughness: 0.22, metalness: 0.55 })
  const silver = new THREE.MeshStandardMaterial({ color: "#d8eeee", roughness: 0.24, metalness: 0.7 })
  const tire = new THREE.MeshStandardMaterial({ color: "#030303", roughness: 0.78 })

  const addBox = (size: [number, number, number], position: [number, number, number], material: any) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
    mesh.position.set(...position)
    mesh.castShadow = true
    car.add(mesh)
    return mesh
  }

  addBox([1.28, 0.5, 2.7], [0, 0.58, -0.05], black)
  addBox([0.42, 0.28, 2.25], [0, 0.48, -2.05], silver)
  addBox([2.75, 0.12, 0.42], [0, 0.28, -3.28], black)
  addBox([2.2, 0.1, 0.24], [0, 0.4, -3.02], teal)
  addBox([2.45, 0.18, 0.36], [0, 0.95, 1.62], black)
  addBox([2.05, 0.09, 3.9], [0, 0.3, 0], black)
  addBox([1.0, 0.08, 0.12], [0, 1.0, -0.45], black)
  ;[-1.15, 1.15].forEach((x) => [-1.28, 1.16].forEach((z) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.38, 28), tire)
    wheel.position.set(x, 0.4, z)
    wheel.rotation.z = Math.PI / 2
    wheel.castShadow = true
    car.add(wheel)
  }))

  return car
}

export default function F1TrackPortfolio() {
  const mountRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [activeStation, setActiveStation] = useState<Station | null>(null)
  const [telemetry, setTelemetry] = useState<Telemetry>({ speed: 0, gear: 1, rpm: 1200, sector: "PIT" })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSceneReady, setIsSceneReady] = useState(false)
  const keys = useRef<Record<string, boolean>>({})
  const carState = useRef<CarState>({ x: -47, z: -11, heading: 1.04, velocity: 0, steering: 0 })
  const activeStationRef = useRef<Station | null>(activeStation)

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

  const revealStation = useCallback((station: Station | null) => {
    activeStationRef.current = station
    setActiveStation(station)
    if (station) {
      gsap.fromTo(overlayRef.current, { y: 24, scale: 0.98, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.36, ease: "power3.out" })
    } else {
      gsap.to(overlayRef.current, { y: 20, autoAlpha: 0, duration: 0.28, ease: "power2.in" })
    }
  }, [])

  const jumpToStation = useCallback((station: Station) => {
    const [x, , z] = station.position
    carState.current.x = x - 2.5
    carState.current.z = z + 1.8
    carState.current.velocity = 0
    revealStation(station)
  }, [revealStation])

  const stationButtons = useMemo(() => stations.map((station) => (
    <button
      key={station.id}
      type="button"
      onClick={() => jumpToStation(station)}
      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-[10px] uppercase tracking-[0.22em] text-neutral-300 transition hover:border-[#00D2BE] hover:bg-[#00D2BE]/10 hover:text-[#00D2BE]"
    >
      {station.label}
    </button>
  )), [jumpToStation])

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
    let cleanup: (() => void) | undefined
    let cancelled = false

    loadThree()
      .then((THREE) => {
        if (cancelled || !mountRef.current) return

        const mount = mountRef.current
        const scene = new THREE.Scene()
        scene.background = new THREE.Color("#050707")
        scene.fog = new THREE.Fog("#050707", 75, 190)

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
        renderer.setSize(mount.clientWidth, mount.clientHeight)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05
        mount.appendChild(renderer.domElement)

        const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 320)
        camera.position.set(-25, 56, 58)

        const ambientLight = new THREE.HemisphereLight("#cafff7", "#10211f", 1.3)
        scene.add(ambientLight)
        const sunLight = new THREE.DirectionalLight("#ffffff", 3.2)
        sunLight.position.set(-45, 70, 35)
        sunLight.castShadow = true
        sunLight.shadow.mapSize.set(2048, 2048)
        sunLight.shadow.camera.left = -80
        sunLight.shadow.camera.right = 80
        sunLight.shadow.camera.top = 80
        sunLight.shadow.camera.bottom = -80
        scene.add(sunLight)
        const carGlow = new THREE.PointLight(MERCEDES, 2.6, 55)
        carGlow.position.set(0, 9, 0)
        scene.add(carGlow)

        const grassMaterial = new THREE.MeshStandardMaterial({ color: "#071510", roughness: 0.9, metalness: 0.02 })
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(170, 125, 1, 1), grassMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.receiveShadow = true
        scene.add(ground)

        const curve = new THREE.CatmullRomCurve3(trackPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z)), true, "catmullrom", 0.62)
        const runOff = createFlatStrip(THREE, curve, 15.5, 420, 0.018, new THREE.MeshStandardMaterial({ color: "#201d18", roughness: 0.88, metalness: 0.02 }))
        runOff.receiveShadow = true
        scene.add(runOff)

        const track = createFlatStrip(THREE, curve, 9.2, 480, 0.045, new THREE.MeshStandardMaterial({ color: "#111315", roughness: 0.68, metalness: 0.18 }))
        track.receiveShadow = true
        scene.add(track)

        const racingLine = createFlatStrip(THREE, curve, 0.38, 480, 0.07, new THREE.MeshBasicMaterial({ color: MERCEDES, transparent: true, opacity: 0.8 }))
        scene.add(racingLine)

        const wallOuter = createFlatStrip(THREE, curve, 18.6, 380, 0.032, new THREE.MeshBasicMaterial({ color: "#09100f", transparent: true, opacity: 0.48 }))
        scene.add(wallOuter)

        const kerbMaterials = [new THREE.MeshBasicMaterial({ color: "#f6f6f6" }), new THREE.MeshBasicMaterial({ color: "#e51622" })]
        for (let index = 0; index < 92; index += 1) {
          const t = index / 92
          const point = curve.getPoint(t)
          const tangent = curve.getTangent(t)
          const outside = index % 4 < 2 ? 1 : -1
          const kerb = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.08, 0.62), kerbMaterials[index % 2])
          kerb.position.set(point.x + tangent.z * 5.05 * outside, 0.11, point.z - tangent.x * 5.05 * outside)
          kerb.rotation.y = Math.atan2(tangent.x, tangent.z)
          kerb.receiveShadow = true
          scene.add(kerb)
        }

        const barrierMaterial = new THREE.MeshStandardMaterial({ color: "#d9e2e1", roughness: 0.5, metalness: 0.15 })
        for (let index = 0; index < 68; index += 1) {
          const t = index / 68
          const point = curve.getPoint(t)
          const tangent = curve.getTangent(t)
          const barrier = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.78, 0.22), barrierMaterial)
          barrier.position.set(point.x + tangent.z * 9.5, 0.43, point.z - tangent.x * 9.5)
          barrier.rotation.y = Math.atan2(tangent.x, tangent.z)
          barrier.castShadow = true
          barrier.receiveShadow = true
          scene.add(barrier)
        }

        const buildingMaterial = new THREE.MeshStandardMaterial({ color: "#0a0e10", roughness: 0.4, metalness: 0.35 })
        const glassMaterial = new THREE.MeshStandardMaterial({ color: MERCEDES, roughness: 0.18, metalness: 0.15, transparent: true, opacity: 0.48 })
        ;[
          { position: [-55, 1.8, 1], size: [16, 3.6, 7], label: "Pit building" },
          { position: [-61, 2.6, -12], size: [9, 5.2, 18], label: "Grandstand" },
          { position: [45, 1.4, -18], size: [13, 2.8, 5], label: "Media centre" },
        ].forEach((item) => {
          const building = new THREE.Mesh(new THREE.BoxGeometry(...item.size), buildingMaterial)
          building.position.set(...item.position)
          building.castShadow = true
          building.receiveShadow = true
          scene.add(building)
          const glass = new THREE.Mesh(new THREE.BoxGeometry(item.size[0] * 0.92, item.size[1] * 0.35, 0.08), glassMaterial)
          glass.position.set(item.position[0], item.position[1] + item.size[1] * 0.12, item.position[2] - item.size[2] * 0.51)
          scene.add(glass)
        })

        const treeTrunk = new THREE.MeshStandardMaterial({ color: "#26150d", roughness: 0.9 })
        const treeLeaf = new THREE.MeshStandardMaterial({ color: "#103a2d", roughness: 0.8 })
        for (let index = 0; index < 42; index += 1) {
          const angle = (index / 42) * Math.PI * 2
          const radius = 58 + (index % 5) * 4
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius * 0.72
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.6, 8), treeTrunk)
          trunk.position.set(x, 0.8, z)
          trunk.castShadow = true
          scene.add(trunk)
          const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.2 + (index % 3) * 0.2, 3.1, 8), treeLeaf)
          leaves.position.set(x, 2.6, z)
          leaves.castShadow = true
          scene.add(leaves)
        }

        const car = new THREE.Group()
        car.add(createFallbackFormulaCar(THREE))
        car.scale.set(1.12, 1.12, 1.12)
        car.position.set(carState.current.x, 0, carState.current.z)
        scene.add(car)

        loadPortfolioFormulaModel(THREE)
          .then((model) => {
            if (cancelled) return
            car.clear()
            car.add(model)
          })
          .catch(() => {
            // Keep the in-scene fallback car if the local GLTF asset cannot be decoded.
          })

        stations.forEach((station) => {
          const beacon = new THREE.Group()
          const pad = new THREE.Mesh(
            new THREE.CylinderGeometry(station.zoneRadius, station.zoneRadius, 0.08, 80),
            new THREE.MeshBasicMaterial({ color: station.accent, transparent: true, opacity: 0.08 }),
          )
          pad.position.y = 0.09
          beacon.add(pad)
          const marker = new THREE.Mesh(
            new THREE.CylinderGeometry(1.4, 1.4, 0.16, 44),
            new THREE.MeshBasicMaterial({ color: station.accent, transparent: true, opacity: 0.82 }),
          )
          marker.position.y = 0.22
          beacon.add(marker)
          const ring = new THREE.Mesh(new THREE.TorusGeometry(station.zoneRadius, 0.055, 8, 96), new THREE.MeshBasicMaterial({ color: station.accent, transparent: true, opacity: 0.72 }))
          ring.rotation.x = Math.PI / 2
          ring.position.y = 0.18
          beacon.add(ring)
          const sprite = createTextSprite(THREE, station.title, station.accent)
          sprite.position.y = 4.8
          beacon.add(sprite)
          beacon.position.set(...station.position)
          scene.add(beacon)
          gsap.to(ring.rotation, { z: Math.PI * 2, duration: 8, repeat: -1, ease: "none" })
          gsap.to(sprite.position, { y: 5.6, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" })
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
        const clockSector = ["ESSES", "HAIRPIN", "SPOON", "130R", "CHICANE"]

        const animate = (time: number) => {
          const delta = Math.min((time - lastTime) / 1000, 0.033)
          lastTime = time
          const state = carState.current
          const input = keys.current
          const throttle = input.KeyW || input.ArrowUp
          const brake = input.KeyS || input.ArrowDown
          const left = input.KeyA || input.ArrowLeft
          const right = input.KeyD || input.ArrowRight
          const handbrake = input.Space

          const targetSteer = (left ? 1 : 0) - (right ? 1 : 0)
          state.steering += (targetSteer - state.steering) * Math.min(1, 12 * delta)

          if (throttle) state.velocity += 18.5 * delta
          if (brake) state.velocity -= state.velocity > 1 ? 24 * delta : 12 * delta
          if (!throttle && !brake) state.velocity *= Math.pow(0.965, delta * 60)
          if (handbrake) state.velocity *= Math.pow(0.88, delta * 60)
          state.velocity = Math.max(-6.5, Math.min(30, state.velocity))

          const speedFactor = Math.min(1, Math.abs(state.velocity) / 18)
          const steerStrength = 1.65 * (0.36 + speedFactor * 0.64)
          state.heading += state.steering * steerStrength * delta * (state.velocity >= 0 ? 1 : -1)

          state.x += Math.sin(state.heading) * state.velocity * delta
          state.z += Math.cos(state.heading) * state.velocity * delta
          state.x = Math.max(-69, Math.min(69, state.x))
          state.z = Math.max(-47, Math.min(47, state.z))

          car.position.set(state.x, 0.04, state.z)
          car.rotation.y = state.heading
          carGlow.position.set(state.x, 7, state.z)

          const cameraTarget = new THREE.Vector3(state.x - Math.sin(state.heading) * 26, 54, state.z - Math.cos(state.heading) * 26 + 18)
          camera.position.lerp(cameraTarget, 0.035)
          camera.lookAt(state.x + Math.sin(state.heading) * 6, 0.2, state.z + Math.cos(state.heading) * 6)

          const proximity = nearestStation(state.x, state.z)
          const shouldShow = proximity.distance <= proximity.station.zoneRadius
          if (shouldShow && proximity.station.id !== activeStationRef.current?.id) revealStation(proximity.station)
          if (!shouldShow && activeStationRef.current) revealStation(null)

          if (time - lastTelemetryRender > 120) {
            lastTelemetryRender = time
            setTelemetry({
              speed: Math.round(Math.abs(state.velocity) * 12.5),
              gear: Math.max(1, Math.min(8, Math.ceil(Math.abs(state.velocity) / 3.5))),
              rpm: Math.round(1200 + Math.abs(state.velocity) * 640),
              sector: clockSector[Math.floor((time / 3300) % clockSector.length)],
            })
          }

          renderer.render(scene, camera)
          animationFrame = requestAnimationFrame(animate)
        }

        window.addEventListener("resize", resize)
        animationFrame = requestAnimationFrame(animate)
        setIsSceneReady(true)
        gsap.set(overlayRef.current, { autoAlpha: 0, y: 20 })

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
  }, [nearestStation, revealStation])

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050707] text-white">
      <div ref={mountRef} className="absolute inset-0" aria-label="Interactive flat Suzuka-inspired Formula 1 portfolio circuit" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(0,210,190,0.18),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.72))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 border-t-2 border-[#00D2BE]/50 bg-gradient-to-b from-[#00D2BE]/10 to-transparent" />

      <header className="absolute left-0 right-0 top-0 z-20 flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between md:p-8">
        <div className="max-w-4xl rounded-3xl border border-[#00D2BE]/25 bg-black/55 p-5 shadow-2xl shadow-[#00D2BE]/10 backdrop-blur-xl md:p-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#00D2BE]">Mercedes-AMG F1 / Suzuka-inspired portfolio</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-none tracking-[-0.06em] text-white md:text-7xl">
            Drive the circuit.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 md:text-base">
            Pilot an imported <span className="text-[#00D2BE]">GLTF Formula car</span> around a flat, wide-angle circuit. Stop inside a glowing checkpoint zone to open that portfolio module.
          </p>
        </div>

        <div className="grid min-w-[250px] grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-black/65 p-3 font-mono text-xs uppercase shadow-2xl backdrop-blur-xl">
          <div><span className="block text-neutral-500">Speed</span><strong className="text-xl text-[#00D2BE]">{telemetry.speed}</strong></div>
          <div><span className="block text-neutral-500">Gear</span><strong className="text-xl text-white">{telemetry.gear}</strong></div>
          <div><span className="block text-neutral-500">RPM</span><strong className="text-xl text-[#00D2BE]">{telemetry.rpm}</strong></div>
          <div className="col-span-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#00D2BE] transition-[width]" style={{ width: `${Math.min(100, telemetry.rpm / 210)}%` }} /></div>
          <div className="col-span-3 text-right text-[10px] tracking-[0.28em] text-neutral-400">ZONE {telemetry.sector}</div>
        </div>
      </header>

      <aside ref={overlayRef} className="absolute bottom-4 left-4 right-4 z-20 md:bottom-8 md:left-auto md:right-8 md:w-[460px]">
        {activeStation ? (
          <div className="rounded-[2rem] border border-[#00D2BE]/35 bg-black/75 p-6 shadow-2xl shadow-[#00D2BE]/20 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#00D2BE]">{activeStation.label}</p>
              <span className="rounded-full border border-[#00D2BE]/30 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-neutral-300">Modal unlocked</span>
            </div>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">{activeStation.title}</h2>
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
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050707] text-center">
          <div className="max-w-md rounded-3xl border border-[#00D2BE]/30 bg-black/80 p-8 shadow-2xl shadow-[#00D2BE]/20">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#00D2BE] border-t-transparent" />
            <h2 className="text-2xl font-black uppercase text-[#00D2BE]">{loadError ? "3D systems offline" : "Loading Suzuka circuit"}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              {loadError ? "The portfolio shell is ready, but the three.js runtime or GLTF loader could not load." : "Building the flat circuit, imported Formula car, checkpoint modals, and polished track environment."}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

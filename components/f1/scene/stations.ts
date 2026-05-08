import * as THREE from "three"
import { gsap } from "gsap"
import { PALETTE } from "./palette"

export type Station = {
  id: string
  label: string
  title: string
  short: string
  details: string[]
  position: [number, number, number]
  accent: string
  zoneRadius: number
}

// Station positions follow the world scale used in track.ts (SCALE_X = 2.4, SCALE_Z = 2.6).
// Inlined as final coordinates for clarity.
export const STATIONS: Station[] = [
  {
    id: "about",
    label: "01 / ABOUT",
    title: "Driver Profile",
    short: "SJSU CS engineer building fast, polished full-stack products.",
    details: ["President's Scholar mindset", "React Native + AI specialist", "Product-focused startup builder"],
    position: [22 * 2.4, 0, 16 * 2.6],
    accent: PALETTE.mercedesTeal,
    zoneRadius: 9.0,
  },
  {
    id: "experience",
    label: "02 / EXPERIENCE",
    title: "Race History",
    short: "Frontend React Developer Intern experience with major performance wins.",
    details: ["GBCS Group internship", "Performance-focused UI systems", "Cross-functional engineering delivery"],
    position: [38 * 2.4, 0, -2 * 2.6],
    accent: PALETTE.silver,
    zoneRadius: 8.8,
  },
  {
    id: "skills",
    label: "03 / SKILLS",
    title: "Engineering Setup",
    short: "Next.js, TypeScript, Tailwind, React Native, Python, ML, and cloud tools.",
    details: ["Frontend systems", "Mobile apps", "ML-backed product features"],
    position: [-18 * 2.4, 0, 34 * 2.6],
    accent: PALETTE.petronasGreen,
    zoneRadius: 9.4,
  },
  {
    id: "projects",
    label: "04 / PROJECTS",
    title: "Pit Garage",
    short: "PalAte and selected product builds staged around the circuit.",
    details: ["PalAte co-founder", "Food-tech product launch", "Portfolio-ready demos"],
    position: [-46 * 2.4, 0, 8 * 2.6],
    accent: PALETTE.kerbRed,
    zoneRadius: 9.5,
  },
  {
    id: "contact",
    label: "05 / CONTACT",
    title: "Finish Straight",
    short: "Ready for internships, early-career software roles, and ambitious builds.",
    details: ["Open to collaboration", "Bay Area / remote", "Let's ship something fast"],
    position: [-58 * 2.4, 0, 18 * 2.6],
    accent: PALETTE.kerbWhite,
    zoneRadius: 8.6,
  },
]

function createTextSprite(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement("canvas")
  canvas.width = 768
  canvas.height = 192
  const context = canvas.getContext("2d")
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "rgba(8, 12, 14, 0.92)"
    context.strokeStyle = color
    context.lineWidth = 5
    context.beginPath()
    const r = 28
    context.moveTo(12 + r, 12)
    context.lineTo(canvas.width - 12 - r, 12)
    context.quadraticCurveTo(canvas.width - 12, 12, canvas.width - 12, 12 + r)
    context.lineTo(canvas.width - 12, canvas.height - 12 - r)
    context.quadraticCurveTo(canvas.width - 12, canvas.height - 12, canvas.width - 12 - r, canvas.height - 12)
    context.lineTo(12 + r, canvas.height - 12)
    context.quadraticCurveTo(12, canvas.height - 12, 12, canvas.height - 12 - r)
    context.lineTo(12, 12 + r)
    context.quadraticCurveTo(12, 12, 12 + r, 12)
    context.closePath()
    context.fill()
    context.stroke()
    context.font = "800 56px sans-serif"
    context.fillStyle = color
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(text, canvas.width / 2, canvas.height / 2)
  }
  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(13, 3.25, 1)
  return sprite
}

export function buildStations(scene: THREE.Scene): { group: THREE.Group; stations: Station[] } {
  const group = new THREE.Group()
  group.name = "Stations"

  STATIONS.forEach((station) => {
    const beacon = new THREE.Group()

    // Pad: faint ground glow
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(station.zoneRadius, station.zoneRadius, 0.06, 64),
      new THREE.MeshBasicMaterial({ color: station.accent, transparent: true, opacity: 0.1, depthWrite: false }),
    )
    pad.position.y = 0.07
    beacon.add(pad)

    // Sakura petal accent ring (replaces plain torus)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(station.zoneRadius, 0.06, 10, 96),
      new THREE.MeshBasicMaterial({ color: station.accent, transparent: true, opacity: 0.85 }),
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.18
    beacon.add(ring)

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(station.zoneRadius * 0.72, 0.04, 8, 64),
      new THREE.MeshBasicMaterial({ color: station.accent, transparent: true, opacity: 0.55 }),
    )
    innerRing.rotation.x = Math.PI / 2
    innerRing.position.y = 0.16
    beacon.add(innerRing)

    // Floating petals (8 small icosahedrons orbiting)
    const petalsGroup = new THREE.Group()
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2
      const petal = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.18, 0),
        new THREE.MeshStandardMaterial({ color: station.accent, emissive: new THREE.Color(station.accent), emissiveIntensity: 0.6, roughness: 0.5 }),
      )
      petal.position.set(Math.cos(a) * (station.zoneRadius * 0.85), 0.6 + Math.sin(a * 2) * 0.2, Math.sin(a) * (station.zoneRadius * 0.85))
      petalsGroup.add(petal)
    }
    beacon.add(petalsGroup)

    // Center marker
    const marker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.18, 32),
      new THREE.MeshStandardMaterial({ color: station.accent, emissive: new THREE.Color(station.accent), emissiveIntensity: 0.65, roughness: 0.35 }),
    )
    marker.position.y = 0.22
    beacon.add(marker)

    // Vertical glow column
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 5, 16),
      new THREE.MeshBasicMaterial({ color: station.accent, transparent: true, opacity: 0.55 }),
    )
    column.position.y = 2.6
    beacon.add(column)

    // Floating label
    const sprite = createTextSprite(station.title, station.accent)
    sprite.position.y = 6
    beacon.add(sprite)

    beacon.position.set(...station.position)
    group.add(beacon)

    // Animations
    gsap.to(ring.rotation, { z: Math.PI * 2, duration: 10, repeat: -1, ease: "none" })
    gsap.to(innerRing.rotation, { z: -Math.PI * 2, duration: 14, repeat: -1, ease: "none" })
    gsap.to(petalsGroup.rotation, { y: Math.PI * 2, duration: 16, repeat: -1, ease: "none" })
    gsap.to(sprite.position, { y: 6.6, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" })
    gsap.to(marker.scale, { x: 1.15, z: 1.15, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut" })
  })

  scene.add(group)
  return { group, stations: STATIONS }
}

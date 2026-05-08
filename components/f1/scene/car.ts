import * as THREE from "three"
import { PALETTE } from "./palette"

export type CarRig = {
  root: THREE.Group
  chassis: THREE.Group
  wheels: {
    fl: THREE.Group
    fr: THREE.Group
    rl: THREE.Group
    rr: THREE.Group
  }
  steeringWheels: THREE.Group[]
}

const carbon = () => new THREE.MeshStandardMaterial({ color: PALETTE.carbonGrey, roughness: 0.55, metalness: 0.42 })
const blackMatte = () => new THREE.MeshStandardMaterial({ color: PALETTE.petronasBlack, roughness: 0.6, metalness: 0.18 })
const teal = () => new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.32, metalness: 0.5, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.15 })
const silverPaint = () => new THREE.MeshStandardMaterial({ color: PALETTE.silver, roughness: 0.28, metalness: 0.78 })
const tireMat = () => new THREE.MeshStandardMaterial({ color: PALETTE.rubberBlack, roughness: 0.92, metalness: 0.05 })
const rimMat = () => new THREE.MeshStandardMaterial({ color: "#1a1a1c", roughness: 0.42, metalness: 0.85 })
const helmetMat = () => new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.4, metalness: 0.35 })
const visorMat = () => new THREE.MeshStandardMaterial({ color: "#050608", roughness: 0.18, metalness: 0.65 })
const brakeMat = () => new THREE.MeshStandardMaterial({ color: "#0d0d0d", roughness: 0.55, metalness: 0.6, emissive: new THREE.Color("#ff3a14"), emissiveIntensity: 0.0 })

function buildMonocoque(): THREE.Group {
  const g = new THREE.Group()

  const sideShape = new THREE.Shape()
  sideShape.moveTo(-2.6, -0.05)
  sideShape.lineTo(-2.6, 0.36)
  sideShape.lineTo(-1.7, 0.5)
  sideShape.lineTo(-0.6, 0.62)
  sideShape.lineTo(0.5, 0.7)
  sideShape.lineTo(1.4, 0.55)
  sideShape.lineTo(2.2, 0.3)
  sideShape.lineTo(2.4, -0.05)
  sideShape.lineTo(-2.6, -0.05)

  const tubExtrude = new THREE.ExtrudeGeometry(sideShape, { depth: 0.86, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2, steps: 1 })
  tubExtrude.translate(0, 0, -0.43)
  const tub = new THREE.Mesh(tubExtrude, carbon())
  tub.rotation.y = Math.PI / 2
  tub.castShadow = true
  tub.receiveShadow = true
  g.add(tub)

  // Floor / undertray
  const floor = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 5.4), blackMatte())
  floor.position.y = 0.04
  floor.receiveShadow = true
  g.add(floor)

  // Splitter at front of floor
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.5), blackMatte())
  splitter.position.set(0, 0.06, -2.55)
  g.add(splitter)

  // Teal racing stripe down the centerline
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 4.6), teal())
  stripe.position.set(0, 0.71, 0.1)
  g.add(stripe)

  // Mercedes star plate (silver) on top of monocoque just behind nose
  const star = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.55), silverPaint())
  star.position.set(0, 0.73, -1.6)
  g.add(star)

  return g
}

function buildNose(): THREE.Group {
  const g = new THREE.Group()

  // Lathe profile points (radius vs length)
  const noseLength = 1.6
  const points: THREE.Vector2[] = []
  const segments = 24
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments
    const z = t * noseLength
    // Radius shrinks toward tip with a slight curve
    const r = 0.32 * (1 - t) + 0.07 * (1 - t) * (1 - t) * 1.5 + 0.04
    points.push(new THREE.Vector2(r, z))
  }
  const noseGeo = new THREE.LatheGeometry(points, 24)
  const nose = new THREE.Mesh(noseGeo, carbon())
  nose.rotation.x = -Math.PI / 2
  nose.position.set(0, 0.36, -2.6)
  nose.castShadow = true
  g.add(nose)

  // Teal tip cap
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), teal())
  tip.position.set(0, 0.36, -4.18)
  g.add(tip)

  return g
}

function buildFrontWing(): THREE.Group {
  const g = new THREE.Group()

  const flapGeo1 = new THREE.BoxGeometry(2.55, 0.05, 0.7)
  const flap1 = new THREE.Mesh(flapGeo1, carbon())
  flap1.position.set(0, 0.18, -3.85)
  flap1.rotation.x = -0.05
  flap1.castShadow = true
  g.add(flap1)

  const flap2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.04, 0.32), carbon())
  flap2.position.set(0, 0.26, -4.05)
  flap2.rotation.x = -0.16
  g.add(flap2)

  const flap3 = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.035, 0.22), teal())
  flap3.position.set(0, 0.32, -4.18)
  flap3.rotation.x = -0.24
  g.add(flap3)

  // Endplates
  ;[-1.27, 1.27].forEach((x) => {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.95), blackMatte())
    ep.position.set(x, 0.28, -3.95)
    ep.castShadow = true
    g.add(ep)

    const epTop = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.45), teal())
    epTop.position.set(x, 0.46, -4.06)
    g.add(epTop)
  })

  return g
}

function buildSidepods(): THREE.Group {
  const g = new THREE.Group()

  ;[-1, 1].forEach((side) => {
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 2.2), carbon())
    pod.position.set(side * 0.85, 0.4, 0.15)
    pod.castShadow = true
    pod.receiveShadow = true
    g.add(pod)

    // Inlet duct (dark recess)
    const inlet = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.18), blackMatte())
    inlet.position.set(side * 0.85, 0.48, -0.95)
    g.add(inlet)

    // Side teal accent
    const accent = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 1.8), teal())
    accent.position.set(side * 1.2, 0.48, 0.2)
    g.add(accent)

    // Bargeboard
    const bargeShape = new THREE.Shape()
    bargeShape.moveTo(0, 0)
    bargeShape.lineTo(0.6, 0)
    bargeShape.lineTo(0.5, 0.4)
    bargeShape.lineTo(0, 0.5)
    bargeShape.lineTo(0, 0)
    const bargeGeo = new THREE.ExtrudeGeometry(bargeShape, { depth: 0.04, bevelEnabled: false })
    const barge = new THREE.Mesh(bargeGeo, blackMatte())
    barge.position.set(side * 1.05, 0.08, -1.5)
    barge.scale.x = side
    g.add(barge)
  })

  return g
}

function buildHalo(): THREE.Group {
  const g = new THREE.Group()

  // Halo loop (front-strut + side hoop using torus arc + center post)
  const loopGeo = new THREE.TorusGeometry(0.55, 0.04, 12, 24, Math.PI)
  const loop = new THREE.Mesh(loopGeo, blackMatte())
  loop.rotation.x = Math.PI / 2
  loop.rotation.z = Math.PI
  loop.position.set(0, 1.06, -0.6)
  g.add(loop)

  // Side strut (left/right) connecting halo to chassis sides
  ;[-1, 1].forEach((side) => {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.85, 10), blackMatte())
    strut.position.set(side * 0.55, 0.78, -0.6)
    g.add(strut)
  })

  // Center forward strut
  const centerStrut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), blackMatte())
  centerStrut.position.set(0, 0.85, -1.1)
  centerStrut.rotation.x = -0.35
  g.add(centerStrut)

  return g
}

function buildDriverHelmet(): THREE.Group {
  const g = new THREE.Group()
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.62), helmetMat())
  helmet.position.set(0, 0.95, -0.45)
  helmet.castShadow = true
  g.add(helmet)

  // Visor
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.221, 24, 18, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.18), visorMat())
  visor.position.copy(helmet.position)
  g.add(visor)

  // Helmet cap stripe (silver)
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.222, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.15), silverPaint())
  cap.position.copy(helmet.position)
  g.add(cap)

  return g
}

function buildEngineCover(): THREE.Group {
  const g = new THREE.Group()

  // Tapered engine cover via lathe-ish: use shape + extrude
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(0.4, 0)
  shape.lineTo(0.36, 0.6)
  shape.lineTo(0.18, 0.85)
  shape.lineTo(0, 1.0)
  shape.lineTo(0, 0)
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.7, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 })
  geo.center()
  const cover = new THREE.Mesh(geo, carbon())
  cover.rotation.y = Math.PI / 2
  cover.position.set(0, 0.7, 0.3)
  cover.castShadow = true
  g.add(cover)

  // Shark fin
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 1.3), carbon())
  fin.position.set(0, 1.0, 0.7)
  fin.castShadow = true
  g.add(fin)

  // Air intake (above driver)
  const intake = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.6), blackMatte())
  intake.position.set(0, 1.18, -0.2)
  g.add(intake)

  // Number 44 panel (silver) on engine cover
  const numPanel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.5), silverPaint())
  numPanel.position.set(0, 1.05, 0.5)
  g.add(numPanel)

  return g
}

function buildRearWing(): THREE.Group {
  const g = new THREE.Group()

  // Lower main plane
  const main = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.55), carbon())
  main.position.set(0, 1.18, 2.4)
  main.rotation.x = 0.18
  main.castShadow = true
  g.add(main)

  // Upper flap
  const upper = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.05, 0.4), carbon())
  upper.position.set(0, 1.4, 2.5)
  upper.rotation.x = 0.28
  upper.castShadow = true
  g.add(upper)

  // Teal accent on top edge
  const accent = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.025, 0.08), teal())
  accent.position.set(0, 1.43, 2.65)
  accent.rotation.x = 0.28
  g.add(accent)

  // Endplates
  ;[-1.1, 1.1].forEach((x) => {
    const ep = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, 0.95), blackMatte())
    ep.position.set(x, 1.28, 2.45)
    ep.castShadow = true
    g.add(ep)
  })

  // Vertical mounts (swan-neck)
  ;[-0.36, 0.36].forEach((x) => {
    const mount = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.2), carbon())
    mount.position.set(x, 1.0, 2.4)
    g.add(mount)
  })

  // DRS pod / center mount
  const drs = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.3), blackMatte())
  drs.position.set(0, 1.32, 2.45)
  g.add(drs)

  // Rain light (small red dot under wing)
  const rainLight = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshStandardMaterial({ color: "#ff2218", emissive: new THREE.Color("#ff2218"), emissiveIntensity: 1.0 }))
  rainLight.position.set(0, 1.06, 2.5)
  g.add(rainLight)

  return g
}

function buildExhaust(): THREE.Group {
  const g = new THREE.Group()
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 16), new THREE.MeshStandardMaterial({ color: "#1a1a1c", roughness: 0.3, metalness: 0.9 }))
  pipe.rotation.x = Math.PI / 2
  pipe.position.set(0, 0.62, 2.65)
  g.add(pipe)
  // Mini exhausts
  ;[-0.32, 0.32].forEach((x) => {
    const wgPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 12), new THREE.MeshStandardMaterial({ color: "#1a1a1c", roughness: 0.35, metalness: 0.85 }))
    wgPipe.rotation.x = Math.PI / 2
    wgPipe.position.set(x, 0.58, 2.6)
    g.add(wgPipe)
  })
  return g
}

function buildWheel(role: "fl" | "fr" | "rl" | "rr"): THREE.Group {
  const g = new THREE.Group()
  g.userData.role = role

  // Tire
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.42, 32), tireMat())
  tire.rotation.z = Math.PI / 2
  tire.castShadow = true
  g.add(tire)

  // Inner rim
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.43, 24), rimMat())
  rim.rotation.z = Math.PI / 2
  g.add(rim)

  // Center hub
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.46, 16), silverPaint())
  hub.rotation.z = Math.PI / 2
  g.add(hub)

  // Spokes (5)
  for (let i = 0; i < 5; i += 1) {
    const angle = (i / 5) * Math.PI * 2
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.04), rimMat())
    spoke.position.set(0, Math.cos(angle) * 0.18, Math.sin(angle) * 0.18)
    spoke.rotation.x = angle
    g.add(spoke)
  }

  // Brake disc (visible behind rim)
  const brake = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 24), brakeMat())
  brake.rotation.z = Math.PI / 2
  brake.position.x = role.endsWith("l") ? 0.05 : -0.05
  g.add(brake)

  // Tire sidewall stripe (white "P ZERO" hint)
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.012, 6, 28), new THREE.MeshBasicMaterial({ color: "#dddddd" }))
  stripe.position.x = role.endsWith("l") ? -0.205 : 0.205
  stripe.rotation.y = Math.PI / 2
  g.add(stripe)

  return g
}

function buildSuspension(): THREE.Group {
  const g = new THREE.Group()
  const armMat = blackMatte()

  const arm = (length: number) => new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, length, 8), armMat)

  // Front wishbones (each side)
  ;[-1, 1].forEach((side) => {
    // Front upper
    const upper = arm(0.95)
    upper.rotation.z = Math.PI / 2
    upper.position.set(side * 0.65, 0.5, -1.45)
    g.add(upper)
    // Front lower
    const lower = arm(0.95)
    lower.rotation.z = Math.PI / 2
    lower.position.set(side * 0.65, 0.32, -1.45)
    g.add(lower)
    // Rear upper
    const rUpper = arm(0.95)
    rUpper.rotation.z = Math.PI / 2
    rUpper.position.set(side * 0.65, 0.55, 1.55)
    g.add(rUpper)
    // Rear lower
    const rLower = arm(0.95)
    rLower.rotation.z = Math.PI / 2
    rLower.position.set(side * 0.65, 0.32, 1.55)
    g.add(rLower)
  })

  return g
}

export function buildW15Car(): CarRig {
  const root = new THREE.Group()
  root.name = "W15Car"

  const chassis = new THREE.Group()
  chassis.add(buildMonocoque())
  chassis.add(buildNose())
  chassis.add(buildFrontWing())
  chassis.add(buildSidepods())
  chassis.add(buildHalo())
  chassis.add(buildDriverHelmet())
  chassis.add(buildEngineCover())
  chassis.add(buildRearWing())
  chassis.add(buildExhaust())
  chassis.add(buildSuspension())

  // Wheel positions (x, y, z) - z is forward
  const wheelData: Array<{ key: "fl" | "fr" | "rl" | "rr"; x: number; z: number }> = [
    { key: "fl", x: -1.2, z: -1.5 },
    { key: "fr", x: 1.2, z: -1.5 },
    { key: "rl", x: -1.2, z: 1.55 },
    { key: "rr", x: 1.2, z: 1.55 },
  ]

  const fl = buildWheel("fl"); const fr = buildWheel("fr"); const rl = buildWheel("rl"); const rr = buildWheel("rr")
  const wheelGroups = { fl, fr, rl, rr } as const
  wheelData.forEach((d) => {
    const w = wheelGroups[d.key]
    w.position.set(d.x, 0.46, d.z)
    chassis.add(w)
  })

  // Steering wheels are wrapped in a parent group so we can rotate yaw without losing wheel-spin axis
  const flSteer = new THREE.Group()
  const frSteer = new THREE.Group()
  flSteer.position.copy(fl.position); fl.position.set(0, 0, 0); flSteer.add(fl); chassis.remove(fl)
  frSteer.position.copy(fr.position); fr.position.set(0, 0, 0); frSteer.add(fr); chassis.remove(fr)
  chassis.add(flSteer)
  chassis.add(frSteer)

  // Make every mesh cast shadows
  chassis.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      ;(obj as THREE.Mesh).castShadow = true
      ;(obj as THREE.Mesh).receiveShadow = true
    }
  })

  // Orient car so that -Z is forward in chassis local space, but driving code uses +Z forward.
  // We rotate the chassis 180° so that the "nose" (-Z in chassis local) points along +Z when heading=0... actually we'll let the driving math match the model: chassis nose is -Z, so when heading=0 the car points -Z. Adjust loop accordingly.
  // Simpler: rotate chassis so nose points +Z (matching loop assumption Sin(heading), Cos(heading)).
  chassis.rotation.y = Math.PI

  root.add(chassis)

  // After rotating chassis 180, the front wheels are at chassis local -Z (was -1.5), now +Z... but they are part of chassis so they rotate with it. Steering must still rotate around Y of each wheel group (works regardless).

  return {
    root,
    chassis,
    wheels: { fl, fr, rl, rr },
    steeringWheels: [flSteer, frSteer],
  }
}

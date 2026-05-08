import * as THREE from "three"
import { PALETTE } from "./palette"
import { SCALE_X, SCALE_Z, SUZUKA_LANDMARKS, SUZUKA_TRACK_POINTS, TRACK_HALF_WIDTH } from "./track"

export type Collider = { x: number; z: number; radius: number }

export type EnvironmentSystem = {
  group: THREE.Group
  ferrisWheel: THREE.Group
  petals: PetalSystem
  colliders: Collider[]
}

export type PetalSystem = {
  mesh: THREE.InstancedMesh
  data: Array<{ pos: THREE.Vector3; vel: THREE.Vector3; rot: number; rotSpeed: number; spawn: THREE.Vector3 }>
  update: (delta: number) => void
}

const TRACK_CLEARANCE_SAMPLES = (() => {
  const curve = new THREE.CatmullRomCurve3(
    SUZUKA_TRACK_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    true,
    "centripetal",
    0.5,
  )
  const samples: THREE.Vector3[] = []
  const sampleCount = 720
  for (let i = 0; i < sampleCount; i += 1) {
    samples.push(curve.getPoint(i / sampleCount))
  }
  return samples
})()

type LowerRoadCutSample = {
  x: number
  y: number
  z: number
}

const LOWER_CUT_NEGATIVE_Y = -0.05
const LOWER_CUT_TRANSITION_Y = 0.08
const LOWER_CUT_SAMPLE_COUNT = 720
const LOWER_CUT_EXTENSION_SAMPLES = 18
const LOWER_CUT_INNER_HALF_WIDTH = TRACK_HALF_WIDTH + 1.6
const LOWER_CUT_OUTER_HALF_WIDTH = TRACK_HALF_WIDTH + 10.0
const LOWER_CUT_CLEARANCE_BELOW_ROAD = 1.0
const TRACK_TERRAIN_SINK_INNER = TRACK_HALF_WIDTH + 9.5
const TRACK_TERRAIN_SINK_OUTER = TRACK_HALF_WIDTH + 24.0
const TRACK_TERRAIN_SINK_DEPTH = 1.0

const LOWER_ROAD_CUT_SAMPLES = (() => {
  const curve = new THREE.CatmullRomCurve3(
    SUZUKA_TRACK_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    true,
    "centripetal",
    0.5,
  )
  const samples: THREE.Vector3[] = []
  const negativeIndices: number[] = []

  for (let i = 0; i < LOWER_CUT_SAMPLE_COUNT; i += 1) {
    const point = curve.getPoint(i / LOWER_CUT_SAMPLE_COUNT)
    samples.push(point)
    if (point.y < LOWER_CUT_NEGATIVE_Y) negativeIndices.push(i)
  }

  if (negativeIndices.length === 0) return [] as LowerRoadCutSample[]

  const first = Math.max(0, Math.min(...negativeIndices) - LOWER_CUT_EXTENSION_SAMPLES)
  const last = Math.min(LOWER_CUT_SAMPLE_COUNT - 1, Math.max(...negativeIndices) + LOWER_CUT_EXTENSION_SAMPLES)
  const cutSamples: LowerRoadCutSample[] = []
  for (let i = first; i <= last; i += 1) {
    const point = samples[i]
    if (point.y <= LOWER_CUT_TRANSITION_Y) {
      cutSamples.push({ x: point.x, y: point.y, z: point.z })
    }
  }

  return cutSamples
})()

function distanceToTrackXZ(x: number, z: number): number {
  let best = Number.POSITIVE_INFINITY
  for (const p of TRACK_CLEARANCE_SAMPLES) {
    const distance = Math.hypot(p.x - x, p.z - z)
    if (distance < best) best = distance
  }
  return best
}

function underpassCuttingGroundY(x: number, z: number): number {
  if (LOWER_ROAD_CUT_SAMPLES.length === 0) return 0

  let nearest: LowerRoadCutSample | null = null
  let nearestDistance = Number.POSITIVE_INFINITY
  for (const sample of LOWER_ROAD_CUT_SAMPLES) {
    const distance = Math.hypot(sample.x - x, sample.z - z)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = sample
    }
  }

  if (!nearest || nearestDistance >= LOWER_CUT_OUTER_HALF_WIDTH) return 0

  const cutFactor = 1 - THREE.MathUtils.smoothstep(nearestDistance, LOWER_CUT_INNER_HALF_WIDTH, LOWER_CUT_OUTER_HALF_WIDTH)
  return (nearest.y - LOWER_CUT_CLEARANCE_BELOW_ROAD) * cutFactor
}

const MAIN_STRAIGHT_YAW = 1.2
const MAIN_STRAIGHT_HEADING = 2.77
const yawFromHeading = (heading: number) => heading - Math.PI / 2
const toWorldXZ = (x: number, z: number): THREE.Vector3 => new THREE.Vector3(x * SCALE_X, 0, z * SCALE_Z)
const tracksidePosition = (x: number, z: number, heading: number, offset: number): THREE.Vector3 => {
  const pos = toWorldXZ(x, z)
  pos.x += -Math.cos(heading) * offset
  pos.z += Math.sin(heading) * offset
  return pos
}

const PIT_COMPLEX_POS = tracksidePosition(150, 12, MAIN_STRAIGHT_HEADING, -38)
const MAIN_STRAIGHT_STANDS_POS = tracksidePosition(148, 16, MAIN_STRAIGHT_HEADING, 92)
const FIRST_TURN_STANDS_POS = tracksidePosition(146, -78, -1.0, 92)
const S_CURVE_STANDS_POS = tracksidePosition(34, -42, -1.92, 92)
const HAIRPIN_STANDS_POS = tracksidePosition(92, 118, -0.33, -110)
const SPOON_STANDS_POS = tracksidePosition(-166, 158, 3.08, -112)
const CASIO_STANDS_POS = tracksidePosition(170, 58, 2.71, -108)
const FERRIS_WHEEL_POS = new THREE.Vector3(540, 13, 240)
const PAGODA_GARDEN_POS = new THREE.Vector3(-342, 0, -256)
const TORII_PLAZA_POS = new THREE.Vector3(500, 0, -260)

const SCENERY_CLEARINGS = [
  { x: FERRIS_WHEEL_POS.x, z: FERRIS_WHEEL_POS.z, inner: 34, outer: 78 },
  { x: PAGODA_GARDEN_POS.x, z: PAGODA_GARDEN_POS.z, inner: 36, outer: 86 },
  { x: TORII_PLAZA_POS.x, z: TORII_PLAZA_POS.z, inner: 18, outer: 52 },
]

function sceneryClearingFactor(x: number, z: number): number {
  let factor = 1
  for (const clearing of SCENERY_CLEARINGS) {
    const distance = Math.hypot(x - clearing.x, z - clearing.z)
    factor = Math.min(factor, THREE.MathUtils.smoothstep(distance, clearing.inner, clearing.outer))
  }
  return factor
}

function addRotatedCollider(
  colliders: Collider[],
  center: THREE.Vector3,
  yaw: number,
  localX: number,
  localZ: number,
  radius: number,
): void {
  const c = Math.cos(yaw)
  const s = Math.sin(yaw)
  colliders.push({
    x: center.x + localX * c + localZ * s,
    z: center.z - localX * s + localZ * c,
    radius,
  })
}

function buildGround(group: THREE.Group): void {
  const geo = new THREE.PlaneGeometry(1400, 1400, 220, 220)
  geo.rotateX(-Math.PI / 2)

  const positions = geo.attributes.position as THREE.BufferAttribute
  const colors: number[] = []
  const grass = new THREE.Color(PALETTE.grass)
  const grassHill = new THREE.Color(PALETTE.grassHill)
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    const distFromCenter = Math.hypot(x, z)
    const trackDistance = distanceToTrackXZ(x, z)
    const flatZone = THREE.MathUtils.smoothstep(distFromCenter, 160, 320)
    const trackClearance = THREE.MathUtils.smoothstep(trackDistance, 48, 104)
    const sceneryClearance = sceneryClearingFactor(x, z)
    const noise =
      Math.sin(x * 0.012 + z * 0.016) * 1.4 +
      Math.cos(x * 0.028 - z * 0.02) * 0.8 +
      Math.sin(x * 0.005 + z * 0.0075) * 4.4
    const rollingTerrainY = flatZone * trackClearance * sceneryClearance * Math.max(noise, 0)
    const cuttingY = underpassCuttingGroundY(x, z)
    const trackBedSink =
      (1 - THREE.MathUtils.smoothstep(trackDistance, TRACK_TERRAIN_SINK_INNER, TRACK_TERRAIN_SINK_OUTER)) *
      TRACK_TERRAIN_SINK_DEPTH
    const y = cuttingY < 0 ? Math.min(cuttingY, rollingTerrainY - trackBedSink) : rollingTerrainY - trackBedSink
    positions.setY(i, y - 0.05)

    const tint = THREE.MathUtils.clamp(Math.max(0, y) / 5, 0, 1)
    const c = grass.clone().lerp(grassHill, tint)
    colors.push(c.r, c.g, c.b)
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  geo.computeVertexNormals()

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.0,
    flatShading: false,
    emissive: new THREE.Color("#17360f"),
    emissiveIntensity: 0.28,
  })
  const ground = new THREE.Mesh(geo, mat)
  ground.receiveShadow = false
  group.add(ground)
}

function buildMtFuji(group: THREE.Group, colliders: Collider[]): void {
  const fuji = new THREE.Group()

  const coneGeo = new THREE.ConeGeometry(120, 160, 18, 6)
  const positions = coneGeo.attributes.position as THREE.BufferAttribute
  const colors: number[] = []
  const base = new THREE.Color(PALETTE.fujiBase)
  const snow = new THREE.Color(PALETTE.fujiSnow)
  for (let i = 0; i < positions.count; i += 1) {
    const y = positions.getY(i)
    const t = THREE.MathUtils.smoothstep(y, 40, 75)
    const c = base.clone().lerp(snow, t)
    colors.push(c.r, c.g, c.b)
  }
  coneGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

  const fujiMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })
  const cone = new THREE.Mesh(coneGeo, fujiMat)
  cone.position.y = 80
  fuji.add(cone)

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(46, 40, 12, 3),
    new THREE.MeshStandardMaterial({ color: PALETTE.fujiSnow, roughness: 0.85, flatShading: true, emissive: new THREE.Color("#fff0e0"), emissiveIntensity: 0.05 }),
  )
  cap.position.y = 154
  fuji.add(cap)

  const fujiPos = new THREE.Vector3(-450, 0, -680)
  fuji.position.copy(fujiPos)
  group.add(fuji)
  colliders.push({ x: fujiPos.x, z: fujiPos.z, radius: 110 })

  const foothillPos = new THREE.Vector3(-280, 25, -520)
  const foothill = new THREE.Mesh(
    new THREE.ConeGeometry(58, 60, 14, 4),
    new THREE.MeshStandardMaterial({ color: PALETTE.fujiBase, flatShading: true, roughness: 0.95 }),
  )
  foothill.position.copy(foothillPos)
  group.add(foothill)
  colliders.push({ x: foothillPos.x, z: foothillPos.z, radius: 50 })
}

function buildToriiInstance(parent: THREE.Group): THREE.Group {
  const torii = new THREE.Group()
  const red = new THREE.MeshStandardMaterial({ color: PALETTE.toriiRed, roughness: 0.7 })
  const dark = new THREE.MeshStandardMaterial({ color: PALETTE.toriiDark, roughness: 0.6 })

  ;[-3.6, 3.6].forEach((x) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 8.5, 12), red)
    col.position.set(x, 4.25, 0)
    col.castShadow = true
    col.receiveShadow = true
    torii.add(col)
  })

  const lowerBeam = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.45, 0.7), dark)
  lowerBeam.position.set(0, 7.0, 0)
  lowerBeam.castShadow = true
  torii.add(lowerBeam)

  const upperBeam = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.7, 1.0), red)
  upperBeam.position.set(0, 8.2, 0)
  upperBeam.castShadow = true
  torii.add(upperBeam)

  ;[-5.0, 5.0].forEach((x) => {
    const tip = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.2), red)
    tip.position.set(x, 8.3, 0)
    tip.rotation.z = x > 0 ? -0.18 : 0.18
    torii.add(tip)
  })

  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.1), dark)
  plaque.position.set(0, 7.55, 0.4)
  torii.add(plaque)

  parent.add(torii)
  return torii
}

function buildTorii(group: THREE.Group, colliders: Collider[]): void {
  const torii1 = buildToriiInstance(group)
  const t1Pos = new THREE.Vector3(-220, 0, 90)
  torii1.position.copy(t1Pos)
  torii1.rotation.y = Math.PI / 2
  // Pillars are along world X axis but rotated 90deg, so columns sit at +/-3.6z.
  ;[-3.6, 3.6].forEach((off) => {
    colliders.push({ x: t1Pos.x, z: t1Pos.z + off, radius: 1.4 })
  })

  const torii2 = buildToriiInstance(group)
  const t2Pos = TORII_PLAZA_POS.clone()
  torii2.position.copy(t2Pos)
  torii2.rotation.y = -Math.PI / 6
  torii2.scale.setScalar(0.7)
  // Apply rotation to local pillar offsets when adding colliders
  const t2Yaw = -Math.PI / 6
  ;[-3.6, 3.6].forEach((off) => {
    const dx = Math.cos(t2Yaw) * off * 0.7
    const dz = Math.sin(t2Yaw) * off * 0.7
    colliders.push({ x: t2Pos.x + dx, z: t2Pos.z + dz, radius: 1.0 })
  })
}

function buildPagoda(group: THREE.Group, colliders: Collider[]): void {
  const pagoda = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: PALETTE.pagodaWood, roughness: 0.8 })
  const roofMat = new THREE.MeshStandardMaterial({ color: PALETTE.pagodaRoof, roughness: 0.65, flatShading: true })
  const trimMat = new THREE.MeshStandardMaterial({ color: PALETTE.pagodaTrim, roughness: 0.7 })

  let baseY = 0
  const baseSize = 4.5
  for (let tier = 0; tier < 5; tier += 1) {
    const size = baseSize * (1 - tier * 0.13)
    const tierHeight = 1.6
    const body = new THREE.Mesh(new THREE.BoxGeometry(size, tierHeight, size), woodMat)
    body.position.y = baseY + tierHeight / 2
    body.castShadow = true
    body.receiveShadow = true
    pagoda.add(body)

    const roofSize = size * 1.35
    const roof = new THREE.Mesh(new THREE.ConeGeometry(roofSize * 0.7, 0.8, 4, 1), roofMat)
    roof.rotation.y = Math.PI / 4
    roof.position.y = baseY + tierHeight + 0.4
    roof.castShadow = true
    pagoda.add(roof)

    const trim = new THREE.Mesh(new THREE.BoxGeometry(size * 1.05, 0.12, size * 1.05), trimMat)
    trim.position.y = baseY + tierHeight + 0.04
    pagoda.add(trim)

    baseY += tierHeight + 0.5
  }

  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.5, 8), trimMat)
  spire.position.y = baseY + 0.4
  pagoda.add(spire)
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), new THREE.MeshStandardMaterial({ color: "#d4a55a", metalness: 0.85, roughness: 0.25 }))
  finial.position.y = baseY + 1.3
  pagoda.add(finial)

  const pagodaPos = PAGODA_GARDEN_POS.clone()
  const gardenPad = new THREE.Mesh(
    new THREE.CylinderGeometry(32, 36, 0.08, 10),
    new THREE.MeshStandardMaterial({ color: PALETTE.grassHill, roughness: 0.95, flatShading: true }),
  )
  gardenPad.position.set(pagodaPos.x, 0.03, pagodaPos.z)
  gardenPad.rotation.y = Math.PI / 10
  gardenPad.receiveShadow = true
  group.add(gardenPad)

  pagoda.position.copy(pagodaPos)
  pagoda.scale.setScalar(1.6)
  group.add(pagoda)
  colliders.push({ x: pagodaPos.x, z: pagodaPos.z, radius: 8 })
}

function buildSakuraTrees(group: THREE.Group): void {
  const positions: Array<{ x: number; z: number; scale: number; rot: number; tint: number }> = []
  const seed = 51719
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }

  for (let i = 0; i < 110; i += 1) {
    const ring = 200 + rand() * 220
    const angle = rand() * Math.PI * 2
    const x = Math.cos(angle) * ring
    const z = Math.sin(angle) * ring * 0.78
    if (Math.hypot(x, z) < 170) continue
    if (distanceToTrackXZ(x, z) < 58) continue
    positions.push({ x, z, scale: 0.9 + rand() * 1.4, rot: rand() * Math.PI * 2, tint: rand() })
  }

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.8, 7)
  const trunkMat = new THREE.MeshStandardMaterial({ color: PALETTE.sakuraTrunk, roughness: 0.9 })
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, positions.length)

  const canopyGeo = new THREE.IcosahedronGeometry(1.4, 0)
  const canopyMat = new THREE.MeshStandardMaterial({ color: PALETTE.sakuraPink, roughness: 0.75, flatShading: true, emissive: new THREE.Color(PALETTE.sakuraPink), emissiveIntensity: 0.06 })
  const canopyMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, positions.length * 3)

  const dummy = new THREE.Object3D()
  let canopyIndex = 0
  positions.forEach((p, i) => {
    dummy.position.set(p.x, 0.9 * p.scale, p.z)
    dummy.rotation.set(0, p.rot, 0)
    dummy.scale.setScalar(p.scale)
    dummy.updateMatrix()
    trunkMesh.setMatrixAt(i, dummy.matrix)

    for (let k = 0; k < 3; k += 1) {
      const offX = (Math.cos(p.rot + k * 2.1) * 0.7) * p.scale
      const offZ = (Math.sin(p.rot + k * 2.1) * 0.7) * p.scale
      const offY = 1.8 * p.scale + Math.cos(k) * 0.3 * p.scale
      dummy.position.set(p.x + offX, offY, p.z + offZ)
      dummy.scale.setScalar(p.scale * (0.85 + (k === 0 ? 0.25 : 0)))
      dummy.rotation.set(p.rot + k * 0.7, p.rot + k, k * 0.3)
      dummy.updateMatrix()
      canopyMesh.setMatrixAt(canopyIndex, dummy.matrix)
      canopyIndex += 1
    }
  })

  trunkMesh.instanceMatrix.needsUpdate = true
  canopyMesh.instanceMatrix.needsUpdate = true
  trunkMesh.castShadow = true
  canopyMesh.castShadow = true
  trunkMesh.receiveShadow = true
  canopyMesh.receiveShadow = true
  group.add(trunkMesh)
  group.add(canopyMesh)
}

function buildPaddyTerraces(group: THREE.Group): void {
  const colors = [PALETTE.paddyGreen1, PALETTE.paddyGreen2, PALETTE.paddyGreen3]
  const tiers = [
    { x: 320, z: -250, w: 78, d: 50, tier: 0 },
    { x: 320, z: -250, w: 65, d: 40, tier: 1 },
    { x: 320, z: -250, w: 52, d: 32, tier: 2 },
    { x: -300, z: 190, w: 92, d: 56, tier: 0 },
    { x: -300, z: 190, w: 74, d: 46, tier: 1 },
    { x: 250, z: 250, w: 72, d: 40, tier: 0 },
    { x: 250, z: 250, w: 56, d: 32, tier: 1 },
  ]
  tiers.forEach((t) => {
    const mat = new THREE.MeshStandardMaterial({ color: colors[t.tier % colors.length], roughness: 1.0, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(t.w, t.d), mat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(t.x, 0.018 + t.tier * 0.006, t.z)
    mesh.castShadow = false
    mesh.receiveShadow = false
    group.add(mesh)
  })
}

function buildTokyoSkyline(group: THREE.Group): void {
  const seed = 91337
  let s = seed
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const buildingGeo = new THREE.BoxGeometry(1, 1, 1)
  const cityMat = new THREE.MeshStandardMaterial({ color: PALETTE.cityBlack, emissive: new THREE.Color(PALETTE.cityWindow), emissiveIntensity: 0.18, roughness: 0.6, metalness: 0.4 })
  const count = 130
  const mesh = new THREE.InstancedMesh(buildingGeo, cityMat, count)
  const dummy = new THREE.Object3D()

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + rand() * 0.05
    const radius = 540 + rand() * 180
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius * 0.9
    if (z < -380 && Math.abs(x) < 480) continue // clear behind Fuji
    const w = 6 + rand() * 12
    const d = 6 + rand() * 12
    const h = 14 + rand() * 64
    dummy.position.set(x, h / 2, z)
    dummy.rotation.set(0, rand() * Math.PI, 0)
    dummy.scale.set(w, h, d)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  group.add(mesh)
}

function buildFerrisWheel(group: THREE.Group, colliders: Collider[]): THREE.Group {
  const wheel = new THREE.Group()
  const ringMat = new THREE.MeshStandardMaterial({ color: PALETTE.silver, roughness: 0.4, metalness: 0.7 })
  const cabinMat = new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.4, metalness: 0.5, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.2 })

  const outer = new THREE.Mesh(new THREE.TorusGeometry(11, 0.35, 12, 56), ringMat)
  wheel.add(outer)

  const spokeCount = 16
  for (let i = 0; i < spokeCount; i += 1) {
    const angle = (i / spokeCount) * Math.PI * 2
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 22, 0.18), ringMat)
    spoke.rotation.z = angle
    wheel.add(spoke)

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.4), cabinMat)
    cabin.position.set(Math.cos(angle) * 11, Math.sin(angle) * 11, 0)
    cabin.userData.spinIndex = i
    wheel.add(cabin)
  }

  wheel.position.set(0, 0, 0)

  const wheelHolder = new THREE.Group()
  wheelHolder.add(wheel)
  const wheelPos = FERRIS_WHEEL_POS.clone()
  wheelHolder.position.copy(wheelPos)

  const legMat = new THREE.MeshStandardMaterial({ color: "#3a3a3e", roughness: 0.5, metalness: 0.6 })
  ;[-1, 1].forEach((side) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 18, 0.5), legMat)
    leg.position.set(side * 6, -9, 0)
    leg.rotation.z = side * 0.3
    wheelHolder.add(leg)
  })

  group.add(wheelHolder)
  // Hitbox covers the base so you can't drive through the legs
  colliders.push({ x: wheelPos.x, z: wheelPos.z, radius: 8 })
  return wheel
}

type StandSpec = {
  name: string
  position: THREE.Vector3
  yaw: number
  width: number
  rows: number
  depthSign: 1 | -1
  covered?: boolean
  screen?: boolean
}

function buildStandUnit(spec: StandSpec, colliders: Collider[]): THREE.Group {
  const stand = new THREE.Group()
  stand.name = `Grandstand_${spec.name}`

  const seatMat = new THREE.MeshStandardMaterial({ color: "#2a2e30", roughness: 0.74 })
  const riserMat = new THREE.MeshStandardMaterial({ color: "#171a1d", roughness: 0.88 })
  const roofMat = new THREE.MeshStandardMaterial({ color: "#3f4648", roughness: 0.58, metalness: 0.28 })
  const screenMat = new THREE.MeshStandardMaterial({
    color: "#080b0c",
    roughness: 0.45,
    metalness: 0.35,
    emissive: new THREE.Color(PALETTE.mercedesTeal),
    emissiveIntensity: 0.18,
  })

  const rowStep = 1.34
  const rowRise = 0.58
  const depth = Math.max(2, (spec.rows - 1) * rowStep + 2)
  const depthCenter = (depth * 0.5 - 0.5) * spec.depthSign

  const base = new THREE.Mesh(new THREE.BoxGeometry(spec.width + 1.5, 0.32, depth + 1.2), riserMat)
  base.position.set(0, 0.16, depthCenter)
  base.castShadow = true
  base.receiveShadow = true
  stand.add(base)

  for (let row = 0; row < spec.rows; row += 1) {
    const y = 0.46 + row * rowRise
    const z = row * rowStep * spec.depthSign
    const bench = new THREE.Mesh(new THREE.BoxGeometry(spec.width, 0.46, 1.08), row % 2 === 0 ? seatMat : riserMat)
    bench.position.set(0, y, z)
    bench.castShadow = true
    bench.receiveShadow = true
    stand.add(bench)

    const stepFace = new THREE.Mesh(new THREE.BoxGeometry(spec.width, 0.36, 0.12), riserMat)
    stepFace.position.set(0, y - 0.24, z - spec.depthSign * 0.58)
    stepFace.castShadow = true
    stand.add(stepFace)
  }

  if (spec.covered) {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(spec.width + 2.5, 0.34, depth + 2.4), roofMat)
    roof.position.set(0, spec.rows * rowRise + 1.2, depthCenter)
    roof.castShadow = true
    stand.add(roof)
    ;[-spec.width / 2 + 2, spec.width / 2 - 2].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, spec.rows * rowRise + 1.0, 0.32), roofMat)
      post.position.set(x, (spec.rows * rowRise + 1.0) / 2, depthCenter)
      post.castShadow = true
      stand.add(post)
    })
  }

  if (spec.screen) {
    const screen = new THREE.Mesh(new THREE.BoxGeometry(Math.max(5, spec.width * 0.22), 4.2, 0.32), screenMat)
    screen.position.set(spec.width * 0.5 + 4.2, 3.2, depthCenter)
    screen.castShadow = true
    stand.add(screen)
  }

  stand.position.copy(spec.position)
  stand.rotation.y = spec.yaw

  const colliderCount = Math.max(1, Math.ceil(spec.width / 34))
  const colliderRadius = Math.max(4.4, spec.rows * 0.72)
  for (let i = 0; i < colliderCount; i += 1) {
    const t = colliderCount === 1 ? 0 : i / (colliderCount - 1) - 0.5
    addRotatedCollider(colliders, spec.position, spec.yaw, t * (spec.width - 6), depthCenter, colliderRadius)
  }

  return stand
}

function makeStand(
  name: string,
  x: number,
  z: number,
  heading: number,
  offset: number,
  width: number,
  rows: number,
  covered = false,
  screen = false,
): StandSpec {
  return {
    name,
    position: tracksidePosition(x, z, heading, offset),
    yaw: yawFromHeading(heading),
    width,
    rows,
    depthSign: offset >= 0 ? 1 : -1,
    covered,
    screen,
  }
}

function buildSuzukaGrandstands(group: THREE.Group, colliders: Collider[]): void {
  const hMain = MAIN_STRAIGHT_HEADING
  const hTurnOne = -1.0
  const hEsses = -1.92
  const hDunlop = 2.25
  const hHairpin = -0.33
  const hSpoon = 3.08
  const h130r = 1.5
  const hCasio = 2.71

  const standSpecs: StandSpec[] = [
    // Main straight, final corner, and pit-entry side.
    makeStand("V1", 148, 16, hMain, 80, 58, 6, false, true),
    makeStand("V2", 148, 16, hMain, 104, 68, 11, true, false),
    makeStand("A1", 160, -34, hMain, 100, 34, 5, true, true),
    makeStand("A2", 166, -42, hMain, 120, 38, 8, true, false),
    makeStand("S", 150, 28, hMain, -100, 22, 4, false, true),
    makeStand("R", 158, 38, hCasio, -100, 28, 5, false, true),
    makeStand("Q1", 170, 58, hCasio, -100, 24, 4, false, false),
    makeStand("Q2", 176, 60, hCasio, -120, 30, 8, false, true),

    // First curve and S-curve entry.
    makeStand("B1", 154, -74, hTurnOne, 90, 34, 5, false, true),
    makeStand("B2-1", 148, -82, hTurnOne, 110, 24, 7, false, false),
    makeStand("B2-2", 136, -86, hTurnOne, 112, 24, 7, false, false),
    makeStand("B2-3", 124, -82, hTurnOne, 112, 24, 7, false, false),
    makeStand("C", 106, -68, hTurnOne, 90, 48, 7, false, true),

    // S Curves and Dunlop.
    makeStand("D1", 78, -52, hEsses, 90, 24, 5, false, false),
    makeStand("D2", 60, -58, hEsses, 92, 22, 5, false, false),
    makeStand("D3", 42, -38, hEsses, 100, 22, 5, false, false),
    makeStand("D4", 18, -46, hEsses, 96, 22, 4, false, true),
    makeStand("D5", -8, -26, hEsses, 104, 22, 4, false, true),
    makeStand("E1", -24, 48, hDunlop, 122, 28, 5, false, true),
    makeStand("E2", 8, 64, hDunlop, 60, 30, 5, false, true),

    // Hairpin, Spoon, and 130R.
    makeStand("H", 102, 96, hHairpin, -120, 30, 5, false, true),
    makeStand("I", 76, 132, hHairpin, -120, 58, 8, false, true),
    makeStand("J", 28, 98, 2.7, -100, 22, 4, false, false),
    makeStand("M", -166, 158, hSpoon, -112, 64, 6, false, true),
    makeStand("G1", -20, 56, h130r, -96, 26, 4, false, true),
    makeStand("G3", 20, 52, h130r, -60, 20, 4, false, false),
    makeStand("G4", 62, 58, h130r, 60, 20, 4, false, false),
    makeStand("G5", 104, 72, h130r, 92, 20, 4, false, false),
    makeStand("P", 136, 82, h130r, -80, 42, 5, false, true),
  ]

  standSpecs.forEach((spec) => {
    group.add(buildStandUnit(spec, colliders))
  })
}

function buildPitComplex(group: THREE.Group, colliders: Collider[]): void {
  const pit = new THREE.Group()
  pit.name = "SuzukaPitPaddock"

  const pitLaneMat = new THREE.MeshStandardMaterial({ color: PALETTE.asphaltRunoff, roughness: 0.92, metalness: 0.0 })
  const pitWallMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeck, roughness: 0.74, metalness: 0.08 })
  const fenceMat = new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.45, metalness: 0.6, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.15 })
  const garageMat = new THREE.MeshStandardMaterial({ color: "#181d20", roughness: 0.58, metalness: 0.32 })
  const doorMat = new THREE.MeshStandardMaterial({ color: "#2e3638", roughness: 0.4, metalness: 0.45 })
  const glassMat = new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.18, metalness: 0.4, transparent: true, opacity: 0.48, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.18 })

  const laneLength = 156
  const laneWidth = 9
  const garageLength = 132
  const garageDepth = 9
  const garageZ = laneWidth * 0.5 + garageDepth * 0.5 + 6

  const lane = new THREE.Mesh(new THREE.BoxGeometry(laneLength, 0.045, laneWidth), pitLaneMat)
  lane.position.y = 0.055
  lane.receiveShadow = false
  pit.add(lane)

  const pitWallZ = -laneWidth * 0.5 - 2.1
  for (let i = 0; i < 20; i += 1) {
    const x = -laneLength / 2 + 4 + i * ((laneLength - 8) / 19)
    const wall = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.55, 0.32), pitWallMat)
    wall.position.set(x, 0.32, pitWallZ)
    wall.castShadow = true
    pit.add(wall)

    const fence = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.08), fenceMat)
    fence.position.set(x, 1.35, pitWallZ)
    fence.castShadow = true
    pit.add(fence)
  }

  const garage = new THREE.Mesh(new THREE.BoxGeometry(garageLength, 4.8, garageDepth), garageMat)
  garage.position.set(0, 2.4, garageZ)
  garage.castShadow = true
  garage.receiveShadow = true
  pit.add(garage)

  const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(garageLength - 4, 2.2, garageDepth - 1.6), garageMat)
  upperDeck.position.set(0, 6.0, garageZ)
  upperDeck.castShadow = true
  pit.add(upperDeck)

  const glass = new THREE.Mesh(new THREE.BoxGeometry(garageLength - 8, 1.25, 0.2), glassMat)
  glass.position.set(0, 6.15, garageZ - garageDepth * 0.5 - 0.12)
  pit.add(glass)

  const bayCount = 18
  for (let i = 0; i < bayCount; i += 1) {
    const x = -((bayCount - 1) / 2) * 6.7 + i * 6.7
    const door = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.2, 0.22), doorMat)
    door.position.set(x, 1.75, garageZ - garageDepth * 0.5 - 0.14)
    door.castShadow = true
    pit.add(door)

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.18, 0.26), fenceMat)
    stripe.position.set(x, 0.42, garageZ - garageDepth * 0.5 - 0.28)
    pit.add(stripe)
  }

  const raceControl = new THREE.Mesh(new THREE.BoxGeometry(18, 13, 12), garageMat)
  raceControl.position.set(-garageLength * 0.5 + 12, 6.5, garageZ + 12)
  raceControl.castShadow = true
  raceControl.receiveShadow = true
  pit.add(raceControl)

  const controlGlass = new THREE.Mesh(new THREE.BoxGeometry(15, 4.2, 0.24), glassMat)
  controlGlass.position.set(-garageLength * 0.5 + 12, 9.2, garageZ + 5.8)
  pit.add(controlGlass)

  ;[-34, 0, 34].forEach((x, i) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(28, 4 + i * 0.7, 12), garageMat)
    block.position.set(x, 2 + i * 0.35, garageZ + 24 + i * 2)
    block.castShadow = true
    block.receiveShadow = true
    pit.add(block)
  })

  pit.position.copy(PIT_COMPLEX_POS)
  pit.rotation.y = MAIN_STRAIGHT_YAW
  group.add(pit)

  for (let i = 0; i < 7; i += 1) {
    const t = i / 6 - 0.5
    addRotatedCollider(colliders, PIT_COMPLEX_POS, MAIN_STRAIGHT_YAW, t * (garageLength - 8), garageZ, 5.4)
  }
  addRotatedCollider(colliders, PIT_COMPLEX_POS, MAIN_STRAIGHT_YAW, -garageLength * 0.5 + 12, garageZ + 12, 7.5)
  ;[-34, 0, 34].forEach((x) => {
    addRotatedCollider(colliders, PIT_COMPLEX_POS, MAIN_STRAIGHT_YAW, x, garageZ + 25, 7.0)
  })
}

function buildPetals(group: THREE.Group): PetalSystem {
  const COUNT = 320
  const SPAWN_BOX = 360
  const geo = new THREE.PlaneGeometry(0.18, 0.18)
  const mat = new THREE.MeshBasicMaterial({ color: PALETTE.sakuraPink, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  group.add(mesh)

  const data: PetalSystem["data"] = []
  for (let i = 0; i < COUNT; i += 1) {
    const spawn = new THREE.Vector3(
      (Math.random() - 0.5) * SPAWN_BOX,
      8 + Math.random() * 22,
      (Math.random() - 0.5) * SPAWN_BOX,
    )
    data.push({
      pos: spawn.clone(),
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.6, -(0.4 + Math.random() * 0.5), (Math.random() - 0.5) * 0.6),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.6,
      spawn,
    })
  }

  const dummy = new THREE.Object3D()
  let elapsed = 0
  const update = (delta: number) => {
    elapsed += delta
    for (let i = 0; i < COUNT; i += 1) {
      const p = data[i]
      p.pos.x += p.vel.x * delta + Math.sin(elapsed * 1.2 + i) * 0.08 * delta
      p.pos.y += p.vel.y * delta
      p.pos.z += p.vel.z * delta + Math.cos(elapsed * 0.9 + i) * 0.08 * delta
      p.rot += p.rotSpeed * delta
      if (p.pos.y < 0.1) {
        p.pos.x = (Math.random() - 0.5) * SPAWN_BOX
        p.pos.y = 30 + Math.random() * 12
        p.pos.z = (Math.random() - 0.5) * SPAWN_BOX
      }
      dummy.position.copy(p.pos)
      dummy.rotation.set(p.rot * 0.4, p.rot, p.rot * 0.6)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }

  return { mesh, data, update }
}

function buildBannerColliders(colliders: Collider[]): void {
  const [x, , z] = SUZUKA_LANDMARKS.startFinish.position
  const sideX = Math.cos(SUZUKA_LANDMARKS.startFinish.heading)
  const sideZ = -Math.sin(SUZUKA_LANDMARKS.startFinish.heading)
  // Start/finish banner support poles. Keep the hitboxes tiny so the car can
  // squeeze past the gantry without clipping through the posts.
  ;[-7.5, 7.5].forEach((off) => {
    colliders.push({ x: x + sideX * off, z: z + sideZ * off, radius: 0.7 })
  })
}

export function buildEnvironment(scene: THREE.Scene): EnvironmentSystem {
  const group = new THREE.Group()
  group.name = "JapanEnvironment"

  const colliders: Collider[] = []

  buildGround(group)
  buildMtFuji(group, colliders)
  buildTorii(group, colliders)
  buildPagoda(group, colliders)
  buildSakuraTrees(group)
  buildPaddyTerraces(group)
  buildTokyoSkyline(group)
  const ferrisWheel = buildFerrisWheel(group, colliders)
  buildBannerColliders(colliders)
  const petals = buildPetals(group)

  scene.add(group)

  return { group, ferrisWheel, petals, colliders }
}

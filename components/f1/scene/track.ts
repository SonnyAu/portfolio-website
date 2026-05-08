import * as THREE from "three"
import { PALETTE } from "./palette"

export type TrackSystem = {
  group: THREE.Group
  curve: THREE.CatmullRomCurve3
  startFinish: THREE.Vector3
  sampler: TrackSampler
  trackHalfWidth: number
}

export type TrackSampler = {
  getGroundAt: (x: number, z: number, currentY: number) => { y: number; distance: number; t: number }
}

export type TrackLandmark = {
  position: [number, number, number]
  heading: number
}

const BRIDGE_Y = 5.2
export const BRIDGE_THRESHOLD = 1.2

export type CircuitSection = {
  label: string
  start: number
  end: number
  bridgeOnly?: boolean
  fallbackLabel?: string
}

export const CIRCUIT_SECTIONS: CircuitSection[] = [
  { label: "PIT STRAIGHT", start: 0.973, end: 0.055 },
  { label: "TURN 1 / TURN 2", start: 0.055, end: 0.145 },
  { label: "S CURVES", start: 0.145, end: 0.23 },
  { label: "DUNLOP", start: 0.23, end: 0.295 },
  { label: "DEGNER", start: 0.295, end: 0.415 },
  { label: "HAIRPIN", start: 0.415, end: 0.52 },
  { label: "200R", start: 0.52, end: 0.6 },
  { label: "SPOON", start: 0.6, end: 0.745 },
  { label: "BACKSTRETCH / 130R", start: 0.745, end: 0.804 },
  { label: "CROSSOVER BRIDGE", start: 0.804, end: 0.895, bridgeOnly: true, fallbackLabel: "130R" },
  { label: "CASIO TRIANGLE", start: 0.895, end: 0.955 },
  { label: "FINAL CORNER", start: 0.955, end: 0.973 },
]

function normalizeTrackT(t: number): number {
  return ((t % 1) + 1) % 1
}

function isTrackTInRange(t: number, start: number, end: number): boolean {
  return start <= end ? t >= start && t < end : t >= start || t < end
}

export function getCircuitSectionAt(t: number, y: number): string {
  const normalizedT = normalizeTrackT(t)
  for (const section of CIRCUIT_SECTIONS) {
    if (!isTrackTInRange(normalizedT, section.start, section.end)) continue
    if (section.bridgeOnly) return y > BRIDGE_THRESHOLD ? section.label : section.fallbackLabel ?? "DEGNER"
    return section.label
  }
  return "PIT STRAIGHT"
}

// World-scale constants. The TRACK_POINTS array remains readable at small numbers;
// SCALE_X/SCALE_Z expand the figure-8 to roughly Suzuka proportions when the curve is built.
export const SCALE_X = 2.4
export const SCALE_Z = 2.6
export const TRACK_HALF_WIDTH = 6.0
const TRACK_WIDTH = 12.0
const TRACK_SURFACE_Y_OFFSET = 0.04
const PAINT_Y_OFFSET = 0.075
const GROUND_DETAIL_Y_OFFSET = 0.03
const GROUND_DETAIL_MAX_Y = 0.18
const KERB_HALF = 6.0
const WALL_OFF = 6.25
const TUNNEL_WALL_OFFSET = TRACK_HALF_WIDTH + 2.1
const TUNNEL_WALL_THICKNESS = 0.7
const TUNNEL_LENGTH = 38
const TUNNEL_WALL_HEIGHT = 4.35
const TUNNEL_SOFFIT_Y = BRIDGE_Y - 0.65

const toWorldPosition = (x: number, y: number, z: number): [number, number, number] => [x * SCALE_X, y, z * SCALE_Z]

export const SUZUKA_LANDMARKS: Record<
  "startFinish" | "turnOneTwo" | "sCurves" | "hairpin" | "spoon" | "casioTriangle",
  TrackLandmark
> = {
  startFinish: { position: toWorldPosition(126, 0, -24), heading: 0.43 },
  turnOneTwo: { position: toWorldPosition(180, 0, 154), heading: -1.26 },
  sCurves: { position: toWorldPosition(78, 0, 36), heading: -2.45 },
  hairpin: { position: toWorldPosition(-52, 0, -104), heading: 1.14 },
  spoon: { position: toWorldPosition(-240, 0, -96), heading: -0.23 },
  casioTriangle: { position: toWorldPosition(66, 0, -14), heading: 1.31 },
}

const TRACK_POINTS: Array<[number, number, number]> = [
  // helper waypoint before S/F
  [126, 0, -24],

  // S/F and Turn 1-2
  [140, 0, 4],
  [156, 0, 42],
  [172, 0, 84],

  // Turn 01
  [184, 0, 116],
  [188, 0, 138],
  [180, 0, 154],

  // Turn 02
  [160, 0, 160],
  [140, 0, 148],
  [126, 0, 126],

  // Snake / Esses
  [120, 0, 104],
  [104, 0, 86],
  [86, 0, 78],

  [72, 0, 58],
  [78, 0, 36],
  [62, 0, 18],

  // Turn 07 Dunlop
  [38, 0, 18],
  [18, 0, 30],
  [4, 0, 48],
  [-18, 0, 44],

  // Turn 08 Degner 1
  [-42, 0, 42],
  [-52, 0, 42],
  [-60, 0, 40],

  // Turn 09 Degner 2
  [-62, 0, 30],
  [-61, 0, 18],
  [-60, 0, 6],
  [-59, 0, -8],
  [-57, 0, -22],
  [-54, 0, -34],

  // Turn 10 Hairpin entry
  [-52, 0, -48],
  [-50, 0, -62],
  [-48, 0, -76],

  // Turn 11 Hairpin apex
  [-46, 0, -90],
  [-46, 0, -100],
  [-52, 0, -104],
  [-62, 0, -98],

  // Turn 12 200R
  [-76, 0, -82],
  [-92, 0, -64],
  [-112, 0, -44],
  [-134, 0, -26],
  [-158, 0, -10],

  // Turn 13 Spoon
  [-184, 0, -18],
  [-204, 0, -42],
  [-220, 0, -68],
  [-232, 0, -88],
  [-240, 0, -96],

  // Turn 14 Spoon
  [-250, 0, -96],
  [-258, 0, -90],
  [-260, 0, -76],
  [-256, 0, -58],
  [-246, 0, -38],
  [-228, 0, -18],

  // Backstretch into 130R
  [-168, 0, 4],
  [-142, 0, 8],
  [-118, 0, 10],
  [-94, 0, 12],
  [-72, 0.8, 14],
  [-56, 2.8, 15],

  // Turn 15 130R
  [-48, BRIDGE_Y, 16],

  // Exit from 130R toward Casio Triangle
  [-28, BRIDGE_Y, 14],
  [-8, BRIDGE_Y, 8],
  [12, 3.2, 0],
  [30, 1.6, -16],
  [46, 0.6, -28],

  // Turn 16 Casio Triangle entry
  [58, 0, -34],
  [72, 0, -28],
  [66, 0, -14],

  // Turn 17 Casio Triangle exit
  [82, 0, -10],
  [102, 0, -18],

  // Turn 18 final corner
  [118, 0, -24],
]

export const SUZUKA_TRACK_POINTS: Array<[number, number, number]> = TRACK_POINTS.map(([x, y, z]) => (
  toWorldPosition(x, y, z)
))

type RibbonOptions = {
  curve: THREE.CatmullRomCurve3
  width: number
  samples: number
  yOffset: number
  thickness: number
  topMaterial: THREE.Material
  sideMaterial: THREE.Material
  /** When true, samples whose curve y > BRIDGE_THRESHOLD are skipped (runoff/gravel). */
  clipBridge?: boolean
}

/**
 * Builds a 3D ribbon along a curve with a top deck, two side walls, and a bottom face.
 * Produces 4 vertices per sample (TL, TR, BL, BR) and uses material groups so the
 * top can have an asphalt material while the sides/bottom show concrete-grey deck.
 *
 * When `clipBridge` is true, elevated samples are skipped and the ribbon is split
 * into multiple disconnected sub-ribbons across the curve (used for runoff/gravel
 * which should only sit on ground sections).
 */
function buildThickRibbon(opts: RibbonOptions): THREE.Mesh {
  const { curve, width, samples, yOffset, thickness, topMaterial, sideMaterial, clipBridge = false } = opts

  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  // groups[0] -> top quads (top material), groups[1] -> sides+bottom (side material)
  const topIndices: number[] = []
  const sideIndices: number[] = []

  type SampleVerts = { tl: number; tr: number; bl: number; br: number; valid: boolean }
  const sampleVerts: SampleVerts[] = []

  const halfW = width * 0.5
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    const point = curve.getPoint(t)
    const tangent = curve.getTangent(t).normalize()
    const sideX = tangent.z
    const sideZ = -tangent.x

    const skip = clipBridge && point.y > BRIDGE_THRESHOLD
    if (skip) {
      sampleVerts.push({ tl: -1, tr: -1, bl: -1, br: -1, valid: false })
      continue
    }

    const baseY = point.y + yOffset
    const tlIdx = positions.length / 3
    positions.push(point.x + sideX * halfW, baseY, point.z + sideZ * halfW)
    normals.push(0, 1, 0); uvs.push(0, t * 40)
    const trIdx = positions.length / 3
    positions.push(point.x - sideX * halfW, baseY, point.z - sideZ * halfW)
    normals.push(0, 1, 0); uvs.push(1, t * 40)
    const blIdx = positions.length / 3
    positions.push(point.x + sideX * halfW, baseY - thickness, point.z + sideZ * halfW)
    normals.push(0, -1, 0); uvs.push(0, t * 40)
    const brIdx = positions.length / 3
    positions.push(point.x - sideX * halfW, baseY - thickness, point.z - sideZ * halfW)
    normals.push(0, -1, 0); uvs.push(1, t * 40)

    sampleVerts.push({ tl: tlIdx, tr: trIdx, bl: blIdx, br: brIdx, valid: true })
  }

  for (let i = 0; i < samples; i += 1) {
    const a = sampleVerts[i]
    const b = sampleVerts[i + 1]
    if (!a.valid || !b.valid) continue

    // Top: a.tl -> b.tl -> a.tr  /  a.tr -> b.tl -> b.tr
    topIndices.push(a.tl, b.tl, a.tr, a.tr, b.tl, b.tr)
    // Bottom (reversed winding so it faces down)
    sideIndices.push(a.bl, a.br, b.bl, a.br, b.br, b.bl)
    // Left wall (a.tl - a.bl - b.tl - b.bl)
    sideIndices.push(a.tl, a.bl, b.tl, b.tl, a.bl, b.bl)
    // Right wall (a.tr - b.tr - a.br - b.br)
    sideIndices.push(a.tr, b.tr, a.br, a.br, b.tr, b.br)
  }

  const allIndices = topIndices.concat(sideIndices)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(allIndices)
  geo.addGroup(0, topIndices.length, 0)
  geo.addGroup(topIndices.length, sideIndices.length, 1)
  geo.computeVertexNormals()
  geo.computeBoundingSphere()

  const mesh = new THREE.Mesh(geo, [topMaterial, sideMaterial])
  mesh.castShadow = true
  mesh.receiveShadow = false
  return mesh
}

function buildSurfaceBand(
  curve: THREE.CatmullRomCurve3,
  innerOffset: number,
  outerOffset: number,
  samples: number,
  yOffset: number,
  material: THREE.Material,
): THREE.Mesh {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const sampleVerts: Array<{ inner: number; outer: number; valid: boolean }> = []

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    const point = curve.getPoint(t)
    const tangent = curve.getTangent(t).normalize()
    const sideX = tangent.z
    const sideZ = -tangent.x

    if (point.y > GROUND_DETAIL_MAX_Y) {
      sampleVerts.push({ inner: -1, outer: -1, valid: false })
      continue
    }

    const innerIdx = positions.length / 3
    positions.push(point.x + sideX * innerOffset, point.y + yOffset, point.z + sideZ * innerOffset)
    normals.push(0, 1, 0)
    uvs.push(0, t * 24)

    const outerIdx = positions.length / 3
    positions.push(point.x + sideX * outerOffset, point.y + yOffset, point.z + sideZ * outerOffset)
    normals.push(0, 1, 0)
    uvs.push(1, t * 24)

    sampleVerts.push({ inner: innerIdx, outer: outerIdx, valid: true })
  }

  for (let i = 0; i < samples; i += 1) {
    const a = sampleVerts[i]
    const b = sampleVerts[i + 1]
    if (!a.valid || !b.valid) continue
    indices.push(a.inner, b.inner, a.outer, a.outer, b.inner, b.outer)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeBoundingSphere()

  const mesh = new THREE.Mesh(geo, material)
  mesh.receiveShadow = false
  return mesh
}

function addMirroredSurfaceBands(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  innerOffset: number,
  outerOffset: number,
  samples: number,
  yOffset: number,
  material: THREE.Material,
): void {
  group.add(buildSurfaceBand(curve, innerOffset, outerOffset, samples, yOffset, material))
  group.add(buildSurfaceBand(curve, -innerOffset, -outerOffset, samples, yOffset, material))
}

function buildKerbs(curve: THREE.CatmullRomCurve3, group: THREE.Group): void {
  const samples = 360
  const trackHalf = KERB_HALF
  const kerbWhite = new THREE.MeshStandardMaterial({ color: PALETTE.kerbWhite, roughness: 0.6 })
  const kerbRed = new THREE.MeshStandardMaterial({ color: PALETTE.kerbRed, roughness: 0.6 })

  const points: THREE.Vector3[] = []
  const tangents: THREE.Vector3[] = []
  for (let i = 0; i <= samples; i += 1) {
    points.push(curve.getPoint(i / samples))
    tangents.push(curve.getTangent(i / samples).normalize())
  }

  for (let i = 0; i < samples; i += 1) {
    const t1 = tangents[i]
    const t2 = tangents[(i + 4) % samples]
    const cross = t1.x * t2.z - t1.z * t2.x
    if (Math.abs(cross) < 0.012) continue

    const inside = cross > 0 ? 1 : -1
    const point = points[i]
    const t = t1
    const sideX = t.z * inside
    const sideZ = -t.x * inside

    const kerb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.07, 1.2), i % 2 === 0 ? kerbWhite : kerbRed)
    kerb.position.set(point.x + sideX * trackHalf, point.y + 0.05, point.z + sideZ * trackHalf)
    kerb.rotation.y = Math.atan2(t.x, t.z)
    kerb.receiveShadow = true
    group.add(kerb)
  }
}

function buildPaintedLines(curve: THREE.CatmullRomCurve3, group: THREE.Group): void {
  const whiteEdge = new THREE.MeshBasicMaterial({
    color: PALETTE.trackWhite,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })
  const yellowDash = new THREE.MeshBasicMaterial({
    color: PALETTE.trackYellow,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })

  const samples = 480

  const buildEdge = (offset: number) => {
    const positions: number[] = []
    const normals: number[] = []
    const indices: number[] = []
    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples
      const p = curve.getPoint(t)
      const tan = curve.getTangent(t).normalize()
      const sx = tan.z
      const sz = -tan.x
      const cx = p.x + sx * offset
      const cz = p.z + sz * offset
      positions.push(cx + sx * 0.09, p.y + PAINT_Y_OFFSET, cz + sz * 0.09)
      positions.push(cx - sx * 0.09, p.y + PAINT_Y_OFFSET, cz - sz * 0.09)
      normals.push(0, 1, 0, 0, 1, 0)
    }
    for (let i = 0; i < samples; i += 1) {
      const a = i * 2; const b = a + 1; const c = a + 2; const d = a + 3
      indices.push(a, c, b, b, c, d)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
    g.setIndex(indices)
    g.computeBoundingSphere()
    return new THREE.Mesh(g, whiteEdge)
  }
  const trackHalf = TRACK_HALF_WIDTH
  group.add(buildEdge(trackHalf))
  group.add(buildEdge(-trackHalf))

  const dashCount = 64
  for (let i = 0; i < dashCount; i += 1) {
    const t = i / dashCount
    const p = curve.getPoint(t)
    const tan = curve.getTangent(t).normalize()
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.7), yellowDash)
    dash.position.set(p.x, p.y + PAINT_Y_OFFSET, p.z)
    dash.rotation.y = Math.atan2(tan.x, tan.z)
    group.add(dash)
  }
}

type CrossoverSample = {
  p: THREE.Vector3
  tan: THREE.Vector3
  t: number
}

type CrossoverInfo = {
  lower: CrossoverSample
  upper: CrossoverSample
  planarDistance: number
}

function findCrossover(curve: THREE.CatmullRomCurve3): CrossoverInfo | null {
  const samples = 360
  const lower: CrossoverSample[] = []
  const upper: CrossoverSample[] = []

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    const p = curve.getPoint(t)
    const sample = { p, tan: curve.getTangent(t).normalize(), t }
    if (p.y <= 0.2) lower.push(sample)
    if (p.y >= BRIDGE_Y - 0.35) upper.push(sample)
  }

  let best: CrossoverInfo | null = null
  lower.forEach((low) => {
    upper.forEach((high) => {
      const planarDistance = Math.hypot(low.p.x - high.p.x, low.p.z - high.p.z)
      if (!best || planarDistance < best.planarDistance) {
        best = { lower: low, upper: high, planarDistance }
      }
    })
  })

  return best
}

function createBermGeometry(innerX: number, outerX: number, halfLength: number, highY: number, lowY: number): THREE.BufferGeometry {
  const positions = [
    innerX, 0, -halfLength,
    outerX, 0, -halfLength,
    outerX, 0, halfLength,
    innerX, 0, halfLength,
    innerX, highY, -halfLength,
    outerX, lowY, -halfLength,
    outerX, lowY, halfLength,
    innerX, highY, halfLength,
  ]
  const indices = [
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4,
    3, 7, 6, 3, 6, 2,
    0, 4, 7, 0, 7, 3,
    1, 2, 6, 1, 6, 5,
  ]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
  return geo
}

function buildCrossoverTunnel(curve: THREE.CatmullRomCurve3, group: THREE.Group): void {
  const crossover = findCrossover(curve)
  if (!crossover) return

  const tunnel = new THREE.Group()
  tunnel.name = "CrossoverTunnel"
  tunnel.position.set(crossover.lower.p.x, 0, crossover.lower.p.z)
  tunnel.rotation.y = Math.atan2(crossover.lower.tan.x, crossover.lower.tan.z)

  const concreteMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeck, roughness: 0.86, metalness: 0.04 })
  const darkConcreteMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDark, roughness: 0.94, metalness: 0.02 })
  const earthMat = new THREE.MeshStandardMaterial({ color: PALETTE.grassHill, roughness: 1.0, metalness: 0, flatShading: true, side: THREE.DoubleSide })

  const halfLength = TUNNEL_LENGTH * 0.5
  const wallY = TUNNEL_WALL_HEIGHT * 0.5 + 0.04
  ;[-1, 1].forEach((side) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(TUNNEL_WALL_THICKNESS, TUNNEL_WALL_HEIGHT, TUNNEL_LENGTH),
      concreteMat,
    )
    wall.position.set(side * TUNNEL_WALL_OFFSET, wallY, 0)
    wall.castShadow = true
    wall.receiveShadow = true
    tunnel.add(wall)

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(TUNNEL_WALL_THICKNESS + 0.04, 0.08, TUNNEL_LENGTH * 0.92),
      darkConcreteMat,
    )
    stripe.position.set(side * TUNNEL_WALL_OFFSET, 1.45, 0)
    tunnel.add(stripe)

    const innerX = side * (TUNNEL_WALL_OFFSET + TUNNEL_WALL_THICKNESS * 0.5)
    const outerX = side * (TUNNEL_WALL_OFFSET + TUNNEL_WALL_THICKNESS * 0.5 + 7.0)
    const berm = new THREE.Mesh(createBermGeometry(innerX, outerX, halfLength + 3, TUNNEL_WALL_HEIGHT * 0.74, 0.28), earthMat)
    berm.position.y = 0.01
    berm.receiveShadow = false
    tunnel.add(berm)
  })

  const soffitWidth = TUNNEL_WALL_OFFSET * 2 + TUNNEL_WALL_THICKNESS + 1.2
  const soffit = new THREE.Mesh(
    new THREE.BoxGeometry(soffitWidth, 0.5, TUNNEL_LENGTH + 5),
    darkConcreteMat,
  )
  soffit.position.set(0, TUNNEL_SOFFIT_Y, 0)
  soffit.castShadow = true
  soffit.receiveShadow = true
  tunnel.add(soffit)

  ;[-1, 1].forEach((end) => {
    const z = end * (halfLength + 0.45)
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(soffitWidth + 2.0, 0.82, 0.8),
      concreteMat,
    )
    lintel.position.set(0, TUNNEL_SOFFIT_Y - 0.08, z)
    lintel.castShadow = true
    tunnel.add(lintel)

    ;[-1, 1].forEach((side) => {
      const cheek = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, TUNNEL_WALL_HEIGHT + 0.45, 0.9),
        concreteMat,
      )
      cheek.position.set(side * TUNNEL_WALL_OFFSET, (TUNNEL_WALL_HEIGHT + 0.45) * 0.5, z)
      cheek.castShadow = true
      cheek.receiveShadow = true
      tunnel.add(cheek)
    })
  })

  group.add(tunnel)
}

function buildBridgeSupports(curve: THREE.CatmullRomCurve3, group: THREE.Group): void {
  const samples = 240
  const wallMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeck, roughness: 0.7, metalness: 0.1 })
  const wallStripeMat = new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.5, metalness: 0.3, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.25 })

  const samplePoints: { p: THREE.Vector3; tan: THREE.Vector3 }[] = []
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    samplePoints.push({ p: curve.getPoint(t), tan: curve.getTangent(t).normalize() })
  }

  // Solid wall panels along elevated road edges. The terrain mesh now supplies
  // the visible support, so repeated bridge pillars would fight the embankment.
  const wallHeight = 0.95
  const wallThickness = 0.18
  const segLen = 1.5
  for (let i = 0; i < samples; i += 1) {
    const sp = samplePoints[i]
    const next = samplePoints[i + 1] ?? samplePoints[0]
    if (sp.p.y < 0.6 || next.p.y < 0.6) continue
    if (i % 2 !== 0) continue

    const sx = sp.tan.z
    const sz = -sp.tan.x
    const yaw = Math.atan2(sp.tan.x, sp.tan.z)

    ;[-WALL_OFF, WALL_OFF].forEach((off) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, segLen), wallMat)
      wall.position.set(sp.p.x + sx * off, sp.p.y + wallHeight / 2 + 0.08, sp.p.z + sz * off)
      wall.rotation.y = yaw
      wall.castShadow = true
      wall.receiveShadow = true
      group.add(wall)

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(wallThickness * 1.05, 0.08, segLen), wallStripeMat)
      stripe.position.set(sp.p.x + sx * off, sp.p.y + wallHeight + 0.08, sp.p.z + sz * off)
      stripe.rotation.y = yaw
      group.add(stripe)
    })
  }
}

function buildStartFinish(curve: THREE.CatmullRomCurve3, group: THREE.Group): THREE.Vector3 {
  const startT = 0
  const point = curve.getPoint(startT)
  const tangent = curve.getTangent(startT).normalize()
  const sx = tangent.z
  const sz = -tangent.x

  const checkers = new THREE.Group()
  const cellSize = 1.0
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 11; col += 1) {
      const isWhite = (row + col) % 2 === 0
      const cell = new THREE.Mesh(
        new THREE.BoxGeometry(cellSize, 0.04, cellSize * 0.45),
        new THREE.MeshBasicMaterial({ color: isWhite ? "#f5f5f5" : "#0a0a0a" }),
      )
      const lateral = (col - 5) * cellSize
      const longitudinal = (row - 0.5) * cellSize * 0.5
      cell.position.set(point.x + sx * lateral + tangent.x * longitudinal, point.y + PAINT_Y_OFFSET, point.z + sz * lateral + tangent.z * longitudinal)
      cell.rotation.y = Math.atan2(tangent.x, tangent.z)
      checkers.add(cell)
    }
  }
  group.add(checkers)

  const bannerCanvas = document.createElement("canvas")
  bannerCanvas.width = 1024; bannerCanvas.height = 128
  const ctx = bannerCanvas.getContext("2d")
  if (ctx) {
    ctx.fillStyle = "#0a0e10"
    ctx.fillRect(0, 0, 1024, 128)
    ctx.fillStyle = PALETTE.mercedesTeal
    ctx.font = "bold 64px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("MERCEDES-AMG PETRONAS - SUZUKA", 512, 64)
  }
  const bannerTex = new THREE.CanvasTexture(bannerCanvas)
  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(14, 1.2, 0.2),
    new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.6 }),
  )
  banner.position.set(point.x, 7, point.z)
  banner.rotation.y = Math.atan2(tangent.x, tangent.z)
  group.add(banner)

  ;[-7.5, 7.5].forEach((off) => {
    const pole = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 7, 0.4),
      new THREE.MeshStandardMaterial({ color: "#2a2e30", roughness: 0.5, metalness: 0.5 }),
    )
    pole.position.set(point.x + sx * off, 3.5, point.z + sz * off)
    pole.rotation.y = Math.atan2(tangent.x, tangent.z)
    pole.castShadow = true
    group.add(pole)
  })

  return point.clone()
}

function buildTrackSampler(curve: THREE.CatmullRomCurve3): TrackSampler {
  const samples = 720
  const xs = new Float32Array(samples)
  const ys = new Float32Array(samples)
  const zs = new Float32Array(samples)
  for (let i = 0; i < samples; i += 1) {
    const p = curve.getPoint(i / samples)
    xs[i] = p.x
    ys[i] = p.y
    zs[i] = p.z
  }
  return {
    getGroundAt(x: number, z: number, currentY: number) {
      let nearestI = 0
      let nearestD = Number.POSITIVE_INFINITY
      for (let i = 0; i < samples; i += 1) {
        const dx = xs[i] - x
        const dz = zs[i] - z
        const d = Math.sqrt(dx * dx + dz * dz)
        if (d < nearestD) {
          nearestD = d
          nearestI = i
        }
      }

      let bestI = nearestI
      let bestScore = Number.POSITIVE_INFINITY
      let groundI = -1
      let groundD = Number.POSITIVE_INFINITY
      let bridgeI = -1
      let bridgeD = Number.POSITIVE_INFINITY
      for (let i = 0; i < samples; i += 1) {
        const dx = xs[i] - x
        const dz = zs[i] - z
        const planarD = Math.sqrt(dx * dx + dz * dz)
        if (planarD > nearestD + TRACK_HALF_WIDTH) continue

        if (ys[i] <= BRIDGE_THRESHOLD && planarD < groundD) {
          groundD = planarD
          groundI = i
        }
        if (ys[i] > BRIDGE_THRESHOLD && planarD < bridgeD) {
          bridgeD = planarD
          bridgeI = i
        }

        const yDelta = Math.abs(ys[i] - currentY)
        const score = yDelta * 12 + planarD * 0.02
        if (score < bestScore) {
          bestScore = score
          bestI = i
        }
      }

      const nearestIsBridge = ys[nearestI] > BRIDGE_THRESHOLD
      const lowerIsUsable = groundI >= 0 && groundD <= TRACK_HALF_WIDTH + 1.0
      const bridgeIsUsable = bridgeI >= 0 && bridgeD <= TRACK_HALF_WIDTH + 1.0
      if (currentY < 0.35 && lowerIsUsable) {
        bestI = groundI
      } else if (currentY < 1.4 && lowerIsUsable) {
        bestI = groundI
      } else if (bridgeIsUsable && (nearestIsBridge || currentY > 0.65 || !lowerIsUsable || bridgeD + 1.0 < groundD)) {
        bestI = bridgeI
      } else if (lowerIsUsable) {
        bestI = groundI
      }

      const dx = xs[bestI] - x
      const dz = zs[bestI] - z
      return { y: ys[bestI], distance: Math.sqrt(dx * dx + dz * dz), t: bestI / samples }
    },
  }
}

export function buildSuzukaTrack(): TrackSystem {
  const group = new THREE.Group()
  group.name = "SuzukaTrack"

  const curve = new THREE.CatmullRomCurve3(
    SUZUKA_TRACK_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    true,
    "centripetal",
    0.5,
  )

  // Materials
  const concreteSideMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeck, roughness: 0.85, metalness: 0.05 })
  const concreteUnderMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDark, roughness: 0.95, metalness: 0.0 })

  const groundBandSide = THREE.DoubleSide
  const gravelMat = new THREE.MeshStandardMaterial({ color: PALETTE.gravel, roughness: 0.98, metalness: 0.0, side: groundBandSide })
  const runOffMat = new THREE.MeshStandardMaterial({ color: PALETTE.asphaltRunoff, roughness: 0.94, metalness: 0.0, side: groundBandSide })
  const shoulderMat = new THREE.MeshStandardMaterial({ color: PALETTE.asphaltDark, roughness: 0.95, metalness: 0.0, side: groundBandSide })

  addMirroredSurfaceBands(group, curve, TRACK_HALF_WIDTH + 0.35, TRACK_HALF_WIDTH + 1.7, 600, GROUND_DETAIL_Y_OFFSET + 0.012, shoulderMat)
  addMirroredSurfaceBands(group, curve, TRACK_HALF_WIDTH + 1.95, TRACK_HALF_WIDTH + 4.8, 600, GROUND_DETAIL_Y_OFFSET + 0.006, runOffMat)
  addMirroredSurfaceBands(group, curve, TRACK_HALF_WIDTH + 5.1, TRACK_HALF_WIDTH + 6.7, 600, GROUND_DETAIL_Y_OFFSET, gravelMat)

  // Main asphalt deck (thick so the bridge has a visible solid underside)
  const trackTopMat = new THREE.MeshStandardMaterial({
    color: PALETTE.asphalt,
    roughness: 0.85,
    metalness: 0.0,
    emissive: new THREE.Color("#0b0c0d"),
    emissiveIntensity: 0.36,
  })
  const trackMesh = buildThickRibbon({
    curve,
    width: TRACK_WIDTH,
    samples: 800,
    yOffset: TRACK_SURFACE_Y_OFFSET,
    thickness: 0.85,
    topMaterial: trackTopMat,
    sideMaterial: concreteSideMat,
  })
  group.add(trackMesh)

  buildPaintedLines(curve, group)
  buildKerbs(curve, group)
  buildBridgeSupports(curve, group)
  buildCrossoverTunnel(curve, group)
  const startFinish = buildStartFinish(curve, group)

  void concreteUnderMat

  const sampler = buildTrackSampler(curve)

  return { group, curve, startFinish, sampler, trackHalfWidth: TRACK_HALF_WIDTH }
}

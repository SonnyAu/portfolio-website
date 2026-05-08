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
  getGroundAt: (x: number, z: number, currentY: number, previousT?: number) => { y: number; distance: number; t: number; layer: TrackLayer }
}

export type TrackLandmark = {
  position: [number, number, number]
  heading: number
}

export type TrackLayer = "ground" | "elevated"

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
export const PAVED_HALF_WIDTH = TRACK_HALF_WIDTH + 4.8
export const START_FINISH_GANTRY_POLE_OFFSET = TRACK_HALF_WIDTH + 2.6
const TRACK_WIDTH = 12.0
const TRACK_SURFACE_Y_OFFSET = 0.04
const PAINT_Y_OFFSET = 0.075
const GROUND_DETAIL_Y_OFFSET = 0.03
const GROUND_DETAIL_MAX_Y = 0.18
const KERB_HALF = 6.0
const WALL_OFF = 6.25
const UNDERPASS_VOID_HALF_WIDTH = TRACK_HALF_WIDTH + 1.15
const UNDERPASS_VOID_HALF_LENGTH = 92
const UNDERPASS_WALL_THICKNESS = 0.65
const UNDERPASS_WALL_TOP_Y = 0.22
const UNDERPASS_BANK_WIDTH = 5.0
const BRIDGE_DETAIL_MIN_Y = BRIDGE_Y - 0.45
const BRIDGE_SIDE_PANEL_OFF = TRACK_HALF_WIDTH + 0.45
const BRIDGE_SPONSOR_PANEL_HEIGHT = 0.72
const BRIDGE_SUPPORT_OFF = TRACK_HALF_WIDTH + 3.4
const APPROACH_EMBANKMENT_MIN_Y = 0.35
const APPROACH_EMBANKMENT_INNER_OFFSET = TRACK_HALF_WIDTH + 0.9
const APPROACH_EMBANKMENT_OUTER_OFFSET = TRACK_HALF_WIDTH + 6.2
const APPROACH_EMBANKMENT_TOP_DROP = 0.75
const APPROACH_EMBANKMENT_MAX_Y = 1.6
const LOWER_CUT_SURFACE_CLIP_Y = -0.05

const toWorldPosition = (x: number, y: number, z: number): [number, number, number] => [x * SCALE_X, y, z * SCALE_Z]
const toWorldVector = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(...toWorldPosition(x, y, z))

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
  [-52, -0.25, 42],
  [-60, -0.65, 40],

  // Turn 09 Degner 2
  [-62, -1.05, 30],
  [-61, -1.35, 18],
  [-60, -1.55, 6],
  [-59, -1.45, -8],
  [-57, -0.85, -22],
  [-54, -0.35, -34],

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
  [-168, 0.6, 4],
  [-142, 1.4, 8],
  [-118, 2.6, 10],
  [-94, 4.0, 12],
  [-72, BRIDGE_Y, 14],
  [-56, BRIDGE_Y, 15],

  // Turn 15 130R
  [-48, BRIDGE_Y, 16],

  // Exit from 130R toward Casio Triangle
  [-28, BRIDGE_Y, 14],
  [-8, BRIDGE_Y, 8],
  [12, 4.6, 0],
  [30, 3.2, -16],
  [46, 1.6, -28],

  // Turn 16 Casio Triangle entry
  [58, 0.4, -34],
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
  clipUnderpass?: UnderpassVoid | null,
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

    const innerX = point.x + sideX * innerOffset
    const innerZ = point.z + sideZ * innerOffset
    const outerX = point.x + sideX * outerOffset
    const outerZ = point.z + sideZ * outerOffset
    const isDepressedLowerRoad = point.y < LOWER_CUT_SURFACE_CLIP_Y
    const clippedByUnderpass = clipUnderpass
      ? point.y <= GROUND_DETAIL_MAX_Y &&
      (
        isDepressedLowerRoad ||
        isInsideUnderpassVoid(clipUnderpass, point.x, point.z, 1.8) ||
        isInsideUnderpassVoid(clipUnderpass, innerX, innerZ, 0.35) ||
        isInsideUnderpassVoid(clipUnderpass, outerX, outerZ, 0.35)
      )
      : false

    if (point.y > GROUND_DETAIL_MAX_Y || clippedByUnderpass) {
      sampleVerts.push({ inner: -1, outer: -1, valid: false })
      continue
    }

    const innerIdx = positions.length / 3
    positions.push(innerX, point.y + yOffset, innerZ)
    normals.push(0, 1, 0)
    uvs.push(0, t * 24)

    const outerIdx = positions.length / 3
    positions.push(outerX, point.y + yOffset, outerZ)
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
  clipUnderpass?: UnderpassVoid | null,
): void {
  group.add(buildSurfaceBand(curve, innerOffset, outerOffset, samples, yOffset, material, clipUnderpass))
  group.add(buildSurfaceBand(curve, -innerOffset, -outerOffset, samples, yOffset, material, clipUnderpass))
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

type UnderpassVoid = {
  center: THREE.Vector3
  yaw: number
  halfWidth: number
  halfLength: number
}

function buildDegnerUnderpassVoid(): UnderpassVoid {
  const center = toWorldVector(-60, -1.55, 6)
  const entry = toWorldVector(-62, -1.05, 30)
  const exit = toWorldVector(-54, -0.35, -34)
  const tangent = exit.sub(entry).normalize()

  return {
    center,
    yaw: Math.atan2(tangent.x, tangent.z),
    halfWidth: UNDERPASS_VOID_HALF_WIDTH,
    halfLength: UNDERPASS_VOID_HALF_LENGTH,
  }
}

function toUnderpassLocal(space: UnderpassVoid, x: number, z: number): { x: number; z: number } {
  const dx = x - space.center.x
  const dz = z - space.center.z
  const c = Math.cos(-space.yaw)
  const s = Math.sin(-space.yaw)
  return {
    x: dx * c + dz * s,
    z: -dx * s + dz * c,
  }
}

function isInsideUnderpassVoid(space: UnderpassVoid, x: number, z: number, padding = 0): boolean {
  const local = toUnderpassLocal(space, x, z)
  return Math.abs(local.x) <= space.halfWidth + padding && Math.abs(local.z) <= space.halfLength + padding
}

function buildApproachEmbankment(
  curve: THREE.CatmullRomCurve3,
  underpass: UnderpassVoid,
  side: -1 | 1,
  material: THREE.Material,
): THREE.Mesh {
  const samples = 260
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const sampleVerts: Array<{ inner: number; outer: number; valid: boolean }> = []

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    const p = curve.getPoint(t)
    const tan = curve.getTangent(t).normalize()
    const sx = tan.z * side
    const sz = -tan.x * side
    const innerX = p.x + sx * APPROACH_EMBANKMENT_INNER_OFFSET
    const innerZ = p.z + sz * APPROACH_EMBANKMENT_INNER_OFFSET
    const outerX = p.x + sx * APPROACH_EMBANKMENT_OUTER_OFFSET
    const outerZ = p.z + sz * APPROACH_EMBANKMENT_OUTER_OFFSET
    const crossesVoid =
      isInsideUnderpassVoid(underpass, p.x, p.z, 1.8) ||
      isInsideUnderpassVoid(underpass, innerX, innerZ, 0.6) ||
      isInsideUnderpassVoid(underpass, outerX, outerZ, 0.6)
    const valid = p.y > APPROACH_EMBANKMENT_MIN_Y && p.y < BRIDGE_Y - 0.6 && !crossesVoid

    if (!valid) {
      sampleVerts.push({ inner: -1, outer: -1, valid: false })
      continue
    }

    const innerY = Math.min(APPROACH_EMBANKMENT_MAX_Y, Math.max(0.08, p.y - APPROACH_EMBANKMENT_TOP_DROP))
    const outerY = 0.02

    const innerIdx = positions.length / 3
    positions.push(innerX, innerY, innerZ)
    normals.push(0, 1, 0)
    uvs.push(0, t * 10)

    const outerIdx = positions.length / 3
    positions.push(outerX, outerY, outerZ)
    normals.push(0, 1, 0)
    uvs.push(1, t * 10)

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
  geo.computeVertexNormals()
  geo.computeBoundingSphere()

  const mesh = new THREE.Mesh(geo, material)
  mesh.receiveShadow = false
  return mesh
}

function buildUnderpassSurfaceStrip(
  curve: THREE.CatmullRomCurve3,
  side: -1 | 1,
  innerOffset: number,
  outerOffset: number,
  samples: number,
  material: THREE.Material,
  getInnerY: (p: THREE.Vector3) => number,
  getOuterY: (p: THREE.Vector3) => number,
): THREE.Mesh {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const sampleVerts: Array<{ inner: number; outer: number; valid: boolean }> = []

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    const p = curve.getPoint(t)
    if (p.y >= LOWER_CUT_SURFACE_CLIP_Y) {
      sampleVerts.push({ inner: -1, outer: -1, valid: false })
      continue
    }

    const tan = curve.getTangent(t).normalize()
    const sx = tan.z * side
    const sz = -tan.x * side
    const innerIdx = positions.length / 3
    positions.push(p.x + sx * innerOffset, getInnerY(p), p.z + sz * innerOffset)
    normals.push(0, 1, 0)
    uvs.push(0, t * 18)

    const outerIdx = positions.length / 3
    positions.push(p.x + sx * outerOffset, getOuterY(p), p.z + sz * outerOffset)
    normals.push(0, 1, 0)
    uvs.push(1, t * 18)

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
  geo.computeVertexNormals()
  geo.computeBoundingSphere()

  const mesh = new THREE.Mesh(geo, material)
  mesh.receiveShadow = false
  return mesh
}

function buildUnderpassWallMesh(
  curve: THREE.CatmullRomCurve3,
  side: -1 | 1,
  material: THREE.Material,
): THREE.Mesh {
  const samples = 360
  const wallInnerOffset = TRACK_HALF_WIDTH + 0.95
  const wallOuterOffset = wallInnerOffset + UNDERPASS_WALL_THICKNESS
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const sampleVerts: Array<{
    innerTop: number
    innerBottom: number
    outerTop: number
    outerBottom: number
    valid: boolean
  }> = []

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    const p = curve.getPoint(t)
    if (p.y >= LOWER_CUT_SURFACE_CLIP_Y) {
      sampleVerts.push({ innerTop: -1, innerBottom: -1, outerTop: -1, outerBottom: -1, valid: false })
      continue
    }

    const tan = curve.getTangent(t).normalize()
    const sx = tan.z * side
    const sz = -tan.x * side
    const topY = UNDERPASS_WALL_TOP_Y
    const bottomY = p.y - 0.12

    const innerTop = positions.length / 3
    positions.push(p.x + sx * wallInnerOffset, topY, p.z + sz * wallInnerOffset)
    normals.push(0, 1, 0)
    uvs.push(0, t * 18)

    const innerBottom = positions.length / 3
    positions.push(p.x + sx * wallInnerOffset, bottomY, p.z + sz * wallInnerOffset)
    normals.push(0, 1, 0)
    uvs.push(0, t * 18)

    const outerTop = positions.length / 3
    positions.push(p.x + sx * wallOuterOffset, topY, p.z + sz * wallOuterOffset)
    normals.push(0, 1, 0)
    uvs.push(1, t * 18)

    const outerBottom = positions.length / 3
    positions.push(p.x + sx * wallOuterOffset, bottomY, p.z + sz * wallOuterOffset)
    normals.push(0, 1, 0)
    uvs.push(1, t * 18)

    sampleVerts.push({ innerTop, innerBottom, outerTop, outerBottom, valid: true })
  }

  for (let i = 0; i < samples; i += 1) {
    const a = sampleVerts[i]
    const b = sampleVerts[i + 1]
    if (!a.valid || !b.valid) continue

    indices.push(a.innerBottom, b.innerBottom, a.innerTop, a.innerTop, b.innerBottom, b.innerTop)
    indices.push(a.outerTop, b.outerBottom, a.outerBottom, a.outerTop, b.outerTop, b.outerBottom)
    indices.push(a.innerTop, b.innerTop, a.outerTop, a.outerTop, b.innerTop, b.outerTop)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  geo.computeBoundingSphere()

  const mesh = new THREE.Mesh(geo, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function buildUnderpassRetainingWalls(
  group: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  concreteMat: THREE.Material,
  darkConcreteMat: THREE.Material,
  earthMat: THREE.Material,
): void {
  const channel = new THREE.Group()
  channel.name = "DegnerRetainingWalls"
  ;([-1, 1] as const).forEach((side) => {
    channel.add(buildUnderpassWallMesh(curve, side, concreteMat))
    channel.add(buildUnderpassSurfaceStrip(
      curve,
      side,
      TRACK_HALF_WIDTH + 0.12,
      TRACK_HALF_WIDTH + 0.72,
      360,
      darkConcreteMat,
      (p) => p.y + 0.025,
      (p) => p.y + 0.025,
    ))
    channel.add(buildUnderpassSurfaceStrip(
      curve,
      side,
      TRACK_HALF_WIDTH + 0.95 + UNDERPASS_WALL_THICKNESS,
      TRACK_HALF_WIDTH + 0.95 + UNDERPASS_WALL_THICKNESS + UNDERPASS_BANK_WIDTH,
      360,
      earthMat,
      () => UNDERPASS_WALL_TOP_Y + 0.06,
      () => 0.02,
    ))
  })

  group.add(channel)
}

function buildUpperBridgeDetails(
  curve: THREE.CatmullRomCurve3,
  group: THREE.Group,
  underpass: UnderpassVoid,
  sponsorMat: THREE.Material,
  sponsorAccentMat: THREE.Material,
  supportMat: THREE.Material,
): void {
  const samples = 300
  const panelLength = 1.7
  const ribMat = supportMat

  for (let i = 0; i < samples; i += 1) {
    const t = i / samples
    const p = curve.getPoint(t)
    const next = curve.getPoint((i + 1) / samples)
    if (p.y < BRIDGE_DETAIL_MIN_Y || next.y < BRIDGE_DETAIL_MIN_Y) continue

    const tan = curve.getTangent(t).normalize()
    const sx = tan.z
    const sz = -tan.x
    const yaw = Math.atan2(tan.x, tan.z)

    if (i % 2 === 0) {
      ;[-1, 1].forEach((side) => {
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, BRIDGE_SPONSOR_PANEL_HEIGHT, panelLength),
          sponsorMat,
        )
        panel.position.set(
          p.x + sx * side * BRIDGE_SIDE_PANEL_OFF,
          p.y - BRIDGE_SPONSOR_PANEL_HEIGHT * 0.5 - 0.18,
          p.z + sz * side * BRIDGE_SIDE_PANEL_OFF,
        )
        panel.rotation.y = yaw
        panel.castShadow = true
        group.add(panel)

        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, panelLength * 0.54), sponsorAccentMat)
        stripe.position.set(panel.position.x, panel.position.y + 0.02, panel.position.z)
        stripe.rotation.y = yaw
        group.add(stripe)
      })
    }

    if (i % 18 === 0) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(TRACK_WIDTH + 3.0, 0.14, 0.28), ribMat)
      rib.position.set(p.x, p.y - 0.58, p.z)
      rib.rotation.y = yaw
      rib.castShadow = true
      group.add(rib)

      ;[-1, 1].forEach((side) => {
        const supportX = p.x + sx * side * BRIDGE_SUPPORT_OFF
        const supportZ = p.z + sz * side * BRIDGE_SUPPORT_OFF
        if (isInsideUnderpassVoid(underpass, supportX, supportZ, 1.4)) return

        const supportHeight = Math.max(0.8, p.y - 0.62)
        const column = new THREE.Mesh(new THREE.BoxGeometry(0.75, supportHeight, 0.75), supportMat)
        column.position.set(supportX, supportHeight * 0.5, supportZ)
        column.castShadow = true
        column.receiveShadow = true
        group.add(column)
      })
    }
  }
}

function buildApproachEmbankments(curve: THREE.CatmullRomCurve3, group: THREE.Group, underpass: UnderpassVoid): void {
  const earthMat = new THREE.MeshStandardMaterial({
    color: PALETTE.grassHill,
    roughness: 1.0,
    metalness: 0,
    flatShading: true,
    side: THREE.DoubleSide,
  })

  group.add(buildApproachEmbankment(curve, underpass, -1, earthMat))
  group.add(buildApproachEmbankment(curve, underpass, 1, earthMat))
}

function buildCrossoverOverpass(curve: THREE.CatmullRomCurve3, group: THREE.Group, underpass: UnderpassVoid | null): void {
  if (!underpass) return

  const concreteMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeck, roughness: 0.86, metalness: 0.04, side: THREE.DoubleSide })
  const darkConcreteMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDark, roughness: 0.94, metalness: 0.02, side: THREE.DoubleSide })
  const sponsorMat = new THREE.MeshStandardMaterial({ color: PALETTE.trackYellow, roughness: 0.58, metalness: 0.02 })
  const sponsorAccentMat = new THREE.MeshStandardMaterial({ color: PALETTE.kerbRed, roughness: 0.5, metalness: 0.02 })
  const earthMat = new THREE.MeshStandardMaterial({ color: PALETTE.grassHill, roughness: 1.0, metalness: 0, flatShading: true, side: THREE.DoubleSide })

  buildUnderpassRetainingWalls(group, curve, concreteMat, darkConcreteMat, earthMat)
  buildApproachEmbankments(curve, group, underpass)
  buildUpperBridgeDetails(curve, group, underpass, sponsorMat, sponsorAccentMat, darkConcreteMat)
}

function buildBridgeSupports(curve: THREE.CatmullRomCurve3, group: THREE.Group, underpass: UnderpassVoid | null): void {
  const samples = 240
  const wallMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeck, roughness: 0.7, metalness: 0.1 })
  const wallStripeMat = new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.5, metalness: 0.3, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.25 })

  const samplePoints: { p: THREE.Vector3; tan: THREE.Vector3 }[] = []
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    samplePoints.push({ p: curve.getPoint(t), tan: curve.getTangent(t).normalize() })
  }

  // Solid wall panels along elevated road edges. Ramp-height panels are clipped
  // out of the protected lower-road void so the underpass mouths stay open.
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
      const wallX = sp.p.x + sx * off
      const wallZ = sp.p.z + sz * off
      if (underpass && sp.p.y < BRIDGE_DETAIL_MIN_Y && isInsideUnderpassVoid(underpass, wallX, wallZ, 0.9)) return

      const wall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, segLen), wallMat)
      wall.position.set(wallX, sp.p.y + wallHeight / 2 + 0.08, wallZ)
      wall.rotation.y = yaw
      wall.castShadow = true
      wall.receiveShadow = true
      group.add(wall)

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(wallThickness * 1.05, 0.08, segLen), wallStripeMat)
      stripe.position.set(wallX, sp.p.y + wallHeight + 0.08, wallZ)
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
  const bannerWidth = START_FINISH_GANTRY_POLE_OFFSET * 2 + 0.8
  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(bannerWidth, 1.2, 0.2),
    new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.6 }),
  )
  banner.position.set(point.x, 7, point.z)
  banner.rotation.y = Math.atan2(tangent.x, tangent.z)
  group.add(banner)

  ;[-START_FINISH_GANTRY_POLE_OFFSET, START_FINISH_GANTRY_POLE_OFFSET].forEach((off) => {
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

  const progressDistance = (a: number, b: number): number => {
    const delta = Math.abs(normalizeTrackT(a) - normalizeTrackT(b))
    return Math.min(delta, 1 - delta)
  }

  return {
    getGroundAt(x: number, z: number, currentY: number, previousT?: number) {
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
      let groundScore = Number.POSITIVE_INFINITY
      let bridgeI = -1
      let bridgeD = Number.POSITIVE_INFINITY
      let bridgeScore = Number.POSITIVE_INFINITY
      const hasPreviousT = typeof previousT === "number" && Number.isFinite(previousT)
      const previousRouteT = hasPreviousT ? Number(previousT) : 0
      const previousSampleI = hasPreviousT ? Math.round(normalizeTrackT(previousRouteT) * samples) % samples : -1
      const previousY = previousSampleI >= 0 ? ys[previousSampleI] : 0

      for (let i = 0; i < samples; i += 1) {
        const dx = xs[i] - x
        const dz = zs[i] - z
        const planarD = Math.sqrt(dx * dx + dz * dz)
        if (planarD > nearestD + PAVED_HALF_WIDTH) continue

        const t = i / samples
        const routePenalty = hasPreviousT ? progressDistance(t, previousRouteT) * 8 : 0
        const layerScore = planarD + routePenalty
        if (ys[i] <= 0.2 && layerScore < groundScore) {
          groundD = planarD
          groundScore = layerScore
          groundI = i
        }
        if (ys[i] > 0.2 && layerScore < bridgeScore) {
          bridgeD = planarD
          bridgeScore = layerScore
          bridgeI = i
        }

        const yDelta = Math.abs(ys[i] - currentY)
        const score = yDelta * 12 + planarD * 0.02 + routePenalty
        if (score < bestScore) {
          bestScore = score
          bestI = i
        }
      }

      const nearestIsBridge = ys[nearestI] > 0.2
      const lowerIsUsable = groundI >= 0 && groundD <= PAVED_HALF_WIDTH + 0.5
      const bridgeIsUsable = bridgeI >= 0 && bridgeD <= PAVED_HALF_WIDTH + 0.5
      const nearLowerLayer = currentY < 1.05
      const committedToBridge = currentY > BRIDGE_THRESHOLD || previousY > BRIDGE_THRESHOLD
      const continuingBridgeRamp = previousY > 0.2 && currentY > 0.55
      const bridgeT = bridgeI >= 0 ? bridgeI / samples : 0
      const bridgeY = bridgeI >= 0 ? ys[bridgeI] : 0
      const bridgeContinuesRoute = !hasPreviousT || progressDistance(bridgeT, previousRouteT) < 0.12
      const enteringBridgeRamp =
        bridgeIsUsable &&
        bridgeY <= BRIDGE_THRESHOLD &&
        bridgeContinuesRoute &&
        (!lowerIsUsable || bridgeD + 0.9 < groundD)

      if (enteringBridgeRamp) {
        bestI = bridgeI
      } else if (currentY < 0.7 && lowerIsUsable) {
        bestI = groundI
      } else if (bridgeIsUsable && (committedToBridge || continuingBridgeRamp)) {
        bestI = bridgeI
      } else if (nearLowerLayer && lowerIsUsable) {
        bestI = groundI
      } else if (
        bridgeIsUsable
        && (
          !lowerIsUsable
          || (nearestIsBridge && currentY > 0.9)
          || (currentY > 0.9 && bridgeD + 1.0 < groundD)
        )
      ) {
        bestI = bridgeI
      } else if (lowerIsUsable) {
        bestI = groundI
      }

      const dx = xs[bestI] - x
      const dz = zs[bestI] - z
      return {
        y: ys[bestI],
        distance: Math.sqrt(dx * dx + dz * dz),
        t: bestI / samples,
        layer: ys[bestI] > 0.2 ? "elevated" : "ground",
      }
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
  const underpass = buildDegnerUnderpassVoid()

  // Materials
  const concreteSideMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeck, roughness: 0.85, metalness: 0.05 })
  const concreteUnderMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDark, roughness: 0.95, metalness: 0.0 })

  const groundBandSide = THREE.DoubleSide
  const gravelMat = new THREE.MeshStandardMaterial({ color: PALETTE.gravel, roughness: 0.98, metalness: 0.0, side: groundBandSide })
  const runOffMat = new THREE.MeshStandardMaterial({ color: PALETTE.asphaltRunoff, roughness: 0.94, metalness: 0.0, side: groundBandSide })
  const shoulderMat = new THREE.MeshStandardMaterial({ color: PALETTE.asphaltDark, roughness: 0.95, metalness: 0.0, side: groundBandSide })
  ;[gravelMat, runOffMat, shoulderMat].forEach((mat) => {
    mat.fog = false
  })

  addMirroredSurfaceBands(group, curve, TRACK_HALF_WIDTH + 0.35, TRACK_HALF_WIDTH + 1.7, 600, GROUND_DETAIL_Y_OFFSET + 0.012, shoulderMat, underpass)
  addMirroredSurfaceBands(group, curve, TRACK_HALF_WIDTH + 1.95, TRACK_HALF_WIDTH + 4.8, 600, GROUND_DETAIL_Y_OFFSET + 0.006, runOffMat, underpass)
  addMirroredSurfaceBands(group, curve, TRACK_HALF_WIDTH + 5.1, TRACK_HALF_WIDTH + 6.7, 600, GROUND_DETAIL_Y_OFFSET, gravelMat, underpass)

  // Main asphalt deck (thick so the bridge has a visible solid underside)
  const trackTopMat = new THREE.MeshStandardMaterial({
    color: PALETTE.asphalt,
    roughness: 0.85,
    metalness: 0.0,
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0.0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })
  trackTopMat.fog = false
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
  buildBridgeSupports(curve, group, underpass)
  buildCrossoverOverpass(curve, group, underpass)
  const startFinish = buildStartFinish(curve, group)

  void concreteUnderMat

  const sampler = buildTrackSampler(curve)

  return { group, curve, startFinish, sampler, trackHalfWidth: PAVED_HALF_WIDTH }
}

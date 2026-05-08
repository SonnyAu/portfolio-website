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
  getGroundAt: (x: number, z: number) => { y: number; distance: number; t: number }
}

const BRIDGE_Y = 1.6
const BRIDGE_THRESHOLD = 0.5

// World-scale constants. The TRACK_POINTS array remains readable at small numbers;
// SCALE_X/SCALE_Z expand the figure-8 to roughly Suzuka proportions when the curve is built.
export const SCALE_X = 2.4
export const SCALE_Z = 2.6
export const TRACK_HALF_WIDTH = 6.0
const TRACK_WIDTH = 12.0
const RUNOFF_WIDTH = 22.0
const GRAVEL_WIDTH = 15.0
const SHOULDER_WIDTH = 13.4
const KERB_HALF = 6.0
const WALL_OFF = 6.25
const PILLAR_OFF = 6.0

// Suzuka-inspired figure-8 layout. The bridge entry/exit ramps use intermediate
// elevation control points (0.4 / 1.2) to ease the curve up smoothly instead of
// snapping straight from y=0 to y=1.6.
const TRACK_POINTS: Array<[number, number, number]> = [
  // Start/finish straight (south side, going east -> +X direction)
  [-58, 0, 18],
  [-40, 0, 18],
  [-22, 0, 18],
  [-4, 0, 18],
  [14, 0, 18],
  // Turn 1 / Turn 2 (right hander, sweeps north)
  [28, 0, 16],
  [38, 0, 10],
  [40, 0, -2],
  // Esses S-curves (S1-S7) heading west
  [34, 0, -10],
  [22, 0, -6],
  [12, 0, -14],
  [0, 0, -8],
  [-10, 0, -16],
  [-22, 0, -10],
  // Dunlop curve heading north-west
  [-32, 0, -16],
  [-44, 0, -12],
  // Degner 1
  [-52, 0, -2],
  // Degner 2 (start of bridge ramp up)
  [-46, 0.0, 8],
  [-42, 0.4, 7],
  [-38, 1.2, 5.5],
  // Crossover bridge over the esses (elevated, heading east)
  [-30, BRIDGE_Y, 4],
  [-12, BRIDGE_Y, 0],
  [6, BRIDGE_Y, -2],
  [22, BRIDGE_Y, -2],
  // Down ramp from bridge (eased)
  [30, 1.2, -1],
  [36, 0.4, 1.5],
  [40, 0.0, 4],
  // Hairpin (sharp left)
  [44, 0, 6],
  [42, 0, 14],
  [34, 0, 18],
  [22, 0, 16],
  // Spoon curve
  [10, 0, 22],
  [-4, 0, 30],
  [-18, 0, 34],
  [-32, 0, 32],
  [-44, 0, 26],
  // 130R (long left sweeper back to chicane area)
  [-50, 0, 18],
  // Casio Triangle chicane
  [-44, 0, 14],
  [-46, 0, 12],
  [-52, 0, 14],
  [-58, 0, 16],
]

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
  mesh.receiveShadow = true
  return mesh
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
  const whiteEdge = new THREE.MeshBasicMaterial({ color: PALETTE.trackWhite, transparent: true, opacity: 0.92 })
  const yellowDash = new THREE.MeshBasicMaterial({ color: PALETTE.trackYellow, transparent: true, opacity: 0.85 })

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
      positions.push(cx + sx * 0.09, p.y + 0.022, cz + sz * 0.09)
      positions.push(cx - sx * 0.09, p.y + 0.022, cz - sz * 0.09)
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
    dash.position.set(p.x, p.y + 0.024, p.z)
    dash.rotation.y = Math.atan2(tan.x, tan.z)
    group.add(dash)
  }
}

function buildBridgeSupports(curve: THREE.CatmullRomCurve3, group: THREE.Group): void {
  const samples = 240
  const supportMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDark, roughness: 0.85, metalness: 0.05 })
  const wallMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeck, roughness: 0.7, metalness: 0.1 })
  const wallStripeMat = new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.5, metalness: 0.3, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.25 })

  const samplePoints: { p: THREE.Vector3; tan: THREE.Vector3 }[] = []
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples
    samplePoints.push({ p: curve.getPoint(t), tan: curve.getTangent(t).normalize() })
  }

  // Pillars every ~8 samples on bridge segments (denser than before)
  for (let i = 0; i < samples; i += 1) {
    const sp = samplePoints[i]
    if (sp.p.y < 0.6) continue
    if (i % 7 !== 0) continue

    const sx = sp.tan.z
    const sz = -sp.tan.x
    ;[-PILLAR_OFF, PILLAR_OFF].forEach((off) => {
      const pillarHeight = sp.p.y + 0.5
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.6, pillarHeight, 0.6), supportMat)
      pillar.position.set(sp.p.x + sx * off, pillarHeight / 2 - 0.5, sp.p.z + sz * off)
      pillar.castShadow = true
      pillar.receiveShadow = true
      group.add(pillar)

      // Cross brace
      if (off > 0) {
        const brace = new THREE.Mesh(new THREE.BoxGeometry(PILLAR_OFF * 2 + 0.5, 0.2, 0.2), supportMat)
        brace.position.set(sp.p.x, sp.p.y * 0.5, sp.p.z)
        brace.rotation.y = Math.atan2(sp.tan.x, sp.tan.z) + Math.PI / 2
        group.add(brace)
      }
    })
  }

  // Solid wall panels along the deck edges (replaces thin railings).
  // Build as a series of short box segments stitched along the bridge.
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
  const startT = 0.02
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
      cell.position.set(point.x + sx * lateral + tangent.x * longitudinal, point.y + 0.045, point.z + sz * lateral + tangent.z * longitudinal)
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
    ctx.fillText("MERCEDES-AMG PETRONAS · SUZUKA", 512, 64)
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
    getGroundAt(x: number, z: number) {
      let bestI = 0
      let bestD = Number.POSITIVE_INFINITY
      for (let i = 0; i < samples; i += 1) {
        const dx = xs[i] - x
        const dz = zs[i] - z
        const d = dx * dx + dz * dz
        if (d < bestD) {
          bestD = d
          bestI = i
        }
      }
      return { y: ys[bestI], distance: Math.sqrt(bestD), t: bestI / samples }
    },
  }
}

export function buildSuzukaTrack(): TrackSystem {
  const group = new THREE.Group()
  group.name = "SuzukaTrack"

  const curve = new THREE.CatmullRomCurve3(
    TRACK_POINTS.map(([x, y, z]) => new THREE.Vector3(x * SCALE_X, y, z * SCALE_Z)),
    true,
    "catmullrom",
    0.5,
  )

  // Materials
  const concreteSideMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDeck, roughness: 0.85, metalness: 0.05 })
  const concreteUnderMat = new THREE.MeshStandardMaterial({ color: PALETTE.concreteDark, roughness: 0.95, metalness: 0.0 })

  const runOffMat = new THREE.MeshStandardMaterial({ color: PALETTE.asphaltRunoff, roughness: 0.95, metalness: 0.0 })
  const runOff = buildThickRibbon({
    curve,
    width: RUNOFF_WIDTH,
    samples: 600,
    yOffset: 0.005,
    thickness: 0.05,
    topMaterial: runOffMat,
    sideMaterial: runOffMat,
    clipBridge: true,
  })
  group.add(runOff)

  const gravelMat = new THREE.MeshStandardMaterial({ color: PALETTE.gravel, roughness: 0.97, metalness: 0.0 })
  const gravel = buildThickRibbon({
    curve,
    width: GRAVEL_WIDTH,
    samples: 600,
    yOffset: 0.012,
    thickness: 0.08,
    topMaterial: gravelMat,
    sideMaterial: gravelMat,
    clipBridge: true,
  })
  group.add(gravel)

  // Main asphalt deck (thick so the bridge has a visible solid underside)
  const trackTopMat = new THREE.MeshStandardMaterial({
    color: PALETTE.asphalt,
    roughness: 0.85,
    metalness: 0.0,
    emissive: new THREE.Color(PALETTE.asphaltDark),
    emissiveIntensity: 0.18,
  })
  const trackMesh = buildThickRibbon({
    curve,
    width: TRACK_WIDTH,
    samples: 800,
    yOffset: 0.04,
    thickness: 0.55,
    topMaterial: trackTopMat,
    sideMaterial: concreteSideMat,
  })
  group.add(trackMesh)

  // Optional: a slightly wider, flat asphalt "shoulder" mesh that tucks under the
  // track edges on ground sections so the painted white edge doesn't visually float.
  const shoulderMat = new THREE.MeshStandardMaterial({ color: PALETTE.asphaltDark, roughness: 0.95, metalness: 0.0 })
  const shoulder = buildThickRibbon({
    curve,
    width: SHOULDER_WIDTH,
    samples: 600,
    yOffset: 0.018,
    thickness: 0.06,
    topMaterial: shoulderMat,
    sideMaterial: shoulderMat,
    clipBridge: true,
  })
  group.add(shoulder)

  buildPaintedLines(curve, group)
  buildKerbs(curve, group)
  buildBridgeSupports(curve, group)
  const startFinish = buildStartFinish(curve, group)

  void concreteUnderMat

  const sampler = buildTrackSampler(curve)

  return { group, curve, startFinish, sampler, trackHalfWidth: TRACK_HALF_WIDTH }
}
